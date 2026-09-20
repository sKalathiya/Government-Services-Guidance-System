GovGuide --- Project Plan

## 1. Project Overview

**GovGuide** is an India-focused government-service discovery
application. V1 will cover a small, manually verified set of
approximately 10--15 Gujarat and Central Government services.

GovGuide helps users identify potentially relevant government services
and understand how to apply for them using verified service information.
Visitors can freely browse and search services. Authenticated users
additionally receive AI-guided service discovery and can manage their
personal application progress.

GovGuide does **not** submit government applications, does **not** track
actual government application status, and does **not** treat AI
recommendations as authoritative government information.

The verified service record is the source of truth.

---

## 2. V1 Scope

### Visitor

- Browse active services.
- Search services by partial service name.
- Filter services by jurisdiction.
- View complete service information.
- Open the official government application link.
- Cannot use AI discovery.
- Cannot create personal progress.

### USER

Everything available to a Visitor, plus: - AI-guided service
discovery. - View and update own profile. - Start tracking a service. -
Check and uncheck application steps. - View derived progress
percentage. - Remove own progress records. - Cannot access another
user's information. - Cannot manage service records.

### ADMIN

- Login to the Admin experience.
- View dashboard counts.
- Search and manage active/inactive services.
- Create services.
- Update services.
- Activate/deactivate services.
- Update own profile.
- Does not use AI discovery.
- Does not use My Progress.
- Cannot modify users' personal information or progress.

### Explicitly Out of Scope for V1

- Government application submission.
- Actual government application-status tracking.
- More than Gujarat + Central Government jurisdictions.
- Departments/categories/district filtering.
- AI conversation history.
- Refresh tokens.
- Automated scraping of government websites.
- Automated official-link monitoring.
- LlamaParse/document ingestion.
- HNSW vector indexing.
- Advanced analytics.
- Multi-agent AI.
- Complex caching.

---

## 3. Core User Journeys

### Public Service Discovery

Visitor flow:

`Search/Browse → Select Service → Service Detail → Official Government Application Link`

### AI-Guided Discovery

Authenticated USER flow:

`Describe Situation → Semantic Retrieval → AI Clarifying Question(s) → User Answers → Retrieval Again → 2–3 Potential Services → Select Service → Verified Service Detail → Official Government Link`

The AI may ask multiple questions. It must not force a recommendation
when the available service data does not contain a suitable match.

### Progress Tracking

`Service Detail → "I'm working on this" → Checklist → Check/Uncheck Steps → Derived Percentage → Completed`

"Completed" means the user completed all application steps tracked by
GovGuide. It does **not** mean the government approved the application.

---

## 4. Jurisdictions

V1 supports:

- Gujarat
- Central Government

Use a `Jurisdiction` concept rather than representing Central Government
as a state.

Each Service belongs to exactly one Jurisdiction.

The architecture should allow additional states/jurisdictions later.
Similar services in different jurisdictions should be separate service
records because eligibility, documents, fees, procedures, and URLs can
differ.

Departments are not part of V1.

---

## 5. Service Data Model

A Service contains:

- `id`
- `name` --- required
- `description` --- required
- `eligibility` --- required
- `required_documents` --- required list
- `fees` --- optional
- `processing_time` --- optional
- `official_url` --- required
- `source_url` --- required
- `jurisdiction_id` --- required
- `is_active` --- required
- `last_verified_at` --- required
- `created_at`
- `updated_at`
- semantic embedding
- embedding processing status

Fees must distinguish between a genuinely free service and fee
information that is unavailable.

`official_url` is the application/service destination. `source_url` is
the official government source used to verify GovGuide's stored
information. They may be different.

### ServiceStep

Application steps are separate records:

- `id`
- `service_id`
- `step_text`
- `step_order`

Default ordering follows creation order unless the Admin explicitly
reorders the steps.

---

## 6. User Data Model

A User contains:

- `id`
- `name`
- `email` --- unique
- `password_hash`
- `role` --- `USER` or `ADMIN`

V1 does not collect: - Phone - Address - Date of birth - Government ID -
Profile picture

Passwords are never stored in plaintext.

---

## 7. Progress Data Model

A Progress record contains:

- `id`
- `user_id`
- `service_id`
- `status`
- completed ServiceStep association/list
- `created_at`
- `updated_at`

Statuses:

- `WORKING_ON`
- `COMPLETED`

Do not persist: - `total_steps` - `current_step` - `progress_percentage`

Progress percentage is derived from:

