import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { CreateTodoInput, Todo, UpdateTodoInput } from '../types/todo';
import { useAuth } from './AuthContext';

interface TodoContextType {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (input: CreateTodoInput) => Promise<void>;
  updateTodo: (id: string, input: UpdateTodoInput) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    console.log('📋 TodoProvider: Starting todos monitoring for user:', user.uid);

    try {
      const todosRef = collection(db, 'todos');
      // 🔧 一時的に並び替えなしのクエリを使用（インデックスビルド中のため）
      const q = query(
        todosRef,
        where('userId', '==', user.uid)
        // orderBy('createdAt', 'desc') // インデックス完成後に有効化
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('📋 Todos snapshot received, size:', snapshot.size);
          const todosData: Todo[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            const todo: Todo = {
              id: doc.id,
              title: data.title,
              description: data.description,
              completed: data.completed,
              priority: data.priority,
              dueDate: data.dueDate?.toDate(),
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              userId: data.userId,
            };
            todosData.push(todo);
          });

          // クライアント側で並び替え（一時的な解決策）
          todosData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

          setTodos(todosData);
          setError(null);
          setLoading(false);
          console.log('✅ Todos loaded successfully:', todosData.length);
        },
        (error) => {
          console.error('❌ Error fetching todos:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
          setError(error.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('🛑 TodoProvider: Stopping todos monitoring');
        unsubscribe();
      };
    } catch (error: any) {
      console.error('❌ Error setting up todos listener:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [user]);

  const addTodo = async (input: CreateTodoInput): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('📝 Adding new todo:', input);

    try {
      const todosRef = collection(db, 'todos');
      const todoData = {
        title: input.title,
        description: input.description || '',
        completed: false,
        priority: input.priority,
        dueDate: input.dueDate || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: user.uid,
      };

      console.log('📤 Sending todo data to Firestore:', todoData);
      const docRef = await addDoc(todosRef, todoData);
      console.log('✅ Todo added successfully with ID:', docRef.id);
    } catch (error: any) {
      console.error('❌ Error adding todo:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const updateTodo = async (id: string, input: UpdateTodoInput): Promise<void> => {
    console.log('📝 Updating todo:', id, input);

    try {
      const todoRef = doc(db, 'todos', id);
      const updateData = {
        ...input,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(todoRef, updateData);
      console.log('✅ Todo updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating todo:', error);
      throw error;
    }
  };

  const deleteTodo = async (id: string): Promise<void> => {
    console.log('🗑️ Deleting todo:', id);

    try {
      const todoRef = doc(db, 'todos', id);
      await deleteDoc(todoRef);
      console.log('✅ Todo deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting todo:', error);
      throw error;
    }
  };

  const toggleTodo = async (id: string): Promise<void> => {
    const todo = todos.find(t => t.id === id);
    if (!todo) {
      throw new Error('Todo not found');
    }

    await updateTodo(id, { completed: !todo.completed });
  };

  return (
    <TodoContext.Provider 
      value={{ 
        todos, 
        loading, 
        error, 
        addTodo, 
        updateTodo, 
        deleteTodo, 
        toggleTodo 
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}; 