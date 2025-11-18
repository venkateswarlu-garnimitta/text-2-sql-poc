# FastAPI Server

Backend API server for the Text to SQL application. Handles natural language query processing, SQL generation, database operations, and data visualization.

## Requirements

- Python 3.8 or higher
- Virtual environment (recommended)

## Setup

1. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   - Copy `env-example` to `.env`
   - Fill in your credentials:
     ```
     FLOTORCH_API_KEY=your_flotorch_api_key
     FLOTORCH_BASE_URL=https://gateway.flotorch.cloud
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     ```

## Running the Server

Start the development server:
```
uvicorn main:app --reload
```

The server will run on `http://127.0.0.1:8000`

API documentation is available at `http://127.0.0.1:8000/docs`

## Project Structure

```
fcsc_Server/
├── agents/              # AI agents for query processing
│   ├── schema_loader_agent.py
│   ├── selector_agent.py
│   ├── decomposer_agent.py
│   ├── refiner_agent.py
│   └── visualization_agent_3.py
├── models/              # Pydantic models for request/response
│   ├── agents.py
│   └── common.py
├── routers/             # API route handlers
│   ├── schema.py        # Database schema endpoints
│   ├── upload.py        # File upload endpoints
│   ├── query_process.py # Query processing endpoints
│   ├── insights.py      # Data insights endpoints
│   └── downloads.py    # Report download endpoints
├── utils/               # Utility functions
│   └── processing_steps.py
├── main.py              # FastAPI application entry point
├── database.py          # Database connection and query execution
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables (create from env-example)
```

## API Endpoints

- `/schema` - Get database schema information
- `/upload` - Upload CSV files to database
- `/query-process` - Process natural language queries
- `/insights` - Get data insights and summaries
- `/generate-pdf/{lang}` - Generate PDF reports (eng/ar)
- `/download-excel` - Download results as Excel file

## Database Configuration

The server connects to Supabase PostgreSQL database. Ensure:

1. Supabase project is created and active
2. `execute_sql` function is created in Supabase SQL Editor
3. Environment variables `SUPABASE_URL` and `SUPABASE_KEY` are set correctly

## Notes

- The server uses CORS middleware to allow requests from the frontend
- Global application state is managed in `main.py` (`app_state` dictionary)
- The server automatically loads the database schema on startup
- Supports both English and Arabic language queries