`completed current service steps / total current service steps × 100`

There must be a unique constraint on:

`user_id + service_id`

A user therefore has at most one Progress record per Service.

### Latest-Step Policy

Progress always reflects the Service's **current** steps.

- New Admin step → appears incomplete for existing users.
- Removed step → stops counting.
- Edited wording with the same step ID → updated wording appears while
  completion remains.
- Steps do not have to be completed sequentially.

---

## 8. Database Relationships

- Jurisdiction `1 → many` Services
- Service `many → 1` Jurisdiction
- Service `1 → many` ServiceSteps
- ServiceStep `many → 1` Service
- User `1 → many` Progress records
- Progress `many → 1` User
- Service `1 → many` Progress records
- Progress `many → 1` Service

User and Service have no direct ownership relationship outside Progress.

---

## 9. Service Search

### Visitor / USER

Search supports: - Partial service-name matching. - Jurisdiction
filtering. - Active services only.

### ADMIN

Management search supports: - Service-name search. - Jurisdiction
filter. - Active/inactive filter. - Both active and inactive records.

No category, department, district, advanced search, or complex sorting
is required in V1.

---

## 10. AI Service Discovery

AI is available only to authenticated `USER` accounts.

### Retrieval Pipeline

1.  User describes their situation.
2.  Generate a query embedding.
3.  Apply jurisdiction filtering before vector retrieval when
    jurisdiction is known.
4.  Perform exact cosine similarity search against eligible active
    services.
5.  Select up to the top 5 candidates above a configurable relevance
    threshold.
6.  Supply those candidate records to the LLM.
7.  LLM asks clarification question(s) when necessary.
8.  User answers.
9.  Combine the original situation with relevant answers.
10. Generate a new query embedding.
11. Run retrieval again.
12. Updated top 5 candidates may differ from the initial candidates.
13. LLM recommends 2--3 potentially relevant services.
14. User selects a recommendation.
15. GovGuide opens the normal verified Service Detail page.

If no candidate passes the threshold, return the no-match flow instead
of sending arbitrary services to the LLM.

### Embedding Content

Service embeddings are generated from:

- Service name
- Description
- Eligibility

Do not include frequently changing/non-semantic fields simply to
increase embedding size.

### LLM Context

For candidate evaluation, provide:

- Service ID
- Name
- Description
- Eligibility
- Required documents

The LLM does not need to generate fees, processing time, application
steps, or official links. Those come directly from the verified database
after the user selects a service.

### AI Output Rules

The LLM must: - Use only supplied candidate context. - Never invent a
service. - Never invent eligibility. - Never invent required
documents. - Never invent fees/procedures/government facts. - Recommend
only supplied candidate service IDs. - Return a clarification question,
recommendations, or no-match as appropriate.

Application code must validate AI output. A recommended service ID must
actually belong to the candidate set sent to Gemini.

AI is a discovery layer, not the source of truth.

---

## 11. AI Conversation State

AI conversations are temporary.

During the current discovery flow, temporary state may contain: -
Original situation - Clarification questions - Answers - Current
candidates - Discovered jurisdiction

Do not persist: - AI conversation history - User situation - Questions -
Answers - Recommendations

The AI session ends when the user selects a recommended service.

Refreshing or closing the page may lose the current AI session in V1.
The user can restart discovery.

---

## 12. Authentication

### Registration

- User supplies name, email, and password.
- Validate input.
- Hash password using bcrypt.
- Create `USER` account by default.

### Login

- Validate email/password.
- Return/create a short-lived JWT access token.
- No refresh token in V1.

### JWT

JWT contains only required identity/authorization claims such as: - User
ID - Role

Prefer an `HttpOnly` cookie for browser storage. Use secure production
cookie settings.

### Authorization Layers

1.  Authentication guard --- valid identity?
2.  Role guard --- allowed role?
3.  Ownership check --- does the requested resource belong to this user?

Never trust a frontend-supplied `user_id` for ownership.

---

## 13. Security & Validation

### Passwords

- bcrypt hashing.
- Minimum 8 characters.
- Never expose hashes through API responses.

### Request Validation

Validate all external input, including: - Registration/login. - Profile
updates. - Service creation/update. - Jurisdiction values. -
Required-document lists. - Service steps. - URLs. - Progress updates. -
AI situation/answers.

### URLs

`official_url` and `source_url` must be valid HTTPS URLs.

Admin is responsible for confirming that stored sources are official
government sources. Automated government-domain verification is not
required in V1.

### Rate Limiting

Use stricter limits for: - Login - Registration - AI discovery

Exact limits should be determined during implementation/testing rather
than invented during architecture planning.

### Secrets

Keep outside source control: - JWT secret - Gemini API key - PostgreSQL
credentials - Redis credentials - Internal-service credentials

Use environment configuration and never commit real `.env` secrets.

### Internal AI Service

FastAPI is not a public frontend API.

Required boundary:

`React → NestJS → FastAPI`

React must not directly call FastAPI.

### Safe Errors

Do not expose: - Stack traces - SQL errors - Credentials - Internal
configuration - Raw provider errors

---

## 14. Admin Dashboard

Dashboard shows: - Active service count. - Inactive service count. -
Total user count. - Total Progress record count. - Service-management
list.

"Total progress" means the number of Progress records, not the
sum/average of progress percentages.

V1 does not include: - Charts. - Conversion analytics. - AI analytics. -
Individual user progress inspection. - Activity graphs.

---

## 15. Admin Service Management

Admin can: - Create. - Update. - Activate. - Deactivate.

Services are normally deactivated rather than hard deleted.

Inactive services: - Remain in the database. - Remain visible to
Admin. - Are hidden from public/user search. - Are excluded from AI
recommendations.

### Create / Update Form

Admin manages: - Name. - Description. - Eligibility. - Required
documents. - Application steps. - Fees. - Processing time. - Official
URL. - Source URL. - Jurisdiction. - Active/inactive state.

Before save require: - Name. - Description. - Eligibility. - At least
one required document. - At least one application step. - Official
URL. - Source URL. - Jurisdiction. - Valid active/inactive state.

Fees and processing time are optional.

### Verification Timestamps

- `created_at` --- automatic.
- `updated_at` --- automatic on changes.
- `last_verified_at` --- set when initially researched from an
  official source and updated only when an Admin explicitly
  re-verifies the government information.

Do not treat `updated_at` as evidence that government information was
re-verified.

---

## 16. Embedding Job Queue

Embedding generation is asynchronous using **BullMQ + Redis**.

### Service Creation

`Admin Save → NestJS Saves Service → Queue Embedding Job → Request Completes → Worker Processes Job → FastAPI Generates Embedding → Embedding Stored`

Normal service browsing does not have to wait for embedding generation.

### Regenerate Embedding When

- Name changes.
- Description changes.
- Eligibility changes.

### Do Not Regenerate When Only

- Fees change.
- Processing time changes.
- Required documents change.
- Application steps change.
- Official/source URL changes.
- Active state changes.

### Embedding Status

Track an internal state such as:

`PENDING → PROCESSING → COMPLETED`

Failure:

`PROCESSING → FAILED`

Failed jobs can be retried with controlled retry/backoff behavior.

Only services with a valid `COMPLETED` embedding participate in semantic
retrieval.

Do not regenerate all embeddings during application startup/deployment.

---

## 17. API Planning

### Auth

- Register.
- Login.

### Profile

- Get own profile.
- Update own profile.
- Delete own account.

Registration creates the account/profile; there is no separate Create
Profile endpoint.

### Public/User Service API

- Search services.
- Filter by jurisdiction.
- Get service details.

### AI --- USER Only

- Start discovery.
- Continue discovery with clarification answers.
- Return next question, recommendations, or no-match.

### Progress --- USER Only

- Start tracking.
- List own progress.
- Get individual own progress if needed.
- Check/uncheck steps.
- Remove progress.
- Derive completion state.

### Admin

- Dashboard counts.
- Search active/inactive services.
- Create service.
- Update service.
- Activate/deactivate service.

Service mutation belongs to the Admin API, not the public Service API.

---

## 18. Frontend Pages

### Public

- Home
- Search
- Service Detail
- Login
- Register

### USER

- Ask AI
- My Progress
- Profile

### ADMIN

- Dashboard
- Service Management
- Create Service
- Edit Service

### Home

Primary actions: - Search Services. - Ask AI.

Visitor clicking Ask AI is sent through authentication first.

### Service Detail

Display: - Name. - Description. - Jurisdiction. - Eligibility. -
Required documents. - Application steps. - Fees. - Processing time. -
Official application link. - Source/verification information where
appropriate.

Authenticated USER additionally sees:

`I'm working on this`

### Ask AI

UI states: - Situation input. - Clarification question. - Answer. -
Loading/retrieval. - Recommendations. - No-match. - Provider
unavailable.

### My Progress

