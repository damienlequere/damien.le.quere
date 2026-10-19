#!/usr/bin/env bash
# Manage the old copy of the site hosted on Free's personal pages (ftpperso.free.fr).
#
# Usage: scripts/free-ftp.sh list|backup|upload|delete
#
#   list    print every file and directory on the server
#   backup  download every file into $BACKUP_DIR (default: backup/free.fr)
#   upload  upload the website (files known to git, minus dev tooling), overwriting remote copies
#   delete  delete everything on the server, after a typed confirmation
#
# Credentials come from the environment, or from git-ignored .env / .env.local files
# (environment wins, then .env.local, then .env; see .env.example):
#   FTP_PASSWORD  required
#   FTP_USER      default: damien.le.quere
#   FTP_HOST      default: ftpperso.free.fr
set -euo pipefail
shopt -s inherit_errexit

cd "$(dirname "$0")/.."
# Variables already set in the environment take precedence over the files.
env_before=$(declare -p FTP_HOST FTP_USER FTP_PASSWORD BACKUP_DIR 2>/dev/null || true)
for env_file in .env .env.local; do
  if [[ -f $env_file ]]; then
    set -a
    source "$env_file"
    set +a
  fi
done
eval "$env_before"

FTP_HOST=${FTP_HOST:-ftpperso.free.fr}
FTP_USER=${FTP_USER:-damien.le.quere}
BACKUP_DIR=${BACKUP_DIR:-backup/free.fr}
: "${FTP_PASSWORD:?Set FTP_PASSWORD in the environment, .env or .env.local}"

# curl with credentials passed through a config fd, so the password never shows in `ps`.
# --ssl uses FTPS when the server supports it, plain FTP otherwise.
ftp() {
  local creds="$FTP_USER:$FTP_PASSWORD"
  creds=${creds//\\/\\\\}
  creds=${creds//\"/\\\"}
  curl --silent --show-error --ssl --config <(printf 'user = "%s"\n' "$creds") "$@"
}

url() {
  local p=${1//%/%25}
  p=${p// /%20}
  p=${p//#/%23}
  printf 'ftp://%s%s' "$FTP_HOST" "$p"
}

# Print every entry under directory $1 (which ends with /), directories with a trailing /.
# Children come before their parent directory, which is the order deletion needs.
walk() {
  local dir=$1 listing line name
  listing=$(ftp "$(url "$dir")")
  while IFS= read -r line; do
    line=${line%$'\r'}
    # Unix-style LIST line: perms links owner group size month day time|year name
    name=$(sed -E 's/^([^ ]+ +){8}//' <<<"$line")
    [[ -z $name || $name == . || $name == .. ]] && continue
    case $line in
      d*) walk "$dir$name/"; echo "$dir$name/" ;;
      l*) echo "skipping symlink: $dir$name" >&2 ;;
      *) echo "$dir$name" ;;
    esac
  done <<<"$listing"
}

list() {
  walk /
}

backup() {
  local entries path count=0
  entries=$(walk /)
  while IFS= read -r path; do
    [[ -z $path || $path == */ ]] && continue
    ftp --create-dirs -o "$BACKUP_DIR$path" "$(url "$path")"
    echo "saved $path"
    count=$((count + 1))
  done <<<"$entries"
  echo "Backed up $count files to $BACKUP_DIR"
}

# Website files: tracked or new files not ignored by git, minus repository tooling.
site_files() {
  git ls-files --cached --others --exclude-standard |
    grep -Ev '^(scripts/|partials/|\.gitignore$|\.env\.example$|package\.json$|pnpm-lock\.yaml$|README\.md$)' |
    while IFS= read -r path; do
      [[ -f $path ]] && echo "$path"
    done
}

upload() {
  local files path count=0
  files=$(site_files)
  while IFS= read -r path; do
    [[ -z $path ]] && continue
    ftp --ftp-create-dirs -T "$path" "$(url "/$path")"
    echo "uploaded /$path"
    count=$((count + 1))
  done <<<"$files"
  echo "Uploaded $count files to $FTP_HOST"
}

delete() {
  local entries path cmd answer
  entries=$(walk /)
  if [[ -z $entries ]]; then
    echo "Nothing to delete on $FTP_HOST."
    return
  fi

  echo "$entries"
  echo
  echo "$(wc -l <<<"$entries") entries above will be PERMANENTLY deleted from $FTP_HOST."
  read -rp "Type the username ($FTP_USER) to confirm: " answer
  if [[ $answer != "$FTP_USER" ]]; then
    echo "Aborted, nothing was deleted."
    exit 1
  fi

  while IFS= read -r path; do
    if [[ $path == */ ]]; then cmd="RMD ${path%/}"; else cmd="DELE $path"; fi
    ftp --list-only -o /dev/null -Q "$cmd" "$(url /)"
    echo "deleted $path"
  done <<<"$entries"
  echo "Done."
}

case ${1:-} in
  list | backup | upload | delete) "$1" ;;
  *)
    echo "Usage: $0 list|backup|upload|delete" >&2
    exit 1
    ;;
esac
