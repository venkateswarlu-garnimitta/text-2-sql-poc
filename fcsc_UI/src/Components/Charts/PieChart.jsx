
import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const COLORS = [
  '#34568B',
  '#FF6F61',
  '#6B5B95',
  '#88B04B',
  '#F7CAC9',
  '#92A8D1',
  '#955251',
  '#B565A7',
  '#009B77',
  '#DD4124',
  '#45B8AC',
  '#EFC050',
];

const PieChartComponent = ({ data, xKey, yKey }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[450px] text-gray-500 font-sans p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-3 opacity-40">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
        </svg>
        <div className="text-sm font-semibold text-gray-700">No Data Available</div>
        <div className="text-xs mt-1.5">Please provide data to display the chart.</div>
      </div>
    );
  }

  if (!xKey || !yKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[450px] text-red-500 font-sans p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-3 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.25 2.25 0 0 0 21 18.75V16.5M11.42 15.17l2.4704-2.47041.7536-1.75361.061-1.061M11.42 15.17l-4.47-4.47m4.47 4.47-1.061-1.061M12.58 3.42A2.25 2.25 0 0 0 10.5 3h-5.25A2.25 2.25 0 0 0 3 5.25v5.25A2.25 2.25 0 0 0 5.25 12.75M12.58 3.42 18.75 9.58m-6.17-6.16A2.25 2.25 0 0 1 12.75 3h5.25A2.25 2.25 0 0 1 21 5.25V10.5A2.25 2.25 0 0 1 18.75 12.75M12.58 3.42 12.75 3h.001Z" />
        </svg>
        <div className="text-sm font-semibold">Configuration Required</div>
        <div className="text-xs mt-1.5">Please select category and value fields.</div>
      </div>
    );
  }

  const processedData = data
    .map((item, index) => ({
      name: String(item[xKey] === undefined || item[xKey] === null || String(item[xKey]).trim() === '' ? `Category ${index + 1}` : item[xKey]),
      value: Number.parseFloat(item[yKey]) || 0,
      originalIndex: index,
    }))
    .filter(item => item.value > 0);

  if (processedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[450px] text-gray-500 font-sans p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-3 opacity-40">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
        <div className="text-sm font-semibold text-gray-700">No Valid Data</div>
        <div className="text-xs mt-1.5">The selected fields result in no displayable data.</div>
      </div>
    );
  }

  const totalValue = processedData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      const percentage = totalValue > 0 ? ((dataItem.value / totalValue) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-md p-2 border border-gray-200 text-xs font-sans min-w-[150px] opacity-100">
          <p className="font-semibold text-slate-700 mb-1 text-xs">
            {capitalize(dataItem.name)}
          </p>
          <div className="text-slate-600 space-y-0.5 text-xs">
            <div className="flex justify-between">
              <span>{capitalize(yKey)}:</span>
              <span className="font-medium text-slate-700" style={{ color: payload[0].fill }}>{dataItem.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Percentage:</span>
              <span className="font-medium text-slate-700" style={{ color: payload[0].fill }}>{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedOuterLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    if (percent < 0.035 && processedData.length > 7) return null;
    if (percent < 0.045 && processedData.length > 5) return null;

    const RADIAN = Math.PI / 180;
    const radiusOffset = processedData.length > 6 ? 28 : 22;
    const radius = outerRadius + radiusOffset;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';

    const displayName = capitalize(name);

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-[9px] sm:text-[10px] font-medium font-sans"
        style={{ pointerEvents: 'none' }}
      >
        {`${displayName} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  const onPieEnterHandle = (_, index) => {
    const dataEntry = processedData[index];
    if (dataEntry) {
      setActiveIndex(dataEntry.originalIndex);
    }
  };

  const onPieLeaveHandle = () => {
    setActiveIndex(null);
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="pr-1">
        <ul className="list-none p-0 m-0">
          {payload.map((legendEntry, index) => {
            const originalDataIndex = processedData.find(p => p.name === legendEntry.value)?.originalIndex;
            const isCurrentlyActive = activeIndex === originalDataIndex;
            const isGenerallyActive = activeIndex === null;

            return (
              <li
                key={`item-${legendEntry.value}-${index}`}
                className={`flex items-center mb-1.5 text-xs cursor-pointer transition-opacity duration-150 ${isCurrentlyActive || isGenerallyActive ? 'opacity-100 text-slate-800' : 'opacity-75 text-slate-600'}`}
                onMouseEnter={() => {
                  if (originalDataIndex !== undefined) setActiveIndex(originalDataIndex);
                }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className="w-3 h-3 rounded-sm mr-2 transition-all duration-150"
                  style={{
                    backgroundColor: legendEntry.color,
                    border: isCurrentlyActive ? `2px solid ${legendEntry.color}` : `1px solid ${legendEntry.color}`,
                    filter: isCurrentlyActive ? `brightness(1.15) drop-shadow(0 0 3px ${legendEntry.color})` : 'brightness(1)',
                  }}
                />
                <span
                  className="font-medium text-xs"
                  style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  {capitalize(legendEntry.value)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="w-full font-sans">
      <ResponsiveContainer width="100%" height={430}>
        <PieChart margin={{ top: 25, right: 25, bottom: 25, left: 25 }}>
          <Pie
            data={processedData}
            cx="55%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedOuterLabel}
            outerRadius="73%"
            innerRadius="45%"
            paddingAngle={0}
            dataKey="value"
            nameKey="name"
            animationDuration={250}
            onMouseEnter={onPieEnterHandle}
            onMouseLeave={onPieLeaveHandle}
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke={"#FFFFFF"}
                strokeWidth={activeIndex === entry.originalIndex ? 3 : 1}
                style={{
                  filter: activeIndex === entry.originalIndex ? "brightness(1.08)" : "brightness(1)",
                  transition: "filter 0.08s ease-out, stroke-width 0.08s ease-out",
                  cursor: 'pointer'
                }}
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltipContent />}
            cursor={{ fill: 'rgba(200,200,200,0.02)' }}
            wrapperStyle={{ zIndex: 1000 }}
            position={{ y: 0 }}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconSize={8}
            iconType="circle"
            wrapperStyle={{
              width: '200px',
              paddingLeft: "15px",
            }}
            content={renderLegend}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;