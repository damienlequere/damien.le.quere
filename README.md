# damien.le.quere

Personal website and resume. Plain static HTML with Bootstrap 4, no build step.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000, reloads on save
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
pnpm ftp:delete   # delete everything on the server, after typing the username to confirm
```

`upload` sends the files known to git (tracked, or new and not ignored), minus
repository tooling (`scripts/`, `package.json`, `README.md`, ...). It never
deletes remote files, so for a clean redeploy:

```bash
pnpm ftp:backup && pnpm ftp:delete && pnpm ftp:upload
```

## Layout

```
index.html            Home
cv/index.html         Resume (served at /cv/)
publications.html     Thesis summary and publications
projects.html         Academic projects
contact.html          Contact

assets/
  css/style.css       Site styles (shared + per-page, scoped by body class)
  js/navbar.js        Hide navbar on scroll down
  img/                Logos and photo
  vendor/bootstrap/   Bootstrap 4.5.3 (css + js bundle)

files/                Downloadable documents
  cv/  thesis/  publications/  projects/  diplomas/

scripts/free-ftp.sh   FTP list / backup / upload / delete (not uploaded)
```

The navbar is duplicated in each page; keep the copies in sync when editing it.
