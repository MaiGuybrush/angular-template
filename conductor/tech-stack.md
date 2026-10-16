# Technology Stack

## Frontend Core
- **Framework:** **Angular** - Selected for its robust enterprise features, structured architecture, and strong typing support.
- **Language:** **TypeScript** - Ensures type safety and improves maintainability across the large codebase.
- **Styling:** **Tailwind CSS** - Used for rapid UI development and implementing the high-density, corporate design system.

## State Management & Reactivity
- **RxJS:** Leveraged for handling asynchronous operations.
- **Angular Signals:** Used for granular and efficient state management within components.

## Communication & Integration
- **API Communication:** **Angular HttpClient** - Standard RESTful communication with backend services.
- **Authentication:** **Corporate SSO (OIDC/LDAP/AD)** - Authentication is handled via redirection to the corporate identity provider. The frontend manages the resulting session/tokens.

## Development & Tooling
- **Build Tool:** Angular CLI / Webpack
- **Linting & Formatting:** ESLint & Prettier
