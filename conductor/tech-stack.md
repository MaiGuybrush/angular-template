# Technology Stack

## Frontend Core
- **Framework:** **Angular** - Selected for its robust enterprise features, structured architecture, and strong typing support, which are essential for a complex system like UMS.
- **Language:** **TypeScript** - Ensures type safety and improves maintainability across the large codebase.
- **Styling:** **Tailwind CSS** - Used for rapid UI development and implementing the high-density, corporate design system defined in the product guidelines.

## State Management & Reactivity
- **RxJS:** Leveraged for handling complex asynchronous operations, especially for real-time status updates (e.g., training progress).
- **Angular Signals:** Used for granular and efficient state management within components.

## Communication & Integration
- **API Communication:** **Angular HttpClient** - Standard RESTful communication with UMS backend services.
- **Authentication:** **Corporate SSO (OIDC/LDAP/AD)** - Authentication is handled via redirection to the corporate identity provider. The frontend manages the resulting session/tokens.

## Development & Tooling
- **Build Tool:** Angular CLI / Webpack
- **Linting & Formatting:** ESLint & Prettier
