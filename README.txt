FixMyCampus — Full-stack application

Prerequisites: Node.js 18+ and a MongoDB Atlas database.

Setup
1. Run `npm install` in this folder.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set `MONGO_URI` to your Atlas connection string and set a long random `JWT_SECRET`.
4. Run `npm run dev` (or `npm start`). The API listens on http://localhost:5000.
5. Serve this project folder with a static server (for example VS Code Live Server) and open START_HERE.html or index.html.

Security note
`backend/.env` is ignored by Git and must never be shared. The browser only stores the issued JWT and safe user profile; it never receives MongoDB credentials or password hashes.

API overview
- POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- GET/POST /api/issues, GET/PUT/DELETE /api/issues/:id
- GET/POST /api/announcements, PUT/DELETE /api/announcements/:id
- POST /api/feedback, GET /api/feedback (admin)
- GET /api/users (admin), GET/PUT /api/users/:id
- GET /api/admin/dashboard, GET /api/admin/issues, PUT /api/admin/issues/:id/status

The initial admin must be created directly in MongoDB with `role: "admin"` and a bcrypt password hash, or promoted securely through an administrative deployment process. Public registration intentionally creates student accounts only.

The legacy visual UI still includes some prototype-only widgets (notifications, charts and detailed audit timeline). Its authentication, student issue creation/listing, and admin issue/dashboard data are connected to the API; future work can add backend-backed notification, image upload, and history collections if those prototype widgets need persistence.
