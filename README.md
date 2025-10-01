# Attendance Tracking System - Frontend

This is the React frontend for the Attendance Tracking System.

## Features

- **Authentication**: Employee and Admin login with JWT tokens
- **Dashboard**: Single-page dashboard with sidebar navigation
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop
- **Error Handling**: Comprehensive error boundaries and loading states

## Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:5174`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx   # Main dashboard component
│   ├── LoginPage.jsx   # Login form
│   ├── ErrorBoundary.jsx # Error handling
│   └── dashboard/      # Dashboard sub-components
│       ├── Overview.jsx
│       ├── Departments.jsx
│       ├── LeaveManagement.jsx
│       ├── Salary.jsx
│       └── Settings.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Environment Variables

The frontend connects to the backend at `http://localhost:5000` by default. Make sure your backend server is running.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Common Issues

1. **Port already in use**: Change port in `vite.config.js`
2. **Backend connection failed**: Ensure backend is running on port 5000
3. **Build errors**: Check Node.js version and dependencies

### Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Use Error Boundary for graceful error handling
