import time
import pandas as pd
from fastapi import APIRouter, HTTPException, status
from starlette.responses import StreamingResponse
from io import StringIO, BytesIO
from typing import Optional

from main import app_state # Import the global app_state

# Assuming these PDF generators are external and remain as is.
from pdf_v2 import PDFReportGenerator
from translate_pdf import ArabicPDFReportGenerator


router = APIRouter(
    prefix="/download", # Prefix for download related endpoints
    tags=['Download']
)

@router.get("/generate-pdf/{lang}", summary="Generate PDF Report")
async def generate_pdf_report_endpoint(lang :Optional[str] = "eng"): # Renamed to avoid conflict
    """
    Generates a PDF report based on the last successfully processed query, SQL, and results.
    The report language (English or Arabic) can be specified via the 'lang' path parameter.
    """
    # Check if necessary data exists in app_state
    # Crucially, app_state["last_result_df"] should be a pandas DataFrame
    if app_state["last_result_df"] is None: # This now correctly checks for the DataFrame
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, # 409 Conflict: request cannot be processed in current state
            detail="No result DataFrame available to generate PDF. Run /query-process successfully first."
        )

    # Determine which query and insights to use based on 'lang'
    if lang.lower() == "arabic":
        query_for_pdf = app_state["last_query_processed_arabic"] if app_state["last_query_processed_arabic"] else app_state["last_query_processed_english"]
        summary_insights_for_pdf = app_state["current_summary_insights_ar"] if app_state["current_summary_insights_ar"] else "No specific insights generated for this query."
    else: # Default to English
        query_for_pdf = app_state["last_query_processed_english"]
        summary_insights_for_pdf = app_state["current_summary_insights_eng"] if app_state["current_summary_insights_eng"] else "No specific insights generated for this query."


    if query_for_pdf is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Original query (English or Arabic version) not found. Run /query-process first."
        )

    if app_state["last_sql_generated"] is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="SQL query not found. Run /query-process first."
        )

    try:
        # Ensure last_result_df is a DataFrame before passing
        if not isinstance(app_state["last_result_df"], pd.DataFrame):
            print(f"Error: last_result_df is not a DataFrame, but type: {type(app_state['last_result_df'])}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal error: Result data is not in the expected format (DataFrame).")

        if app_state["last_result_df"].empty:
            summary_insights_for_pdf = "Query executed successfully but returned no data. " + summary_insights_for_pdf

        if lang.lower() == "arabic":
            pdf_bytes_content = ArabicPDFReportGenerator.generate_report( # Assuming external generator
                query=query_for_pdf, # Pass the appropriate language query
                sql_query=app_state["last_sql_generated"],
                result_df=app_state["last_result_df"],
                summary=summary_insights_for_pdf, # Pass the appropriate language summary insights
                output_path=None
            )
        else:
            pdf_bytes_content = PDFReportGenerator.generate_report( # Assuming external generator
                query=query_for_pdf, # Pass the appropriate language query
                sql_query=app_state["last_sql_generated"],
                result_df=app_state["last_result_df"],
                summary=summary_insights_for_pdf, # Pass the appropriate language summary insights
                output_path=None
            )

        if isinstance(pdf_bytes_content, bytes): # Correct check for 'bytes'
            filename = f"NL2SQL_Report_{lang.lower()}_{int(time.time())}.pdf"
            # Wrap the bytes in BytesIO for StreamingResponse
            return StreamingResponse(BytesIO(pdf_bytes_content), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}"})
        else:
            # This block would be hit if generate_report returned something unexpected (e.g., None due to an internal error)
            print(f"Error: PDFReportGenerator.generate_report returned type {type(pdf_bytes_content)} instead of bytes.")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="PDF generator returned an unexpected data type or an error occurred within the generator.")

    except HTTPException as he: # Re-raise HTTPExceptions
        raise he
    except Exception as e:
        import traceback
        tb_str = traceback.format_exc()
        print(f"Error generating PDF report: {str(e)}\nTraceback: {tb_str}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An internal error occurred while generating the PDF report: {str(e)}")


@router.get("/csv", tags=["Download-CSV"], summary="Download Last Query Result as CSV")
async def download_csv():
    """
    Downloads the result of the last processed query as a CSV file.
    Requires a query to have been processed successfully via /query-process.
    """
    if app_state["last_result_df"] is None or app_state["last_result_df"].empty:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No data available from the last query to download as CSV. Please run /query-process first."
        )

    try:
        csv_buffer = StringIO()
        app_state["last_result_df"].to_csv(csv_buffer, index=False, encoding='utf-8')
        csv_buffer.seek(0) # Rewind the buffer to the beginning

        file_name = f"query_result_{int(time.time())}.csv"

        return StreamingResponse(
            BytesIO(csv_buffer.getvalue().encode('utf-8')), # Encode to bytes for StreamingResponse
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={file_name}"}
        )
    except Exception as e:
        print(f"Error generating CSV for download: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred while generating the CSV file: {e}")


@router.get("/excel", tags=["Download-Excel"], summary="Download Last Query Result as Excel")
async def download_excel():
    """
    Downloads the result of the last processed query as an Excel (XLSX) file.
    Requires a query to have been processed successfully via /query-process.
    """
    if app_state["last_result_df"] is None or app_state["last_result_df"].empty:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No data available from the last query to download as Excel. Please run /query-process first."
        )

    try:
        excel_buffer = BytesIO()
        # Ensure 'openpyxl' is installed for .xlsx support if not already.
        # pip install openpyxl
        app_state["last_result_df"].to_excel(excel_buffer, index=False, engine='openpyxl')
        excel_buffer.seek(0) # Rewind the buffer to the beginning

        file_name = f"query_result_{int(time.time())}.xlsx"

        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={file_name}"}
        )
    except Exception as e:
        print(f"Error generating Excel for download: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred while generating the Excel file: {e}")
