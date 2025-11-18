

import os
import time
import openai
import json
from flotorch.sdk.llm import FlotorchLLM
from dotenv import load_dotenv
load_dotenv()

class SelectorAgent:
    """
    Agent responsible for checking if a user query is answerable based on the schema
    and if it needs decomposition.
    """
    @staticmethod
    def is_query_answerable(query: str, schema_string: str) -> tuple[bool, str, bool, float]:
        """
        Uses an LLM to determine if the query can be answered and if it needs decomposition.

        Args:
            query (str): The user's natural language query.
            schema_string (str): A string representation of the database schema.

        Returns:
            tuple[bool, str, bool, float]: A tuple containing:
                                     - bool: True if the query is answerable (is_answerable).
                                     - str: An explanation or status message.
                                     - bool: True if the query needs decomposition (needs_decomposition).
                                     - float: The time taken in seconds.
        """
        start_time = time.time()
        # Default values for return tuple
        is_answerable_flag = False
        explanation_msg = "Selector Agent evaluation pending."
        needs_decompose_flag = False # Default to False, especially in error cases

        try:
            # client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            client = FlotorchLLM(
                model_id="flotorch/flotorch-model",
                api_key=os.getenv("FLOTORCH_API_KEY"),
                base_url=os.getenv("FLOTORCH_BASE_URL")
            )

            prompt = f"""
                # Smart Query Evaluator Prompt

You are a practical query evaluator that helps determine if user queries can be answered using available database tables.

## Database Schema:
{schema_string}

## User Query:
"{query}"

## Your Task:
Evaluate the query using these **flexible guidelines**:

### 1. Is the query answerable? (Be GENEROUS)
Mark as **"Yes"** if:
- ANY relevant table names are mentioned or implied in the query
- ANY column names match or are conceptually related to the query
- The query asks for information that could reasonably exist in the schema
- You can imagine a SQL query being written using the available tables/columns
- The intent is clear even if exact terminology doesn't match

Mark as **"No"** ONLY if:
- The query asks for completely unrelated data not present in any table
- No tables or columns could possibly contain the requested information

### 2. Does it need decomposition? (Be PRACTICAL)
Mark as **"Yes"** if the query requires:
- Multiple SELECT statements or subqueries
- Joining multiple tables
- Different aggregations (SUM, COUNT, AVG) on different data
- Complex comparisons or trend analysis
- Multiple filtering conditions across different tables

Mark as **"No"** if:
- Simple SELECT from one table
- Basic filtering on one table
- Single aggregation operation
- Straightforward data retrieval

## Important Guidelines:
- **Err on the side of "answerable"** - if there's reasonable doubt, choose "Yes"
- Focus on whether the information *could* exist in the schema, not exact matches
- Consider synonyms and related concepts (e.g., "customer" might relate to "user" table)
- Think practically - can a developer write SQL for this using the available tables?

## Response Format:
Return ONLY a valid JSON object:


{{
  "is_answerable": "Yes" or "No",
  "need_decompose": "Yes" or "No"
}}


## Examples:
- Simple query about user data when users table exists: `{{"is_answerable": "Yes", "need_decompose": "No"}}`
- Complex query requiring multiple tables and aggregations: `{{"is_answerable": "Yes", "need_decompose": "Yes"}}`
- Query about completely unrelated domain: `{{"is_answerable": "No", "need_decompose": "No"}}`
                """

            # response = client.chat.completions.create(
            #     model="gpt-4o-mini",
            #     messages=[{"role": "user", "content": prompt}],
            #     temperature=0,
            #     max_tokens=50
            # )

            # answer = response.choices[0].message.content.strip()
            response = client.invoke(messages=[{"role":"user","content":prompt}])
            answer = response.content
            print(f"SelectorAgent LLM raw response: {answer}") # for debugging/logging

            try:
                result = json.loads(answer)
                is_answerable_str = result.get("is_answerable", "No").strip().lower()
                need_decompose_str = result.get("need_decompose", "No").strip().lower()

                is_answerable_flag = is_answerable_str == "yes"
                needs_decompose_flag = need_decompose_str == "yes"

                if is_answerable_flag:
                    explanation_msg = f"Query is considered answerable. Decomposition needed: {needs_decompose_flag}."
                else:
                    explanation_msg = f"Query is considered NOT answerable. Decomposition needed: {needs_decompose_flag}."
                
                if not is_answerable_flag: # If not answerable, decomposition is usually irrelevant or based on why it's not answerable
                    needs_decompose_flag = False # Or keep LLM's opinion if preferred

            except json.JSONDecodeError:
                explanation_msg = f"Error: Failed to parse JSON from SelectorAgent. Raw response: '{answer}'"
                print(explanation_msg)
                # is_answerable_flag and needs_decompose_flag remain False (default)
            
        except openai.APIError as e: # More specific OpenAI error handling
            explanation_msg = f"Error in SelectorAgent (OpenAI API Error): {str(e)}"
            print(explanation_msg)
            # is_answerable_flag and needs_decompose_flag remain False (default)
        except Exception as e:
            explanation_msg = f"Unexpected error in SelectorAgent: {str(e)}"
            print(explanation_msg)
            # is_answerable_flag and needs_decompose_flag remain False (default)
        
        time_taken = time.time() - start_time
        return is_answerable_flag, explanation_msg, needs_decompose_flag, time_taken

# Example usage (for testing)
if __name__ == '__main__':
    # Load environment variables if you use a .env file
    from dotenv import load_dotenv
    load_dotenv()

    # Dummy schema for testing
    dummy_schema = """
    Database Schema:
    Table: employees (
      employee_id INTEGER,
      name TEXT,
      department TEXT,
      salary REAL
    );
    Table: departments (
      department_id INTEGER,
      department_name TEXT
    );
    """
    query_simple_answerable = "What are the names of all employees?"
    query_complex_answerable = "Show me the average salary by department."
    query_not_answerable = "What is the weather like in London?"

    if os.getenv("OPENAI_API_KEY"):
        print(f"Checking query: '{query_simple_answerable}'")
        answerable, explanation, needs_decomp, duration = SelectorAgent.is_query_answerable(query_simple_answerable, dummy_schema)
        print(f"Answerable: {answerable}, Explanation: {explanation}, Needs Decomposition: {needs_decomp}, Time: {duration:.4f}s\n")

        print(f"Checking query: '{query_complex_answerable}'")
        answerable, explanation, needs_decomp, duration = SelectorAgent.is_query_answerable(query_complex_answerable, dummy_schema)
        print(f"Answerable: {answerable}, Explanation: {explanation}, Needs Decomposition: {needs_decomp}, Time: {duration:.4f}s\n")

        print(f"Checking query: '{query_not_answerable}'")
        answerable, explanation, needs_decomp, duration = SelectorAgent.is_query_answerable(query_not_answerable, dummy_schema)
        print(f"Answerable: {answerable}, Explanation: {explanation}, Needs Decomposition: {needs_decomp}, Time: {duration:.4f}s\n")
    else:
        print("OpenAI API key not found. Cannot run SelectorAgent example.")