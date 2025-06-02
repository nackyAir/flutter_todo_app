import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

interface ChartProps {
  data: number[];
  labels?: string[];
  title: string;
  type: 'line' | 'bar';
  color?: string;
  height?: number;
  showValues?: boolean;
}

export const SimpleChart: React.FC<ChartProps> = ({
  data,
  labels,
  title,
  type,
  color = '#3B82F6',
  height = 200,
  showValues = false,
}) => {
  const maxValue = Math.max(...data, 1);
  const chartWidth = 300;
  const chartHeight = height - 60; // タイトルとラベル用のスペース
  const padding = 20;

  const getPointX = (index: number) => {
    return padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
  };

  const getPointY = (value: number) => {
    return chartHeight - padding - ((value / maxValue) * (chartHeight - 2 * padding));
  };

  const renderLineChart = () => {
    const points = data
      .map((value, index) => `${getPointX(index)},${getPointY(value)}`)
      .join(' ');

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* グリッド線 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <Line
            key={index}
            x1={padding}
            y1={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
            x2={chartWidth - padding}
            y2={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}
        
        {/* 軸線 */}
        <Line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#9CA3AF"
          strokeWidth="2"
        />
        
        {/* データライン */}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* データポイント */}
        {data.map((value, index) => (
          <React.Fragment key={index}>
            <Circle
              cx={getPointX(index)}
              cy={getPointY(value)}
              r="4"
              fill={color}
            />
            {showValues && (
              <SvgText
                x={getPointX(index)}
                y={getPointY(value) - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#374151"
              >
                {value}
              </SvgText>
            )}
          </React.Fragment>
        ))}
      </Svg>
    );
  };

  const renderBarChart = () => {
    const barWidth = (chartWidth - 2 * padding) / data.length * 0.8;
    const barSpacing = (chartWidth - 2 * padding) / data.length * 0.2;

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* グリッド線 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <Line
            key={index}
            x1={padding}
            y1={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
            x2={chartWidth - padding}
            y2={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}
        
        {/* 軸線 */}
        <Line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#9CA3AF"
          strokeWidth="2"
        />
        
        {/* バー */}
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * (chartHeight - 2 * padding);
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = chartHeight - padding - barHeight;
          
          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
              />
              {showValues && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#374151"
                >
                  {value}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {type === 'line' ? renderLineChart() : renderBarChart()}
      </View>
      {labels && (
        <View style={styles.labelsContainer}>
          {labels.map((label, index) => (
            <Text key={index} style={styles.label}>
              {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 