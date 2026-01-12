# Initial Concept
Establish a standardized, centralized, and scalable Universal Modeling System (UMS) platform to provide one-stop services for image data uploading, annotation, data management, model training, model management, and deployment for various departments.

# Product Guide

## Scope
**This project specifically focuses on the Frontend Application of the UMS platform.** It serves as the user interface and interaction layer, communicating with backend services via APIs to deliver the full platform functionality.

## Target Users
The primary users of the UMS platform interface are the **Business Units & End Users** from various departments, including:
- **Plant Operations & AIADJ/ADR/HOP Teams:** Personnel who interact with the UI to upload data, manage projects, and deploy models for their business scenarios.

## Goals
The frontend application aims to:
- **Provide an Intuitive Interface:** Enable users to easily navigate complex modeling workflows without deep technical knowledge.
- **Accelerate Adoption:** Reduce the barrier to entry for AI tools through a user-friendly and responsive design.
- **Visualize Complex Data:** Clearly present dataset statistics, model performance metrics, and resource usage.

## Core Features (Frontend)
The application will implement the user interfaces for the following platform capabilities:

### 1. Administrative & Collaboration UI
- **Dashboard:** Unified view of projects and system status.
- **Project Settings:** Interfaces for managing project details, team members, and permissions.
- **SSO Authentication (Redirection):** The application integrates with corporate SSO. Unauthenticated users are automatically redirected to the external SSO portal for authentication; no local login screens are implemented in this project.

### 2. Data & Model Management UI
- **Data Explorer:** Visual tools for browsing, filtering, and managing image datasets and annotations.
- **Model Studio:** Wizards and configuration forms for initiating training jobs and fine-tuning models.
- **Registry View:** Detailed views for model versions, lineage, and performance metrics.

### 3. Execution & Monitoring UI
- **Deployment Manager:** Interfaces for configuring and monitoring deployed inference services.
- **Resource Monitor:** Dashboards displaying GPU usage, quotas, and job queues.
