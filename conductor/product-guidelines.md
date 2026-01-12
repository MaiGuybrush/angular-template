# Product Guidelines

## Tone and Voice
- **Professional & Technical:** Use precise machine learning and data science terminology (e.g., "Inference," "Lineage," "Hyperparameters") to ensure clarity for technical users. Avoid overly casual language.
- **Efficient & Minimal:** Prioritize brevity in UI labels and descriptions. Use well-established icons and short phrases to convey information quickly, respecting the user's expertise and time.

## Visual Identity
- **Design Style:** Adhere to a **Corporate & Functional** aesthetic. This means clean lines, a disciplined color palette (primarily Slate and Blue tones), and a strong emphasis on information hierarchy.
- **Layout:** Focus on high-density layouts that allow power users to view significant amounts of data at once without feeling overwhelmed. Utilize collapsible navigation and sidebars to maximize screen real estate.

## UI/UX Principles
- **Data Density First:** Tables, lists, and dashboards should be optimized for viewing large datasets. Use compact component variations and efficient spacing.
- **Responsiveness:** While the primary use case is desktop-based, the application must be fully responsive and adapt gracefully to different screen resolutions.
- **Standardization & Consistency:**
    - Use a unified component library (Angular + Tailwind CSS) to ensure all buttons, modals, and alerts behave identically.
    - Follow consistent navigation patterns (e.g., breadcrumbs, consistent sidebar placement) to minimize the learning curve across different platform modules.
- **Navigation Flow:** Ensure that multi-step processes (like model training wizards) are clearly marked with progress indicators and allow users to save or return to previous steps.
