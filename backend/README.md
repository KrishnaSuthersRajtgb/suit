# EHS-Suit Backend (Node + Express + MongoDB)

Backend for the login page: Visitor check-in, Security visitor registration,
and Admin/Manager login — all scoped to a Plant.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit MONGO_URI / JWT_SECRET as needed
node seed.js            # creates the 4 plants + a test admin & manager user
npm run dev              # starts on http://localhost:5000
```

Seeded test logins (all under plant `PLT-CHN01`):
- Admin → username `admin1`, password `Admin@123`
- Manager → username `manager1`, password `Manager@123`

## Models

- **Plant** — `plantCode`, `plantName`, `location`, `status`
- **User** — `username`, `passwordHash`, `role` (ADMIN/MANAGER/EMPLOYEE/SECURITY/SUPPORT), `plant`, `status`, `lastLoginAt`, ...
- **Visitor** — `name`, `phone`, `company`, `purpose`, `host`, `plant`, `status` (REGISTERED/CHECKED_IN/CHECKED_OUT)

## API

### Plants
`GET /api/plants` → list of active plants, for the login page dropdown.
```json
[{ "_id": "...", "plantCode": "PLT-CHN01", "plantName": "Chennai Plant 1", "location": "Ambattur, Chennai" }]
```

### Admin login
`POST /api/auth/admin/login`
```json
{ "username": "admin1", "password": "Admin@123", "plant": "PLT-CHN01" }
```
→ `{ "token": "...", "user": { "id", "username", "role", "plant", "plantName" } }`

### Manager login
`POST /api/auth/manager/login` — same shape as Admin login, restricted to `role: "MANAGER"`.

### Security — register a visitor
`POST /api/visitors/register`
```json
{
  "name": "Arun Sharma",
  "phone": "+91 98765 43210",
  "company": "ABC Contractors Ltd",
  "purpose": "Safety Audit",
  "host": "Priya Kumar",
  "plant": "PLT-CHN01"
}
```
→ `{ "message": "Registered \"Arun Sharma\" for Chennai Plant 1.", "visitor": {...} }`

### Visitor — check in by phone
`POST /api/visitors/checkin`
```json
{ "phone": "+91 98765 43210" }
```
→ `{ "visitor": {...} }` (404 if no registration exists for that number — matches the
frontend's "check in at Security first" message)

## Notes

- Passwords are hashed with bcrypt; a JWT (role + plant embedded) is issued on Admin/Manager
  login. Protect any future admin/manager-only routes with `middleware/auth.js`
  (`protect`, `requireRole("ADMIN")`).
- The Security and Visitor endpoints are intentionally open (no login), matching the current
  frontend — add `protect`/`requireRole("SECURITY")` to `/api/visitors/register` later if
  Security should require its own login.
- Swap the frontend's hardcoded `PLANTS` array for a `GET /api/plants` call, and swap
  `localStorage` reads/writes in `VisitorForm`/`SecurityForm` for `fetch` calls to
  `/api/visitors/checkin` and `/api/visitors/register`.
