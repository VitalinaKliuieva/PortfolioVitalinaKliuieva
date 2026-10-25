# Portfolio: Spring Boot API + Angular SPA

A full-stack personal portfolio. A Spring Boot 3 (Java 21) backend serves portfolio content as a REST API, and an Angular 18 single-page app renders it. Content is data, not code: add or change a project by editing one JSON file.

## Architecture

```
Browser ── Angular 18 SPA (standalone components, signals)
              │  GET /api/portfolio        POST /api/contact
              ▼
        Spring Boot 3 REST API
          ├─ PortfolioController ─▶ PortfolioService ─▶ portfolio.json (loaded once at startup)
          └─ ContactController  ─▶ validation, honeypot, per-email rate limit, log
```

| Layer | Choice | Why |
|---|---|---|
| Backend | Java 21, Spring Boot 3.3, Gradle | Same stack as my production-style projects; records keep the model small |
| Content | `portfolio.json` mapped to Java records | No database needed for read-only content; edits need no code change |
| Frontend | Angular 18, standalone components, signals, SCSS | No NgModules; small bundle; typed API service |
| Validation | Jakarta Bean Validation (backend), Reactive Forms (frontend) | Validate on both sides |
| Tests | JUnit 5, Spring MockMvc | Fast API-level checks without a running server |

## Project structure

```
backend/
  build.gradle
  src/main/java/dev/vitalina/portfolio/
    PortfolioApplication.java     entry point
    Model.java                    records: Profile, Project, Experience, SkillGroup, Portfolio
    PortfolioService.java         loads portfolio.json at startup, lookup by id
    PortfolioController.java      GET /api/portfolio, /api/projects, /api/projects/{id}
    ContactController.java        POST /api/contact (validation, honeypot, rate limit)
    WebConfig.java                CORS from portfolio.allowed-origins
  src/main/resources/
    application.yml
    portfolio.json                ALL site content lives here
  src/test/.../PortfolioApiTest.java
frontend/
  proxy.conf.json                 dev proxy: /api -> http://localhost:8080
  src/app/
    app.component.ts              layout and sections (hero, experience, skills)
    projects.component.ts         filter chips, cards, case-study modal
    contact.component.ts          reactive form with honeypot field
    portfolio.service.ts          HttpClient wrapper
    models.ts                     TypeScript interfaces mirroring the Java records
  src/styles.scss                 design tokens (CSS variables), dark/light theme
```

## Prerequisites

- JDK 21
- Gradle 8+ (or generate the wrapper once with `gradle wrapper`)
- Node.js 18.19+ or 20+ and npm

## Run locally

```bash
# 1. Backend  -> http://localhost:8080
cd backend
./gradlew bootRun

# 2. Frontend -> http://localhost:4200  (proxies /api to :8080)
cd frontend
npm install
npm start
```

Quick check: `curl http://localhost:8080/api/portfolio`

## Configuration

| Property | Default | Purpose |
|---|---|---|
| `server.port` | `8080` | API port |
| `portfolio.allowed-origins` | `http://localhost:4200` | CORS origins for `/api/**` (comma-separated). Set your domain in production |

Override with environment variables, for example `PORTFOLIO_ALLOWED_ORIGINS=https://yourdomain.dev`.

## API reference

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/portfolio` | 200, full portfolio (cached 10 min) | none |
| GET | `/api/projects` | 200, list of projects | none |
| GET | `/api/projects/{id}` | 200, one project | 404 unknown id |
| POST | `/api/contact` | 202 accepted | 400 invalid body, 429 same email within 30 s |

Contact request:

```json
{ "name": "Anna", "email": "anna@example.com", "message": "Hello, we have a role for you.", "website": "" }
```

`website` is a honeypot: real users never see it, bots fill it in. A non-empty value is silently accepted and dropped. Constraints: `name` 1–80 chars, `email` valid and up to 120, `message` 10–2000.

## Content model

Edit `backend/src/main/resources/portfolio.json`, then restart the backend.

```json
{ "id": "my-project", "title": "...", "subtitle": "...", "category": "Full-stack",
  "period": "10.2026", "summary": "...", "problem": "...",
  "highlights": ["..."], "stack": ["Java 21"], "repoUrl": "https://github.com/...", "liveUrl": "" }
```

- `category` values become the filter chips automatically.
- Empty `repoUrl` / `liveUrl` hide the matching button.
- Empty `profile.linkedin` hides the LinkedIn button.
- If you add a field, add it to the Java record in `Model.java` and the interface in `models.ts`.

## Testing

```bash
cd backend && ./gradlew test
```

`PortfolioApiTest` covers: portfolio returned with profile and projects, unknown project returns 404, invalid contact returns 400, valid contact returns 202. Ideas to extend: rate-limit (429) test, honeypot test, and a Testcontainers or Selenium end-to-end test.

## Production build and deploy

Option A, single jar (simplest):

```bash
cd frontend && npm run build
cp -r dist/portfolio/browser/* ../backend/src/main/resources/static/
cd ../backend && ./gradlew bootJar
java -jar build/libs/portfolio-backend-1.0.0.jar
```

Spring Boot serves the files in `static/` and the API from the same origin, so CORS is not needed. Put Nginx with HTTPS (Let's Encrypt) in front on EC2 or any VPS. Example Dockerfile for the jar:

```dockerfile
FROM eclipse-temurin:21-jre
COPY backend/build/libs/portfolio-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

Option B, separate hosting: host the Angular build on any static host, deploy the jar separately, and set `portfolio.allowed-origins` to the frontend domain.

## Design decisions

- **JSON over database:** content is read-only and tiny, so a file removes a moving part. Swap `PortfolioService` for a JPA repository if you later want an admin UI.
- **Records for the model:** immutable, no boilerplate, serialize cleanly with Jackson.
- **Signals and `@if`/`@for` control flow:** current Angular style, no `async` pipe or `ngIf`/`ngFor` imports.
- **Honeypot plus rate limit, no CAPTCHA:** no third-party scripts or cookies, and the in-memory limiter is enough for a personal site. Use Redis or Bucket4j if you run several instances.
- **Contact messages are logged, not emailed:** keeps the project dependency-light. To send email, add `spring-boot-starter-mail` and call `JavaMailSender` in `ContactController`.
- **Accessibility:** keyboard-focusable cards, Escape closes the modal, `prefers-reduced-motion` respected.

## Troubleshooting

| Symptom | Fix |
|---|---|
| UI shows "API is not reachable" | Start the backend on port 8080; check `curl localhost:8080/api/portfolio` |
| CORS error in the browser | Add your frontend origin to `portfolio.allowed-origins` |
| `./gradlew: not found` | Run `gradle wrapper` once in `backend/`, or use your IDE's Gradle import |
| `ng: command not found` | Run `npm install` in `frontend/` first, then `npm start` |
| Contact returns 429 | Same email sent within 30 seconds; wait and retry |