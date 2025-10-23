# Boom

A monorepo workspace powered by Nx, containing NestJS backend services.

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm (comes with Node.js)

**Or with Docker:**
- Docker
- Docker Compose

### Installation

```bash
npm install
```

### Run the Backend

#### Development Mode

Development mode enables hot reload - the server automatically restarts when you make code changes:

```bash
# Start backend in development mode (recommended)
npm start

# Or use the Nx command directly
npx nx serve backend
```

The backend will be available at: **http://localhost:3000/api**

**Swagger API Documentation:** http://localhost:3000/api/docs

To run on a custom port:
```bash
PORT=4000 npm start
```

#### Production Mode

```bash
# Build and run in production mode
npm run build
npm run start:prod

# Or build with production configuration
npx nx build backend --configuration=production
node dist/apps/backend/main.js
```

## Docker

### Run with Docker (Development Mode)

Development mode with Docker includes hot reload - the container will automatically reflect your code changes:

```bash
# Start the backend in development mode
docker-compose up

# Or run in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop the container
docker-compose down
```

The backend will be available at: **http://localhost:3000/api**

**Swagger API Documentation:** http://localhost:3000/api/docs

### Run with Docker (Production Mode)

Production mode uses optimized builds and runs as a non-root user for security:

```bash
# Start the backend in production mode
docker-compose -f docker-compose.prod.yml up

# Or run in detached mode (background)
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Stop the container
docker-compose -f docker-compose.prod.yml down
```

### Docker Management Commands

```bash
# Rebuild the Docker image (after dependency changes)
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Remove containers and volumes
docker-compose down -v

# View running containers
docker-compose ps

# Execute commands inside the container
docker-compose exec backend sh
```

### Other Commands

```bash
# Build the backend
npm run build

# Build all projects
npm run build:all

# Run tests
npm test

# Run end-to-end tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format

# View dependency graph
npm run graph
```

## Project Structure

```
boom/
├── apps/
│   ├── backend/         # NestJS REST API
│   └── backend-e2e/     # E2E tests
├── dist/                # Build output
└── package.json         # Dependencies and scripts
```

## Technology Stack

- **Nx** - Monorepo management and build system
- **NestJS** - Backend framework
- **TypeScript** - Programming language
- **Webpack** - Module bundler
- **Swagger/OpenAPI** - API documentation

## Adding New Features

```bash
# Generate a new NestJS module
npx nx g @nx/nest:module --name=users --project=backend

# Generate a controller
npx nx g @nx/nest:controller --name=users --project=backend

# Generate a service
npx nx g @nx/nest:service --name=users --project=backend
```

## API Documentation

The backend includes Swagger/OpenAPI documentation for all endpoints.

**Access Swagger UI:**
- Local: http://localhost:3000/api/docs
- Docker: http://localhost:3000/api/docs

The Swagger interface provides:
- Interactive API testing
- Complete endpoint documentation
- Request/response schemas
- Authentication details (when configured)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)

Example:
```bash
PORT=4000 npm start
```

## Documentation

For more detailed information, see [CLAUDE.md](./CLAUDE.md).