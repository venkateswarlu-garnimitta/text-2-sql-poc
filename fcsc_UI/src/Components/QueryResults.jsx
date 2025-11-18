
import React, { useState, useEffect } from 'react';
import VisualizationPanel from './VisualizationPanel';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

const QueryResults = ({ rows, columns, data, }) => {
  const [selectedViz, setSelectedViz] = useState('table');
  const [isDownloading, setIsDownloading] = useState(false);
  const [insights, setInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(true);

  const visualizationTypes = [
    { label: 'Table', value: 'table' },
    { label: 'Bar Chart', value: 'bar' },
    { label: 'Line Chart', value: 'line' },
    { label: 'Pie Chart', value: 'pie' },
    { label: 'Scatter Plot', value: 'scatterPlot' },
    { label: 'Heat Map', value: 'heatMap' },
  ];


  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => {
    const fetchInsights = async () => {
      setInsightsLoading(true);

      const insightsUrl =
        currentLang === 'ar'
          ? 'http://127.0.0.1:8000/summary-insights/arabic'
          : 'http://127.0.0.1:8000/summary-insights/english';

      try {
        const res = await axios.get(insightsUrl);
        if (res.status === 200 && res.data.summary_insights) {
          setInsights(res.data.summary_insights);
        } else {
          setInsights('⚠️ No insights returned.');
        }
      } catch (err) {
        console.error('Error fetching insights:', err.message);
        setInsights('⚠️ Error loading insights.');
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();
  }, [currentLang]);



  const handleGeneratePDF = async () => {
    setIsDownloading(true);
    try {
      const pdfUrl =
        currentLang === 'ar'
          ? 'http://127.0.0.1:8000/download/generate-pdf/arabic'
          : 'http://127.0.0.1:8000/download/generate-pdf/english';

      const response = await axios.get(pdfUrl, {
        responseType: 'blob',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'NL2SQL_Report.pdf';
        link.click();
      } else {
        console.error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-8">

      {/* TABLE */}
      {/* <h2 className="text-xl font-semibold mb-4" style={{ color: "##000000" }}>
        📊 {t('Queryr')}
      </h2>

      <div className="flex justify-between items-center gap-6 w-full mb-4">
        <div className="flex-1">
          <p className="font-bold mb-2">{t('Rows')}</p>
          <p className="text-gray-800">{rows}</p>
        </div>

        <div className="flex-1">
          <p className="font-bold mb-2">{t('Columns')}</p>
          <p className="text-gray-800">{columns}</p>
        </div>

        <div className="flex-1">
          <p className="font-bold mb-2">{t('Visualization')}</p>
          <select
            value={selectedViz}
            onChange={(e) => setSelectedViz(e.target.value)}
            className="h-10 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
          >
            {visualizationTypes.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div> */}
  <h2 className="text-xl font-semibold mb-4" style={{ color: "##000000" }}>
    📊 {t('Queryr')}
  </h2>

  <div className="flex justify-between items-center gap-6 w-full mb-6 px-6">
    <div className="flex-1">
      <p className="font-bold mb-2">{t('Rows')}</p>
      <p className="text-gray-800">{rows}</p>
    </div>

    <div className="flex-1">
      <p className="font-bold mb-2">{t('Columns')}</p>
      <p className="text-gray-800">{columns}</p>
    </div>

    <div className="flex-1">
      <p className="font-bold mb-2">{t('Visualization')}</p>
      <select
        value={selectedViz}
        onChange={(e) => setSelectedViz(e.target.value)}
        className="h-10 w-full py-2 pr-4 pl-2 border border-gray-300 rounded-md bg-white text-gray-800"
      >
        {visualizationTypes.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  </div>

      {/* Table */}
      <VisualizationPanel data={data} chartType={selectedViz} />

      {/* <div className="mt-6">
        <p className="text-2xl font-semibold mb-2" style={{ color: "##000000" }}>
          📊 {t('Summary')}
        </p>
        {insightsLoading ? (
          <p className="text-gray-600 text-lg">🔄 {t('lsights')}...</p>
        ) : (
          <div className="text-gray-800 list-disc pl-5">
            <ReactMarkdown
              components={{
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-5" {...props} />
                ),
              }}
            >
              {insights}
            </ReactMarkdown>
          </div>
        )}
      </div> */}

      <div className="mt-6">
        <p className="text-2xl font-semibold mb-2 " style={{ color: "##000000" }}>
          📊 {t('Summary')}
        </p>
        {insightsLoading ? (
          <p className="text-gray-600 text-lg">🔄 {t('lsights')}...</p>
        ) : (
          <div className="text-gray-800 list-disc pl-5">
            <ReactMarkdown
              components={{
                ul: ({ node, ...props }) => <ul className="list-disc pl-5" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5" {...props} />,
              }}
            >
              {insights}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <div className="p-4 max-w-xs">
        <button
          onClick={handleGeneratePDF}
          className="border border-black text-black bg-white rounded px-3 py-1.5 mb-2 hover:text-orange-500 hover:border-orange-500 transition-colors duration-200 ml-6"
        >
          {isDownloading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">🔄</span> {t('Generating')}...
            </span>
          ) : (
            t('pdf')
          )}
        </button>
      </div>
    </div>
  );
};

export default QueryResults;