Display: - Tracked services. - Status. - Derived percentage. - Current
checklist. - Check/uncheck controls. - Remove tracking.

---

## 19. Error Handling & Edge Cases

### Search

No results: \> No matching services found. Try a different name or
jurisdiction.

### AI

No candidate above threshold: - Do not force a recommendation. - Tell
user no suitable service was found in the current GovGuide database. -
Direct them to normal service search.

AI provider unavailable: - Show a safe temporary-unavailable message. -
Offer normal service search.

Empty/invalid situation: - Require meaningful input.

### Authorization

- Unauthenticated protected route → authentication flow.
- USER accessing Admin route → deny.
- ADMIN accessing USER-only AI → deny.
- Attempt to access another user's Progress → deny without exposing
  the record.

### Progress

Duplicate tracking attempt: - Open/return existing Progress record.

Removed service step: - Ignore removed step when calculating current
progress.

### JWT

Expired access token: - Authentication fails. - User logs in again.

### Embeddings

Failed embedding generation: - Service can still exist for normal
browsing. - Mark embedding failed. - Exclude from AI retrieval. - Retry
through BullMQ as configured.

### General Rule

Never expose internal errors, never invent missing government
information, and fail safely when authorization or AI retrieval is
uncertain.

---

## 20. Technology Stack

### Frontend

- React
- TypeScript

### Primary Backend

- NestJS

NestJS owns: - Authentication. - Authorization. - Profile. - Service
CRUD. - Normal service search. - Progress. - Admin APIs. - Primary
public API boundary. - Queue job creation.

### AI Service

- FastAPI

FastAPI is an internal service responsible for AI/vector-specific
operations such as: - Embedding generation. - Query embedding. - Vector
retrieval. - AI discovery orchestration. - Gemini interaction.

### Database

- PostgreSQL
- pgvector

PostgreSQL stores: - Users. - Jurisdictions. - Services. -
ServiceSteps. - Progress. - Embeddings.

### ORM

- TypeORM for NestJS relational persistence.

### AI

- Gemini for LLM behavior.
- Gemini embedding model for both service and query embeddings.
- Use the same embedding model for both sides of similarity
  comparison.

### AI Orchestration

- Lightweight LangChain usage where it meaningfully simplifies the
  retrieval/LLM pipeline.
- No agents.
- No multi-agent architecture.
- No complex tool-calling framework.
- No persistent AI memory.

### Background Jobs

- Redis.
- BullMQ.
- Separate worker process.

### Not V1

- LlamaParse.
- HNSW.
- Unnecessary Redis caching.

Redis's required V1 purpose is BullMQ. Additional caching should only be
added when there is a demonstrated need.

---

## 21. Vector Retrieval Strategy

V1 contains only around 10--15 services.

Use: - PostgreSQL + pgvector. - Exact nearest-neighbor cosine
similarity. - Top 5 candidates. - Configurable minimum
similarity/relevance threshold.

Do **not** use HNSW in V1 because the dataset does not justify
approximate indexing.

Determine the threshold by evaluating real seeded services and test
queries. Do not hardcode an arbitrary value into the architectural plan.

When jurisdiction is known, filter by jurisdiction **before** selecting
nearest candidates.

---

## 22. Seed Data Strategy

V1 service data is manually researched from official government sources.

Target: - Approximately 10--15 services. - Roughly 7--10 Gujarat
services. - Roughly 3--5 Central Government services.

The exact mix can change based on useful available services.

For every seeded service collect: - Name. - Description. -
Eligibility. - Required documents. - Application steps. - Fees when
available. - Processing time when available. - Official application
URL. - Official verification/source URL. - Jurisdiction. - Active
state. - Verification date.

Prefer a mix containing some semantically similar services so AI
clarification and retrieval can be meaningfully tested.

Do not use blogs or third-party guides as authoritative seed sources.

Do not use AI-generated government facts as source data.

Automated scraping is not required for V1.

The seed process must be reproducible:

`Fresh DB → migrations → seed jurisdictions/services/steps → embedding jobs → completed embeddings`

Do not automatically reseed production on every deployment.

---

## 23. Testing Strategy

Testing should focus on important behavior rather than an arbitrary
coverage number.

### NestJS

Test: - Duplicate registration. - Invalid login. - JWT protection. -
Role authorization. - Ownership authorization. - Active-only public
service search. - Admin active/inactive search. - Duplicate Progress
prevention. - Progress percentage calculation. - Check/uncheck
behavior. - Removed-step behavior. - Completion when all current steps
are checked. - Semantic-field update queues embedding. - Non-semantic
update does not queue embedding.

