import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTodos } from '../contexts/TodoContext';
import { CreateTodoInput } from '../types/todo';

interface AddTodoFormProps {
  visible: boolean;
  onClose: () => void;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({ visible, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addTodo } = useTodos();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    console.log('📝 AddTodoForm: Starting todo submission');
    setIsLoading(true);
    
    try {
      const todoInput: CreateTodoInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate,
      };

      console.log('📝 AddTodoForm: Todo input data:', todoInput);
      
      await addTodo(todoInput);
      console.log('✅ AddTodoForm: Todo added successfully');
      
      Alert.alert('成功', 'タスクが追加されました', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            onClose();
          }
        }
      ]);
    } catch (error: any) {
      console.error('❌ AddTodoForm: Error adding todo:', error);
      Alert.alert(
        'エラー', 
        error.message || 'タスクの追加に失敗しました',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const getPriorityConfig = (priorityValue: string) => {
    switch (priorityValue) {
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
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClose = () => {
    if (isLoading) {
      Alert.alert('処理中', 'タスク追加中です。しばらくお待ちください。');
      return;
    }
    resetForm();
    onClose();
  };

  const clearDueDate = () => {
    setDueDate(undefined);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
            disabled={isLoading}
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>新しいタスク</Text>
          
          <TouchableOpacity 
            style={[
              styles.headerButton,
              styles.saveButton,
              (!title.trim() || isLoading) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={isLoading || !title.trim()}
          >
            {isLoading ? (
              <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* コンテンツエリア */}
        <View style={styles.contentWrapper}>
          <KeyboardAvoidingView 
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              {/* タイトル入力 */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Ionicons name="create-outline" size={16} color="#374151" />
                  <Text style={styles.inputLabel}>タイトル</Text>
                  <Text style={styles.requiredMark}>*</Text>
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    !title.trim() && styles.invalidInput
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="何をしますか？"
                  placeholderTextColor="#9CA3AF"
                  editable={!isLoading}
                  autoFocus={true}
                />
              </View>

              {/* 説明入力 */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Ionicons name="document-text-outline" size={16} color="#374151" />
                  <Text style={styles.inputLabel}>説明</Text>
                  <Text style={styles.optionalMark}>任意</Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="詳細な説明を追加..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  editable={!isLoading}
                />
              </View>

              {/* 優先度選択 */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Ionicons name="flag-outline" size={16} color="#374151" />
                  <Text style={styles.inputLabel}>優先度</Text>
                </View>
                <View style={styles.priorityGrid}>
                  {(['low', 'medium', 'high'] as const).map((priorityValue) => {
                    const config = getPriorityConfig(priorityValue);
                    const isSelected = priority === priorityValue;
                    
                    return (
                      <TouchableOpacity
                        key={priorityValue}
                        style={[
                          styles.priorityCard,
                          isSelected && styles.selectedPriorityCard,
                          { borderColor: config.color }
                        ]}
                        onPress={() => setPriority(priorityValue)}
                        disabled={isLoading}
                        activeOpacity={0.8}
                      >
                        <View style={[
                          styles.priorityIconContainer,
                          { backgroundColor: isSelected ? config.color : config.backgroundColor }
                        ]}>
                          <Ionicons 
                            name={config.icon} 
                            size={16} 
                            color={isSelected ? '#FFFFFF' : config.color} 
                          />
                        </View>
                        <Text style={[
                          styles.priorityLabel,
                          isSelected && { color: config.color, fontWeight: '600' }
                        ]}>
                          {config.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 期限設定 */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Ionicons name="calendar-outline" size={16} color="#374151" />
                  <Text style={styles.inputLabel}>期限</Text>
                  <Text style={styles.optionalMark}>任意</Text>
                </View>
                
                <View style={styles.dateSection}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                    disabled={isLoading}
                  >
                    <Ionicons 
                      name="calendar-outline" 
                      size={16} 
                      color={dueDate ? '#3B82F6' : '#6B7280'} 
                    />
                    <Text style={[
                      styles.dateButtonText,
                      dueDate && styles.selectedDateText
                    ]}>
                      {dueDate ? formatDate(dueDate) : '期限を設定'}
                    </Text>
                  </TouchableOpacity>
                  
                  {dueDate && (
                    <TouchableOpacity
                      style={styles.clearDateButton}
                      onPress={clearDueDate}
                      disabled={isLoading}
                    >
                      <Ionicons name="close-circle" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>

                {dueDate && (
                  <View style={styles.dueDatePreview}>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text style={styles.dueDatePreviewText}>
                      {new Date() > dueDate ? '期限切れ' : 
                       Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) === 0 ? '今日まで' :
                       `あと${Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}日`}
                    </Text>
                  </View>
                )}
              </View>

              {/* ボトムスペース */}
              <View style={styles.bottomSpace} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>

        {/* 日付ピッカー */}
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
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
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  requiredMark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  optionalMark: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  invalidInput: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  selectedPriorityCard: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 15,
    color: '#6B7280',
  },
  selectedDateText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  clearDateButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  dueDatePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  dueDatePreviewText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  bottomSpace: {
    height: 80,
  },
}); 