# Raport Generator AI

AI-powered application for automatic generation of reports from text input.

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Overview

Raport Generator AI is a web application utilizing artificial intelligence to automatically generate clear reports from input text. The application enables users to quickly create summaries, extract key information, and formulate conclusions, significantly saving time and facilitating content analysis.

### Key Features
- **User Account System** - Registration, login, profile management
- **Text Input** - Interface for manual text entry
- **AI Report Generation** - Automatic creation of structured reports from source text
- **Report Editing** - Interface for editing generated reports
- **Report History** - Management and storage of user reports

### Problem Solved
Manual report creation from source texts is time-consuming, error-prone, inefficient, and often lacks standardization. This application automates the process of text analysis and report creation, ensuring consistency, completeness, and time savings.

## Tech Stack

### Frontend
- Next.js 15.3.0
- React 19
- TypeScript 5
- Tailwind CSS 4
- Shadcn/ui component library

### Backend
- Supabase (PostgreSQL database)
- Supabase SDK as Backend-as-a-Service
- Built-in user authentication

### AI Integration
- Openrouter.ai for AI model communication
- Access to various models (OpenAI, Anthropic, Google, etc.)

### CI/CD & Hosting
- GitHub Actions for CI/CD pipelines
- DigitalOcean hosting via Docker image

## Getting Started

### Prerequisites
- Node.js 22.12.0 (use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/raport-generator-ai.git
   cd raport-generator-ai
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables (create a `.env.local` file in the root directory)
   ```
   # Add required environment variables here
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Scope

### Features Included in MVP
- User account system (registration, login, password recovery)
- Text input interface
- AI-powered report generation
- Report editing capabilities
- Report history management
- User profile management
- Responsive interface for various devices

### Features Not Included in First Version
- Advanced analysis of numerical data and charts
- Support for multiple input formats (PDF, DOCX, etc.)
- Report sharing between users
- Integrations with external reporting systems
- Mobile applications (access only via web browser)

## Project Status

The project is currently in the early development phase. The PRD has been created, and the tech stack has been defined. Implementation is in progress.

## License

This project is licensed under the [LICENSE NAME] - see the LICENSE file for details.

---

*Note: This README is a living document and will be updated as the project evolves.*
