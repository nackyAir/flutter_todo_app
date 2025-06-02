import { AddTodoForm } from '@/components/AddTodoForm';
import { TodoItem } from '@/components/TodoItem';
import { useAuth } from '@/contexts/AuthContext';
import { useTodos } from '@/contexts/TodoContext';
import { Todo } from '@/types/todo';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

type FilterType = 'all' | 'active' | 'completed';

export default function TodoScreen() {
  const { user } = useAuth();
  const { todos, loading, error } = useTodos();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const todoStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    const overdue = todos.filter(todo => 
      todo.dueDate && 
      new Date() > todo.dueDate && 
      !todo.completed
    ).length;

    return { total, completed, active, overdue };
  }, [todos]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <TodoItem todo={item} />
  );

  const renderDebugInfo = () => (
    <View style={styles.debugContainer}>
      <Text style={styles.debugTitle}>🔧 デバッグ情報</Text>
      <Text style={styles.debugText}>認証状態: {user ? '✅ ログイン済み' : '❌ 未ログイン'}</Text>
      {user && (
        <>
          <Text style={styles.debugText}>ユーザーID: {user.uid}</Text>
          <Text style={styles.debugText}>メール: {user.email}</Text>
        </>
      )}
      <Text style={styles.debugText}>TODO読み込み状態: {loading ? '読み込み中...' : '完了'}</Text>
      <Text style={styles.debugText}>エラー: {error || 'なし'}</Text>
      <Text style={styles.debugText}>TODO件数: {todos.length}件</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* グリーティング */}
      <View style={styles.greetingSection}>
        <Text style={styles.welcomeText}>おかえりなさい</Text>
        <Text style={styles.userEmail}>{user?.email?.split('@')[0]}</Text>
        {showDebug && renderDebugInfo()}
      </View>

      {/* 統計カード */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="list-outline" size={20} color="#6B7280" />
            </View>
            <Text style={styles.statNumber}>{todoStats.total}</Text>
            <Text style={styles.statLabel}>合計</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="hourglass-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
              {todoStats.active}
            </Text>
            <Text style={styles.statLabel}>進行中</Text>
          </View>
        </View>

        <View style={[styles.statsRow, styles.lastStatsRow]}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
            </View>
            <Text style={[styles.statNumber, { color: '#059669' }]}>
              {todoStats.completed}
            </Text>
            <Text style={styles.statLabel}>完了</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons 
                name="alert-circle-outline" 
                size={20} 
                color={todoStats.overdue > 0 ? "#DC2626" : "#D1D5DB"} 
              />
            </View>
            <Text style={[
              styles.statNumber, 
              { color: todoStats.overdue > 0 ? '#DC2626' : '#9CA3AF' }
            ]}>
              {todoStats.overdue}
            </Text>
            <Text style={[
              styles.statLabel,
              { color: todoStats.overdue > 0 ? '#64748B' : '#D1D5DB' }
            ]}>期限切れ</Text>
          </View>
        </View>
      </View>

      {/* フィルターチップ */}
      <View style={styles.filterChips}>
        {([
          { key: 'all', label: 'すべて', icon: 'apps-outline' },
          { key: 'active', label: '進行中', icon: 'hourglass-outline' },
          { key: 'completed', label: '完了', icon: 'checkmark-circle-outline' }
        ] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption.key}
            style={[
              styles.filterChip,
              filter === filterOption.key && styles.activeFilterChip
            ]}
            onPress={() => setFilter(filterOption.key)}
          >
            <Ionicons 
              name={filterOption.icon} 
              size={16} 
              color={filter === filterOption.key ? '#3B82F6' : '#6B7280'} 
            />
            <Text style={[
              styles.filterChipText,
              filter === filterOption.key && styles.activeFilterChipText
            ]}>
              {filterOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* デバッグトグル */}
      <TouchableOpacity 
        style={styles.debugToggle}
        onPress={() => setShowDebug(!showDebug)}
      >
        <Ionicons name="bug-outline" size={16} color="#9CA3AF" />
        <Text style={styles.debugToggleText}>
          {showDebug ? 'デバッグ情報を隠す' : 'デバッグ情報を表示'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <Ionicons 
          name={filter === 'all' ? 'document-outline' : 
                filter === 'active' ? 'hourglass-outline' : 
                'checkmark-circle-outline'} 
          size={60} 
          color="#D1D5DB" 
        />
      </View>
      <Text style={styles.emptyStateTitle}>
        {filter === 'all' ? 'TODOがありません' :
         filter === 'active' ? '進行中のタスクなし' :
         '完了したタスクなし'}
      </Text>
      <Text style={styles.emptyStateDescription}>
        {filter === 'all' ? '新しいタスクを追加して始めましょう！' :
         filter === 'active' ? 'すべてのタスクが完了しています 🎉' :
         'タスクを完了させてここに表示させましょう'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>TODOを読み込み中...</Text>
            {user && (
              <Text style={styles.loadingSubText}>
                {user.email}
              </Text>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={60} color="#DC2626" />
            <Text style={styles.errorTitle}>エラーが発生しました</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>再試行</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        
        <View style={styles.contentContainer}>
          <FlatList
            data={filteredTodos}
            renderItem={renderTodoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContainer,
              filteredTodos.length === 0 && styles.emptyListContainer
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3B82F6"
                colors={['#3B82F6']}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        </View>

        {/* フローティングアクションボタン */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <AddTodoForm 
          visible={isAddModalVisible} 
          onClose={() => setIsAddModalVisible(false)} 
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  greetingSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 6,
    height: 100,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statIcon: {
    marginBottom: 8,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
    height: 22,
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    height: 14,
    lineHeight: 14,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  activeFilterChip: {
    backgroundColor: '#EBF4FF',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeFilterChipText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  debugToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.7,
  },
  debugToggleText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  debugContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  debugText: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  loadingSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  lastStatsRow: {
    marginBottom: 0,
  },
});
