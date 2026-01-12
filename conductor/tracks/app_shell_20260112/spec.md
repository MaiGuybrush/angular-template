# Specification: Application Shell & Navigation

## 1. Overview
This track focuses on establishing the foundational structure of the UMS Frontend Application. It involves setting up the Angular application, integrating Tailwind CSS, implementing the core layout (header, sidebar, content area), and handling authentication via SSO redirection.

## 2. User Stories
- **As a user**, I want to see a professional and consistent layout so that I can easily navigate the application.
- **As a user**, I want to be automatically redirected to the corporate SSO portal if I am not authenticated, so that I don't have to manually find the login page.
- **As a user**, I want to see a dashboard overview upon successful login.
- **As a developer**, I want a reusable shell component that handles global navigation and responsive behavior.

## 3. Functional Requirements
### 3.1 Application Setup
- Initialize a new Angular project with the specified tech stack (Angular, TypeScript, Tailwind CSS).
- Configure the build system and linting rules according to project standards.

### 3.2 Authentication (SSO Redirection)
- Implement an `AuthGuard` or similar mechanism to check for a valid session token on application load.
- If no valid session exists, redirect the user's browser to the configured external SSO URL.
- Handle the callback/return from SSO to extract and store the session token.

### 3.3 Layout Structure
- **Sidebar:**
    - Collapsible navigation menu.
    - Links to: Dashboard, Data Explorer, Model Studio, Deployment Manager, Resource Monitor, Settings.
    - Responsive behavior (hidden/toggleable on smaller screens).
- **Header:**
    - User profile summary (name/avatar).
    - Global search bar (placeholder).
    - Notifications icon (placeholder).
- **Main Content Area:**
    - Router outlet for displaying active route components.

### 3.4 Dashboard Placeholder
- Create a basic "Dashboard" component to serve as the default landing page after authentication.
- Display a welcome message.

## 4. Non-Functional Requirements
- **Performance:** Initial load time should be minimized (lazy loading for feature modules).
- **Responsiveness:** Layout must function correctly on desktop (primary) and allow basic navigation on tablet/mobile.
- **Accessibility:** Semantic HTML and ARIA labels for navigation elements.
- **Code Quality:** Adhere to the defined TypeScript and Angular style guides.

## 5. UI/UX Design
- **Theme:** "Corporate & Functional" - Slate/Blue color palette.
- **Density:** Compact navigation items to maximize screen real estate.

## 6. References
- **SSO Documentation & Samples:** `docs/sso/`
- **Backend API Contracts:** `docs/api/ums-api/contracts/`
