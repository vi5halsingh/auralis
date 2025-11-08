
# Auralis — Backend

This repository contains the backend for Auralis — a Node.js + Express API that uses MongoDB (via Mongoose) for persistence. The goal of this README is to provide enough information for a new developer to get the project running locally, understand the code layout, and contribute safely.

## Quick facts

- Language: JavaScript (Node.js, CommonJS modules)
- Frameworks / Libraries: Express, Mongoose, dotenv, cors
- Database: MongoDB
- Run (dev): nodemon with dotenv auto-loading


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
- [User register](#Register-user)
- [User login](#login)
- [User Details Management](#user-details-management)
- [Contributing](#contributing)



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



## API reference (auth)

The application currently exposes authentication endpoints under `/api/v1/users` as wired in `src/app.js`.

## user-authentication

### Register-user

- URL: POST `/api/v1/users/register`
- Content-Type: multipart/form-data

Payload (form fields):
- `email` (string) — required
- `fullName` (string) — required
- `password` (string) — required (will be hashed before saving)
- `profileImage` (file) — optional but recommended (handled by multer)

Behavior (implemented in `src/controllers/user.controller.js`):
- Validates required fields and returns 400 when missing.
- Uploads `profileImage` to Cloudinary (`src/utils/cloudinary.js`) and deletes the local temp copy.
- Checks if a user with the same email already exists and returns 409 if so.
- Creates the user; password is hashed by a pre-save hook in the model.
- Returns 201 with an `ApiResponse` containing the created user (sensitive fields removed).

Example success response (201):

```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": { /* user object without password/refreshToken */ },
  "success": true
}
```

Example error responses:
- 400 — missing fields
- 409 — user already exists
- 500 — internal error (e.g., Cloudinary upload failed)

### Login 
- Obtain tokens and cookies 
- URL: POST `/api/v1/users/login`
- Content-Type: application/json

Payload (JSON):
- `email` or `userName` — use either to identify the user
- `password` — required

Behavior:
- The controller looks up a user by `email` or `userName`.
- Verifies password via the model's `isPasswordCorrect` method.
- On success, it calls `generateAccessAndRefreshToken(userId)` which:
  - calls `user.generateAccessToken()` and `user.generateRefreshToken()` (model methods),
  - stores the refresh token into `user.refreshToken = [refreshToken]` and saves the user (so refresh tokens can be tracked/invalidated),
  - returns both tokens.
- The controller sets two cookies on the response: `accessToken` and `refreshToken` with options `{ httpOnly: true, secure: true }` and sends an `ApiResponse` including the logged-in user (without password/refreshToken) and the tokens in the JSON body as well.

Example success response (200) + cookies set:

Response headers will include Set-Cookie for `accessToken` and `refreshToken` (httpOnly). The JSON body:

```json
{
  "statusCode": 200,
  "message": "Logged in successfully",
  "data": {
    "loggedInUser": { /* user object without password/refreshToken */ },
    "refreshToken": "<refresh-token>",
    "accessToken": "<access-token>"
  },
  "success": true
}
```

Notes & security:
- Cookies are set with `httpOnly: true` and `secure: true` in the current code — in development (HTTP) you may need `secure: false` to allow the browser to accept cookies.
- Storing refresh tokens server-side (in the user document) allows revocation of refresh tokens.
- Make sure `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are strong, stored safely in environment variables, and rotated as needed.

If you want, I can also:
- Add a `logout` endpoint that clears cookies and removes the refresh token from the user's record.

## Refresh token (implemented)

Short update: a refresh-token flow is implemented in `src/controllers/user.controller.js` as `reGenerateAccessAndRefreshToken`.

- It accepts the incoming refresh token from either `req.cookies.refreshToken` or `req.body.refreshToken`.
- The token is verified with `REFRESH_TOKEN_SECRET`. If valid, the server loads the user and issues a new access token and a new refresh token (token rotation).
- New tokens are saved to the user's `refreshToken` array (replacing existing tokens) and returned in the response; cookies are also updated (`accessToken` and `refreshToken`, httpOnly).
- This enables server-side revocation (by clearing the stored refresh tokens) and safer token rotation.

## Auth middleware (compare / verify)

Short update: an authentication middleware is provided at `src/middlewares/auth.middleware.js`.

- The middleware looks for the access token in `req.cookies.accessToken` or the `Authorization` header.
- It verifies the token using `JWT_SECRET`, fetches the user by ID, and attaches the user object to `req.user` for downstream handlers.
- If verification fails or the user is not found, it returns a 401 `ApiError`.

Notes:
- Cookies are set with `{ httpOnly: true, secure: true }` in the current code. For local development over HTTP, set `secure: false` so browsers accept cookies.
- There are minor naming inconsistencies in some helpers (e.g., `refereshToken` vs `refreshToken`) — consider normalizing to avoid confusion.

## User-Details-Management

The application now includes a comprehensive user details management system that extends the basic user authentication. This system handles user physical details, demographics, and location information.

### Database Schema

**UserDetails Model** (`src/models/userDetails.model.js`):
- `userId` (ObjectId, ref: 'User') - One-to-one relationship with User table
- `bodyDetails` (embedded object):
  - `height` (Number) - User height
  - `weight` (Number) - User weight  
  - `age` (Number) - User age
- `dateOfBirth` (Date) - User's date of birth
- `gender` (String, enum) - Values: 'male', 'female', 'other', 'prefer_not_to_say'
- `location` (embedded object):
  - `city` (String) - City name
  - `state` (String) - State/Province name
  - `country` (String) - Country name
- `isProfileComplete` (Boolean) - Profile completion status
- `timestamps` - Automatic createdAt and updatedAt fields

### API Endpoints

All user details endpoints are protected and require authentication. Base URL: `/api/v1/user-details`

#### Create User Details
- **URL**: POST `/api/v1/user-details/create`
- **Headers**: Authorization: Bearer `<accessToken>`
- **Content-Type**: application/json
- **Body**:
```json
{
  "bodyDetails": {
    "height": 175,
    "weight": 70,
    "age": 25
  },
  "dateOfBirth": "1998-01-01",
  "gender": "male",
  "location": {
    "city": "New York",
    "state": "NY",
    "country": "USA"
  }
}
```
- **Response**: 201 Created with user details object
- **Error Codes**: 
  - 401: User not authenticated
  - 409: User details already exist
  - 500: Server error during creation

#### Get User Details
- **URL**: GET `/api/v1/user-details/me`
- **Headers**: Authorization: Bearer `<accessToken>`
- **Response**: 200 OK with user details including joined user information
- **Features**: Uses MongoDB aggregation pipeline to join with User table for complete profile data

#### Update User Details
- **URL**: PATCH `/api/v1/user-details/update`
- **Headers**: Authorization: Bearer `<accessToken>`
- **Content-Type**: application/json
- **Body**: Any combination of fields to update
```json
{
  "bodyDetails": {
    "weight": 72
  },
  "location": {
    "city": "Los Angeles"
  }
}
```
- **Response**: 200 OK with updated user details
- **Features**: Partial updates supported, only provided fields are updated

#### Delete User Details
- **URL**: DELETE `/api/v1/user-details/delete`
- **Headers**: Authorization: Bearer `<accessToken>`
- **Response**: 200 OK with success message
- **Behavior**: Permanently deletes user details document

#### Get All User Details (Admin/Analytics)
- **URL**: GET `/api/v1/user-details/all?page=1&limit=10&search=keyword`
- **Headers**: Authorization: Bearer `<accessToken>`
- **Query Parameters**:
  - `page` (number): Page number for pagination
  - `limit` (number): Items per page
  - `search` (string): Optional search keyword
- **Response**: 200 OK with paginated user details list
- **Features**: 
  - Pagination support
  - Search functionality across location fields
  - User details joined with user information

### Implementation Features

1. **Data Validation**: All fields validated with Mongoose schema validators
2. **Aggregation Pipeline**: Used for efficient data retrieval with user information joins
3. **Error Handling**: Consistent error responses using ApiError utility
4. **Authentication**: All endpoints protected with authenticatUser middleware
5. **Partial Updates**: PATCH method supports selective field updates
6. **Data Integrity**: Unique constraint on userId ensures one-to-one relationship
7. **Indexing**: Optimized queries with proper MongoDB indexes

### Business Logic

- Each user can have only one details document (enforced by unique userId index)
- Profile completion status tracked via `isProfileComplete` field
- Location data structured for easy querying and analytics
- Body details stored as embedded document for efficient access
- Automatic timestamp management for audit trails

### Code Architecture

**Controller Pattern**: Follows the same asyncHandler wrapper pattern as user authentication
**Response Format**: Consistent ApiResponse format across all endpoints  
**Error Handling**: Centralized error handling with appropriate HTTP status codes
**Database Operations**: Optimized queries with proper indexing and aggregation pipelines
**Security**: All endpoints require valid JWT authentication token

### Integration Notes

- User details are automatically linked to the authenticated user via req.user._id
- No manual userId specification required in request bodies
- Consistent with existing user authentication patterns and response formats
- Ready for future extensions like profile completion tracking, analytics, etc.

## Contributing
  ## status code chart (Memu)
Informational responses (100 – 199)
Successful responses (200 – 299)
Redirection messages (300 – 399)
Client error responses (400 – 499)
Server error responses (500 – 599)
more : https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status

  ## github commit messages 
👉 https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13