### FastAPI / Retrieval

Use pytest for: - Query embedding/retrieval pipeline. - Jurisdiction
filtering. - Top-5 behavior. - Threshold behavior. -
Inactive/non-embedded exclusion. - No-match behavior. - Retrieval after
clarification. - Candidate-context construction. - AI output validation.

### AI Tests

Do not assert exact Gemini sentences.

Validate structured outcomes: - `QUESTION` - `RECOMMENDATIONS` -
`NO_MATCH`

For recommendations: - Maximum 3. - Every ID exists. - Every ID came
from supplied candidates. - Required fields exist.

Mock Gemini for normal automated tests.

Maintain a small real evaluation dataset of roughly 15--20 user
situations, including: - Clear service matches. - Ambiguous situations
requiring clarification. - Similar competing services. - Jurisdiction
differences. - Completely unrelated/no-match queries.

Use this evaluation set to tune the cosine threshold.

### BullMQ

Test: - Correct job creation. - Status transitions. - Retry behavior. -
Failed embeddings excluded from retrieval. - Correct semantic-change
detection.

### Frontend

Keep V1 frontend tests focused: - Protected routes. - Search/filter
interaction. - Progress checklist. - AI states. - Admin form validation.

### Important End-to-End Flows

USER:

`Register → Login → Search → Service Detail → Start Progress → Check Steps → Complete`

AI:

`Login → Describe Situation → Clarification → Recommendation → Service Detail → Start Progress`

ADMIN:

`Admin Login → Create Service → Queue Embedding → Worker Processes → Embedding Completed → Service Available to AI`

---

## 24. Deployment & Environments

### Development

- React development server.
- NestJS.
- FastAPI.
- PostgreSQL + pgvector.
- Redis.
- BullMQ worker.
- Development Gemini credentials.

### Production

- Deployed React frontend.
- NestJS public API.
- Internal FastAPI service.
- Separate BullMQ worker process.
- Managed PostgreSQL supporting pgvector.
- Managed Redis.
- Production environment secrets.

No separate staging environment is required for V1.

### Containerization

Use Docker for backend/infrastructure services.

Local development may use Docker Compose for: - PostgreSQL + pgvector. -
Redis. - NestJS. - BullMQ worker. - FastAPI.

React may run through its normal local development process.

### Production Processes

Keep separate runtime processes for: - NestJS API. - BullMQ worker. -
FastAPI AI service.

### Migrations

Use TypeORM migrations.

Do not depend on automatic schema synchronization in production.

### CI

On push/pull request, run relevant: - Dependency installation. -
Linting. - Unit/integration tests. - Build checks.

---

## 25. Architecture

```text
                         ┌────────────────────┐
                         │ React + TypeScript │
                         └─────────┬──────────┘
                                   │
                                 HTTPS
                                   │
                                   ▼
                         ┌────────────────────┐
                         │       NestJS       │
                         │    Public API      │
                         └───┬──────┬─────┬───┘
                             │      │     │
              ┌──────────────┘      │     └────────────────┐
              ▼                     ▼                      ▼
     ┌─────────────────┐    ┌──────────────┐      ┌────────────────┐
     │ PostgreSQL      │    │    Redis     │      │    FastAPI     │
     │ + pgvector      │    │              │      │ Internal AI API│
     └─────────────────┘    └──────┬───────┘      └───────┬────────┘
                                   │                      │
                                   ▼                      ▼
                            ┌──────────────┐          ┌──────────┐
                            │ BullMQ Worker│          │  Gemini  │
                            └──────────────┘          └──────────┘
```

### Architectural Ownership

**NestJS is the primary application/security boundary.**

React communicates with NestJS, not directly with FastAPI.

**FastAPI is an internal AI/vector service.**

**PostgreSQL is the system database.**

**Redis supports BullMQ jobs.**

The exact responsibility for persisting generated vectors---whether
FastAPI writes the vector or returns it to NestJS/worker for
persistence---should be finalized during implementation-level backend
design. Avoid allowing both services to casually own the same database
writes.

---

## 26. Recommended Build Order

Build the application incrementally so each phase leaves a working
system.

### Phase 1 --- Foundation

1.  Create frontend/backend repositories or workspace structure.
2.  Configure PostgreSQL.
3.  Configure TypeORM.
4.  Create migrations.
5.  Implement Jurisdiction/User/Service/ServiceStep/Progress models.
6.  Seed jurisdictions and initial services.

### Phase 2 --- Authentication

