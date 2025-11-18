

// import React, { useState, useMemo } from 'react';
import React, { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
  Label,
} from 'recharts';

const COLORS = [
  '#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51',
  '#E57373', '#81C784', '#64B5F6', '#FFB74D', '#BA68C8',
  '#795548', '#A1887F', '#90A4AE', '#78909C', '#4DB6AC',
  '#AED581', '#DCE775', '#FFF176', '#FFD54F', '#FF8A65'
];

const MAX_LENGTH_X_AXIS_TITLE = 15;
const MAX_LENGTH_LEGEND_ITEMS = 12;

const truncateText = (text, maxLength) => {
  if (text === null || text === undefined) return '';
  const stringText = String(text);
  if (stringText.length > maxLength) {
    if (maxLength <= 3) return stringText.substring(0, maxLength);
    return stringText.substring(0, maxLength - 3) + '...';
  }
  return stringText;
};

const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const CustomTooltip = ({ active, payload, xKey, yKey, xLabelToColorMap }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const xCategoryName = dataPoint[xKey];
    const yValue = dataPoint.__y__;
    const pointColor = xLabelToColorMap[xCategoryName] || payload[0].color;

    return (
      <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-md p-3 border border-gray-300 text-xs font-sans min-w-[200px]">
        <p className="font-semibold text-slate-700 mb-1.5 text-[13px]">
          {capitalize(xKey)}: <span className="font-normal text-slate-600">{xCategoryName}</span>
        </p>
        <p className="font-semibold text-slate-700 text-[13px]">
          {capitalize(yKey)}: <span className="font-normal text-slate-600" style={{ color: pointColor }}>{yValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomDot = ({ cx, cy, fill, payload, hoveredPoint }) => {
  const isHovered = hoveredPoint === payload.__index__;
  const baseRadius = 7;
  return (
    <g style={{ transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.1s ease-out', transform: isHovered ? 'scale(1.15)' : 'scale(1)' }}>
      <circle cx={cx} cy={cy} r={baseRadius + 2.5} fill="none" stroke={fill} strokeWidth={1.5} opacity={0.4} />
      <circle cx={cx} cy={cy} r={baseRadius} fill={fill} stroke={"#ffffff"} strokeWidth={1.5} style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.25))' }} />
      <circle cx={cx} cy={cy} r={baseRadius * 0.35} fill="rgba(255,255,255,0.65)" />
    </g>
  );
};

const yAxisTickFormatter = (value) => {
  if (value === null || value === undefined) return '';
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 && Math.abs(value) < 10000 ? 0 : 1)}k`;
  return value.toString();
};

const ScatterPlot = ({ data, xKey, yKey }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Handle the case where yKey is "all" by selecting a default numeric column
  const effectiveYKey = yKey === "all" && Array.isArray(data) && data.length > 0
    ? Object.keys(data[0]).find(key => {
        const values = data.map(row => row[key]);
        return values.every(val => !isNaN(Number.parseFloat(val)) && isFinite(val));
      }) || yKey
    : yKey;

  const { plotData, uniqueXValues, xValueToColorMap, legendPayload } = useMemo(() => {
    if (!xKey || !effectiveYKey || xKey === effectiveYKey || !Array.isArray(data) || data.length === 0) {
      return { plotData: [], uniqueXValues: [], xValueToColorMap: {}, legendPayload: [] };
    }

    const uniqueXVals = [...new Set(data.map(item => item && typeof item === 'object' ? item[xKey] : undefined))]
      .filter(val => val !== null && val !== undefined)
      .sort((a, b) => String(a).localeCompare(String(b)));
    const xValMap = Object.fromEntries(uniqueXVals.map((label, index) => [label, index]));
    const xColorMap = {};
    uniqueXVals.forEach((val, index) => { xColorMap[val] = COLORS[index % COLORS.length]; });

    const pData = data
      .map((d, index) => {
        if (!d || typeof d !== 'object') return null;
        const yValRaw = d[effectiveYKey];
        const yVal = (yValRaw === null || yValRaw === undefined || String(yValRaw).trim() === '') ? NaN : parseFloat(String(yValRaw));
        const xCategoryValue = d[xKey];
        if (xCategoryValue === null || xCategoryValue === undefined) return null;
        const xNum = xValMap[xCategoryValue];
        return !isNaN(yVal) && xNum !== undefined
          ? { ...d, __x__: xNum, __y__: yVal, __color__: xColorMap[xCategoryValue], __index__: index, [xKey]: xCategoryValue }
          : null;
      })
      .filter(Boolean);

    const lPayload = uniqueXVals.map(name => ({
      value: truncateText(capitalize(String(name)), MAX_LENGTH_LEGEND_ITEMS),
      type: 'circle', id: name, color: xColorMap[name]
    }));
    return { plotData: pData, uniqueXValues: uniqueXVals, xValueToColorMap: xColorMap, legendPayload: lPayload };
  }, [data, xKey, effectiveYKey]);

  // Early returns moved AFTER hooks
  if (!xKey || !effectiveYKey || xKey === effectiveYKey) {
    return <div className="text-center p-4 text-red-500 font-semibold">Error: X-axis key and Y-axis key must be provided and distinct.</div>;
  }
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-center p-4 text-gray-500">No data provided to render the chart.</div>;
  }
  if (plotData.length === 0) {
    return <div className="text-center p-4 text-gray-500">No valid data points to plot. Please check your Y-axis column for numeric values.</div>;
  }
  const numUniqueYValues = new Set(plotData.map(p => p.__y__)).size;
  if (uniqueXValues.length < 1 || numUniqueYValues < 1) {
    if (uniqueXValues.length === 0 || numUniqueYValues === 0) {
      return <div className="text-center p-4 text-gray-500">Not enough distinct data points for X and Y axes to render a meaningful scatter plot.</div>;
    }
  }

  const yAxisLabelValue = `${capitalize(effectiveYKey)} (in Million AED)`;
  const xAxisTitleFull = capitalize(xKey);
  const xAxisLabelValue = truncateText(xAxisTitleFull, MAX_LENGTH_X_AXIS_TITLE);
  const chartTitle = `${truncateText(capitalize(effectiveYKey), 15)} vs ${truncateText(capitalize(xKey), 15)}`;

  const yAxisLabelWidth = 100;
  const yAxisTicksWidth = 60;
  const labelTicksGap = 10;
  const edgePadding = 10;
  const chartMarginLeft = yAxisLabelWidth + labelTicksGap + yAxisTicksWidth + edgePadding;

  return (
    <div className="w-full font-sans" style={{ minWidth: '800px' }}>
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 m-0">{chartTitle}</h3>
        <p className="text-sm text-slate-600 mt-1.5">Scatter plot visualization</p>
      </div>
      <div>
        <ResponsiveContainer width="100%" height={520}>
          <ScatterChart
            margin={{ 
              top: 20, 
              right: 80, 
              bottom: 70, 
              left: chartMarginLeft - 20
            }}
            onMouseMove={(e) => {
              if (e && e.activePayload && e.activePayload.length > 0) {
                setHoveredPoint(e.activePayload[0].payload.__index__);
              } else { setHoveredPoint(null); }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <CartesianGrid stroke="#f1f5f9" strokeWidth={0.7} strokeDasharray="4 4" />
            <XAxis
              type="number"
              dataKey="__x__"
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1.2 }}
              tickLine={{ stroke: '#cbd5e1', strokeWidth: 0.8 }}
              tickFormatter={() => ''}
              tick={{ fill: '#000', fontSize: 1 }}
              domain={[0, uniqueXValues.length > 0 ? uniqueXValues.length - 1 : 0]}
              interval={uniqueXValues.length > 10 ? Math.floor(uniqueXValues.length / 10) : 0}
              height={60}
            >
              <Label
                value={xAxisLabelValue}
                position='outsideBottom'
                offset={45}
                style={{ textAnchor: 'middle', fill: '#000', fontSize: '14px', fontWeight: '600' }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="__y__"
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1.2 }}
              tickLine={{ stroke: '#cbd5e1', strokeWidth: 0.8 }}
              tick={{ fill: '#000', fontSize: 11, fontWeight: '500', dx: 0 }}
              tickFormatter={yAxisTickFormatter}
              width={yAxisTicksWidth}
            >
              <Label
                value={yAxisLabelValue}
                angle={-90}
                position="left"
                offset={30}
                style={{
                  textAnchor: 'middle',
                  fill: '#000',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              />
            </YAxis>
            <Tooltip content={<CustomTooltip xKey={xKey} yKey={effectiveYKey} xLabelToColorMap={xValueToColorMap} />} 
              cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }} 
              wrapperStyle={{ zIndex: 1000 }} 
            />
            <Legend
              layout="vertical"
              verticalAlign="top"
              align="right"
              iconSize={10}
              iconType="circle"
              wrapperStyle={{
                paddingLeft: '15px',
                fontSize: '12px',
                color: '#334155',
                top: 20,
                right: 0,
              }}
              payload={legendPayload}
            />
            <Scatter data={plotData} shape={<CustomDot hoveredPoint={hoveredPoint} />}>
              {plotData.map((entry) => (<Cell key={`cell-${entry.__index__}`} fill={entry.__color__} />))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScatterPlot;