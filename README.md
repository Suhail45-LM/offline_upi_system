# Credit-Based Offline UPI System

A full-stack payment solution enabling **offline, face-to-face UPI transactions** without active internet connectivity. Transactions are queued locally against a dynamically calculated credit limit and reconciled with the backend once connectivity is restored.

## Key Features

- **Offline-First Queue** — Transactions are validated against a local "safe-to-spend" limit and persisted in the browser's `LocalStorage` when offline.
- **Dynamic Credit Limit** — Offline spending is capped at **25% of the user's active bank balance**, recalculated on each sync.
- **Sync & Reconcile** — On reconnect, queued transactions are batch-pushed to `/api/sync` for server-side processing and ledger updates.
- **Fraud Prevention & Penalty Enforcement** — Guards against overdraft fraud (e.g., offline spend followed by an online withdrawal before sync). On detecting an `InsufficientBalanceException`, the backend bypasses standard Hibernate transaction rollback and executes a custom `@Modifying` native SQL query to enforce a non-negotiable **-₹50 penalty**.

## Tech Stack

| Layer          | Technology                                              |
|----------------|----------------------------------------------------------|
| Frontend       | React.js (Vite), Axios, LocalStorage, React-QR-Scanner   |
| Backend        | Java, Spring Boot, Spring Security (JWT), Spring Data JPA |
| Database       | PostgreSQL                                              |

## Setup Instructions

### Backend (Spring Boot)
```bash
cd backend
# Configure DB credentials in src/main/resources/application.properties
mvn clean install
mvn spring-boot:run
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:8080`.
