export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
} 