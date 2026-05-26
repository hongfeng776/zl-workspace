import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskStatus, LogEntry, LogLevel, GenerateRequest, HistoryRecord } from '../../shared/types';

class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private history: HistoryRecord[] = [];
  private maxHistorySize = 50;

  createTask(request: GenerateRequest): Task {
    const taskId = uuidv4();
    const now = Date.now();
    const task: Task = {
      id: taskId,
      url: request.url,
      folderPath: request.folderPath,
      status: 'pending',
      progress: 0,
      currentStep: '任务已创建，等待启动',
      options: request.options,
      logs: [],
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(taskId, task);
    this.addLog(taskId, 'info', `任务创建成功，ID: ${taskId}`);
    return task;
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      task.updatedAt = Date.now();
      if (status === 'completed' && task.result) {
        this.addToHistory(task);
      }
      if (status === 'failed') {
        this.addToHistory(task);
      }
    }
  }

  updateProgress(taskId: string, progress: number, currentStep: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.progress = Math.min(100, Math.max(0, progress));
      task.currentStep = currentStep;
      task.updatedAt = Date.now();
    }
  }

  addLog(taskId: string, level: LogLevel, message: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      const logEntry: LogEntry = {
        timestamp: Date.now(),
        level,
        message,
      };
      task.logs.push(logEntry);
      task.updatedAt = Date.now();
    }
  }

  setResult(taskId: string, result: Task['result']): void {
    const task = this.tasks.get(taskId);
    if (task && result) {
      task.result = result;
      task.updatedAt = Date.now();
    }
  }

  setError(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.error = error;
      task.status = 'failed';
      task.updatedAt = Date.now();
      this.addLog(taskId, 'error', error);
    }
  }

  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'running') {
      task.isCancelled = true;
      this.addLog(taskId, 'warn', '任务已被用户取消');
      return true;
    }
    return false;
  }

  isCancelled(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    return task?.isCancelled ?? false;
  }

  private addToHistory(task: Task): void {
    const record: HistoryRecord = {
      id: task.id,
      url: task.url,
      folderPath: task.folderPath,
      fileName: task.result?.fileName || '未知',
      totalTestCases: task.result?.totalTestCases || 0,
      createdAt: task.createdAt,
      status: task.status === 'completed' ? 'completed' : 'failed',
    };
    this.history.unshift(record);
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  getHistory(): HistoryRecord[] {
    return [...this.history];
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
}

export const taskManager = new TaskManager();
