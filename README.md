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
