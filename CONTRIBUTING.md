# Contributing to Gradence

We are thrilled that you want to contribute to **Gradence Companion**! This document provides guidelines, style rules, and project setup instructions to keep the codebase clean, robust, and release-ready.

---

## 1. Code of Conduct & Development Philosophy
* **Offline-First Privacy**: Gradence runs completely offline. Never write integrations that transmit student GPA details, attendance logs, or credentials to third-party endpoints.
* **Single Source of Truth (SSOT)**: Always query and modify database states via our centralized React Context (`src/context/GradenceContext.tsx`). Never read or write local preference files directly from sub-components.
* **Aesthetic Excellence**: Follow the sleek dark/nordic light themes. Ensure components use clean spacing, smooth micro-animations, and glassmorphic panels.

---

## 2. Technical Stack & Dependencies
* **Core Framework**: React 19 + TypeScript + Vite
* **Native Shell**: Capacitor Android
* **Styling**: Tailwind CSS
* **Storage Layer**: `@capacitor/preferences` (general state) + `@aparajita/capacitor-secure-storage` (keys) + `@capacitor/filesystem` (backups)

---

## 3. Project Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Run the hot-reloading development server locally:
   ```bash
   npm run dev
   ```
3. To package the web project and synchronize the native Android Gradle project directories:
   ```bash
   npm run build
   npx cap sync
   ```

---

## 4. Coding & Type Safety Standards
* **No `any`**: Ensure complete TypeScript typings. Declare exact interface schemas inside `src/types.ts`.
* **Positional Security API**: Use standard positional arguments for secure storage (`SecureStorage.set(key, value)`). Check types carefully to avoid `DataType` casting errors.
* **Compiler Compliance**: Run `npm run lint` before committing. PRs with compilation warnings or errors will be automatically rejected.

---

## 5. Branching & PR Guidelines
1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/amazing-new-tool
   ```
2. Verify typescript compilation compiles cleanly:
   ```bash
   npm run lint
   ```
3. Commit your changes with clear, descriptive semantic messages:
   ```bash
   git commit -m "feat(planner): add weekly target goals logging"
   ```
4. Push your branch and open a Pull Request against the main branch.
