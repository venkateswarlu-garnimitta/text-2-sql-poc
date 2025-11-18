# Text to SQL POC - Setup Guide

This project consists of a FastAPI backend server and a React frontend application that converts natural language queries to SQL and visualizes the results. This guide will walk you through the complete setup process from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Flotorch Setup](#flotorch-setup)
4. [Server Setup (FastAPI)](#server-setup-fastapi)
5. [UI Setup (React)](#ui-setup-react)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

### Required Software

1. **Python 3.8 or higher**
   - Download from: https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"
   - Verify installation by opening Command Prompt or PowerShell and running:
     ```
     python --version
     ```

2. **Node.js and npm**
   - Download from: https://nodejs.org/
   - Install the LTS (Long Term Support) version
   - Verify installation by running:
     ```
     node --version
     npm --version
     ```

3. **Git** (if cloning from repository)
   - Download from: https://git-scm.com/downloads
   - Verify installation by running:
     ```
     git --version
     ```

### Required Accounts

- A Supabase account (free tier is sufficient)
  - Sign up at: https://supabase.com/
- A Flotorch account (for AI/LLM services)
  - Sign up at: https://console.flotorch.cloud/

---

## Supabase Setup

### Step 1: Create a Supabase Account

1. Go to https://supabase.com/
2. Click "Start your project" or "Sign in" if you already have an account
3. Sign up using your email address or GitHub account
4. Verify your email address if required

### Step 2: Create a New Project

1. After logging in, click "New Project" button
2. Fill in the project details:
   - **Name**: Enter a name for your project (e.g., "text-to-sql-poc")
   - **Database Password**: Create a strong password and save it securely
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Select "Free" for development
3. Click "Create new project"
4. Wait for the project to be created (this may take 1-2 minutes)

### Step 3: Get Your Supabase Credentials

1. Once your project is ready, click on your project to open it
2. In the left sidebar, click on "Settings" (gear icon)
3. Click on "API" in the settings menu
4. You will see two important values:
   - **Project URL**: Copy this value (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key**: Copy this value (a long string starting with `eyJ...`)
5. Save both values in a text file for later use

### Step 4: Create the SQL Function

This function is required for the application to execute SQL queries from the code.

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query" button
3. Copy and paste the following SQL code into the editor:

```sql
create or replace function public.execute_sql(query text)

returns setof json

language plpgsql

security definer

as $$

begin

  return query execute

    format(

      'select row_to_json(t) from (%s) as t',

      query

    );

end;

$$;
```

4. Click the "Run" button (or press Ctrl+Enter)
5. You should see a success message: "Success. No rows returned"
6. The function is now created and ready to use

### Step 5: Prepare Your Database (Optional)

If you have existing data or tables, you can:
- Upload CSV files through the Supabase dashboard (Table Editor > Import)
- Or use the upload feature in the application UI once it's running

---

## Flotorch Setup

Flotorch is a comprehensive AI platform that powers the intelligent capabilities of this application. It enables the creation of sophisticated agentic workflows, AI agents, and experimental AI solutions for natural language processing, SQL generation, and complex reasoning tasks. Visit https://console.flotorch.cloud/ to explore the full suite of AI tools and capabilities available for building advanced AI-powered applications.

### Step 1: Create a Flotorch Account

1. Go to https://console.flotorch.cloud/
2. Click "Sign up" or "Sign in" if you already have an account
3. Create an account using your email address
4. Verify your email address if required

### Step 2: Get Your Flotorch API Key

1. After logging in, navigate to the API Keys section in your dashboard
2. Create a new API key or copy an existing one
3. Save the API key securely for later use
4. Note the gateway URL (typically `https://gateway.flotorch.cloud`)

---

## Server Setup (FastAPI)

### Step 1: Navigate to Server Directory

1. Open Command Prompt (Windows) or PowerShell
2. Navigate to the server directory:
   ```
   cd [YOUR_PROJECT_PATH]/text-2-sql-poc/fcsc_Server
   ```
   Replace `[YOUR_PROJECT_PATH]` with the actual path where you have cloned or extracted the project.

### Step 2: Create a Virtual Environment (Recommended)

A virtual environment isolates your project dependencies from other Python projects.

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows (Command Prompt):
     ```
     venv\Scripts\activate
     ```
   - On Windows (PowerShell):
     ```
     venv\Scripts\Activate.ps1
     ```

3. You should see `(venv)` at the beginning of your command prompt, indicating the virtual environment is active.

### Step 3: Install Python Dependencies

1. Make sure your virtual environment is activated (you should see `(venv)` in your prompt)
2. Install all required packages:
   ```
   pip install -r requirements.txt
   ```
3. Wait for the installation to complete (this may take a few minutes)

### Step 4: Configure Environment Variables

1. In the `fcsc_Server` folder, you should see a file named `env-example`
2. Create a copy of this file and name it `.env` (with a dot at the beginning)
   - On Windows, you can do this in Command Prompt:
     ```
     copy env-example .env
     ```
   - Or manually create a new file named `.env` in the `fcsc_Server` folder

3. Open the `.env` file with a text editor (Notepad, VS Code, etc.)
4. Fill in the values with your actual credentials:

```
FLOTORCH_API_KEY=your_flotorch_api_key
FLOTORCH_BASE_URL=https://gateway.flotorch.cloud
FLOTORCH_MODEL=flotorch/<your_model_id> 
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

Replace:
- `your_supabase_url` with the Project URL you copied from Supabase (Step 3.4 in Supabase Setup)
- `your_supabase_key` with the anon public key you copied from Supabase (Step 3.4 in Supabase Setup)
- `your_flotorch_api_key` with your Flotorch API key (obtained from console.flotorch.cloud as described in Flotorch Setup)
- `FLOTORCH_BASE_URL` should be `https://gateway.flotorch.cloud` (or update if your gateway URL is different)
- `flotorch/<your_model_id>` with the llm that you created in the flotorch console.

5. Save the file

**Important**: Never share your `.env` file or commit it to version control. It contains sensitive credentials.

### Step 5: Verify Server Setup

1. Make sure you're still in the `fcsc_Server` directory
2. Make sure your virtual environment is activated
3. Start the server:
   ```
   uvicorn main:app --reload
   ```

4. You should see output similar to:
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   INFO:     Started reloader process
   INFO:     Started server process
   INFO:     Waiting for application startup.
   Loading initial database schema...
   INFO:     Application startup complete.
   ```

5. Open a web browser and go to: http://127.0.0.1:8000/docs
6. You should see the FastAPI automatic documentation page
7. Press `Ctrl+C` in the terminal to stop the server

---

## UI Setup (React)

### Step 1: Install pnpm

This project uses `pnpm` as the package manager. You need to install it first using npm.

1. Open Command Prompt or PowerShell
2. Install pnpm globally using npm:
   ```
   npm install -g pnpm
   ```
3. Wait for the installation to complete
4. Verify the installation by running:
   ```
   pnpm --version
   ```
5. You should see a version number (e.g., `9.x.x`)

### Step 2: Navigate to UI Directory

1. Open a new Command Prompt or PowerShell window (keep the server terminal open if you want to run both later)
2. Navigate to the UI folder:
   ```
   cd [YOUR_PROJECT_PATH]/text-2-sql-poc/fcsc_UI
   ```
   Replace `[YOUR_PROJECT_PATH]` with the actual path where you have cloned or extracted the project.

### Step 3: Install Node Dependencies

1. Install all required packages using pnpm:
   ```
   pnpm install
   ```
2. Wait for the installation to complete (this may take a few minutes)
3. This will create a `node_modules` folder with all dependencies

### Step 4: Configure API Endpoint (If Needed)

The UI is configured to connect to the FastAPI server running on `http://localhost:8000` by default. If your server runs on a different address or port, you may need to update the API configuration in the React code.

### Step 5: Verify UI Setup

1. Make sure you're in the `fcsc_UI` directory
2. Start the development server:
   ```
   pnpm run dev
   ```

3. You should see output similar to:
   ```
   VITE v6.x.x  ready in xxx ms

   ➜  Local:   http://localhost:3000/
   ➜  Network: http://192.168.x.x:3000/
   ```

4. Open a web browser and go to: http://localhost:3000
5. You should see the application interface
6. Press `Ctrl+C` in the terminal to stop the development server

---

## Running the Application

The application consists of two parts that need to run simultaneously: the backend server and the frontend UI.

### Option 1: Running in Separate Terminal Windows (Recommended for Beginners)

#### Terminal 1: Start the Backend Server

1. Open Command Prompt or PowerShell
2. Navigate to the server directory:
   ```
   cd [YOUR_PROJECT_PATH]/text-2-sql-poc/fcsc_Server
   ```
   Replace `[YOUR_PROJECT_PATH]` with the actual path where you have cloned or extracted the project.
3. Activate the virtual environment:
   ```
   venv\Scripts\activate
   ```
4. Start the server:
   ```
   uvicorn main:app --reload
   ```
5. Leave this terminal window open and running

#### Terminal 2: Start the Frontend UI

1. Open a new Command Prompt or PowerShell window
2. Navigate to the UI directory:
   ```
   cd [YOUR_PROJECT_PATH]/text-2-sql-poc/fcsc_UI
   ```
   Replace `[YOUR_PROJECT_PATH]` with the actual path where you have cloned or extracted the project.
3. Start the development server:
   ```
   pnpm run dev
   ```
4. Leave this terminal window open and running

#### Access the Application

1. Open your web browser
2. Navigate to: http://localhost:3000
3. The application should now be fully functional

### Stopping the Application

1. To stop the frontend: Go to the UI terminal window and press `Ctrl+C`
2. To stop the backend: Go to the server terminal window and press `Ctrl+C`
3. Always stop both servers when you're done using the application

---

## Troubleshooting

### Server Issues

**Problem**: `ModuleNotFoundError` when starting the server
- **Solution**: Make sure your virtual environment is activated and all dependencies are installed:
  ```
  pip install -r requirements.txt
  ```

**Problem**: `Error loading initial schema` or database connection errors
- **Solution**: 
  1. Verify your `.env` file has the correct Supabase URL and key
  2. Make sure you created the `execute_sql` function in Supabase SQL Editor
  3. Check that your Supabase project is active and not paused

**Problem**: Port 8000 is already in use
- **Solution**: Either stop the application using port 8000, or run the server on a different port:
  ```
  uvicorn main:app --reload --port 8001
  ```
  (You'll also need to update the UI configuration to point to the new port)

### UI Issues

**Problem**: `pnpm` command not found
- **Solution**: 
  1. Make sure you have installed pnpm using: `npm install -g pnpm`
  2. Verify installation: `pnpm --version`
  3. If still not found, try restarting your terminal or computer
  4. On Windows, you may need to run PowerShell as Administrator to install globally

**Problem**: `pnpm install` fails or takes too long
- **Solution**: 
  1. Check your internet connection
  2. Try clearing pnpm cache: `pnpm store prune`
  3. Make sure you're in the `fcsc_UI` directory
  4. Try deleting `node_modules` folder and `pnpm-lock.yaml`, then run `pnpm install` again

**Problem**: Port 3000 is already in use
- **Solution**: The Vite server will automatically try the next available port (3001, 3002, etc.). Check the terminal output for the actual port number.

**Problem**: Cannot connect to the backend API
- **Solution**: 
  1. Make sure the backend server is running
  2. Verify the server is accessible at http://localhost:8000/docs
  3. Check that CORS is properly configured (it should be by default)

### Supabase Issues

**Problem**: Cannot find Project URL or API key
- **Solution**: 
  1. Go to Supabase dashboard
  2. Click on your project
  3. Go to Settings > API
  4. Copy the values again

**Problem**: SQL function creation fails
- **Solution**: 
  1. Make sure you're in the SQL Editor
  2. Copy the entire function code exactly as provided
  3. Make sure there are no extra characters or formatting issues
  4. Try running the query again

**Problem**: Database queries fail
- **Solution**: 
  1. Verify the `execute_sql` function exists in your database
  2. Check that the function name in `database.py` (variable `SQL_FUNCTION_NAME`) matches the function name you created in Supabase
  3. If the code uses a different function name (e.g., `run_sql`), either:
     - Update the function name in Supabase to match the code, OR
     - Update the `SQL_FUNCTION_NAME` variable in `database.py` to match your Supabase function name
  4. Check the Supabase SQL Editor logs for error messages
  5. Ensure your database has the necessary tables and data

### General Issues

**Problem**: Changes not reflecting
- **Solution**: 
  - The server uses `--reload` flag, so it should auto-reload on code changes
  - The UI development server also has hot-reload enabled
  - Try refreshing your browser (Ctrl+F5 for hard refresh)

**Problem**: Python or Node.js command not found
- **Solution**: 
  1. Verify the installation by running `python --version` or `node --version`
  2. Make sure Python/Node.js are added to your system PATH
  3. You may need to restart your terminal or computer after installation

---

## Project Structure

```
text-2-sql-poc/
├── fcsc_Server/          # FastAPI backend server
│   ├── agents/          # AI agents for query processing
│   ├── models/          # Data models
│   ├── routers/         # API route handlers
│   ├── utils/           # Utility functions
│   ├── main.py          # FastAPI application entry point
│   ├── database.py      # Database connection and queries
│   ├── requirements.txt # Python dependencies
│   └── .env            # Environment variables (create this)
│
└── fcsc_UI/             # React frontend application
    ├── src/            # Source code
    │   ├── Components/ # React components
    │   └── ...
    ├── public/         # Static assets
    ├── package.json    # Node.js dependencies
    └── vite.config.js  # Vite configuration
```

---

## Additional Notes

- The server runs on port 8000 by default
- The UI runs on port 3000 by default
- Both servers support hot-reload during development
- The `.env` file in the server directory contains sensitive information and should never be shared
- Make sure both servers are running for the application to work properly
- The application requires an active internet connection for AI model API calls

---

## Support

If you encounter issues not covered in this guide:

1. Check the terminal output for error messages
2. Verify all prerequisites are installed correctly
3. Ensure all environment variables are set correctly
4. Make sure both servers are running
5. Check that the Supabase function is created and working

For technical issues, refer to the error messages in the terminal windows for more specific information.

