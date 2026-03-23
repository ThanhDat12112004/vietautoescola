# Viet Acosla - Online Quiz Microservices (VI/ES)

## Architecture

Project uses microservice architecture with clear layers:

- API Gateway: route and rate-limit all client traffic.
- User Service: register/login/logout and single-session login policy.
- Quiz Service: bilingual quizzes, attempts, scoring.
- Stats Service: leaderboard, user score summary, attempt history.
- Materials Service: subjects and learning materials (PDF metadata) domain.
- Media Service: image upload and local CDN-style static serving (no S3, no AWS).
- Web App: Next.js frontend for login, quiz taking, and result display.
- MySQL: primary relational database.

## Services and Default Ports

All ports are configurable in `.env`.

- API Gateway: `API_GATEWAY_PORT` (default `8080`)
- User Service: `USER_SERVICE_PORT` (default `4003`)
- Quiz Service: `QUIZ_SERVICE_PORT` (default `4001`)
- Media Service: `MEDIA_SERVICE_PORT` (default `4002`)
- Stats Service: `STATS_SERVICE_PORT` (default `4004`)
- Materials Service: `MATERIALS_SERVICE_PORT` (default `4005`)
- Web (Next.js): `WEB_PORT` (default `3000`)
- MySQL: `MYSQL_PORT` (default `3306`)

## Directory Layout

- `apps/api-gateway`: gateway entrypoint and proxy routes.
- `apps/web`: Next.js frontend.
- `services/user-service`: route -> controller -> service -> repository for auth.
- `services/quiz-service`: route -> controller -> service -> repository.
- `services/stats-service`: leaderboard and user exam history service.
- `services/materials-service`: learning materials and subjects service.
- `services/media-service`: route -> controller -> service for upload/static media.
- `infra/mysql`: schema init and SQL migrations.

## Quick Start

### 1. Configure environment

Copy environment template:

```bash
cp .env.example .env
```

Adjust values if needed.

### 2. Start MySQL

```bash
docker compose up -d mysql
```

Schema and seed data are loaded from `infra/mysql/init.sql` on first database creation.

### 3. Install dependencies

```bash
npm install
```

### 4. Run all services

```bash
npm run dev
```

This starts:

- api-gateway
- user-service
- quiz-service
- media-service
- stats-service
- materials-service
- web (Next.js)

### 5. Open app

- Frontend: `http://localhost:3000`
- Gateway health: `http://localhost:8080/health`

## API Surface (through gateway)

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /api/quizzes?lang=vi|es`
- `GET /api/quizzes/:id?lang=vi|es`
- `POST /api/attempts/start`
- `POST /api/attempts/:id/submit`
- `GET /stats/leaderboard?limit=20`
- `GET /stats/me/dashboard?lang=vi|es`
- `GET /materials/subjects?lang=vi|es`
- `GET /materials/subjects/:id/materials?lang=vi|es`
- `POST /materials/subjects/:id/materials` (admin only)
- `POST /media/upload-image` (admin only, multipart field: `image`)
- `GET /media/static/...` (served uploaded images)

## Single Session Policy

One account can only keep one active login session at a time.

- New login issues a new session id (`sid`) and invalidates previous devices.
- Old device tokens fail at next authenticated request.

## Seed Data

`infra/mysql/init.sql` includes a sample quiz with bilingual VI/ES questions and answers so the UI has data immediately.

## Optional Migration (existing DB)

If your DB already exists and is missing single-session column, run:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -proot viet_acosla < infra/mysql/migrations/20260321_single_session.sql
mysql -h 127.0.0.1 -P 3306 -u root -proot viet_acosla < infra/mysql/migrations/20260321_user_role.sql
```

## Notes

- Media storage is local filesystem, path from `MEDIA_STORAGE_DIR`.
- CDN-like URLs are generated from `CDN_BASE_URL`.
- No AWS/S3 dependencies are required.
- Role-based upload policy: only `admin` users can create learning materials and upload question images.
