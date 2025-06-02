import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTodos } from '../contexts/TodoContext';
import { Todo, UpdateTodoInput } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState(todo.priority);
  const { toggleTodo, updateTodo, deleteTodo } = useTodos();
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleToggle = async () => {
    // アニメーション効果
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await toggleTodo(todo.id);
    } catch (error) {
      Alert.alert('エラー', 'タスクの状態変更に失敗しました');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'タスク削除',
      'このタスクを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTodo(todo.id);
            } catch (error) {
              Alert.alert('エラー', 'タスクの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    try {
      const updateData: UpdateTodoInput = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
      };

      await updateTodo(todo.id, updateData);
      setIsEditModalVisible(false);
    } catch (error) {
      Alert.alert('エラー', 'タスクの更新に失敗しました');
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: '#DC2626',
          backgroundColor: '#FEF2F2',
          label: '高',
          icon: 'flame-outline' as const,
        };
      case 'medium':
        return {
          color: '#D97706',
          backgroundColor: '#FEF3C7',
          label: '中',
          icon: 'time-outline' as const,
        };
      case 'low':
        return {
          color: '#059669',
          backgroundColor: '#D1FAE5',
          label: '低',
          icon: 'leaf-outline' as const,
        };
      default:
        return {
          color: '#6B7280',
          backgroundColor: '#F3F4F6',
          label: '',
          icon: 'ellipse-outline' as const,
        };
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '明日';
    if (diffDays === -1) return '昨日';
    if (diffDays > 0) return `${diffDays}日後`;
    if (diffDays < 0) return `${Math.abs(diffDays)}日前`;

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const priorityConfig = getPriorityConfig(todo.priority);
  const isOverdue = todo.dueDate && new Date() > todo.dueDate && !todo.completed;

  return (
    <>
      <Animated.View 
        style={[
          styles.container,
          todo.completed && styles.completedContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* メインコンテンツ */}
        <View style={styles.mainContent}>
          {/* チェックボックスとコンテンツ */}
          <View style={styles.contentRow}>
            <TouchableOpacity
              style={[
                styles.checkButton,
                todo.completed && styles.checkButtonCompleted
              ]}
              onPress={handleToggle}
              activeOpacity={0.7}
            >
              {todo.completed ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <View style={styles.uncheckedCircle} />
              )}
            </TouchableOpacity>

            <View style={styles.textContent}>
              <Text style={[
                styles.title,
                todo.completed && styles.completedTitle
              ]}>
                {todo.title}
              </Text>

              {todo.description && (
                <Text style={[
                  styles.description,
                  todo.completed && styles.completedDescription
                ]}>
                  {todo.description}
                </Text>
              )}

              {/* メタデータ行 */}
              <View style={styles.metadataRow}>
                {/* 優先度バッジ */}
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: priorityConfig.backgroundColor }
                ]}>
                  <Ionicons 
                    name={priorityConfig.icon} 
                    size={12} 
                    color={priorityConfig.color} 
                  />
                  <Text style={[
                    styles.priorityText,
                    { color: priorityConfig.color }
                  ]}>
                    {priorityConfig.label}
                  </Text>
                </View>

                {/* 期限表示 */}
                {todo.dueDate && (
                  <View style={[
                    styles.dueDateBadge,
                    isOverdue && styles.overdueBadge
                  ]}>
                    <Ionicons 
                      name={isOverdue ? 'alert-circle-outline' : 'calendar-outline'} 
                      size={12} 
                      color={isOverdue ? '#DC2626' : '#6B7280'} 
                    />
                    <Text style={[
                      styles.dueDateText,
                      isOverdue && styles.overdueText
                    ]}>
                      {formatDate(todo.dueDate)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* アクションボタン */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 完了状態のボーダー */}
        {todo.completed && (
          <View style={styles.completedBorder} />
        )}
      </Animated.View>

      {/* 編集モーダル */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>タスク編集</Text>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveEdit}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>タイトル</Text>
              <TextInput
                style={styles.textInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="タスクのタイトル"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>説明</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="タスクの詳細説明（任意）"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>優先度</Text>
              <View style={styles.priorityOptions}>
                {(['low', 'medium', 'high'] as const).map((priority) => {
                  const config = getPriorityConfig(priority);
                  return (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        editPriority === priority && styles.selectedPriorityOption,
                        { borderColor: config.color }
                      ]}
                      onPress={() => setEditPriority(priority)}
                    >
                      <Ionicons 
                        name={config.icon} 
                        size={16} 
                        color={editPriority === priority ? '#FFFFFF' : config.color} 
                      />
                      <Text style={[
                        styles.priorityOptionText,
                        editPriority === priority && styles.selectedPriorityOptionText,
                        { color: editPriority === priority ? '#FFFFFF' : config.color }
                      ]}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  completedContainer: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  mainContent: {
    padding: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkButtonCompleted: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  uncheckedCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 10,
  },
  completedDescription: {
    color: '#D1D5DB',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 3,
  },
  overdueBadge: {
    backgroundColor: '#FEF2F2',
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  overdueText: {
    color: '#DC2626',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'flex-end',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  completedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#059669',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  selectedPriorityOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  priorityOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  selectedPriorityOptionText: {
    color: '#FFFFFF',
  },
}); 