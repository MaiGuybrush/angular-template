# Plan: Application Shell & Navigation

## Phase 1: Project Initialization & Configuration
- [x] Task: Initialize Angular Project & Tailwind CSS [commit: 83f03e7]
  - [x] Subtask: Run `ng new` to create the project structure.
  - [x] Subtask: Install and configure Tailwind CSS.
  - [x] Subtask: Configure ESLint and Prettier.
  - [x] Subtask: Verify build and test runners.
- [ ] Task: Conductor - User Manual Verification 'Project Initialization & Configuration' (Protocol in workflow.md)

## Phase 2: Core Architecture & Authentication
- [ ] Task: Implement Auth Service & Guard
  - [ ] Subtask: Write unit tests for AuthService (check session, redirect logic).
  - [ ] Subtask: Implement AuthService with mock SSO redirection logic (configurable URL).
  - [ ] Subtask: Implement AuthGuard to protect routes.
- [ ] Task: Set up Routing Module
  - [ ] Subtask: Define root routes (login-callback, app).
  - [ ] Subtask: Configure lazy loading for feature modules.
- [ ] Task: Conductor - User Manual Verification 'Core Architecture & Authentication' (Protocol in workflow.md)

## Phase 3: Layout & Navigation Implementation
- [ ] Task: Build Sidebar Navigation Component
  - [ ] Subtask: Write tests for sidebar toggle and link activation.
  - [ ] Subtask: Implement SidebarComponent with Tailwind styling (collapsible).
  - [ ] Subtask: Define navigation menu items (Dashboard, Data, Models, etc.).
- [ ] Task: Build Header Component
  - [ ] Subtask: Implement HeaderComponent with user profile placeholder.
- [ ] Task: specific App Shell Layout
  - [ ] Subtask: Create MainLayoutComponent combining Sidebar, Header, and Router Outlet.
  - [ ] Subtask: Ensure responsive grid/flex layout using Tailwind.
- [ ] Task: Conductor - User Manual Verification 'Layout & Navigation Implementation' (Protocol in workflow.md)

## Phase 4: Dashboard & Final Integration
- [ ] Task: Create Dashboard Placeholder
  - [ ] Subtask: Generate DashboardComponent.
  - [ ] Subtask: Add welcome message and basic statistics placeholder.
- [ ] Task: Verify End-to-End Flow
  - [ ] Subtask: specific manual verification of the "unauthenticated -> SSO redirect -> dashboard" flow.
- [ ] Task: Conductor - User Manual Verification 'Dashboard & Final Integration' (Protocol in workflow.md)
