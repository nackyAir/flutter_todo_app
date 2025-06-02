import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { SimpleChart } from '@/components/SimpleChart';
import { StatsCard } from '@/components/StatsCard';
import { useDashboard } from '@/contexts/DashboardContext';

type Period = 'week' | 'month';

export default function DashboardScreen() {
  const { stats, loading, refreshStats } = useDashboard();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 視覚的なフィードバック
    refreshStats();
    setRefreshing(false);
  };

  const getProductivityMessage = (score: number) => {
    if (score >= 80) return '素晴らしい生産性です！';
    if (score >= 60) return '良いペースを保っています';
    if (score >= 40) return 'もう少し頑張りましょう';
    return '新しいスタートを切りましょう！';
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#3B82F6';
    if (score >= 40) return '#D97706';
    return '#DC2626';
  };

  const getPeriodData = () => {
    if (selectedPeriod === 'week') {
      return {
        data: stats.weeklyTrend,
        labels: ['月', '火', '水', '木', '金', '土', '日'],
        title: '週間完了トレンド',
        completed: stats.weekCompleted,
        created: stats.weekCreated,
      };
    } else {
      // 月間データは週ごとに集約
      const weeklyData = [];
      const weekLabels = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = i * 7;
        const weekEnd = Math.min((i + 1) * 7, stats.monthlyTrend.length);
        const weekSum = stats.monthlyTrend
          .slice(weekStart, weekEnd)
          .reduce((sum, value) => sum + value, 0);
        weeklyData.push(weekSum);
        weekLabels.push(`第${i + 1}週`);
      }
      return {
        data: weeklyData,
        labels: weekLabels,
        title: '月間完了トレンド（週別）',
        completed: stats.monthCompleted,
        created: stats.monthCreated,
      };
    }
  };

  const periodData = getPeriodData();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ダッシュボード</Text>
          <Text style={styles.headerSubtitle}>あなたの生産性を可視化</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color="#3B82F6" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 生産性スコア */}
        <View style={styles.section}>
          <View style={styles.productivityCard}>
            <View style={styles.productivityHeader}>
              <Ionicons name="trophy" size={32} color={getProductivityColor(stats.productivityScore)} />
              <View style={styles.productivityInfo}>
                <Text style={styles.productivityTitle}>生産性スコア</Text>
                <Text style={styles.productivityMessage}>
                  {getProductivityMessage(stats.productivityScore)}
                </Text>
              </View>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={[
                styles.scoreValue, 
                { color: getProductivityColor(stats.productivityScore) }
              ]}>
                {stats.productivityScore}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${stats.productivityScore}%`,
                    backgroundColor: getProductivityColor(stats.productivityScore)
                  }
                ]}
              />
            </View>
          </View>
        </View>

        {/* 基本統計 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本統計</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatsCard
                title="合計タスク"
                value={stats.totalTasks}
                icon="list"
                color="#3B82F6"
                compact
              />
              <StatsCard
                title="完了率"
                value={`${stats.completionRate.toFixed(1)}%`}
                icon="checkmark-circle"
                color="#059669"
                compact
              />
            </View>
            <View style={styles.statsRow}>
              <StatsCard
                title="進行中"
                value={stats.pendingTasks}
                icon="time"
                color="#D97706"
                compact
              />
              <StatsCard
                title="期限切れ"
                value={stats.overdueTasks}
                icon="warning"
                color="#DC2626"
                compact
              />
            </View>
          </View>
        </View>

        {/* 期間別統計 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>期間別実績</Text>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 'week' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('week')}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'week' && styles.periodButtonTextActive
                ]}>
                  週間
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 'month' && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod('month')}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'month' && styles.periodButtonTextActive
                ]}>
                  月間
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatsCard
              title="完了"
              value={periodData.completed}
              icon="checkmark-done"
              color="#059669"
              subtitle={`${selectedPeriod === 'week' ? '今週' : '今月'}の完了数`}
              compact
            />
            <StatsCard
              title="作成"
              value={periodData.created}
              icon="add-circle"
              color="#3B82F6"
              subtitle={`${selectedPeriod === 'week' ? '今週' : '今月'}の作成数`}
              compact
            />
          </View>
        </View>

        {/* 完了トレンドチャート */}
        <View style={styles.section}>
          <SimpleChart
            data={periodData.data}
            labels={periodData.labels}
            title={periodData.title}
            type="line"
            color="#3B82F6"
            height={220}
            showValues={true}
          />
        </View>

        {/* 優先度別統計 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>優先度別分布</Text>
          <View style={styles.priorityContainer}>
            <View style={styles.priorityItem}>
              <View style={[styles.priorityBadge, { backgroundColor: '#DC2626' }]}>
                <Ionicons name="flame" size={16} color="white" />
              </View>
              <View style={styles.priorityInfo}>
                <Text style={styles.priorityLabel}>高</Text>
                <Text style={styles.priorityValue}>
                  {stats.priorityDistribution.high.toFixed(1)}%
                </Text>
              </View>
              <Text style={styles.priorityCount}>
                {stats.highPriorityTasks}件
              </Text>
            </View>

            <View style={styles.priorityItem}>
              <View style={[styles.priorityBadge, { backgroundColor: '#D97706' }]}>
                <Ionicons name="time" size={16} color="white" />
              </View>
              <View style={styles.priorityInfo}>
                <Text style={styles.priorityLabel}>中</Text>
                <Text style={styles.priorityValue}>
                  {stats.priorityDistribution.medium.toFixed(1)}%
                </Text>
              </View>
              <Text style={styles.priorityCount}>
                {stats.mediumPriorityTasks}件
              </Text>
            </View>

            <View style={styles.priorityItem}>
              <View style={[styles.priorityBadge, { backgroundColor: '#059669' }]}>
                <Ionicons name="leaf" size={16} color="white" />
              </View>
              <View style={styles.priorityInfo}>
                <Text style={styles.priorityLabel}>低</Text>
                <Text style={styles.priorityValue}>
                  {stats.priorityDistribution.low.toFixed(1)}%
                </Text>
              </View>
              <Text style={styles.priorityCount}>
                {stats.lowPriorityTasks}件
              </Text>
            </View>
          </View>
        </View>

        {/* その他の統計 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>詳細統計</Text>
          <View style={styles.detailStats}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>今日の完了</Text>
              <Text style={styles.detailValue}>{stats.todayCompleted}件</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="hourglass" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>平均完了時間</Text>
              <Text style={styles.detailValue}>
                {stats.averageCompletionTime.toFixed(1)}日
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="add" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>今日の作成</Text>
              <Text style={styles.detailValue}>{stats.todayCreated}件</Text>
            </View>
          </View>
        </View>

        {/* 下部の余白 */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productivityCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  productivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  productivityInfo: {
    marginLeft: 16,
    flex: 1,
  },
  productivityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  productivityMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 24,
    color: '#6B7280',
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  priorityContainer: {
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
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  priorityBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  priorityValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  priorityCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  detailStats: {
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
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  bottomPadding: {
    height: 100,
  },
}); 