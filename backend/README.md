
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

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status

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
- [File uploads (multer + Cloudinary)](#file-uploads-multer--cloudinary)
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

## API reference

Below are the primary public endpoints implemented so far. The API base (as mounted in `src/app.js`) is `/api/v1/users`.

### Register user

- Method: POST
- URL: `/api/v1/users/register`
- Content type: multipart/form-data (file + form fields)

Required form fields:
- `userName` (string)
- `email` (string)
- `fullName` (string)
- `password` (string)
- `profileImage` (file) — the profile image to be uploaded; handled by `multer` then uploaded to Cloudinary

Example curl (from shell / PowerShell):

```bash
curl -X POST http://localhost:5000/api/v1/users/register \
  -F "userName=jdoe" \
  -F "email=jdoe@example.com" \
  -F "fullName=John Doe" \
  -F "password=Secret123" \
  -F "profileImage=@/absolute/path/to/avatar.jpg"
```

Example successful response (ApiResponse):

```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "_id": "64f...",
    "userName": "jdoe",
    "email": "jdoe@example.com",
    "fullName": "John Doe",
    "profileImageUrl": "https://res.cloudinary.com/....jpg",
    "role": "user",
    "plan": "free",
    "createdAt": "2025-10-31T...",
    "updatedAt": "2025-10-31T..."
  },
  "success": true
}
```

Example error response (ApiError):

```json
{
  "statusCode": 400,
  "message": "All fields are required",
  "data": null,
  "errors": [],
  "success": false
}
```

Notes:
- The route uses the `upload.single('profileImage')` multer middleware which stores the incoming file to `./public/temp` by default. The controller then calls the `uploadToCloudinary` helper which uploads to Cloudinary and deletes the local temp file.
- The controller returns `ApiResponse` on success and `ApiError` on failures — see `src/utils/apiResponse.js` and `src/utils/apiError.js` for the exact response shapes.
- Consider using `asyncHandler` (provided in `src/utils/asyncHandler.js`) to wrap async route handlers and centralize error handling.

## Contributing

## File uploads (multer + Cloudinary)

We have a small file-upload pipeline implemented using `multer` for temporary disk storage and Cloudinary for permanent storage. The relevant files are in the repository attachments you shared and in `src/`:

- `src/middlewares/multer.middleware.js` — configures `multer` to store uploads in `./public/temp` and preserves the original filename by default.
- `src/utils/cloudinary.js` — Cloudinary helper that uploads the local file and deletes the temp file afterwards. It uses `cloudinary.v2` and expects Cloudinary env variables.
- `src/utils/apiError.js` and `src/utils/apiResponse.js` — small utilities used across the project for consistent error and response objects (the Cloudinary helper returns an `ApiError` on failure).

Environment variables (add to your `.env`):

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```

Notes and best-practices:

- The multer middleware writes uploaded files to `./public/temp`. Make sure this directory exists and is writable. Example: `mkdir -p public/temp` (Windows: create the folder in Explorer or use PowerShell).
- The `cloudinary` helper uploads the file and then removes the local temp file via `fs.unlinkSync`. If you change this, ensure temp files are cleaned up to avoid disk growth.
- The current `multer` configuration uses the original filename (`file.originalname`) which may cause collisions—consider adding a unique prefix (timestamp or UUID) or sanitizing filenames before saving.
- The Cloudinary helper returns the Cloudinary response (which includes `url`, `secure_url`, `public_id`, etc.). On failure it returns/throws an `ApiError(500, ...)` — your error handler should convert that into an HTTP response.

Example Express route (simple usage):

```js
// src/routes/uploads.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer.middleware');
const { uploadToCloudinary } = require('../utils/cloudinary');

router.post('/file', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // multer exposes file.path (e.g., './public/temp/filename')
    const localPath = req.file.path;

    const cloudResult = await uploadToCloudinary(localPath);

    // Example response shape — replace with your ApiResponse utility if available
    return res.status(200).json({ success: true, data: cloudResult });
  } catch (err) {
    next(err); // ensure you have an error handler middleware that understands ApiError
  }
});

module.exports = router;
```

Hooks & middleware:

- If you use `asyncHandler` (a wrapper to catch async errors) you can wrap the route handler to avoid try/catch blocks.
- Add a centralized error-handling middleware (if you don't already have one) to translate `ApiError` instances to clean HTTP responses with proper status codes and JSON body.

Security & production notes:

- Validate uploaded files (MIME type and size) before uploading to Cloudinary. Multer can enforce file-size limits and simple file filters.
- Use signed or limited uploads in production if exposing direct browser uploads to Cloudinary.
- Consider streaming uploads directly to Cloudinary or using Cloudinary's signed upload flow to reduce disk IO and latency.


- Follow common branch workflow: feature branches off `dev` and PRs to `dev`.
- Keep functions small and modular; add tests for important logic.
- Update this README when adding new env vars, scripts, or deployment steps.

Code style & linting:
- No linter configured yet. Consider adding ESLint and Prettier for consistent style.

## Troubleshooting

- MongoDB connection fails: ensure `MONGO_URI` is correct and reachable. Check firewall and Atlas IP whitelist.
- Port already in use: change `PORT` or stop the conflicting process.
- Unexpected crashes: check logs printed to the console, look at `connectDB()` errors.


