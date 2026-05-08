## Security Report

Date: 2026-05-04

### Completed fixes

1. Sensitive demo data was reduced to a minimal demo set.
   - Removed extra customer records from persisted server data.
   - Reduced the admin workspace to a single retail customer: Example User.
   - Rebuilt the production bundle so removed records are no longer shipped in `dist`.

2. API authentication and role checks were added.
   - Added session-based login at `/api/auth/login`.
   - Added server-side registration at `/api/auth/register`.
   - Protected `/api/accounts`, `/api/admin-workspace`, `/api/events`, and email routes.
   - Limited admin-only routes to authenticated admin sessions.

3. Browser persistence was reset.
   - Added a storage version reset so stale local account/admin data from older builds is cleared automatically.

4. Password storage was moved to bcrypt hashes.
   - Added `bcryptjs` hashing for stored account passwords.
   - Existing plaintext records are migrated to bcrypt on first authenticated read.
   - Admin-visible account payloads and admin workspace records no longer expose password fields.

### Current demo credentials

- User: `example.user@demo.local` / `ExampleUser!26`
- Admin: `admin@demo.local` / `AdminDemo!26`

These are demo-only credentials kept so the local application remains usable after the security cleanup.

### Remaining risks

1. Session tokens are in-memory only.
   - Restarting the server invalidates all active sessions.

2. Demo credentials are still present by design.
   - They are synthetic and no longer tied to extra customer records, but they are still embedded demo logins.

3. Demo credentials are still present in the client by design.
   - The persisted server store is hashed, but the demo UI still ships usable login credentials so the local demo remains operable.

### Recommended next steps

1. Replace in-memory sessions with signed cookies or a persistent session store.
2. Move customer mutations from client-side full-record sync to server-side scoped endpoints.
3. Remove or externalize shipped demo credentials if you want the frontend bundle to avoid carrying any usable logins.