1.  Registration.
2.  bcrypt password hashing.
3.  Login.
4.  JWT.
5.  Authentication guard.
6.  Role authorization.
7.  Profile endpoints.

### Phase 3 --- Public Services

1.  Service search.
2.  Jurisdiction filtering.
3.  Service detail.
4.  Active/inactive rules.
5.  Public frontend pages.

### Phase 4 --- Progress

1.  Start tracking.
2.  Unique user/service rule.
3.  Checklist.
4.  Check/uncheck.
5.  Derived percentage.
6.  Completion.
7.  Remove progress.
8.  My Progress UI.

### Phase 5 --- Admin

1.  Admin dashboard.
2.  Service management search/filter.
3.  Create service.
4.  Update service.
5.  Step add/remove/reorder.
6.  Activate/deactivate.
7.  Verification timestamp behavior.

### Phase 6 --- Queue Infrastructure

1.  Redis.
2.  BullMQ.
3.  Worker process.
4.  Embedding job lifecycle.
5.  Retry/error behavior.
6.  Embedding status.

### Phase 7 --- FastAPI AI Service

1.  Internal service boundary.
2.  Gemini configuration.
3.  Service embedding generation.
4.  pgvector retrieval.
5.  Exact cosine search.
6.  Jurisdiction filtering.
7.  Threshold.
8.  Top-5 retrieval.

### Phase 8 --- AI Discovery

1.  Situation input.
2.  Candidate retrieval.
3.  Controlled LLM context.
4.  Clarification questions.
5.  Temporary conversation state.
6.  Retrieval after answers.
7.  2--3 recommendations.
8.  Output validation.
9.  No-match behavior.
10. Service-detail handoff.

### Phase 9 --- Testing

1.  NestJS business/security tests.
2.  FastAPI retrieval tests.
3.  BullMQ tests.
4.  AI mocks.
5.  AI evaluation dataset.
6.  Critical E2E flows.
7.  Tune similarity threshold.

### Phase 10 --- Production Readiness

1.  Docker configuration.
2.  Environment configuration.
3.  Production migrations.
4.  CI.
5.  Deployment.
6.  Logging/error handling.
7.  README.
8.  Architecture diagram.
9.  Screenshots/demo.

---

## 27. V1 Success Criteria

GovGuide V1 is complete when:

- Visitors can search verified active services.
- Visitors can view complete service details and official links.
- Users can register/login securely.
- Users cannot access each other's data.
- USER and ADMIN permissions are separated.
- Users can track current application steps.
- Progress responds correctly when service steps change.
- Admin can manage service records without hard deletion.
- Semantic fields trigger asynchronous embedding jobs.
- Failed embeddings do not break normal service browsing.
- AI retrieval uses pgvector and exact cosine similarity.
- AI can ask clarification questions.
- Retrieval reruns after clarification.
- AI returns only valid database-backed recommendations.
- Unrelated queries produce no-match rather than fabricated answers.
- AI conversation content is not permanently stored.
- The application is deployable and reproducible.

---

## 28. Future Enhancements

Potential future work, deliberately excluded from V1:

- Additional Indian states.
- Departments/categories.
- District-level services.
- Refresh tokens.
- Automated official-link verification.
- Periodic service re-verification jobs.
- LlamaParse-based official-document ingestion.
- Assisted Admin import/review workflow.
- HNSW when service volume justifies approximate search.
- Redis caching where measurements demonstrate value.
- More advanced Admin analytics.
- AI quality/usage analytics with appropriate privacy controls.
- More sophisticated service-data versioning.
- Persistent AI conversations only if a real product requirement
  emerges.

---

## 29. Project Principles

1.  **Verified government data beats generated data.**
2.  **AI discovers services; it does not define government rules.**
3.  **Users own their personal progress; Admins own service
    management.**
4.  **Do not collect personal data without a product need.**
5.  **Do not add infrastructure without a concrete responsibility.**
6.  **Background work belongs in the queue, not the request lifecycle.**
7.  **Normal service discovery must continue even when AI is
    unavailable.**
8.  **No-match is better than an invented recommendation.**
9.  **Build V1 for 10--15 services without pretending it already
    operates at massive scale.**
10. **Keep the architecture extensible without turning the portfolio
    project into an enterprise platform.**

---

## 30. Disclaimer

GovGuide is an independent informational project and is not affiliated
with the Government of India or the Government of Gujarat.

Government-service requirements may change. Users should verify
important information through the official government source linked on
each service before relying on it.
