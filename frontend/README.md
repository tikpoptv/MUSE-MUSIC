# MUSE MUSIC Frontend

> Modern music web app frontend built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Playwright, Jest, and Docker.

---

## 🚀 Tech Stack
- **Next.js 15** (React SSR/SPA Framework)
- **TypeScript** (Static type checking)
- **Tailwind CSS** (Utility-first CSS framework)
- **shadcn/ui** (Modern React UI component toolkit)
- **Jest & React Testing Library** (Unit & integration testing)
- **Playwright** (End-to-end/browser automation)
- **ESLint** (Linting & code quality)
- **Docker** (Containerization for development/production)

---

## 🟩 Getting Started

1. **Install dependencies:**
```bash
npm install  # or pnpm install / yarn install
```

2. **Start the development server:**
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗂️ Project Structure
```text
frontend/
├── src/
│   ├── app/            # Next.js App Router and pages
│   ├── components/     # React UI components (many using shadcn/ui)
│   ├── services/       # API connectors (e.g., authService, userService)
│   ├── types/          # Global TypeScript types & interfaces
│   ├── utils/          # Utility/helper functions
│   └── __tests__/      # Unit/Integration tests
├── tests/              # E2E tests (Playwright)
├── public/             # Static assets (SVGs, images)
├── jest.config.js      # Jest configuration
├── playwright.config.ts# Playwright configuration
└── ...
```

---

## ⚡ Common Scripts
```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "eslint . --ext .ts,.tsx,.js,.jsx",
"test": "jest",
"test:e2e": "playwright test"
```
Find more scripts in `package.json`.

---

## 🧪 Testing
- **Unit/Integration Tests:**  
  - `npm test` or `npm run test:unit` (Jest & React Testing Library)
  - `npm run test:integration`
- **E2E Tests:**  
  - `npm run test:e2e` (Playwright)
- Test coverage and reports are output to the `coverage/` and `playwright-report/` directories.
- Additional scripts (watch, coverage, full run, etc.) are available. See `package.json`.

---

## 🛠️ Linting & Styling
- **Lint:**
  - Run `npm run lint` (ESLint; see config in `eslint.config.mjs`)
- **CSS:**
  - Tailwind CSS (see `tailwind.config.js`, `postcss.config.mjs`)

---

## 🐳 Docker (Optional)
- Can be run in Docker for local development or production.
Example:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

---

## 👩‍💻 Developer Notes
- Isolated, modern, and tested: unit, integration, and E2E best practices are in place
- shadcn/ui or other component/toolkit can be used
- If you encounter dependency or config problems, always check versions in `package.json`
- The backend is a separate service (see ../backend)

---

## 🌏 Language & Contributing
- The codebase and documentation use English for international collaboration
- Please follow contribution guidelines and code quality standards
- For questions, see inline documentation or ask project maintainers

---

## 📚 References
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Jest Docs](https://jestjs.io/docs/getting-started)
