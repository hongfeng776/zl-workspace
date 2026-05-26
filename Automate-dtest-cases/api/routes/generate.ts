import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { taskManager } from '../services/taskManager.js';
import { crawlerService } from '../services/crawler.js';
import { parserService } from '../services/parser.js';
import { testCaseGenerator } from '../services/generator.js';
import { excelService } from '../services/excelService.js';
import type { GenerateRequest, TaskStatusResponse, HistoryRecord, FolderValidateRequest, FolderValidateResponse, FolderOpenRequest, FolderOpenResponse } from '../../shared/types.js';

const router = Router();

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, folderPath, options } = req.body as GenerateRequest;

    if (!url || !folderPath) {
      res.status(400).json({
        success: false,
        error: 'URL地址和文件夹路径不能为空',
      });
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      res.status(400).json({
        success: false,
        error: '请输入有效的URL地址（需包含http://或https://）',
      });
      return;
    }

    if (!fs.existsSync(folderPath)) {
      try {
        fs.mkdirSync(folderPath, { recursive: true });
      } catch {
        res.status(400).json({
          success: false,
          error: '无法创建指定的文件夹，请检查路径是否正确',
        });
        return;
      }
    }

    try {
      fs.accessSync(folderPath, fs.constants.W_OK);
    } catch {
      res.status(400).json({
        success: false,
        error: '指定的文件夹没有写入权限',
      });
      return;
    }

    const task = taskManager.createTask({ url, folderPath, options });

    process.nextTick(async () => {
      try {
        taskManager.updateTaskStatus(task.id, 'running');

        const crawlResult = await crawlerService.crawl(task.id, url, {
          timeout: options?.timeout,
          maxRetries: options?.maxRetries,
          useProxy: options?.useProxy,
          proxyUrl: options?.proxyUrl,
          verifySSL: options?.verifySSL,
          tlsVersion: options?.tlsVersion,
        });
        const requirements = parserService.parse(task.id, crawlResult);
        const testCases = testCaseGenerator.generate(task.id, requirements, options);

        taskManager.updateProgress(task.id, 90, '正在生成Excel文件...');
        const { filePath, fileName } = await excelService.exportToExcel(task.id, testCases, folderPath, options?.fileName);

        taskManager.setResult(task.id, {
          totalRequirements: requirements.length,
          totalTestCases: testCases.length,
          filePath,
          fileName,
          testCases,
        });

        taskManager.updateTaskStatus(task.id, 'completed');
        taskManager.updateProgress(task.id, 100, '任务完成');
        taskManager.addLog(task.id, 'info', `测试用例已保存至: ${filePath}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        taskManager.setError(task.id, errorMessage);
      }
    });

    res.json({
      taskId: task.id,
      status: 'pending',
      message: '任务已创建，正在后台处理',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

router.get('/status/:taskId', (req: Request, res: Response): void => {
  try {
    const { taskId } = req.params;
    const task = taskManager.getTask(taskId);

    if (!task) {
      res.status(404).json({
        success: false,
        error: '任务不存在',
      });
      return;
    }

    const response: TaskStatusResponse = {
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      currentStep: task.currentStep,
      logs: task.logs,
      result: task.result,
      error: task.error,
    };

    res.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

router.post('/cancel/:taskId', (req: Request, res: Response): void => {
  try {
    const { taskId } = req.params;
    const success = taskManager.cancelTask(taskId);

    if (success) {
      res.json({
        success: true,
        message: '任务已取消',
      });
    } else {
      res.status(400).json({
        success: false,
        error: '无法取消任务（任务可能已完成或不存在）',
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

router.post('/validate-folder', (req: Request, res: Response): void => {
  try {
    const { folderPath } = req.body as FolderValidateRequest;

    if (!folderPath) {
      res.json({ valid: false, exists: false, writable: false, message: '文件夹路径不能为空' } as FolderValidateResponse);
      return;
    }

    const exists = fs.existsSync(folderPath);
    let writable = false;

    if (exists) {
      try {
        fs.accessSync(folderPath, fs.constants.W_OK);
        writable = true;
      } catch {
        writable = false;
      }
    }

    let message = '';
    if (!exists) {
      message = '文件夹不存在，将在生成时自动创建';
    } else if (!writable) {
      message = '文件夹存在但没有写入权限';
    } else {
      message = '文件夹验证通过';
    }

    res.json({ valid: exists && writable, exists, writable, message } as FolderValidateResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.json({ valid: false, exists: false, writable: false, message: `验证失败: ${errorMessage}` } as FolderValidateResponse);
  }
});

router.post('/open-folder', (req: Request, res: Response): void => {
  try {
    const { folderPath } = req.body as FolderOpenRequest;

    if (!folderPath || !fs.existsSync(folderPath)) {
      res.json({ success: false, message: '文件夹不存在' } as FolderOpenResponse);
      return;
    }

    const { exec } = require('child_process');
    const platform = process.platform;

    let command = '';
    if (platform === 'win32') {
      command = `explorer "${folderPath}"`;
    } else if (platform === 'darwin') {
      command = `open "${folderPath}"`;
    } else {
      command = `xdg-open "${folderPath}"`;
    }

    exec(command, (error: Error | null) => {
      if (error) {
        res.json({ success: false, message: `打开文件夹失败: ${error.message}` } as FolderOpenResponse);
      } else {
        res.json({ success: true, message: '文件夹已打开' } as FolderOpenResponse);
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.json({ success: false, message: `打开文件夹失败: ${errorMessage}` } as FolderOpenResponse);
  }
});

router.get('/history', (req: Request, res: Response): void => {
  try {
    const history = taskManager.getHistory();
    res.json(history as HistoryRecord[]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

router.get('/download/:taskId', (req: Request, res: Response): void => {
  try {
    const { taskId } = req.params;
    const task = taskManager.getTask(taskId);

    if (!task || !task.result?.filePath) {
      res.status(404).json({
        success: false,
        error: '文件不存在',
      });
      return;
    }

    const filePath = task.result.filePath;
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        error: '文件已被删除或移动',
      });
      return;
    }

    res.download(filePath, task.result.fileName);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default router;