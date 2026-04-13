# Zest - Online Assessment Platform

## Proprietary Notice

This repository is private and proprietary.

- Copyright (c) 2026 Shreyansh Srivastava. All rights reserved.
- No reproduction, redistribution, modification, or transmission is permitted without prior written permission from the copyright owner.
- See [LICENSE](LICENSE) for the binding legal terms.

This README documents architecture and implementation for authorized collaborators and maintainers.

## Overview

Zest is a full-stack online assessment system with:

- A student-facing exam and practice experience.
- An admin portal for exam operations and monitoring.
- A backend API handling authentication, test management, evaluation, analytics, scheduling, and real-time presence.

The project is organized as a monorepo with three main applications.

## Repository Structure

- `frontend/` - Student web application (React).
- `admin-portal/` - Admin dashboard (React).
- `backend/` - API server and real-time services (Node.js + Express + MongoDB).
- `Dockerfile` - Production container setup for the backend with Java runtime support.

## Tech Stack

### Backend (`backend/`)

- Runtime: Node.js (CommonJS)
- Framework: Express 5
- Database: MongoDB with Mongoose
- Authentication: JWT, Google OAuth 2.0 (`passport-google-oauth20`), OTP flows
- Email/OTP delivery: Brevo (`sib-api-v3-sdk`)
- Security/utility: `bcryptjs`, `cookie-session`, `cors`, `dotenv`
- Scheduling: `node-schedule`
- Real-time: Socket.IO
- Code execution: Java compilation/execution via spawned processes (`javac`, `java`)

### Student App (`frontend/`)

- UI framework: React 19
- Routing: `react-router-dom`
- Styling: Tailwind CSS + custom CSS
- Animation: Framer Motion, GSAP
- Icons: `lucide-react`, `react-icons`
- Coding interface: Monaco Editor (`@monaco-editor/react`)
- Real-time communication: `socket.io-client`

### Admin Portal (`admin-portal/`)

- UI framework: React 19
- Routing: `react-router-dom`
- Styling: Tailwind CSS
- Animation: Framer Motion
- HTTP client: Axios + Fetch API

### Container and Runtime

- Docker multi-stage build
- Base Node image: `node:20-slim`
- Java runtime source: `eclipse-temurin:21-jdk`
- Exposed backend port: `7860`

## Implemented Work

### 1) Authentication and Account Flows

- Email OTP send/verify flow with expiring OTP records.
- Password signup/login with hashed credentials.
- Google OAuth login flow with account creation for first-time users.
- Support for remember-session behavior using storage and token expiry strategy.
- Profile update support (email/password flows integrated with OTP verification).

### 2) Exam Lifecycle Management

- Create, update, fetch, and delete exams.
- Exam metadata includes test ID, schedule, duration, marks, topics, and difficulty.
- Automatic status transitions (`scheduled -> ongoing -> completed`) using scheduler jobs.
- Cancellation-aware scheduler behavior.
- Post-completion absentee marking logic for students who did not submit.

### 3) Test Content Authoring and Delivery

- Persistent test content model keyed by `testId`.
- Multiple question formats:
	- Single-option answer
	- Multiple-option answer
	- Value-enter answer
	- Write-code answer (Java)
- Admin content creation and editing workflows.
- Student fetch of test content with merged live exam metadata.

### 4) Code Evaluation and Compilation

- Backend Java code execution for practice and exam coding questions.
- Test-case based validation for coding answers.
- Timeouts and temp-directory isolation for execution sessions.
- WebSocket-based interactive compile/run channel for practice mode.
- REST compile endpoint for simple code execution path.

### 5) Submission, Scoring, and Integrity Signals

- Full test submission pipeline with per-question evaluation.
- Duplicate submission prevention.
- Per-attempt score persistence against student record.
- Alarm count capture and persistence for in-test monitoring signals.
- Unattempted/attempted question-level result reporting.

### 6) Student Experience Features

- Protected student routes with token-based access control.
- Landing/auth/about/home/syllabus/practice/schedule/leaderboard/profile/analytics/test pages.
- Schedule and upcoming exam visibility.
- Late-entry request flow for ongoing exams.
- Leaderboard aggregation endpoint integration.
- Student analytics view with trend and performance breakdown.

### 7) Admin Operations and Monitoring

- Exam management dashboard.
- Test creation and editing UI.
- Active student tracking (name, email, current location, activity timing).
- Late-entry notifications review and allow/deny decisions.
- Alarm report generation for attempts.
- Attendance reporting per exam (present/absent with score rows).
- Storage metrics endpoint and visualization support.

### 8) Real-Time Presence and Activity

- Presence registration when students come online.
- Page-view tracking to reflect current student location.
- Active user map maintained server-side.
- Admin update broadcasts prepared for live dashboard updates.

## Data Models (MongoDB)

- `Student` - identity, auth profile, test attempts, scores, alarm signals, active alarm map.
- `Exam` - schedule, marks, difficulty, status lifecycle.
- `TestContent` - question set and answer/test-case definitions by `testId`.
- `OTP` - short-lived verification codes (TTL indexed).
- `Notification` - late-entry request workflow with decision status.
- `Subscription` - stored push subscription schema (reserved for notification workflows).

## API Surface (High-Level)

- Auth: OTP, signup/login, Google OAuth callback, profile credential updates.
- Exams: CRUD + fetch by test ID.
- Test Content: get/upsert by test ID.
- Test Runtime: run Java testcases, submit tests, alarm updates.
- Student: submitted tests, analytics.
- Admin: notifications, decision endpoint, reports, attendance, active students, storage stats.
- Public: leaderboard.

## Local Development

### Prerequisites

- Node.js 20+
- MongoDB instance
- Java JDK (for local code-compile features)

### Install

Run in each app folder:

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin-portal && npm install
```

### Run

```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm start

# Terminal 3
cd admin-portal
npm start
```

## Required Environment Variables (Backend)

The exact values are intentionally not published in this repository.

- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `BREVO_API_KEY`
- `BREVO_FROM_EMAIL`
- `PORT` (optional; defaults to `7860`)

## Deployment Notes

- Backend is containerized with Node + Java runtime support for compile/evaluate features.
- Frontend/admin apps are standard React builds and can be deployed independently.
- Ensure CORS and callback URLs are aligned with deployment domains.

## License and Usage Policy

This codebase is not open source. Documentation in this file does not grant rights to use, copy, modify, or distribute source code or assets beyond what is allowed by applicable law and explicit written permission.

Third-party dependencies remain subject to their respective licenses.
