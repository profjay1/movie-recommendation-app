# MovieReco — Backend API

A simple Express.js backend for the Movie Recommendation app.  
Implements CRUD for movies and basic authentication (register/login). Uses MongoDB (Mongoose) for persistence.

---

## Table of contents

- [Tech stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Folder structure (recommended)](#folder-structure-recommended)  
- [Environment variables](#environment-variables)  
- [Install & Run (local)](#install--run-local)  
- [Database seeding](#database-seeding)  
- [API documentation (endpoints)](#api-documentation-endpoints)  
- [Testing](#testing)  
- [Deployment (Railway example)](#deployment-railway-example)  
- [Troubleshooting & Tips](#troubleshooting--tips)  
- [License](#license)

---

## Tech stack

- Node.js (v18+ recommended)
- Express.js
- MongoDB (Atlas or local)
- Mongoose (ODM)
- dotenv for environment variables
- cors (optional/used)
- JSON Web Tokens (JWT) for authentication

---

## Prerequisites

- Node.js & npm installed
- MongoDB (Atlas cluster or local `mongod`)
- Git (for cloning / pushing)
- (Optional) Railway account for hosting

---

## Folder structure (recommended)

movie-reco-backend/
├─ package.json
├─ .env
├─ src/
│ ├─ server.js # app entry
│ ├─ config/
│ │ └─ db.js # mongoose connection
│ ├─ controllers/
│ │ ├─ authController.js
│ │ └─ moviesController.js
│ ├─ models/
│ │ ├─ User.js
│ │ └─ Movie.js
│ ├─ routes/
│ │ ├─ auth.js
│ │ └─ movies.js
│ └─ middleware/
│ └─ auth.js
├─ scripts/
│ └─ seed.js # optional seed script
└─ README.md

---

## Environment variables

Create a `.env` file in the project root (do **not** commit it):

PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/moviesDB?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development


> Replace `<user>`, `<password>`, and the host with your Atlas values. For local MongoDB use `mongodb://localhost:27017/moviesDB`.

---

## Install & Run (local)

1. Clone the repo and go to the backend folder:

```bash
git clone https://github.com/your-username/movie-reco-backend.git
cd movie-reco-backend

2. Install dependencies:
npm ci
# or
npm install

3. Create .env as shown above.

4. Run the app:

# development (restart on change if you use nodemon)
node src/server.js

# or if package.json has "start": "node src/server.js"
npm start

Default server message:
MongoDB connected
Backend listening on http://localhost:3000 (pid 12345)

Backend listening on http://localhost:3000 (pid 12345)

Database seeding
A seed script is provided to insert sample movies (optional).

Add file: scripts/seed.js (if not present — see README conversation for contents).

Run:
npm run seed
# or
node scripts/seed.js

Make sure .env contains MONGO_URI that points to the database you want to seed.

API documentation (endpoints)

Base URL (local): http://localhost:3000
Base URL (deployed): https://<your-railway-domain>.up.railway.app

Auth
POST /api/auth/register

Register a new user.

Request body

{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "yourPassword"
}


Response (201 Created)

{
  "token": "<jwt-token>"
}

POST /api/auth/login

Login a user.

Request body

{
  "email": "alice@example.com",
  "password": "yourPassword"
}


Response (200 OK)

{
  "token": "<jwt-token>"
}

Movies

Routes in src/routes/movies.js. If using authentication, pass the JWT in Authorization header: Bearer <token> (if routes require auth).

GET /api/movies

Return an array of movies.

Response (200)

[]


(Empty array means no movies; seed or create one.)

POST /api/movies

Create a movie.

Request body

{
  "title": "The Matrix",
  "year": 1999,
  "genre": "Sci-Fi",
  "overview": "A hacker discovers reality..."
}


Response (201 Created)

{
  "_id": "634a...",
  "title": "The Matrix",
  "year": 1999,
  "genre": "Sci-Fi",
  "overview": "A hacker...",
  "createdAt": "...",
  "__v": 0
}

GET /api/movies/:id

Get a specific movie.

PUT /api/movies/:id

Update a movie.

DELETE /api/movies/:id

Delete a movie (response: 204 No Content).

Example requests (PowerShell / curl)

GET (PowerShell)

Invoke-RestMethod -Uri "http://localhost:3000/api/movies" -Method GET


POST (PowerShell)

$body = @{
  title = "The Matrix"
  year = 1999
  genre = "Sci-Fi"
  overview = "A hacker discovers reality..."
}
Invoke-RestMethod -Uri "http://localhost:3000/api/movies" -Method POST -ContentType "application/json" -Body ($body | ConvertTo-Json)


curl (Unix-like or Git Bash)

curl -i -X POST "http://localhost:3000/api/movies" \
  -H "Content-Type: application/json" \
  -d '{"title":"The Matrix","year":1999,"genre":"Sci-Fi"}'

Testing

There are two easy testing approaches:

Manual testing with Postman / Insomnia / curl / PowerShell (examples above).

Automated tests: add Jest + Supertest tests in tests/ and run npm test.

Example package.json scripts:

"scripts": {
  "start": "node src/server.js",
  "seed": "node scripts/seed.js",
  "test": "jest --detectOpenHandles"
}


If you use ES modules, configure Jest accordingly (--experimental-vm-modules or use CommonJS in tests).

Deployment (Railway example)

Push repo to GitHub.

In Railway: Add Service → Deploy from GitHub.

Root Directory: . (repo root)

Build Command: (example robust)

sh -lc 'if [ -d node_modules ]; then find node_modules -mindepth 1 -maxdepth 1 ! -name ".cache" -exec rm -rf {} +; fi; npm ci --cache /tmp/empty-npm-cache --prefer-offline --no-audit --progress=false'


(use simpler npm ci if you prefer)

Start Command:

npm start


Add environment variables in Railway UI: MONGO_URI, JWT_SECRET, etc.

Deploy and check runtime logs. Railway will display a public domain like your-app-production.up.railway.app.

CORS

If your frontend is hosted on a different origin (Vercel), install and enable CORS:

npm install cors


In src/server.js:

import cors from 'cors';
app.use(cors());
// or app.use(cors({ origin: 'https://your-frontend.vercel.app' }));

Troubleshooting & Tips

Mongoose connection issues: ensure MONGO_URI is correct and Atlas whitelist includes your IP / the cloud host's IPs. For Railway/Heroku, whitelist 0.0.0.0/0 for testing (not recommended for prod).

Cannot GET /: that just means root handler not defined. Use /api/movies or add a health route:

app.get('/health', (req, res) => res.json({ status: 'ok' }));


Environment variables: Railway/Vercel/Heroku set env vars in their UI — do not rely on your local .env for deployed apps.

Remove node_modules from git: ensure .gitignore includes node_modules/ and run git rm -r --cached node_modules then commit.

License
MIT 
