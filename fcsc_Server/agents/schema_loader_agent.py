import time
from database import get_database_schema_string

class SchemaLoaderAgent:
    """
    Agent responsible for loading the database schema.
    """
    @staticmethod
    def load_schema_from_db(db_path: str = None) -> tuple[str, float]:
        """
        Loads the database schema string from the specified SQLite database.

        Args:
            db_path (str): The path to the SQLite database file.

        Returns:
            tuple[str, float]: A tuple containing the schema string and the time taken in seconds.
        """
        start_time = time.time()
        schema_string = get_database_schema_string()
        end_time = time.time()
        time_taken = end_time - start_time
        return schema_string, time_taken


