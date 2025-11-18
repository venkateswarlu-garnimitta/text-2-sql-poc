import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  Legend,
} from "recharts";

// More robust capitalize function
const safeCapitalize = (input) => {
  if (input === null || input === undefined) return '';
  const str = String(input);
  if (str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Provided color palette
const COLORS = [
  "#FF6B35", "#2E86AB", "#A23B72", "#F18F01", "#C73E1D",
  "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD",
  "#20B2AA", "#FF7F50",
];

// --- CustomTooltip ---
const CustomTooltip = ({ active, payload, label, xAxisKey }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.98)",
      border: "1px solid #dfe6e9",
      borderRadius: "10px",
      padding: "12px 15px",
      backdropFilter: "blur(8px)",
      boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
      minWidth: "190px",
      fontFamily: "'Inter', sans-serif",
    }}>
      <p style={{
        margin: "0 0 10px 0",
        fontWeight: "600",
        fontSize: "15px",
        color: "#2c3e50",
        paddingBottom: "8px",
        borderBottom: "1px solid #ecf0f1",
        wordBreak: "break-word",
      }}>
        {safeCapitalize(xAxisKey)}: <span style={{ color: "#0984e3", fontWeight: "700" }}>{safeCapitalize(label)}</span>
      </p>
      {payload.map((entry, index) => (
        <div key={index} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "8px 0",
          padding: "3px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: entry.color,
              border: "1px solid #fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }} />
            <span style={{ fontSize: "13px", color: "#34495e", fontWeight: "500" }}>
              {safeCapitalize(entry.name)}
            </span>
          </div>
          <span style={{
            fontSize: "13px",
            fontWeight: "600",
            color: entry.color,
            backgroundColor: `${entry.color}20`,
            padding: "3px 6px",
            borderRadius: "4px",
          }}>
            {Number.parseFloat(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
};

// --- yAxisTickFormatter ---
const yAxisTickFormatter = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return value.toString();
};

// --- XAxisCategoriesLegend: Displays unique X-axis values in the legend ---
const XAxisCategoriesLegend = ({ chartData, xAxisKey, colorsPalette }) => {
  if (!chartData || chartData.length === 0 || !xAxisKey) return null;

  const uniqueXValues = Array.from(new Set(chartData.map(item => String(item[xAxisKey]))));

  if (uniqueXValues.length === 0) return null;

  // Dynamically adjust font size and spacing based on item count
  const itemCount = uniqueXValues.length;
  const fontSize = itemCount > 30 ? '9px' : itemCount > 20 ? '10px' : '11px';
  const marginBottom = itemCount > 30 ? '3px' : itemCount > 20 ? '4px' : '5px';
  const lineHeight = itemCount > 30 ? '1.1' : '1.2';

  return (
    <div style={{ 
      padding: '10px',
      position: 'absolute',
      right: '0',
      top: '0',
      width: '200px',
      height: '100%', // Match chart height
      boxSizing: 'border-box',
    }}>
      <ul style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        lineHeight: lineHeight,
      }}>
        {uniqueXValues.map((value, index) => (
          <li
            key={`x-cat-item-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: marginBottom,
              fontSize: fontSize,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: colorsPalette[index % colorsPalette.length],
              marginRight: '6px',
              borderRadius: '2px',
              border: `1px solid ${colorsPalette[index % colorsPalette.length]}`,
              flexShrink: 0,
            }} />
            <span style={{
              color: colorsPalette[index % colorsPalette.length],
              fontWeight: 500,
              maxWidth: '170px', // Prevent text from overflowing container
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {safeCapitalize(value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const LineChartComponent = ({ data, xKey, yKey, yOptions }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "450px", color: "#7f8c8d", fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>📊</div>
        <div style={{ fontWeight: "600" }}>No data available</div>
        <div style={{ fontSize: "14px", marginTop: "8px", opacity: 0.7 }}>Please provide data to generate the chart.</div>
      </div>
    );
  }

  if ((!xKey && xKey !== "all") || (!yKey && yKey !== "all")) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "450px", color: "#e74c3c", fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>⚠️</div>
        <div style={{ fontWeight: "600" }}>Configuration Required</div>
        <div style={{ fontSize: "14px", marginTop: "8px", opacity: 0.8 }}>Please select X and Y axes to display the chart.</div>
      </div>
    );
  }

  const xAxisKey = xKey === "all" ? (data[0] && Object.keys(data[0]).find((key) => !(yOptions || []).includes(key))) || "index" : xKey;
  let chartData = xKey === "all" ? data.map((item, index) => ({ ...item, index: `Item ${index + 1}` })) : [...data];
  const metricsToDisplay = yKey === "all" ? (yOptions || []) : [yKey].filter(Boolean);

  const yAxisLabelValue = yKey === "all" ? "Values" : safeCapitalize(yKey);
  const yAxisUnit = "(in Million AED)";
  const chartTitle = yKey === "all" ? `Trend of Selected Metrics over ${safeCapitalize(xAxisKey)}` : `${safeCapitalize(yKey)} Trend over ${safeCapitalize(xAxisKey)}`;

  return (
    <div style={{
      width: "100%",
      fontFamily: "'Inter', sans-serif",
      padding: "10px 0",
      position: 'relative'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '1050px', 
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', margin: 0 }}>
            {chartTitle}
          </h3>
        </div>

        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={480}>
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 220, // Increased right margin for legend space
                left: 35,
                bottom: 80,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeWidth={0.7} />
              <XAxis 
                dataKey={xAxisKey} 
                interval="preserveStartEnd" 
                angle={-40} 
                textAnchor="end" 
                dy={10} 
                height={85} 
                tick={{ fontSize: 11, fill: "#000", fontWeight: 700 }} 
                tickFormatter={() => ''} 
                axisLine={{ stroke: "#cccccc", strokeWidth: 1 }} 
                tickLine={{ stroke: "#cccccc", strokeWidth: 0.8 }}
              >
                <Label 
                  value={safeCapitalize(xAxisKey)} 
                  position="insideBottom" 
                  offset={-5} 
                  style={{ textAnchor: "middle", fontSize: 14, fill: "#2c3e50", fontWeight: "600" }} 
                />
              </XAxis>
              <YAxis 
                tickFormatter={yAxisTickFormatter} 
                tick={{ fontSize: 11, fill: "#000", fontWeight: 700 }} 
                axisLine={{ stroke: "#cccccc", strokeWidth: 1 }} 
                tickLine={{ stroke: "#cccccc", strokeWidth: 0.8 }} 
                width={85}
              >
                <Label 
                  value={`${yAxisLabelValue} ${yAxisUnit}`} 
                  angle={-90} 
                  position="insideLeft" 
                  offset={-20} 
                  style={{ textAnchor: "middle", fontSize: 14, fill: "#2c3e50", fontWeight: "600" }} 
                />
              </YAxis>
              <Tooltip content={<CustomTooltip xAxisKey={xAxisKey} />} cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }} />
              {metricsToDisplay.map((metric, index) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  name={safeCapitalize(metric)}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={3.5}
                  dot={false}
                  activeDot={{ r: 7, stroke: COLORS[index % COLORS.length], strokeWidth: 2.5, fill: "#ffffff", style: { filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.2))" } }}
                  style={{ transition: "opacity 0.25s ease-in-out, stroke-width 0.25s ease-in-out" }}
                  animationDuration={1000}
                  animationBegin={index * 100}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          
          <XAxisCategoriesLegend
            chartData={chartData}
            xAxisKey={xAxisKey}
            colorsPalette={COLORS}
          />
        </div>
      </div>
    </div>
  );
};

export default LineChartComponent;