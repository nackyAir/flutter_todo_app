import React, { createContext, useContext, useMemo } from 'react';
import { useTodos } from './TodoContext';

export interface DashboardStats {
  // 基本統計
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  
  // 完了率
  completionRate: number;
  
  // 優先度別統計
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
  
  // 期間別統計
  todayCompleted: number;
  weekCompleted: number;
  monthCompleted: number;
  
  // 期間別作成
  todayCreated: number;
  weekCreated: number;
  monthCreated: number;
  
  // 生産性指標
  productivityScore: number;
  averageCompletionTime: number; // 日数
  
  // 傾向データ
  weeklyTrend: number[]; // 過去7日の完了数
  monthlyTrend: number[]; // 過去30日の完了数
  priorityDistribution: { high: number; medium: number; low: number };
}

export interface DashboardContextType {
  stats: DashboardStats;
  loading: boolean;
  refreshStats: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { todos, loading } = useTodos();

  const stats = useMemo((): DashboardStats => {
    if (!todos.length) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        highPriorityTasks: 0,
        mediumPriorityTasks: 0,
        lowPriorityTasks: 0,
        todayCompleted: 0,
        weekCompleted: 0,
        monthCompleted: 0,
        todayCreated: 0,
        weekCreated: 0,
        monthCreated: 0,
        productivityScore: 0,
        averageCompletionTime: 0,
        weeklyTrend: Array(7).fill(0),
        monthlyTrend: Array(30).fill(0),
        priorityDistribution: { high: 0, medium: 0, low: 0 },
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 基本統計
    const totalTasks = todos.length;
    const completedTasks = todos.filter(todo => todo.completed).length;
    const pendingTasks = todos.filter(todo => !todo.completed).length;
    const overdueTasks = todos.filter(todo => 
      !todo.completed && todo.dueDate && new Date(todo.dueDate) < now
    ).length;

    // 完了率
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 優先度別統計
    const highPriorityTasks = todos.filter(todo => todo.priority === 'high').length;
    const mediumPriorityTasks = todos.filter(todo => todo.priority === 'medium').length;
    const lowPriorityTasks = todos.filter(todo => todo.priority === 'low').length;

    // 期間別完了統計
    const todayCompleted = todos.filter(todo => 
      todo.completed && todo.updatedAt >= today
    ).length;
    const weekCompleted = todos.filter(todo => 
      todo.completed && todo.updatedAt >= weekAgo
    ).length;
    const monthCompleted = todos.filter(todo => 
      todo.completed && todo.updatedAt >= monthAgo
    ).length;

    // 期間別作成統計
    const todayCreated = todos.filter(todo => 
      todo.createdAt >= today
    ).length;
    const weekCreated = todos.filter(todo => 
      todo.createdAt >= weekAgo
    ).length;
    const monthCreated = todos.filter(todo => 
      todo.createdAt >= monthAgo
    ).length;

    // 週間トレンド（過去7日の完了数）
    const weeklyTrend = Array(7).fill(0).map((_, index) => {
      const date = new Date(today.getTime() - index * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      return todos.filter(todo => 
        todo.completed && 
        todo.updatedAt >= date && 
        todo.updatedAt < nextDate
      ).length;
    }).reverse();

    // 月間トレンド（過去30日の完了数）
    const monthlyTrend = Array(30).fill(0).map((_, index) => {
      const date = new Date(today.getTime() - index * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      return todos.filter(todo => 
        todo.completed && 
        todo.updatedAt >= date && 
        todo.updatedAt < nextDate
      ).length;
    }).reverse();

    // 平均完了時間（作成から完了までの日数）
    const completedTodosWithTime = todos.filter(todo => 
      todo.completed && todo.createdAt && todo.updatedAt
    );
    const averageCompletionTime = completedTodosWithTime.length > 0
      ? completedTodosWithTime.reduce((sum, todo) => {
          const daysDiff = (todo.updatedAt.getTime() - todo.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + daysDiff;
        }, 0) / completedTodosWithTime.length
      : 0;

    // 生産性スコア（複数の指標を組み合わせた0-100のスコア）
    const productivityScore = Math.min(100, Math.round(
      (completionRate * 0.4) + // 完了率の重み40%
      (weekCompleted * 5) + // 週間完了数の重み（1つあたり5点）
      (todayCompleted * 10) + // 今日の完了数の重み（1つあたり10点）
      Math.max(0, 20 - (overdueTasks * 5)) // 期限切れペナルティ
    ));

    // 優先度分布
    const priorityDistribution = {
      high: totalTasks > 0 ? (highPriorityTasks / totalTasks) * 100 : 0,
      medium: totalTasks > 0 ? (mediumPriorityTasks / totalTasks) * 100 : 0,
      low: totalTasks > 0 ? (lowPriorityTasks / totalTasks) * 100 : 0,
    };

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      todayCompleted,
      weekCompleted,
      monthCompleted,
      todayCreated,
      weekCreated,
      monthCreated,
      productivityScore,
      averageCompletionTime,
      weeklyTrend,
      monthlyTrend,
      priorityDistribution,
    };
  }, [todos]);

  const refreshStats = () => {
    // TodoContextのデータが自動的に更新されるため、
    // このメソッドは将来的な拡張用のプレースホルダー
  };

  return (
    <DashboardContext.Provider value={{ stats, loading, refreshStats }}>
      {children}
    </DashboardContext.Provider>
  );
}; 