import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subtitle?: string;
  trend?: number; // 前期比の変化率（%）
  compact?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  compact = false,
}) => {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return 'trending-up';
    if (trend < 0) return 'trending-down';
    return 'remove';
  };

  const getTrendColor = () => {
    if (trend === undefined) return '#6B7280';
    if (trend > 0) return '#059669';
    if (trend < 0) return '#DC2626';
    return '#6B7280';
  };

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={compact ? 20 : 24} color={color} />
        </View>
        {trend !== undefined && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={getTrendIcon()!} 
              size={12} 
              color={getTrendColor()} 
            />
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {Math.abs(trend).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.value, compact && styles.compactValue]}>
        {typeof value === 'number' && value % 1 !== 0 
          ? value.toFixed(1) 
          : value
        }
      </Text>
      
      <Text style={[styles.title, compact && styles.compactTitle]}>
        {title}
      </Text>
      
      {subtitle && (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  },
  compactCard: {
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  compactValue: {
    fontSize: 24,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
}); 