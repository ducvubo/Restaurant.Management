# Restaurant Management Frontend

Frontend application for Restaurant Management System built with React, Vite, and TypeScript.

## Tech Stack

- **React 19.2.0** - Latest React version
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.4** - Fast build tool and dev server
- **React Router DOM 7.10.1** - Client-side routing
- **Axios 1.13.2** - HTTP client
- **ESLint** - Code linting

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.tsx   # Main layout with sidebar
│   └── Layout.css
├── pages/           # Page components
│   ├── Dashboard.tsx
│   ├── UserManagement.tsx
│   └── UserManagement.css
├── services/        # API services
│   ├── api.ts      # Axios instance and interceptors
│   └── userService.ts
├── config/          # Configuration files
│   └── api.ts      # API endpoints
├── types/           # TypeScript type definitions
│   └── index.ts
├── App.tsx          # Main app component with routes
└── main.tsx         # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start dev server (runs on http://localhost:3000)
npm run dev
```

The dev server includes proxy configuration to forward `/api` requests to the backend at `http://localhost:8081`.

### Build

```bash
# Build for production
npm run build
```

### Preview Production Build

```bash
# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

## Features

- ✅ React Router for navigation
- ✅ Axios with interceptors for API calls
- ✅ TypeScript for type safety
- ✅ User Management page with API integration
- ✅ Responsive layout with sidebar navigation
- ✅ Error handling

## API Integration

The app is configured to connect to the Management API backend:
- Base URL: `http://localhost:8081/api`
- Endpoints are defined in `src/config/api.ts`
- Services are in `src/services/`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Next Steps

- Add authentication/login page
- Implement user create/edit forms
- Add more management features
- Add error boundaries
- Add loading states and skeletons
- Add toast notifications
