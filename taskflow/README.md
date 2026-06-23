# ⚡ TaskFlow — Microservices Task Manager

A complete, production-ready microservices project built with:

| Layer | Technology |
|---|---|
| Task Service | Spring Boot 3 + MySQL + Feign + RabbitMQ + Kafka |
| Comment Service | NestJS + MongoDB + RabbitMQ + Kafka |
| Service Discovery | Netflix Eureka |
| Config Server | Spring Cloud Config |
| API Gateway | Spring Cloud Gateway + Keycloak JWT |
| Frontend | Angular 17 + Tailwind CSS |
| Infra | Docker Compose |

---

## 🗂️ Project Structure

```
taskflow/
├── eureka-server/          # Service registry (port 8761)
├── config-server/          # Centralized config (port 8888)
├── api-gateway/            # Gateway + JWT validation (port 8090)
├── task-service/           # Spring Boot + MySQL (port 8081)
├── comment-service/        # NestJS + MongoDB (port 3000)
├── frontend/               # Angular 17 (port 4200 / 80 in Docker)
└── docker-compose.yml
```

---

## 🔄 Communication Architecture

```
Angular Frontend
      │
      ▼ HTTP
API Gateway (8090)  ← Validates Keycloak JWT
      │
      ├─► task-service (8081)
      │        │
      │        ├─► Feign (sync) ──────────► comment-service (3000)
      │        ├─► RabbitMQ (async) ──────► comment-service consumes
      │        └─► Kafka (async) ─────────► comment-service consumes
      │
      └─► comment-service (3000)
               └─► Kafka (async) ─────────► publishes COMMENT_CREATED
```

---

## 🚀 Quick Start

### Prerequisites
- Docker + Docker Compose
- (Optional for local dev) Java 21, Node 20, Maven

### 1. Start everything
```bash
cd taskflow
docker-compose up --build
```

### 2. Access services

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| API Gateway | http://localhost:8090 |
| Eureka Dashboard | http://localhost:8761 |
| Keycloak Admin | http://localhost:8080 |
| RabbitMQ Management | http://localhost:15672 (admin/admin) |
| Task Swagger UI | http://localhost:8081/swagger-ui.html |
| Comment Swagger | http://localhost:3000/api/docs |

---

## ⚙️ Keycloak Setup (First Time)

1. Go to http://localhost:8080 → Admin Console (admin/admin)
2. Create realm: **TaskFlow**
3. Create client: **taskflow-frontend** (public client)
4. Create a test user

For **local dev without Keycloak**, the frontend includes a mock login that stores a local token. Replace `AuthService.login()` with Keycloak OIDC for production.

---

## 🔌 API Reference

### Task Service (via Gateway at /api/tasks)

| Method | Path | Description |
|---|---|---|
| GET | /api/tasks | List all tasks |
| GET | /api/tasks/{id} | Get task + comments (Feign) |
| POST | /api/tasks | Create task → RabbitMQ event |
| PATCH | /api/tasks/{id}/status | Update status → Kafka event |
| DELETE | /api/tasks/{id} | Delete task |

### Comment Service (via Gateway at /api/comments)

| Method | Path | Description |
|---|---|---|
| GET | /api/comments | List all comments |
| GET | /api/comments/task/{taskId} | Get comments for task |
| POST | /api/comments | Create comment → Kafka event |
| DELETE | /api/comments/{id} | Delete comment |

---

## 📡 Messaging Events

### RabbitMQ
- **Exchange**: `taskflow.exchange`
- **Queue**: `task.events.queue`
- **Routing Key**: `task.created`
- **Flow**: `task-service publishes → comment-service consumes`

### Kafka Topics
| Topic | Producer | Consumer |
|---|---|---|
| `task-status-topic` | task-service | comment-service |
| `comment-created-topic` | comment-service | (extensible) |

---

## 🛠️ Local Development

### Run task-service locally
```bash
cd task-service
mvn spring-boot:run
```

### Run comment-service locally
```bash
cd comment-service
npm install
npm run start:dev
```

### Run frontend locally
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:4200
```

---

## 🏗️ Architecture Decisions

| Decision | Reason |
|---|---|
| Feign for comments fetch | Synchronous — task detail needs comment data immediately |
| RabbitMQ for task events | Reliable async notification to comment-service |
| Kafka for status changes | High-throughput event streaming (auditing, notifications) |
| Eureka | Service discovery so gateway can load-balance by name |
| Config Server | Centralized config per environment |
| Keycloak | Enterprise-grade OAuth2/OIDC — all services validate JWT |
