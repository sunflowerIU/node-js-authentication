# Node.js Authentication API

A secure authentication backend API built with Node.js, Express, TypeScript, MongoDB, and JWT.  
This project demonstrates modern authentication features such as access and refresh tokens, email verification, password reset, Google OAuth, role-based access control, and two-factor authentication using TOTP.

## Overview

This project is a backend authentication system created for learning and portfolio purposes. It focuses on how real-world authentication works in a Node.js API, including user registration, login, protected routes, refresh token flow, admin-only routes, OAuth login, email-based account verification, password reset, and 2FA setup.

The API is designed with a modular folder structure using routes, controllers, middleware, models, schemas, configuration files, and helper libraries.

## Features

- User registration
- User login
- Password hashing using bcrypt
- JWT access token authentication
- Refresh token support using cookies
- Protected user route
- Admin-only protected route
- Email verification
- Forgot password flow
- Reset password flow
- Google OAuth authentication
- Two-factor authentication using TOTP
- QR code generation for authenticator apps
- Request validation using Zod
- MongoDB database connection using Mongoose
- Environment variable configuration using dotenv
- Health check endpoint

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT, Cookies |
| Password Security | bcryptjs |
| OAuth | Google OAuth |
| Email Service | Nodemailer |
| Validation | Zod |
| 2FA | otplib, qrcode |
| Dev Tool | ts-node-dev |

## Project Structure

```bash
src/
├── config/              # Database and app configuration
├── controllers/
│   └── auth/            # Auth, Google OAuth, and 2FA controllers
├── lib/                 # Helper utilities
├── middleware/          # Auth and admin middleware
├── models/              # Mongoose models
├── routes/              # Auth, user, and admin routes
├── scripts/             # Utility scripts
├── app.ts               # Express app setup
└── server.ts            # Server entry point
```

# Api Routes
-- Health Check

| Method | Endpoint  | Description                  |
| ------ | --------- | ---------------------------- |
| GET    | `/health` | Checks if the API is running |


-- Authentication routes

| Method | Endpoint                | Description                                     |
| ------ | ----------------------- | ----------------------------------------------- |
| POST   | `/auth/register`        | Register a new user                             |
| POST   | `/auth/login`           | Login user                                      |
| GET    | `/auth/verify-email`    | Verify user email                               |
| POST   | `/auth/refresh`         | Generate a new access token using refresh token |
| POST   | `/auth/logout`          | Logout user                                     |
| POST   | `/auth/forgot-password` | Send password reset request                     |
| POST   | `/auth/reset-password`  | Reset user password                             |
| GET    | `/auth/google`          | Start Google OAuth login                        |
| GET    | `/auth/google/callback` | Google OAuth callback                           |
| POST   | `/auth/2fa/setup`       | Set up two-factor authentication                |
| POST   | `/auth/2fa/verify`      | Verify two-factor authentication code           |

-- Protected user route

| Method | Endpoint   | Description                          |
| ------ | ---------- | ------------------------------------ |
| GET    | `/user/me` | Get authenticated user test response |

-- Protected admin route

| Method | Endpoint    | Description                  |
| ------ | ----------- | ---------------------------- |
| GET    | `/admin/me` | Get admin-only test response |


## Authentication Flow

The authentication system uses access tokens and refresh tokens.

- The user registers or logs in.
- The server validates the user credentials.
- The server creates an access token and refresh token.
- The access token is used to access protected routes.
- The refresh token is stored in cookies and used to request a new access token.
- Protected routes use authentication middleware to verify the token.
- Admin routes use both authentication middleware and admin-check middleware.

  ## Enviromental Variables

  | Variable                   | Description                      |
| -------------------------- | -------------------------------- |
| `PORT`                     | Server port                      |
| `MONGO_URI`                | MongoDB connection string        |
| `JWT_ACCESS_SECRET`        | Secret key for access token      |
| `JWT_REFRESH_SECRET`       | Secret key for refresh token     |
| `ACCESS_TOKEN_EXPIRES_IN`  | Access token expiry time         |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiry time        |
| `EMAIL_USER`               | Email address used by Nodemailer |
| `EMAIL_PASS`               | Email app password               |
| `GOOGLE_CLIENT_ID`         | Google OAuth client ID           |
| `GOOGLE_CLIENT_SECRET`     | Google OAuth client secret       |
| `GOOGLE_CALLBACK_URL`      | Google OAuth callback URL        |
| `CLIENT_URL`               | Frontend/client URL              |



## Security Practices Used
- Passwords are hashed before saving to the database.
- JWT is used for stateless authentication.
- Refresh token is handled using cookies.
- Protected routes require authentication middleware.
- Admin routes require both authentication and role checking.
- Zod is used for request validation.
- Sensitive credentials are stored in environment variables.
- Two-factor authentication adds an extra login security layer.

## What I Learned

Through this project, I practiced:

- Building authentication APIs with Express and TypeScript
- Creating register and login flows
- Using JWT access and refresh tokens
- Protecting routes with middleware
- Connecting Node.js with MongoDB using Mongoose
- Implementing Google OAuth login
- Sending verification and password reset emails
- Adding two-factor authentication using TOTP
- Structuring a backend project in a clean and maintainable way

## Future Improvements
- Add automated tests
- Add Swagger/OpenAPI documentation
- Improve error handling with a global error middleware
- Add rate limiting for login and password reset routes
- Add Docker support
- Add refresh token rotation
- Add frontend integration example
- Deploy the API to a cloud platform
  
