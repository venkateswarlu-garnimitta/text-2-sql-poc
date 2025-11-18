
import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ExportResults = () => {
  const [csvLoading, setCsvLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const { t } = useTranslation();
  const handleDownload = async (type) => {
    const isCSV = type === 'csv';
    const setLoading = isCSV ? setCsvLoading : setExcelLoading;
    const endpoint = isCSV
      ? 'http://127.0.0.1:8000/download/csv'
      : 'http://127.0.0.1:8000/download/excel';

    setLoading(true);
    try {
      const response = await axios.get(endpoint, {
        responseType: 'blob',
      });

      if (response.status === 200) {
        // Try to get file name from backend header
        const contentDisposition = response.headers['content-disposition'];
        const fileNameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
        const fallbackFileName = isCSV ? 'results.csv' : 'results.xlsx';
        const fileName = fileNameMatch ? fileNameMatch[1] : fallbackFileName;

        // Set correct MIME type
        const mimeType = isCSV ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const blob = new Blob([response.data], { type: mimeType });

        // Create and click download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        console.error(`Failed to download ${type.toUpperCase()} file`);
      }
    } catch (error) {
      console.error(`Error downloading ${type.toUpperCase()} file:, error`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-semibold mb-2" style={{ color: '##000000' }}>💾 {t('export')}</h2>

      <div className="flex justify-between items-center w-[650px] px-4">
        <button
          onClick={() => handleDownload('csv')}
          className="border border-black text-black bg-white rounded px-4 py-2 hover:text-orange-500 hover:border-orange-500 flex items-center gap-2 ml-7"
        >
          {csvLoading ? (
            <>
              <span className="animate-spin">🔄</span> {t('Downloading CSV')}...
            </>
          ) : (
           t('csv')
          )}
        </button>

        <button
          onClick={() => handleDownload('excel')}
          className="border border-black text-black bg-white rounded px-4 py-2 hover:text-orange-500 hover:border-orange-500 flex items-center gap-2 ml-5"
        >
          {excelLoading ? (
            <>
              <span className="animate-spin">🔄</span> {t('Downloading Excel')}...
            </>
          ) : (
            t('excel')
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportResults;