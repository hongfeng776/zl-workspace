export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export type TestCasePriority = 'high' | 'medium' | 'low';

export type TestCaseType = 'functional' | 'interface' | 'performance' | 'security';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export type TlsVersion = 'TLSv1' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3' | 'auto';

export interface GenerateOptions {
  template?: 'standard' | 'detailed' | 'simple';
  includeBoundary?: boolean;
  fileName?: string;
  timeout?: number;
  maxRetries?: number;
  useProxy?: boolean;
  proxyUrl?: string;
  verifySSL?: boolean;
  tlsVersion?: TlsVersion;
}

export interface GenerateRequest {
  url: string;
  folderPath: string;
  options?: GenerateOptions;
}

export interface GenerateResponse {
  taskId: string;
  status: TaskStatus;
  message: string;
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
}

export interface TestCase {
  id: string;
  requirementId: string;
  requirement: string;
  module: string;
  title: string;
  precondition: string;
  steps: string[];
  expectedResult: string;
  priority: TestCasePriority;
  type: TestCaseType;
}

export interface Requirement {
  id: string;
  rawContent: string;
  module: string;
  description: string;
  type: TestCaseType;
}

export interface GenerateResult {
  totalRequirements: number;
  totalTestCases: number;
  filePath: string;
  fileName: string;
  testCases: TestCase[];
}

export interface TaskStatusResponse {
  taskId: string;
  status: TaskStatus;
  progress: number;
  currentStep: string;
  logs: LogEntry[];
  result?: GenerateResult;
  error?: string;
}

export interface HistoryRecord {
  id: string;
  url: string;
  folderPath: string;
  fileName: string;
  totalTestCases: number;
  createdAt: number;
  status: 'completed' | 'failed';
}

export interface Task {
  id: string;
  url: string;
  folderPath: string;
  status: TaskStatus;
  progress: number;
  currentStep: string;
  options?: GenerateOptions;
  logs: LogEntry[];
  result?: GenerateResult;
  error?: string;
  createdAt: number;
  updatedAt: number;
  isCancelled?: boolean;
}

export interface FolderValidateRequest {
  folderPath: string;
}

export interface FolderValidateResponse {
  valid: boolean;
  exists: boolean;
  writable: boolean;
  message: string;
}

export interface FolderOpenRequest {
  folderPath: string;
}

export interface FolderOpenResponse {
  success: boolean;
  message: string;
}
