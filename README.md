# NameCard Backend

Multi-tenant backend for the NameCard project. Provides:

- `/scan` public landing page for database-backed cards
- `/api/cards` API for creating and managing cards
- `/secure-dashboard` tenant-aware scan dashboard
- `/secure-users` secure user / tenant management
- `/secure-cards` secure NameCard builder for business users

## Secure NameCard Builder (`/secure-cards`)

The secure builder lets authenticated business users (roles `cdc_admin`, `tenant_admin`, `manager`) create database-backed cards for their staff.

### Flow

1. User signs in via `/secure-dashboard` (token stored in `localStorage` as `nc_auth_token` + `nc_auth_user`).
2. From the dashboard, **Create NameCard** opens `/secure-cards` in a new tab.
3. `/secure-cards` uses the existing token to:
   - Check access and role
   - Show the card form, live preview, and (after create) scan link + QR
4. On submit, the page calls `POST /api/cards` with the `x-auth-token` header.

### Front-end assets

The secure builder page is served by `backend/src/routes/secureCards.js`. The page HTML contains only structure and styles; the behavior is in an external script:

- **Script:** `backend/src/public/secure-cards.js`
- **Served at:** `/secure-static/secure-cards.js`
- **Static mount:** configured in `backend/src/server.js`:
  - `app.use('/secure-static', express.static(path.resolve(__dirname, './public')));`

`secure-cards.js` handles:

- Reading `nc_auth_token` / `nc_auth_user` from `localStorage`
- Role checks (`cdc_admin`, `tenant_admin`, `manager` allowed)
- Live preview updates while typing
- Autosave / restore of the form (`localStorage` key `nc_secure_card_draft`)
- Calling `/api/cards` and rendering the returned `scanUrl` as a QR code using `qrcodejs`

## Running locally

From `backend/`:

```bash
npm install
npm start
# server listens on PORT (default 4000)
```

Then open (with the frontend already deployed or proxied):

- `http://localhost:4000/secure-dashboard`
- `http://localhost:4000/secure-cards`

## Deployment notes

The Render service `namecard-17wq.onrender.com` is deployed from this repo. When you modify secure builder files, you must:

1. Commit and push changes (especially `backend/src/routes/secureCards.js`, `backend/src/public/secure-cards.js`, `backend/src/server.js`).
2. Trigger a **Manual Deploy** in the Render dashboard if auto-deploy is disabled.

Hard-refresh `/secure-cards` after each deploy to ensure the browser uses the latest `secure-cards.js`.
