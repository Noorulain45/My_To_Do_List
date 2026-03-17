export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface UpdateTaskDto {
  title?: string;
  isCompleted?: boolean;
}