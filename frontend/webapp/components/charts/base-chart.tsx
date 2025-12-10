import React from 'react';
import type { ChartProps } from '@/lib/types';
import { buildClassName } from '@/lib/design-system';

const BaseChart: React.FC<ChartProps> = ({
  config,
  height = 300,
  responsive = true,
  onDataPointClick,
  className = '',
}) => {
  const { type, title, data, xAxis, yAxis, color = '#3b82f6' } = config;

  // Calculate dimensions
  const containerClasses = buildClassName(
    'chart-container relative',
    responsive ? 'w-full' : '',
    className
  );

  // Mock chart implementation - in production, you'd use a library like Chart.js, D3, or Recharts
  // For now, we'll create simple SVG-based visualizations

  const renderLineChart = () => {
    if (!data || data.length === 0) return null;

    const width = 800;
    const chartHeight = height - 80; // Account for title and labels
    const padding = 60;

    // Calculate scales
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    
    const xScale = (width - 2 * padding) / (data.length - 1);
    const yScale = (chartHeight - 2 * padding) / (maxValue - minValue);

    // Generate path for line
    const pathData = data.map((point, index) => {
      const x = padding + index * xScale;
      const y = chartHeight - padding - ((point.value - minValue) * yScale);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={width - 2 * padding} height={chartHeight - 2 * padding} x={padding} y={padding} fill="url(#grid)" />
        
        {/* Axes */}
        <line x1={padding} y1={chartHeight - padding} x2={width - padding} y2={chartHeight - padding} stroke="#9ca3af" strokeWidth="2"/>
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#9ca3af" strokeWidth="2"/>
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding));
          const value = minValue + (maxValue - minValue) * ratio;
          return (
            <g key={ratio}>
              <line x1={padding - 5} y1={y} x2={padding + 5} y2={y} stroke="#6b7280" strokeWidth="1"/>
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
                {Math.round(value)}
              </text>
            </g>
          );
        })}

        {/* Line path */}
        <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = padding + index * xScale;
          const y = chartHeight - padding - ((point.value - minValue) * yScale);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:r-6 transition-all duration-200"
              onClick={() => onDataPointClick?.(point)}
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((point, index) => {
          const x = padding + index * xScale;
          return (
            <text
              key={index}
              x={x}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              {point.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </text>
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
    if (!data || data.length === 0) return null;

    const width = 800;
    const chartHeight = height - 80;
    const padding = 60;
    const barWidth = (width - 2 * padding) / data.length * 0.8;
    const barSpacing = (width - 2 * padding) / data.length;

    const maxValue = Math.max(...data.map(d => d.value));
    const yScale = (chartHeight - 2 * padding) / maxValue;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Axes */}
        <line x1={padding} y1={chartHeight - padding} x2={width - padding} y2={chartHeight - padding} stroke="#9ca3af" strokeWidth="2"/>
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#9ca3af" strokeWidth="2"/>
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding));
          const value = maxValue * ratio;
          return (
            <g key={ratio}>
              <line x1={padding - 5} y1={y} x2={padding + 5} y2={y} stroke="#6b7280" strokeWidth="1"/>
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
                {Math.round(value)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((point, index) => {
          const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
          const barHeight = point.value * yScale;
          const y = chartHeight - padding - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={() => onDataPointClick?.(point)}
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {point.label || point.date.toLocaleDateString('en-US', { month: 'short' })}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderTimelineChart = () => {
    if (!data || data.length === 0) return null;

    const width = 800;
    const timelineHeight = 120;
    const padding = 60;

    // Sort data by date
    const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const startDate = sortedData[0].date.getTime();
    const endDate = sortedData[sortedData.length - 1].date.getTime();
    const timeRange = endDate - startDate;

    return (
      <svg width="100%" height={timelineHeight + 80} viewBox={`0 0 ${width} ${timelineHeight + 80}`}>
        {/* Timeline line */}
        <line 
          x1={padding} 
          y1={timelineHeight / 2} 
          x2={width - padding} 
          y2={timelineHeight / 2} 
          stroke="#9ca3af" 
          strokeWidth="2"
        />
        
        {/* Timeline events */}
        {sortedData.map((point, index) => {
          const x = padding + ((point.date.getTime() - startDate) / timeRange) * (width - 2 * padding);
          const isEven = index % 2 === 0;
          const circleY = timelineHeight / 2;
          const labelY = isEven ? circleY - 30 : circleY + 30;
          const lineY = isEven ? circleY - 15 : circleY + 15;
          
          return (
            <g key={index}>
              {/* Event circle */}
              <circle
                cx={x}
                cy={circleY}
                r="8"
                fill={color}
                stroke="white"
                strokeWidth="3"
                className="cursor-pointer hover:r-10 transition-all duration-200"
                onClick={() => onDataPointClick?.(point)}
              />
              
              {/* Connecting line */}
              <line x1={x} y1={circleY} x2={x} y2={lineY} stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,3"/>
              
              {/* Event label */}
              <text
                x={x}
                y={labelY}
                textAnchor="middle"
                fontSize="12"
                fill="#374151"
                className="font-medium"
              >
                {point.label || `Event ${index + 1}`}
              </text>
              
              {/* Date label */}
              <text
                x={x}
                y={labelY + (isEven ? 15 : -15)}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'timeline':
        return renderTimelineChart();
      case 'pie':
        // Pie chart would be implemented here
        return (
          <div className="flex items-center justify-center h-full text-neutral-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm">Pie Chart Coming Soon</p>
            </div>
          </div>
        );
      default:
        return renderLineChart();
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className={containerClasses} style={{ height }}>
        {title && (
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 text-center">
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center h-full text-neutral-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {title && (
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 text-center">
          {title}
        </h3>
      )}
      {xAxis && (
        <p className="text-sm text-neutral-600 text-center mb-2">
          {xAxis} {yAxis && `vs ${yAxis}`}
        </p>
      )}
      <div className="overflow-x-auto">
        {renderChart()}
      </div>
    </div>
  );
};

export default BaseChart;