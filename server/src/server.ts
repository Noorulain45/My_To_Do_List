import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Task, UpdateTaskDto } from './types';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory Database
let tasks: Task[] = [
  { id: uuidv4(), title: 'Master TypeScript with React', isCompleted: false },
];
app.get('/', (req: Request, res: Response) => {
  res.send(' API is live and running!');
});
// 1. GET ALL TASKS
app.get('/api/tasks', (req: Request, res: Response<Task[]>) => {
  res.json(tasks);
});

// 2. ADD TASK
app.post('/api/tasks', (req: Request<{}, {}, { title: string }>, res: Response<Task | { message: string }>) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Task title is required!" });
  }

  const newTask: Task = { 
    id: uuidv4(), 
    title: title.trim(), 
    isCompleted: false 
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 3. UPDATE TASK (Flexible)
app.put('/api/tasks/:id', (req: Request<{ id: string }, {}, UpdateTaskDto>, res: Response<Task | { message: string }>) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  const updatedTask = { ...tasks[taskIndex], ...req.body };
  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

// 4. DELETE TASK
app.delete('/api/tasks/:id', (req: Request<{ id: string }>, res: Response) => {
  tasks = tasks.filter(t => t.id !== req.params.id);
  res.status(204).send();
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}
export default app;