# damien.le.quere

Personal website and resume. Plain static HTML with Bootstrap 5.3, no build step. Light / dark / auto theme
switcher in the navbar.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000, reloads on save
```

The navbar lives in `partials/navbar.html`. After editing it, copy it into
every page (between the `<!-- navbar:start -->` / `<!-- navbar:end -->`
markers), with the right relative links and active item:

```bash
pnpm navbar         # rewrite the navbar in each page
pnpm navbar:check   # only report pages that are out of date
```

## Deploy to free.fr (FTP)

`scripts/free-ftp.sh` manages the copy hosted on `ftpperso.free.fr`.

Set the password once, in a git-ignored `.env.local`:

```bash
cp .env.example .env.local && chmod 600 .env.local
# then edit FTP_PASSWORD in .env.local
```

or for the current shell only (hidden input, stays out of history):

```bash
read -rsp "FTP password: " FTP_PASSWORD && export FTP_PASSWORD
```

Precedence: environment, then `.env.local`, then `.env`. `FTP_USER` defaults to
`damien.le.quere` and `FTP_HOST` to `ftpperso.free.fr`.

```bash
pnpm ftp:list     # print every file and directory on the server
pnpm ftp:backup   # download everything to backup/free.fr/ (git-ignored)
pnpm ftp:upload   # upload the site, overwriting remote copies
pnpm ftp:upload cv/index.html   # upload only the given files
pnpm ftp:deploy   # upload, then delete remote files that are no longer part of the site
pnpm ftp:delete   # delete everything on the server, after typing the username to confirm
```

`upload` sends the files known to git (tracked, or new and not ignored), minus
repository tooling (`scripts/`, `partials/`, `package.json`, `README.md`, ...). It never
deletes remote files.

`deploy` is the usual way to publish: it uploads first, so the site is never
missing a file, then lists the remote files that are not in that set (and the
directories left empty) and deletes them after a `y/N` confirmation. Free's
`000-LISEZ-MOI-PAGES-PERSO-FREE.TXT` is always kept.

## Layout

```
index.html            Home
cv/index.html         Resume (served at /cv/)
cv/fr/index.html      French resume (served at /cv/fr/), keep in sync with the English one
publications.html     Thesis summary and publications
projects.html         Academic projects
contact.html          Contact
partials/navbar.html  Shared navbar template (not uploaded, see `pnpm navbar`)

assets/
  css/style.css       Site styles (shared + per-page, scoped by body class)
  js/navbar.js        Hide navbar on scroll down
  js/theme.js         Light / dark / auto theme, loaded in <head> to avoid a flash
  img/                Logos and photo
  vendor/bootstrap/   Bootstrap 5.3.8 (css + js bundle, no jQuery)

files/                Downloadable documents
  cv/  thesis/  publications/  projects/  diplomas/

scripts/
  free-ftp.sh         FTP list / backup / upload / delete (not uploaded)
  sync-navbar.mjs     Copy the navbar template into each page (not uploaded)
```
