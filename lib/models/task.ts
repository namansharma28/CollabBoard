export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  boardId: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: {
    email: string;
    name: string;
  };
  updatedBy?: {
    email: string;
    name: string;
  };
  statusChangeNote?: string;
} 