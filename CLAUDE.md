# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Nx monorepo workspace named "boom" containing multiple applications. Currently includes:
- **backend** - A NestJS REST API application located in `apps/backend/`
- **backend-e2e** - End-to-end tests for the backend application

## Technology Stack

- **Monorepo Management**: Nx 22.0.0
- **Backend Framework**: NestJS 11.0.0
- **Runtime**: Node.js 20.x
- **Build Tool**: Webpack 5.x with webpack-cli
- **Language**: TypeScript 5.9.2
- **Package Manager**: npm

## Getting Started

### Initial Setup

```bash
# Install dependencies (if not already installed)
npm install
```

### Running Applications

**Using npm scripts (recommended):**
```bash
# Start backend in development mode (hot reload enabled)
npm start

# Start in production mode
npm run start:prod
```

**Using Nx commands directly:**
```bash
# Start the backend in development mode
npx nx serve backend

# Start the backend in production mode
npx nx serve backend --configuration=production

# Run the built application directly (must build first)
npx nx build backend
node dist/apps/backend/main.js
```

**Backend Application:**
- Default URL: `http://localhost:3000/api`
- Swagger API Docs: `http://localhost:3000/api/docs`
- Port can be customized via `PORT` environment variable
- Global API prefix: `/api`

**Running with custom port:**
```bash
PORT=4000 npm start
```

### Docker Development

```bash
# Start backend in development mode with Docker (hot reload enabled)
docker-compose up

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop containers
docker-compose down

# Rebuild image
docker-compose build
```

**Production Docker:**
```bash
# Start with production configuration
docker-compose -f docker-compose.prod.yml up

# Stop production containers
docker-compose -f docker-compose.prod.yml down
```

### Building Applications

```bash
# Build backend (production) - npm script
npm run build

# Build all projects
npm run build:all

# Build with Nx directly
npx nx build backend
npx nx build backend --configuration=development
```

Build output is located in `dist/apps/backend/`

### Testing

```bash
# Run all tests
npm test

# Run e2e tests
npm run test:e2e

# Using Nx directly
npx nx e2e backend-e2e
npx nx run-many -t test
```

### Code Quality

```bash
# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint

# Using Nx directly
npx nx format:write
npx nx lint backend
```

### Nx Utilities

```bash
# View dependency graph
npm run graph

# Show project details and available targets
npx nx show project backend

# Clear Nx cache
npx nx reset
```

## Architecture

### Monorepo Structure

```
boom/
├── apps/                    # Application projects
│   ├── backend/            # NestJS backend service
│   │   ├── src/
│   │   │   ├── app/       # Application module, controllers, services
│   │   │   ├── assets/    # Static assets
│   │   │   └── main.ts    # Application entry point
│   │   ├── project.json   # Nx project configuration
│   │   ├── tsconfig.json  # TypeScript config
│   │   └── webpack.config.js
│   └── backend-e2e/        # E2E tests for backend
├── dist/                   # Build output (generated)
├── node_modules/           # Dependencies
├── nx.json                 # Nx workspace configuration
├── package.json            # Root package.json with all dependencies
└── tsconfig.base.json      # Base TypeScript configuration
```

### Backend Application Structure

The backend follows NestJS conventions with a modular architecture:

**Core Files:**
- **main.ts** (apps/backend/src/main.ts:11) - Bootstrap function that creates the NestJS application with:
  - Global validation pipe (whitelist, forbidNonWhitelisted, transform enabled)
  - Swagger/OpenAPI documentation setup at `/api/docs`
  - Global prefix `/api` for all routes
- **app.module.ts** - Root module importing AuthModule and UsersModule
- **app.controller.ts** - Root controller with basic health check endpoints
- **app.service.ts** - Root service with application logic

**Feature Modules:**

*Users Module* (`apps/backend/src/users/`):
- In-memory user storage (no database yet)
- Password hashing with bcrypt (10 rounds)
- User CRUD operations and validation
- Exports UsersService for use by AuthModule

*Auth Module* (`apps/backend/src/auth/`):
- JWT-based authentication with Passport
- Access tokens (15min lifespan) and refresh tokens (7 days)
- In-memory refresh token storage (Map-based)
- Endpoints: sign-up, sign-in, refresh, logout
- Custom decorators: `@CurrentUser()` extracts user from request
- Guards: `JwtAuthGuard` for protecting routes
- Strategies: JWT strategy validates access tokens

**Authentication Flow:**
1. User signs up/in → receives access + refresh tokens
2. Protected routes use `@UseGuards(JwtAuthGuard)`
3. Extract user data with `@CurrentUser()` decorator
4. Refresh tokens stored in-memory (lost on restart)
5. Access token expired → use refresh token to get new pair

### Nx Configuration

- **nx.json** - Defines target defaults (build, lint, test caching) and plugins
- **project.json** - Per-project configuration defining build targets, executors, and dependencies
- Build output goes to `dist/apps/{project-name}/`
- Nx uses Webpack plugin for build orchestration

## Development Workflow

### Adding New Applications

```bash
# Add another NestJS application
npx nx g @nx/nest:application --name=app-name --directory=apps/app-name

# Add a library
npx nx g @nx/nest:library --name=lib-name --directory=libs/lib-name
```

### Adding NestJS Resources

```bash
# Generate a new module
npx nx g @nx/nest:module --name=module-name --project=backend

# Generate a controller
npx nx g @nx/nest:controller --name=controller-name --project=backend

# Generate a service
npx nx g @nx/nest:service --name=service-name --project=backend
```

### Running Multiple Tasks

```bash
# Run build for all affected projects
npx nx affected -t build

# Run tests for all affected projects
npx nx affected -t test
```

## Build System

- **Executor**: Uses `nx:run-commands` with webpack-cli for building
- **Cache**: All build, lint, and test targets are cached by default
- **Output**: Built artifacts are placed in `dist/apps/backend/`
- **Production builds**: Use `--node-env=production` flag
- **Development builds**: Use `--node-env=development` flag for faster rebuilds

## Environment Configuration

The backend application uses the following environment variables:
- **PORT** - Server port (default: 3000)
- **HOST** - Server host (default: 0.0.0.0 in Docker, localhost otherwise)
- **JWT_SECRET** - Secret for access tokens (default: 'secret-key-change-in-production')
- **JWT_REFRESH_SECRET** - Secret for refresh tokens (default: 'refresh-secret-key-change-in-production')

**Important Notes:**
- Default JWT secrets are for development only - MUST be changed in production
- In-memory storage means user data and refresh tokens are lost on restart
- No database configured yet - consider adding PostgreSQL/MongoDB for production

## API Documentation

Swagger/OpenAPI documentation is automatically generated and available at:
- **Local**: http://localhost:3000/api/docs
- **Docker**: http://localhost:3000/api/docs

The Swagger UI provides:
- Interactive API testing
- Complete endpoint documentation
- Request/response schemas with validation rules
- DTO examples for all endpoints
