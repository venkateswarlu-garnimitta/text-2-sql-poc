import React, { useState, useMemo, useRef, useEffect } from 'react';

const COLORS = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
  "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
  "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"
].filter((value, index, self) => self.indexOf(value) === index);

const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const truncateLabel = (str, numChars = 3, ellipsis = "..") => {
  if (str == null || typeof str !== 'string') return '';
  if (numChars <= ellipsis.length && str.length > numChars) {
    return str.substring(0, Math.max(0, numChars - ellipsis.length)) + ellipsis;
  }
  if (str.length > numChars) {
    return str.substring(0, numChars - ellipsis.length) + ellipsis;
  }
  return str;
};

const formatYAxisValue = (value) => {
  if (typeof value !== 'number') return value;
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 && Math.abs(value) < 10000 ? 0 : 1)}k`;
  }
  return value.toLocaleString();
};

const HeatMap = ({ data = [], xKey = 'year', yKey = 'gdp' }) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const rootRef = useRef(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [titleAreaHeight, setTitleAreaHeight] = useState(50);

  const MIN_CELL_WIDTH = 30;
  const MAX_CELL_WIDTH = 150;
  const CELL_HEIGHT = 35;

  const Y_AXIS_TICK_LABEL_WIDTH = 65;
  const Y_AXIS_TITLE_WIDTH = 55;
  const LEGEND_WIDTH = 160;
  const X_AXIS_SLANTED_LABEL_AREA_HEIGHT = 60;
  const X_AXIS_TITLE_AREA_HEIGHT = 40;

  const CHART_INTERNAL_PADDING_RIGHT = 25;
  const CHART_INTERNAL_PADDING_LEFT_FOR_AXES = Y_AXIS_TICK_LABEL_WIDTH + Y_AXIS_TITLE_WIDTH + 5 + 8;
  const CHART_INTERNAL_PADDING_BOTTOM_FOR_AXES = X_AXIS_SLANTED_LABEL_AREA_HEIGHT + X_AXIS_TITLE_AREA_HEIGHT + 10;
  const CHART_INTERNAL_PADDING_TOP = 5;

  const processedData = useMemo(() => {
    // Validate input props
    if (!xKey || !yKey || !Array.isArray(data) || data.length === 0) {
      return {
        xLabels: [],
        yLabels: [],
        dataMap: {},
        xLabelColors: {},
        currentData: [],
        hasError: true,
        errorMessage: !xKey || !yKey ? "X-key or Y-key is missing." : "No valid data provided.",
        legendItems: [],
      };
    }

    // Filter valid data entries
    const validData = data.filter(item => 
      item && 
      typeof item === 'object' &&
      item[xKey] !== undefined && 
      item[yKey] !== undefined && 
      !isNaN(Number(item[yKey]))
    );

    if (validData.length === 0) {
      return {
        xLabels: [],
        yLabels: [],
        dataMap: {},
        xLabelColors: {},
        currentData: [],
        hasError: true,
        errorMessage: "No valid data entries after filtering.",
        legendItems: [],
      };
    }

    // Extract xLabels and yLabels
    const xLabels = [...new Set(validData.map(item => String(item[xKey])))].sort();
    const yValues = [...new Set(validData.map(item => Number(item[yKey])))].filter(v => !isNaN(v));
    const yLabels = yValues.sort((a, b) => b - a);

    // Build dataMap
    const dataMap = {};
    validData.forEach((item) => {
      const xVal = String(item[xKey]);
      const yVal = Number(item[yKey]);
      if (!dataMap[yVal]) dataMap[yVal] = {};
      dataMap[yVal][xVal] = { value: yVal, originalItem: item };
    });

    // Assign colors
    const xLabelColors = {};
    const uniqueColorKeys = [...new Set(validData.map(item => (item.category ? item.category : String(item[xKey]))))];
    uniqueColorKeys.forEach((key, index) => {
      xLabelColors[key] = COLORS[index % COLORS.length];
    });

    // Build legend items
    const legendItems = [];
    const uniqueCategories = [...new Set(validData.map(item => item.category).filter(Boolean))];
    if (uniqueCategories.length > 0) {
      uniqueCategories.forEach(category => {
        legendItems.push({
          name: category,
          color: xLabelColors[category] || COLORS[legendItems.length % COLORS.length],
        });
      });
    } else {
      xLabels.forEach(label => {
        legendItems.push({
          name: label,
          color: xLabelColors[label] || COLORS[legendItems.length % COLORS.length],
        });
      });
    }

    return {
      xLabels,
      yLabels,
      dataMap,
      xLabelColors,
      currentData: validData,
      hasError: false,
      errorMessage: '',
      legendItems,
    };
  }, [data, xKey, yKey]);

  const { xLabels, yLabels, dataMap, xLabelColors, currentData, hasError, errorMessage, legendItems } = processedData;

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setAvailableWidth(width);

        const titleDiv = entries[0].target.querySelector('.chart-title-area');
        let currentTitleAreaHeight = 50;
        if (titleDiv) {
          currentTitleAreaHeight = titleDiv.offsetHeight;
        }
        setTitleAreaHeight(currentTitleAreaHeight);
        setAvailableHeight(height - currentTitleAreaHeight);
      }
    });
    if (rootRef.current) {
      observer.observe(rootRef.current);
    }
    return () => {
      if (rootRef.current) {
        observer.unobserve(rootRef.current);
      }
      observer.disconnect();
    };
  }, []);

  const chartDimensions = useMemo(() => {
    if (!xLabels.length || !yLabels.length || availableWidth <= 0 || availableHeight <= 0) {
      return {
        naturalChartWidth: 0,
        naturalChartHeight: 0,
        scale: 1,
        cellWidth: MIN_CELL_WIDTH,
        scaledViewportWidth: 0,
        scaledViewportHeight: 0,
        yAxisLabelText: '',
        maxYAxisTitleTextLength: 0,
        heatmapGridWidth: 0,
        heatmapGridHeight: 0,
      };
    }

    const availableGridWidth = availableWidth - CHART_INTERNAL_PADDING_LEFT_FOR_AXES - LEGEND_WIDTH - CHART_INTERNAL_PADDING_RIGHT;
    let cellWidth = MIN_CELL_WIDTH;
    if (xLabels.length > 0) {
      cellWidth = Math.max(MIN_CELL_WIDTH, Math.min(MAX_CELL_WIDTH, availableGridWidth / xLabels.length));
    }

    const heatmapGridWidth = xLabels.length * cellWidth;
    const heatmapGridHeight = yLabels.length * CELL_HEIGHT;

    const naturalChartWidth = CHART_INTERNAL_PADDING_LEFT_FOR_AXES + heatmapGridWidth + LEGEND_WIDTH + CHART_INTERNAL_PADDING_RIGHT;
    const naturalChartHeight = CHART_INTERNAL_PADDING_TOP + heatmapGridHeight + CHART_INTERNAL_PADDING_BOTTOM_FOR_AXES;

    let scale = 1;
    if (naturalChartWidth > availableWidth) {
      scale = Math.min(scale, availableWidth / naturalChartWidth);
    }
    if (naturalChartHeight > availableHeight) {
      scale = Math.min(scale, availableHeight / naturalChartHeight);
    }

    if (scale <= 0.01) scale = 0.01;

    const scaledViewportWidth = naturalChartWidth * scale;
    const scaledViewportHeight = naturalChartHeight * scale;
    const yAxisLabelText = `${capitalize(yKey)} (in Million AED)`;
    const maxYAxisTitleTextLength = heatmapGridHeight;

    return {
      naturalChartWidth,
      naturalChartHeight,
      scale,
      cellWidth,
      scaledViewportWidth,
      scaledViewportHeight,
      yAxisLabelText,
      maxYAxisTitleTextLength,
      heatmapGridWidth,
      heatmapGridHeight,
    };
  }, [xLabels, yLabels, availableWidth, availableHeight, xKey, yKey, legendItems.length]);

  const {
    naturalChartWidth,
    naturalChartHeight,
    scale,
    cellWidth,
    scaledViewportWidth,
    scaledViewportHeight,
    yAxisLabelText,
    maxYAxisTitleTextLength,
    heatmapGridWidth,
    heatmapGridHeight,
  } = chartDimensions;

  if (hasError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: '"Inter", sans-serif', color: '#ef4444', fontWeight: '500' }}>
        Error: {errorMessage}
      </div>
    );
  }
  if (!currentData.length) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: '"Inter", sans-serif', color: '#4b5563' }}>
        No data provided.
      </div>
    );
  }
  if (availableWidth <= 0 || availableHeight <= 0) {
    return (
      <div
        ref={rootRef}
        style={{
          width: '100%',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Inter", sans-serif',
          boxSizing: 'border-box',
        }}
      >
        Initializing chart...
      </div>
    );
  }
  if (!xLabels.length || !yLabels.length) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          fontFamily: '"Inter", sans-serif',
          color: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={{ width: '50px', height: '50px', marginBottom: '10px', opacity: 0.6 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
          />
        </svg>
        Not enough data for X or Y axes to display the heatmap.
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      style={{
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        className="chart-title-area"
        style={{ textAlign: 'center', marginBottom: '20px', width: '100%', flexShrink: 0 }}
      >
        <h2
          style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 5px 0', wordBreak: 'break-word' }}
        >
          {capitalize(yKey)} by {capitalize(xKey)} Heatmap
        </h2>
      </div>

      {scaledViewportWidth > 0 && scaledViewportHeight > 0 ? (
        <div
          style={{
            width: `${scaledViewportWidth}px`,
            height: `${scaledViewportHeight}px`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: `${naturalChartWidth}px`,
              height: `${naturalChartHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {/* Y-Axis Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: Y_AXIS_TITLE_WIDTH,
                marginRight: '5px',
                height: heatmapGridHeight,
                paddingTop: CHART_INTERNAL_PADDING_TOP,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  transform: 'rotate(-90deg)',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#000000',
                  textAlign: 'center',
                  maxWidth: `${maxYAxisTitleTextLength}px`,
                }}
              >
                {yAxisLabelText}
              </div>
            </div>

            {/* Y-Axis Tick Labels */}
            <div
              style={{
                marginRight: '8px',
                width: Y_AXIS_TICK_LABEL_WIDTH,
                display: 'flex',
                flexDirection: 'column',
                paddingTop: CHART_INTERNAL_PADDING_TOP,
                flexShrink: 0,
              }}
            >
              {yLabels.map((label, i) => (
                <div
                  key={`y-label-${i}`}
                  style={{
                    height: CELL_HEIGHT,
                    textAlign: 'right',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: '700',
                    lineHeight: `${CELL_HEIGHT}px`,
                    paddingRight: '8px',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={`${capitalize(yKey)}: ${label.toLocaleString()}`}
                >
                  {formatYAxisValue(label)}
                </div>
              ))}
              {xLabels.length > 0 && (
                <div style={{ height: CHART_INTERNAL_PADDING_BOTTOM_FOR_AXES - CHART_INTERNAL_PADDING_TOP }}></div>
              )}
            </div>

            {/* Heatmap Grid and X-Axis Title */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: heatmapGridWidth,
                paddingTop: CHART_INTERNAL_PADDING_TOP,
                flexShrink: 0,
              }}
            >
              {/* Heatmap Cells */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${xLabels.length}, ${cellWidth}px)`,
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {yLabels.map((yVal, rowIndex) =>
                  xLabels.map((xVal, colIndex) => {
                    const cellData = dataMap[yVal]?.[xVal];
                    let cellColorSourceKey = cellData?.originalItem?.category ? cellData.originalItem.category : xVal;
                    const cellColor = cellData ? (xLabelColors[cellColorSourceKey] || '#f8fafc') : '#f1f5f9';
                    const isHovered = hoveredCell === `${rowIndex}-${colIndex}`;
                    return (
                      <div
                        key={`cell-${rowIndex}-${colIndex}`}
                        title={
                          cellData
                            ? `${capitalize(xKey)}: ${xVal}\n${capitalize(yKey)}: ${cellData.originalItem[yKey].toLocaleString()}${cellData.originalItem.category ? `\nCategory: ${cellData.originalItem.category}` : ''}`
                            : 'No data'
                        }
                        onMouseEnter={() => setHoveredCell(cellData ? `${rowIndex}-${colIndex}` : null)}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          width: cellWidth,
                          height: CELL_HEIGHT,
                          backgroundColor: cellColor,
                          borderRight: colIndex === xLabels.length - 1 ? 'none' : '1px solid #e2e8f0',
                          borderBottom: rowIndex === yLabels.length - 1 ? 'none' : '1px solid #e2e8f0',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: cellData ? (isHovered ? '#000' : '#fff') : '#a0aec0',
                          cursor: cellData ? 'pointer' : 'default',
                          fontWeight: cellData ? '600' : '400',
                          transition: 'all 0.15s ease-in-out',
                          filter: isHovered && cellData ? 'brightness(1.15)' : 'brightness(1)',
                          boxShadow: isHovered && cellData ? `inset 0 0 0 2px ${cellColor}, 0 0 10px rgba(0,0,0,0.3)` : 'none',
                          zIndex: isHovered && cellData ? 10 : 1,
                          position: 'relative',
                          opacity: cellData ? 1 : 0.7,
                        }}
                      >
                        {cellData ? formatYAxisValue(cellData.value) : '-'}
                      </div>
                    );
                  })
                )}
              </div>

              {/* X-Axis Labels and Title */}
              <div
                style={{
                  width: '100%',
                  height: CHART_INTERNAL_PADDING_BOTTOM_FOR_AXES - CHART_INTERNAL_PADDING_TOP - CELL_HEIGHT,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingTop: '5px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    width: '100%',
                    height: X_AXIS_SLANTED_LABEL_AREA_HEIGHT,
                    visibility: 'hidden',
                  }}
                >
                  {xLabels.map((label, index) => (
                    <div key={`x-label-${index}`} style={{ width: cellWidth, textAlign: 'center' }}></div>
                  ))}
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    width: '100%',
                    height: X_AXIS_TITLE_AREA_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 15,
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#000000',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {capitalize(xKey)}
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div
              style={{
                marginLeft: '15px',
                marginRight: CHART_INTERNAL_PADDING_RIGHT - 10,
                width: LEGEND_WIDTH - 15,
                paddingTop: CHART_INTERNAL_PADDING_TOP,
                paddingLeft: '10px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
              }}
            >
              <h4
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#1e293b',
                  paddingBottom: '5px',
                  borderBottom: '1px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                {capitalize(legendItems.length > 0 && currentData[0]?.category ? 'Category' : xKey)}
              </h4>
              <div style={{ overflowY: 'auto', maxHeight: naturalChartHeight - CHART_INTERNAL_PADDING_TOP - 30 }}>
                {legendItems.map((item, index) => (
                  <div
                    key={`legend-${index}`}
                    style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}
                    title={capitalize(item.name)}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        // borderRadius: '2px',
                        marginRight: '6px',
                        // border: '1px solid rgba(0,0,0,0.05)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#475569',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: LEGEND_WIDTH - 40,
                      }}
                    >
                      {truncateLabel(capitalize(item.name), 15, '..')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}
        >
          Chart area too small to render or initializing.
        </div>
      )}
    </div>
  );
};

export default HeatMap;