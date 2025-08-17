# Quorium Student Manager (Frontend – React + Tailwind)

A simple Educational ERP/CRM student management UI built for **Quorium Consulting**.

## Features
- **Dashboard**: total/active/on-hold/graduated counts and a welcome section.
- **Students List**: searchable table with sort, course/status filters, and pagination.
- **Add Student**: form to add a new record (in-memory only).
- **Data Source**: fetched from `https://dummyjson.com/users` and transformed to student objects.

## Tech
- React 18 + Vite 5
- Tailwind CSS 3

## Setup
```bash
# 1) Install dependencies
npm install

# 2) Start dev server (http://localhost:5173)
npm run dev

# 3) Build for production
npm run build
npm run preview
```

## Notes
- The dataset initializes from DummyJSON on load. Adding a student updates the UI state only (no DB).
- Refreshing will restore the initial remote dataset.

## Submission Package
- This project includes: complete source code and this README.
- For screenshots: open the app, navigate to Dashboard, Students, Add Student and take captures.

---
© 2025 Quorium Consulting – Assignment Solution
