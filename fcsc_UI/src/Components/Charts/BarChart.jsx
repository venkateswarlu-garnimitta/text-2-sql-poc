import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Label,
} from "recharts";

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');

const COLORS = [
  "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7",
  "#dda0dd", "#98d8c8", "#f7dc6f", "#bb8fce", "#85c1e9",
  "#ff9ff3", "#54a0ff", "#7bed9f", "#ffa502", "#ff3838",
  "#70a1ff", "#5f27cd", "#00d2d3", "#ff9f43", "#ee5a52"
];

const GRADIENTS = [
  { id: "gradient0", start: "#ff6b6b", end: "#ee5a52", mid: "#ff8a80" },
  { id: "gradient1", start: "#4ecdc4", end: "#26a69a", mid: "#80cbc4" },
  { id: "gradient2", start: "#45b7d1", end: "#1976d2", mid: "#64b5f6" },
  { id: "gradient3", start: "#96ceb4", end: "#4caf50", mid: "#a5d6a7" },
  { id: "gradient4", start: "#ffeaa7", end: "#ffb300", mid: "#ffcc02" },
  { id: "gradient5", start: "#dda0dd", mid: "#ba68c8", end: "#8e24aa" },
  { id: "gradient6", start: "#98d8c8", end: "#00695c", mid: "#4db6ac" },
  { id: "gradient7", start: "#f7dc6f", end: "#f57f17", mid: "#fff176" },
  { id: "gradient8", start: "#bb8fce", end: "#7b1fa2", mid: "#ce93d8" },
  { id: "gradient9", start: "#85c1e9", end: "#0d47a1", mid: "#90caf9" },
  { id: "gradient10", start: "#ff9ff3", end: "#e91e63", mid: "#f48fb1" },
  { id: "gradient11", start: "#54a0ff", end: "#2196f3", mid: "#90caf9" },
  { id: "gradient12", start: "#7bed9f", end: "#4caf50", mid: "#a5d6a7" },
  { id: "gradient13", start: "#ffa502", end: "#ff9800", mid: "#ffcc02" },
  { id: "gradient14", start: "#ff3838", end: "#f44336", mid: "#ef5350" },
  { id: "gradient15", start: "#70a1ff", end: "#3f51b5", mid: "#7986cb" },
  { id: "gradient16", start: "#5f27cd", end: "#673ab7", mid: "#9575cd" },
  { id: "gradient17", start: "#00d2d3", end: "#009688", mid: "#4db6ac" },
  { id: "gradient18", start: "#ff9f43", end: "#ff5722", mid: "#ff8a65" },
  { id: "gradient19", start: "#ee5a52", end: "#d32f2f", mid: "#ef5350" },
];

const formatNumber = (value) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return value.toString();
};

const formatYAxisTick = (value) => {
  return formatNumber(value);
};

