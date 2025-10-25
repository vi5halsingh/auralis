
# Auralis — Backend

This repository contains the backend for Auralis — a Node.js + Express API that uses MongoDB (via Mongoose) for persistence. The goal of this README is to provide enough information for a new developer to get the project running locally, understand the code layout, and contribute safely.

## Quick facts

- Language: JavaScript (Node.js, CommonJS modules)
- Frameworks / Libraries: Express, Mongoose, dotenv, cors
- Database: MongoDB
- Run (dev): nodemon with dotenv auto-loading

# status code chart (Memu)
Informational responses (100 – 199)
Successful responses (200 – 299)
Redirection messages (300 – 399)
Client error responses (400 – 499)
Server error responses (500 – 599)

# github commit messages 
👉 https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13

## Table of contents

- [Project overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Quickstart (run locally)](#quickstart-run-locally)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Important files](#important-files)
- [Scripts](#scripts)
- [Database](#database)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Next steps / TODOs](#next-steps--todos)

## Project overview

This backend exposes HTTP endpoints (Express) and connects to a MongoDB instance. The project is purposely minimal and sets up common middleware (CORS, JSON parsing) and a single DB connection helper.

## Prerequisites

- Node.js LTS (recommend 18.x or 20.x)
- npm (comes with Node.js) or yarn
- MongoDB instance (local or hosted Atlas)
- Optional: nodemon for development (already included as a devDependency)

## Quickstart (run locally)

1. Clone the repository and change into the `backend` folder.

2. Install dependencies:

```powershell
npm install
```

3. Create a `.env` file in `backend/` (see Environment variables below).

4. Start the server in development mode (auto loads dotenv):

```powershell
npm run dev
```

Or run the production-like start:

```powershell
npm start
```

The server will listen on the port defined in `PORT` or 5000 by default.

## Environment variables

Create a `.env` file in the `backend` folder with at least the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017
# or a MongoDB connection string for Atlas (without trailing db name)
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net

```

Notes:
- The code appends the DB name defined in `src/constants.js` to `MONGO_URI` when connecting. If you prefer to supply a database in the connection string itself, adjust `src/db/db.js` accordingly.

## Project structure

High-level view under `backend/`:

- src/
  - index.js        # program entry (starts the server)
  - app.js          # express app, middleware and route wiring
  - constants.js    # shared constants (DB_NAME)
  - db/db.js        # MongoDB connection helper
  - controllers/    # express controllers (empty — add endpoints here)
  - middlewares/    # custom middleware (empty)
  - models/         # mongoose models (empty)
  - routes/         # express routes (empty)
  - utils/          # helper utilities (empty)

## Important files

- `src/app.js` — register middleware and routes here. Add route imports and mount them (e.g., `app.use('/api/users', require('./routes/users'))`).
- `src/db/db.js` — handles mongoose.connect. It currently uses `process.env.MONGO_URI` + `DB_NAME` from `src/constants.js`.
- `src/index.js` — starts the HTTP server. Use it as the entrypoint for processes and tests.

## Scripts

- `npm run dev` — development server with `nodemon -r dotenv/config --experimental-json-modules src/index.js` (auto loads `.env`).
- `npm start` — runs `node src/index.js` (production start).
- `npm test` — placeholder (no tests configured).

## Database

The project uses Mongoose. When `connectDB()` runs it calls:

```js
mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
```

That means `MONGO_URI` should be the server/cluster connection string without the trailing DB name (the DB name is appended from constants). You can change this behavior if you prefer to provide the full connection string.

Add mongoose models in `src/models` and import them where needed.

## Contributing

- Follow common branch workflow: feature branches off `dev` and PRs to `dev`.
- Keep functions small and modular; add tests for important logic.
- Update this README when adding new env vars, scripts, or deployment steps.

Code style & linting:
- No linter configured yet. Consider adding ESLint and Prettier for consistent style.

## Troubleshooting

- MongoDB connection fails: ensure `MONGO_URI` is correct and reachable. Check firewall and Atlas IP whitelist.
- Port already in use: change `PORT` or stop the conflicting process.
- Unexpected crashes: check logs printed to the console, look at `connectDB()` errors.

## Next steps / TODOs

- Add route files in `src/routes` and corresponding controllers.
- Add mongoose models under `src/models`.
- Add tests and CI configuration.
- Consider adding request validation (Joi or celebrate) and centralized error handling middleware.


