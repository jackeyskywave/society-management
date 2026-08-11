# Vue 3 Static Admin Dashboard

A lightweight, modern, fast Vue 3 Admin project built with Vite and Vue Router.

## Demo Credentials

- **Username:** `admin`
- **Password:** `1234`

Centralized static credentials reside in [`src/services/authService.js`](file:///src/services/authService.js) and can easily be replaced with a live API endpoint (`POST /api/login`) without changing component architecture.

---

## Routes

- `/login` - Public authentication page
- `/admin` - Protected admin dashboard

Navigation guards automatically redirect unauthenticated users accessing `/admin` to `/login`, and authenticated users accessing `/login` or `/` to `/admin`.

---

## Installation

```bash
npm install
```

## Development Server

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

---

## Deployment & SPA Fallback Configuration

When deploying production builds of Single Page Applications (SPAs) like Vue Router in `history` mode, direct navigations or page refreshes on non-root paths like `/admin` will fail with a **404 Not Found** error unless server fallback rules are configured.

### Nginx Configuration

Add a `try_files` directive to route all requests back to `index.html`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache (`.htaccess`)

Place a `.htaccess` file inside your web root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Vercel / Netlify / Cloudflare Pages

- **Vercel:** Handled automatically or via `vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **Netlify:** Create a `_redirects` file in `public/`:
  ```
  /*    /index.html   200
  ```
