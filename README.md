# NestJS Microservice Authentication Template

A fully-featured **NestJS microservices authentication template** with **MongoDB**, **TypeScript**, **JWT + Passport**, supporting **Google OAuth login** and **email/password login**.

This template is structured for a microservices architecture using **TCP transport** and can be extended for multiple services like `user-service`, `events-service`, and `auth-gateway`.

---

## Table of Contents

- [Features](#features)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Services](#running-the-services)
- [API Endpoints](#api-endpoints)
- [Microservice Communication](#microservice-communication)
- [Authentication Flow](#authentication-flow)
- [Troubleshooting](#troubleshooting)

---

## Features

- Email/password registration and login
- Google OAuth 2.0 login
- JWT authentication
- Passport.js integration
- NestJS microservice-ready (TCP)
- MongoDB integration
- Environment-based configuration
- Easy to extend for additional microservices

---

## Folder Structure

```text
my-nest-app-microservice/
│
├── apps/
│   ├── auth-gateway/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── dto/
│   │   │   │   │   └── auth-credential.dto.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   └── local-auth.guard.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── google.strategy.ts
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── local.strategy.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── common/
│   │   │   │   └── clients.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── .env
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── events-service/
│   │   ├── src/
│   │   │   ├── email/
│   │   │   │   ├── email.controller.ts
│   │   │   │   └── app.module.ts
│   │   │   └── main.ts
│   │   ├── .env
│   │   ├── package-lock.json
│   │   └── package.json
│   │
│   └── user-service/
│       ├── src/
│       │   ├── users/
│       │   │   ├── dto/
│       │   │   │   └── create-user.dto.ts
│       │   │   ├── schemas/
│       │   │   │   └── user.schemas.ts
│       │   │   ├── users.controller.spec.ts
│       │   │   ├── users.controller.ts
│       │   │   ├── users.module.ts
│       │   │   └── users.service.ts
│       │   ├── app.module.ts
│       │   ├── clients.ts
│       │   └── main.ts
│       ├── .env
│       ├── package-lock.json
│       └── package.json
│
├── dist/
├── node_modules/
├── test/
│   └── app.e2e-spec.ts
├── utils/
│   └── email.utils.ts
├── .env
├── .env.local
├── .gitignore
├── .prettierc
├── eslint.config.js
├── nest-cli.json
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.build.json
└── tsconfig.json

```

## Environment Variables

Each service has its own `.env` file. Example:

**auth-gateway/.env**

```
PORT=3000
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
USER_SERVICE_PORT=4001
```

**user-service/.env**

```
PORT=4001
MONGO_URI=mongodb://localhost:27017/users_db
```

**events-service/.env**

```
PORT=4002
MONGO_URI=mongodb://localhost:27017/events_db
```

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/my-nest-app-microservice.git
cd my-nest-app-microservice
```

2. Install dependencies for each service:

```bash
cd apps/auth-gateway
npm install
cd ../user-service
npm install
cd ../events-service
npm install
```

---

## Running the Services

Each service runs independently.

```bash
# Start user-service
cd apps/user-service
npm run start:dev

# Start events-service
cd apps/events-service
npm run start:dev

# Start API gateway
cd apps/auth-gateway
npm run start:dev
```

API Gateway will run on `http://localhost:3000`.  
User-service TCP listens on port `4001` and events-service on `4002`.

---

## API Endpoints

### Auth Gateway

| Method | Route                 | Description                      |
| ------ | --------------------- | -------------------------------- |
| POST   | /auth/register        | Register user via email/password |
| POST   | /auth/login           | Login user via email/password    |
| GET    | /auth/google          | Redirect to Google OAuth         |
| GET    | /auth/google/redirect | Google OAuth callback            |

**Note:** All routes that need authentication require a valid JWT token in `Authorization` header.

---

## Microservice Communication

- **TCP Transport** is used for service-to-service communication.
- API Gateway sends requests to `user-service` for user registration and login.
- Example:

```ts
const user = await firstValueFrom(
  await this.clientUserService.send({ cmd: 'create_user' }, userDto),
);
```

- `user-service` handles messages with `@MessagePattern({ cmd: 'create_user' })`.

---

## Authentication Flow

### Email/Password

1. User sends `POST /auth/register` with email and password.
2. `auth-gateway` sends data to `user-service` via TCP.
3. User-service hashes password, saves to MongoDB, returns user.
4. On login, password is compared using `bcrypt.compare()`.
5. JWT is issued and returned to user.

### Google OAuth

1. User clicks login with Google button → redirected to Google OAuth.
2. Google redirects to `/auth/google/redirect` with profile info.
3. Auth gateway validates user or creates new entry in user-service.
4. JWT is issued and returned.

---

## Troubleshooting

1. **Connection refused errors**
   - Ensure all services are running on their correct ports.
   - Verify `.env` configuration.

2. **Google OAuth error 400: redirect_uri_mismatch**
   - Update Google Cloud Console with correct redirect URI:  
     `http://localhost:3000/auth/google/redirect`

3. **JWT errors**
   - Ensure `JWT_SECRET` is set in `.env` and matches across services.

4. **Mongoose CastError**
   - Ensure your DTO and schema match the data sent to MongoDB.

---
