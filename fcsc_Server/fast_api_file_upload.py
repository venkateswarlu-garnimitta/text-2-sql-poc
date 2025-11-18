

import pandas as pd
from supabase import create_client, Client
import re
import os
# supabase: Client = create_client(url, key)
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
if not url or not key:
    print("WARNING: SUPABASE_URL or SUPABASE_KEY not found in environment variables.")
    print("Please ensure your .env file is correctly set up.")

supabase: Client = create_client(url, key)


# Clean column names to be SQL-safe
def clean_column_name(col: str) -> str:
    cleaned = re.sub(r"\W+", "_", col.strip().lower())
    if cleaned.startswith("_") and len(cleaned) > 1 and not re.match(r"^\d", cleaned[1:]):
        cleaned = cleaned[1:]
    return cleaned

# Map pandas dtypes to SQL types
def map_dtype(dtype) -> str:
    if pd.api.types.is_integer_dtype(dtype):
        return "INTEGER"
    elif pd.api.types.is_float_dtype(dtype):
        return "FLOAT"
    elif pd.api.types.is_bool_dtype(dtype):
        return "BOOLEAN"
    elif pd.api.types.is_datetime64_any_dtype(dtype):
        return "TIMESTAMP"
    else:
        return "TEXT"

# Generate CREATE TABLE SQL
def create_table_sql(table_name: str, df: pd.DataFrame) -> str:
    cols = []
    for col in df.columns:
        col_name = clean_column_name(col)
        sql_type = map_dtype(df[col].dtype)
        # Wrap column names in double quotes to handle keywords or special characters
        cols.append(f'"{col_name}" {sql_type}')
    return f'CREATE TABLE "{table_name}" ({", ".join(cols)});'


# Run a raw SQL query using Supabase client's rpc call
def run_sql(sql: str):
    """Executes a SQL query using Supabase RPC. Requires 'run_sql' RPC function on Supabase."""
    try:
        result = supabase.rpc("run_sql", {"query": sql}).execute()
        return result
    except Exception as e:
        print(f"Error executing raw SQL via RPC: {e}")
        return None 

# Check if table exists
def table_exists(table_name: str) -> bool:
    """Checks if a table exists in the public schema."""
    sql = f"SELECT to_regclass('public.\"{table_name}\"');" 
    print(f"Checking if table '{table_name}' exists with SQL: {sql}")
    result = run_sql(sql) 

    if result and result.data and result.data[0].get("to_regclass") is not None:
        print(f"Table '{table_name}' exists.")
        return True
    print(f"Table '{table_name}' does not exist or check failed. Result: {result}")
    return False

# Create table safely
def create_table_if_not_exists(df: pd.DataFrame, table_name: str) -> bool:
    """Creates a table if it doesn't exist. Returns True on success, False otherwise."""
    if table_exists(table_name):
        print(f"⚠️ Table `{table_name}` already exists. Skipping creation.")
        return False
    try:
        sql = create_table_sql(table_name, df)
        print(f"Attempting to create table '{table_name}' with SQL: {sql}")
        result = run_sql(sql) 

        if result and result.data is not None:
            print(f"✅ Table `{table_name}` created successfully.")

            # Disable RLS for the created table
            disable_rls_sql = f'ALTER TABLE "public"."{table_name}" DISABLE ROW LEVEL SECURITY;'
            print(f"Attempting to disable RLS for '{table_name}' with SQL: {disable_rls_sql}")
            disable_result = run_sql(disable_rls_sql) 

            if disable_result and disable_result.data is not None:
                print(f"🔓 RLS disabled for `{table_name}`.")
                return True
            else:
                print(f"⚠️ RLS might not be disabled for `{table_name}`. Result: {disable_result}")
                return True 
        else:
            print(f"⚠️ Couldn't confirm table creation for `{table_name}`. Result: {result}")
            return False
    except Exception as e:
        print(f"❌ SQL Execution Error (creating {table_name}): {e}")
        return False

# Insert data into Supabase
def insert_data(df: pd.DataFrame, table_name: str):
    """Inserts DataFrame records into the specified Supabase table."""
    # Clean column names in the DataFrame to match the database's cleaned names
    df.columns = [clean_column_name(col) for col in df.columns]
    data = df.to_dict(orient="records")

    try:
        response = supabase.table(table_name).select("*").limit(1).execute()
        if not response.data:
            print(f"⚠️ Table `{table_name}` is empty. Proceeding with insert.")
        else:
            table_columns = set(response.data[0].keys())
            df_columns = set(df.columns)
            if not df_columns.issubset(table_columns):
                print(f"❌ Column mismatch in `{table_name}`.\n\nExpected: {table_columns}\n\nProvided: {df_columns}")
                return 

        result = supabase.table(table_name).insert(data).execute()
        if result.data:
            print(f"✅ Inserted {len(result.data)} rows into `{table_name}`.")
        else:
            print(f"⚠️ Insert attempt complete but no data returned for `{table_name}`.")
    except Exception as e:
        print(f"❌ Insert Error for `{table_name}`: {e}")