const CustomTooltip = ({ active, payload, label, xAxisKey, yKey }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 20px',
        color: '#1a202c',
        fontSize: '14px',
        fontWeight: '500',
        minWidth: '180px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '700', 
          marginBottom: '10px',
          color: '#2d3748',
        }}>
          {capitalize(xAxisKey === "index" ? "Item" : xAxisKey || 'Category')}: {label}
        </div>
        {payload.map((entry, index) => (
          <div key={`tooltip-entry-${index}`} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginTop: '6px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: entry.color || '#ccc',
                marginRight: '8px',
              }}></div>
              <span style={{ color: '#4a5568', fontWeight: '600' }}>
                {capitalize(entry.name || entry.dataKey)}
              </span>
            </div>
            <span style={{ 
              fontWeight: '700',
              color: '#2d3748',
              marginLeft: '12px',
            }}>
              {typeof entry.value === 'number' ? `${formatNumber(entry.value)}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ColorLegend = ({ data, xKey, yKey, yOptions, usingFlatColors = true }) => {
  const isMultiMetric = yKey === "all" && yOptions && yOptions.length > 0;
  
  if (isMultiMetric) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '40px',
        transform: 'translateY(-50%)',
        zIndex: 10,
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#2d3748',
        }}>
          Metrics
        </div>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}>
          {yOptions.map((metric, index) => (
            <li key={metric} style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                background: usingFlatColors 
                            ? COLORS[index % COLORS.length] 
                            : `linear-gradient(135deg, ${GRADIENTS[index % GRADIENTS.length].start} 0%, ${GRADIENTS[index % GRADIENTS.length].end} 100%)`,
                marginRight: '10px',
              }}></div>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#4a5568',
              }}>
                {capitalize(metric)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      right: '40px',
      transform: 'translateY(-50%)',
      zIndex: 10,
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#2d3748',
      }}>
        Categories
      </div>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}>
        {data.slice(0, 10).map((item, index) => (
          <li key={`legend-item-${index}`} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              background: `linear-gradient(135deg, ${GRADIENTS[index % GRADIENTS.length].start} 0%, ${GRADIENTS[index % GRADIENTS.length].end} 100%)`,
              marginRight: '10px',
            }}></div>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#4a5568',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '170px', // Adjusted to fit without container
            }}>
              {xKey && item[xKey] ? capitalize(item[xKey]) : (item[Object.keys(item)[0]] ? capitalize(item[Object.keys(item)[0]]) : `Item ${index + 1}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const BarChartComponent = ({ data, xKey: initialXKey, yKey, yOptions }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#4a5568', fontSize: '18px', fontWeight: '600', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        No data available to display.
      </div>
    );
  }
  
  if (yKey === "all" && (!yOptions || !Array.isArray(yOptions) || yOptions.length === 0)) {
    console.warn("BarChartComponent: 'yKey' is 'all' but 'yOptions' is not a valid array with multiple metric keys.");
  } else if ((!initialXKey && initialXKey !== "all") || (!yKey && yKey !== "all")) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#4a5568', fontSize: '18px', fontWeight: '600', textAlign: 'center'}}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
        Please select both X and Y axes to display the chart.
      </div>
    );
  }

  let xAxisDataKey = initialXKey;
  let chartData = [...data];

  if (initialXKey === "all") {
    chartData = data.map((item, idx) => ({
      ...item,
      index: `Item ${idx + 1}`, 
    }));
    xAxisDataKey = "index"; 
  }

  const xAxisConfig = {
    height: 40, 
    labelOffset: -10, 
  };

  const useFlatColorsForMultiMetric = true;

  if (yKey === "all") {
    const metricsToDisplay = (Array.isArray(yOptions) ? yOptions : []).filter(opt => typeof opt === 'string' && opt.trim() !== '');

    return (
      <div style={{
        width: '100%',
        height: '550px', 
        position: 'relative',
        padding: '20px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          paddingTop: '20px',
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#2d3748',
            marginBottom: '8px',
          }}>
            Multi-Metric Analysis
          </div>
        </div>
        
        <ColorLegend 
            data={chartData} 
            xKey={xAxisDataKey}
            yKey={yKey} 
            yOptions={metricsToDisplay} 
            usingFlatColors={useFlatColorsForMultiMetric} 
        /> 
        
        <BarChart 
          data={chartData} 
          width={800}
          height={468}
          margin={{ top: 20, right: 240, left: 60, bottom: xAxisConfig.height }}
          barGap={1}
          barCategoryGap="10%" 
        >
          <defs>
            {GRADIENTS.map((gradient) => (
              <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradient.start} stopOpacity={1}/>
                <stop offset="50%" stopColor={gradient.mid || gradient.start} stopOpacity={0.9}/>
                <stop offset="100%" stopColor={gradient.end} stopOpacity={0.8}/>
              </linearGradient>
            ))}
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e2e8f0"
            strokeWidth={1}
            horizontal={true}
            vertical={false}
          />
          
          <XAxis
            dataKey={xAxisDataKey}
            height={xAxisConfig.height}
            axisLine={{ stroke: '#cbd5e0', strokeWidth: 2 }}
            tickLine={false} 
            tick={false}     
          >
            <Label
              value={capitalize(xAxisDataKey === "index" ? "Item" : xAxisDataKey)} 
              position="insideBottom"
              offset={xAxisConfig.labelOffset}
              style={{ 
                textAnchor: "middle", 
                fontSize: 16, 
                fill: "#2d3748",
                fontWeight: '700',
              }}
            />
          </XAxis>
          
          <YAxis
            tickFormatter={formatYAxisTick}
            tick={{
              fill: '#2d3748', 
              fontSize: 12,   
              fontWeight: '500',
            }}
            axisLine={{ stroke: '#cbd5e0', strokeWidth: 2 }}
            tickLine={{ stroke: '#cbd5e0', strokeWidth: 1 }}
            width={60} 
          >
            <Label
              value="Values (in Million AED)"
              angle={-90}
              position="insideLeft"
              offset={-20}
              style={{ 
                textAnchor: "middle", 
                fontSize: 16, 
                fill: "#2d3748",
                fontWeight: '700',
              }}
            />
          </YAxis>
          
          <Tooltip
            content={<CustomTooltip xAxisKey={xAxisDataKey} yKey={yKey} />}
            cursor={{
              fill: 'rgba(102, 126, 234, 0.1)',
            }}
          />
          
          {metricsToDisplay.length > 0 ? metricsToDisplay.map((metric, idx) => (
            <Bar
              key={metric}
              dataKey={metric}
              name={capitalize(metric)}
              fill={useFlatColorsForMultiMetric ? COLORS[idx % COLORS.length] : `url(#gradient${idx % GRADIENTS.length})`}
              radius={[4, 4, 0, 0]}
              barSize={35} 
            />
          )) : null}
        </BarChart>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '550px', 
      position: 'relative',
      padding: '20px',
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        paddingTop: '20px',
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#2d3748',
          marginBottom: '8px',
        }}>
          {capitalize(yKey)} Distribution
        </div>
      </div>
      
      <ColorLegend data={chartData} xKey={xAxisDataKey} yKey={yKey} /> 
      
      <BarChart 
        data={chartData} 
        width={800}
        height={468}
        margin={{ top: 20, right: 200, left: 60, bottom: xAxisConfig.height }} 
        barCategoryGap="15%" 
      >
        <defs>
          {GRADIENTS.map((gradient) => (
            <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradient.start} stopOpacity={1}/>
              <stop offset="50%" stopColor={gradient.mid || gradient.start} stopOpacity={0.9}/>
              <stop offset="100%" stopColor={gradient.end} stopOpacity={0.8}/>
              </linearGradient>
          ))}
        </defs>
        
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#e2e8f0"
          strokeWidth={1}
          horizontal={true}
          vertical={false}
        />
        
        <XAxis
          dataKey={xAxisDataKey}
          height={xAxisConfig.height}
          axisLine={{ stroke: '#cbd5e0', strokeWidth: 2 }}
          tickLine={false} 
          tick={false}     
        >
          <Label
            value={capitalize(xAxisDataKey === "index" ? "Item" : xAxisDataKey)} 
            position="insideBottom"
            offset={xAxisConfig.labelOffset}
            style={{ 
              textAnchor: "middle", 
              fontSize: 14, 
              fill: "#2d3748",
              fontWeight: '700',
            }}
          />
        </XAxis>
        
        <YAxis
          tickFormatter={formatYAxisTick}
          tick={{
            fill: '#2d3748', 
            fontSize: 12,   
            fontWeight: '500',
          }}
          axisLine={{ stroke: '#cbd5e0', strokeWidth: 2 }}
          tickLine={{ stroke: '#cbd5e0', strokeWidth: 1 }}
          width={60}
        >
          <Label
            value={`${capitalize(yKey)} (in Million AED)`}
            angle={-90}
            position="insideLeft"
            offset={-20} 
            style={{ 
              textAnchor: "middle", 
              fontSize: 16, 
              fill: "#2d3748",
              fontWeight: '700',
            }}
          />
        </YAxis>
        
        <Tooltip
          content={<CustomTooltip xAxisKey={xAxisDataKey} yKey={yKey} />}
          cursor={{
            fill: 'rgba(102, 126, 234, 0.1)',
          }}
        />
        
        <Bar 
          dataKey={yKey} 
          name={capitalize(yKey)} 
          radius={[6, 6, 0, 0]} 
          barSize={35} 
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#gradient${index % GRADIENTS.length})`}
            />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
};

export default BarChartComponent;