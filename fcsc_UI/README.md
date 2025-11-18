# React UI

Frontend application for the Text to SQL system. Built with React, Vite, and Tailwind CSS. Provides an intuitive interface for natural language query input, result visualization, and data export.

## Requirements

- Node.js 16 or higher
- pnpm package manager

## Setup

1. Install pnpm (if not already installed):
   ```
   npm install -g pnpm
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

## Running the Application

Start the development server:
```
pnpm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint

## Project Structure

```
fcsc_UI/
├── src/
│   ├── Components/          # React components
│   │   ├── Charts/          # Chart components (Bar, Line, Pie, etc.)
│   │   ├── context/         # React context providers
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MainContent.jsx
│   │   ├── QueryResults.jsx
│   │   └── VisualizationPanel.jsx
│   ├── locales/             # Internationalization files
│   │   ├── en/
│   │   └── ar/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── i18n.jsx             # i18n configuration
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
└── vite.config.js           # Vite configuration
```

## Features

- Natural language query input (English and Arabic)
- Real-time SQL query generation
- Interactive data visualization (tables, charts, graphs)
- Data export (PDF, Excel)
- Multi-language support (English/Arabic)
- Responsive design

## API Configuration

The UI connects to the FastAPI backend server running on `http://localhost:8000` by default. If your backend runs on a different address, update the API base URL in the relevant component files.

## Technologies

- React 19
- Vite
- Tailwind CSS
- PrimeReact
- Chart.js / Recharts
- React i18next
- Axios

