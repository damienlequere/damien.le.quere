# damien.le.quere

Personal website and resume. Plain static HTML with Bootstrap 4, no build step.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3000, reloads on save
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
```

The navbar is duplicated in each page; keep the copies in sync when editing it.
