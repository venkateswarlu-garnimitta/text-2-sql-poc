import pandas as pd
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Name of the Postgres function we call
SQL_FUNCTION_NAME = "run_sql"


def get_db_connection(db_path: str = None) -> Client:
    return supabase


def call_sql_function(conn: Client, query: str):
    """
    Helper to call the run_sql(query text) function and handle errors.
    """
    # Ensure query does NOT end with a semicolon
    query = query.strip()
    if query.endswith(";"):
        query = query[:-1]

    response = conn.rpc(SQL_FUNCTION_NAME, {"query": query}).execute()

    # supabase-py v2 style: response has .data and .error
    if getattr(response, "error", None):
        raise RuntimeError(response.error)

    # response.data is a list of JSON objects or raw rows (depending on your function)
    return response.data


def get_table_names(conn: Client) -> list[str]:
    query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    """
    data = call_sql_function(conn, query)

    # data is a list of JSON rows like {"table_name": "..."}
    return [row["table_name"] for row in data]


def get_table_schema(conn: Client, table_name: str) -> list[tuple]:
    query = f"""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = '{table_name}'
    """
    data = call_sql_function(conn, query)
    return [(row["column_name"], row["data_type"]) for row in data]


def get_database_schema_string(db_path: str = None) -> str:
    schema_string = "Database Schema:\n"
    try:
        conn = get_db_connection()
        table_names = get_table_names(conn)
        if not table_names:
            return "No tables found in the database."
        for table_name in table_names:
            schema_string += f"Table: {table_name} (\n"
            table_schema = get_table_schema(conn, table_name)
            for col_name, col_type in table_schema:
                schema_string += f"  {col_name} {col_type},\n"
            schema_string = schema_string.rstrip(",\n") + "\n);\n"
    except Exception as e:
        return f"Error loading database schema: {e}"
    return schema_string


def execute_sql_query_db(sql_query: str, db_path: str = None) -> pd.DataFrame | None:
    try:
        conn = get_db_connection()
        data = call_sql_function(conn, sql_query)
        # data should be a list of dict-like JSON rows
        return pd.DataFrame(data)
    except Exception as e:
        print(f"Error executing SQL query: {e}")
        return None


if __name__ == "__main__":
    print("\n--- Database Schema ---")
    schema_str = get_database_schema_string()
    print(schema_str)

    print("\n--- Query Execution Test ---")
    test_query = "SELECT * FROM iristable LIMIT 10;"
    print(f"Executing query: {test_query}")
    result_df = execute_sql_query_db(test_query)

    if result_df is not None:
        print("\nResult DataFrame:")
        print(result_df)
    else:
        print("Query execution failed.")
