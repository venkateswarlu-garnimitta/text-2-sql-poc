import { useState, useEffect } from "react";
import LineChartComponent from "./Charts/LineChart";
import BarChartComponent from "./Charts/BarChart";
import PieChartComponent from "./Charts/PieChart";
import ResultTable from "./Charts/ResultTable";
import ScatterPlot from "./Charts/ScatterPlot";
import HeatMap from "./Charts/HeatMap";
import ErrorBoundary from "./ErrorBoundary";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { MultiSelect } from "primereact/multiselect";

const VisualizationPanel = ({ data, chartType }) => {
  const [xOptions, setXOptions] = useState([]);
  const [yOptions, setYOptions] = useState([]);
  const [selectedX, setSelectedX] = useState("");
  const [selectedY, setSelectedY] = useState("");
  const [showAxisSelectors, setShowAxisSelectors] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setXOptions([]);
      setYOptions([]);
      setSelectedX("");
      setSelectedY("");
      setFilteredData([]);
      return;
    }

    const sampleRow = data[0];
    const allKeys = Object.keys(sampleRow);

    const xCategorical = [];
    const yNumerical = [];

    allKeys.forEach((key) => {
      const values = data.map((row) => row[key]);
      const isNumeric = values.every(
        (val) => !isNaN(Number.parseFloat(val)) && isFinite(val)
      );
      if (isNumeric) {
        yNumerical.push(key);
      } else {
        xCategorical.push(key);
      }
    });

    setXOptions(xCategorical);
    setYOptions(yNumerical);

    // Automatically select first valid options
    if (xCategorical.length > 0) {
      setSelectedX(xCategorical[0]);
    } else {
      setSelectedX("");
    }
    if (yNumerical.length > 0) {
      setSelectedY(yNumerical[0]); // Default to first numeric column instead of "all"
    } else {
      setSelectedY("");
    }
  }, [data]);

  // Filter data based on selections
  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setFilteredData([]);
      return;
    }

    let filtered = [...data];

    if (filterValue && selectedX && selectedX !== "all") {
      filtered = filtered.filter((item) =>
        String(item[selectedX])
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [data, selectedX, filterValue]);

  // Decide when to show selectors (hide for table)
  useEffect(() => {
    setShowAxisSelectors(chartType !== "table" && data?.length > 0);
  }, [chartType, data]);

  return (
    <div className="space-y-4">
      {showAxisSelectors && (
        <>
          <div>
            <label className="font-semibold text-sm mb-1 block">
              Select X-axis (categorical):
            </label>
            <select
              value={selectedX}
              onChange={(e) => setSelectedX(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select X --</option>
              {xOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-sm mb-1 block">
              Select Y-axis (numeric):
            </label>
            <select
              value={selectedY}
              onChange={(e) => setSelectedY(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select Y --</option>
              {yOptions
                .filter((opt) => opt !== selectedX)
                .map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
        </>
      )}
      <div className="rounded p-2">
        {chartType === "line" && (
          <ErrorBoundary>
            <LineChartComponent
              data={filteredData}
              xKey={selectedX}
              yKey={selectedY}
              yOptions={yOptions}
            />
          </ErrorBoundary>
        )}
        {chartType === "bar" && (
          <ErrorBoundary>
            <BarChartComponent
              data={filteredData}
              xKey={selectedX}
              yKey={selectedY}
              yOptions={yOptions}
            />
          </ErrorBoundary>
        )}
        {chartType === "pie" && (
          <ErrorBoundary>
            <PieChartComponent
              data={filteredData}
              xKey={selectedX}
              yKey={selectedY}
            />
          </ErrorBoundary>
        )}
        {chartType === "scatterPlot" && (
          <ErrorBoundary>
            <ScatterPlot data={filteredData} xKey={selectedX} yKey={selectedY} />
          </ErrorBoundary>
        )}
        {chartType === "heatMap" && (
          <ErrorBoundary>
            <HeatMap data={filteredData} xKey={selectedX} yKey={selectedY} />
          </ErrorBoundary>
        )}
        {chartType === "table" && <ResultTable data={filteredData} />}
      </div>
    </div>
  );
};

export default VisualizationPanel;