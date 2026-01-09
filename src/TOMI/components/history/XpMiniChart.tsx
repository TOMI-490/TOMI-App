import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, GestureResponderEvent } from 'react-native';
import Svg, { Line, Circle, Defs, LinearGradient, Stop, Path, Text as SvgText, G } from 'react-native-svg';
import { historyStyles } from '../../styles/history.styles';

interface XpDataPoint {
  date: string;
  xp: number;
}

interface XpMiniChartProps {
  data: XpDataPoint[];
  width?: number;
  height?: number;
  color?: string;
  maxXp?: number;
  rangeLabel?: string;
  showLabels?: boolean;
}

export const XpMiniChart: React.FC<XpMiniChartProps> = ({
  data,
  width = 280,
  height = 140,
  color = '#4CAF50',
  maxXp,
  rangeLabel,
  showLabels = true,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    data && data.length > 0 ? data.length - 1 : null
  );

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <View style={[historyStyles.chartEmptyContainer, { width, height }]}>
        <Text style={historyStyles.chartEmptyText}>No XP data yet</Text>
      </View>
    );
  }

  // Check if all values are zero
  const allZeros = data.every(point => point.xp === 0);

  // Handle single point case
  const isSinglePoint = data.length === 1;

  // Find min and max XP values for scaling with some padding
  const xpValues = data.map(d => d.xp);
  const dataMaxXp = Math.max(...xpValues, 1);
  const minXp = Math.min(...xpValues, 0);
  const xpRange = dataMaxXp - minXp || 1;
  
  // Add 15% padding to top and bottom for better visual spacing
  const paddingPercent = allZeros ? 0 : 0.15;
  const displayMin = minXp - xpRange * paddingPercent;
  const displayMax = dataMaxXp + xpRange * paddingPercent;
  const displayRange = displayMax - displayMin || 1;

  // Calculate chart dimensions (with padding for labels)
  const padding = { top: 25, right: 20, bottom: 25, left: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate positions for each point
  const points = data.map((point, index) => {
    const x = padding.left + (isSinglePoint ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - ((point.xp - displayMin) / displayRange) * chartHeight;
    return { x, y, xp: point.xp, date: point.date, index };
  });

  // Create smooth curved path using quadratic bezier curves
  const createSmoothPath = () => {
    if (points.length < 2) {
      // Single point - return just a move command
      return `M ${points[0].x},${points[0].y}`;
    }
    
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      
      path += ` Q ${controlX},${current.y} ${controlX},${(current.y + next.y) / 2}`;
      path += ` Q ${controlX},${next.y} ${next.x},${next.y}`;
    }
    
    return path;
  };

  // Create area fill path
  const createFillPath = () => {
    if (points.length < 2) {
      // Single point - no fill
      return '';
    }
    const smoothPath = createSmoothPath();
    const baselineY = padding.top + chartHeight;
    return `${smoothPath} L ${points[points.length - 1].x},${baselineY} L ${points[0].x},${baselineY} Z`;
  };

  // Format date for display (e.g., "Jan 6")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle tap on chart
  const handlePress = (event: GestureResponderEvent) => {
    const { locationX } = event.nativeEvent;
    
    // Find nearest point
    let nearestIndex = 0;
    let minDistance = Math.abs(locationX - points[0].x);
    
    points.forEach((point, index) => {
      const distance = Math.abs(locationX - point.x);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });
    
    setSelectedIndex(nearestIndex);
  };

  const selectedPoint = selectedIndex !== null ? points[selectedIndex] : null;

  return (
    <View style={{ width, height: height + 30 }}>
      {/* Range label */}
      {rangeLabel && showLabels && (
        <Text style={historyStyles.chartRangeLabel}>{rangeLabel}</Text>
      )}
      
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={[historyStyles.chartContainer, { width, height }]}>
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={color} stopOpacity="0.2" />
                <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </LinearGradient>
            </Defs>

            {/* Grid Lines Layer (behind everything) */}
            <G opacity={0.5}>
              {/* Horizontal grid lines - 4 lines evenly spaced */}
              {[0, 0.33, 0.66, 1].map((ratio, index) => {
                const y = padding.top + chartHeight * ratio;
                const isBaseline = ratio === 1;
                const isMidline = ratio === 0.5;
                return (
                  <Line
                    key={`h-grid-${index}`}
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke={isBaseline ? "#E0E0E0" : "#F0F0F0"}
                    strokeWidth="1"
                    strokeDasharray={isBaseline ? "4,4" : "3,3"}
                    opacity={isBaseline ? 1 : isMidline ? 0.8 : 0.6}
                  />
                );
              })}
              
              {/* Vertical grid lines - 3 lines (start, middle, end) */}
              {!isSinglePoint && points.length > 1 && [0, 0.5, 1].map((ratio, index) => {
                const x = padding.left + chartWidth * ratio;
                return (
                  <Line
                    key={`v-grid-${index}`}
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#F5F5F5"
                    strokeWidth="1"
                    strokeDasharray="2,4"
                    opacity={0.4}
                  />
                );
              })}
            </G>

            {/* Area fill with gradient (skip for single point) */}
            {!isSinglePoint && (
              <Path
                d={createFillPath()}
                fill="url(#areaGradient)"
              />
            )}

            {/* Main smooth line (or single point) */}
            {!isSinglePoint && (
              <Path
                d={createSmoothPath()}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data point circles */}
            {points.map((point, index) => {
              const isSelected = index === selectedIndex;
              return (
                <React.Fragment key={index}>
                  {/* Outer glow circle */}
                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r={isSelected ? "8" : "6"}
                    fill={color}
                    fillOpacity={isSelected ? "0.25" : "0.15"}
                  />
                  {/* Main circle */}
                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r={isSelected ? "5" : "4"}
                    fill="#fff"
                    stroke={color}
                    strokeWidth={isSelected ? "3" : "2.5"}
                  />
                </React.Fragment>
              );
            })}

            {/* X-axis labels (first and last date) */}
            {showLabels && points.length > 1 && (
              <>
                <SvgText
                  x={padding.left}
                  y={height - 8}
                  fontSize="10"
                  fill="#999"
                  textAnchor="start"
                >
                  {formatDate(data[0].date)}
                </SvgText>
                <SvgText
                  x={width - padding.right}
                  y={height - 8}
                  fontSize="10"
                  fill="#999"
                  textAnchor="end"
                >
                  {formatDate(data[data.length - 1].date)}
                </SvgText>
              </>
            )}

            {/* Max XP label at top right */}
            {showLabels && maxXp !== undefined && maxXp > 0 && !allZeros && (
              <SvgText
                x={width - padding.right}
                y={padding.top - 8}
                fontSize="10"
                fill="#999"
                textAnchor="end"
              >
                {`Max: ${maxXp}`}
              </SvgText>
            )}

            {/* All zeros message */}
            {allZeros && (
              <SvgText
                x={width / 2}
                y={height / 2}
                fontSize="12"
                fill="#CCC"
                textAnchor="middle"
              >
                No XP changes
              </SvgText>
            )}
          </Svg>

          {/* Tooltip for selected point */}
          {selectedPoint && !allZeros && (
            <View
              style={[
                historyStyles.chartTooltip,
                {
                  left: selectedPoint.x - 40,
                  top: selectedPoint.y - 35,
                }
              ]}
            >
              <Text style={historyStyles.chartTooltipText}>
                {formatDate(selectedPoint.date)} • {selectedPoint.xp} XP
              </Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
