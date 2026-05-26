import { v4 as uuidv4 } from 'uuid';
import { taskManager } from './taskManager';
import type { Requirement, TestCase, TestCasePriority, GenerateOptions } from '../../shared/types';

export class TestCaseGenerator {
  private readonly priorityKeywords: Record<TestCasePriority, string[]> = {
    high: ['必须', '核心', '重要', '关键', '主要', '安全', '支付', '登录', '注册', '应', '需'],
    medium: ['应该', '建议', '可以', '能够', '支持', '提供', '一般'],
    low: ['可选', '优化', '建议', '可', '未来', '后续', '扩展'],
  };

  private readonly actionKeywords = [
    '输入', '点击', '选择', '填写', '提交', '查询', '搜索', '导出', '导入',
    '下载', '上传', '删除', '修改', '编辑', '新增', '添加', '查看', '浏览',
    '打开', '关闭', '确认', '取消', '保存', '重置', '刷新',
  ];

  generate(
    taskId: string,
    requirements: Requirement[],
    options?: GenerateOptions
  ): TestCase[] {
    taskManager.addLog(taskId, 'info', `开始生成测试用例，共 ${requirements.length} 条需求`);
    taskManager.updateProgress(taskId, 50, '正在生成测试用例...');

    if (taskManager.isCancelled(taskId)) {
      throw new Error('任务已取消');
    }

    const testCases: TestCase[] = [];
    const template = options?.template || 'standard';
    const includeBoundary = options?.includeBoundary ?? true;

    requirements.forEach((req, index) => {
      if (taskManager.isCancelled(taskId)) {
        throw new Error('任务已取消');
      }

      const progress = 50 + Math.floor((index / requirements.length) * 30);
      taskManager.updateProgress(taskId, progress, `正在处理第 ${index + 1}/${requirements.length} 条需求`);

      const cases = this.generateFromRequirement(req, template, includeBoundary);
      testCases.push(...cases);
    });

    taskManager.addLog(taskId, 'info', `测试用例生成完成，共生成 ${testCases.length} 条用例`);
    taskManager.updateProgress(taskId, 80, '测试用例生成完成');

    return testCases;
  }

  private generateFromRequirement(
    requirement: Requirement,
    template: 'standard' | 'detailed' | 'simple',
    includeBoundary: boolean
  ): TestCase[] {
    const cases: TestCase[] = [];

    const positiveCase = this.createTestCase(requirement, 'positive');
    cases.push(positiveCase);

    if (template === 'detailed' || template === 'standard') {
      const negativeCase = this.createTestCase(requirement, 'negative');
      cases.push(negativeCase);
    }

    if (includeBoundary && (template === 'detailed' || template === 'standard')) {
      const boundaryCases = this.createBoundaryTestCases(requirement);
      cases.push(...boundaryCases);
    }

    if (template === 'detailed') {
      const edgeCase = this.createTestCase(requirement, 'edge');
      cases.push(edgeCase);
    }

    return cases;
  }

  private createTestCase(
    requirement: Requirement,
    caseType: 'positive' | 'negative' | 'edge'
  ): TestCase {
    const id = `TC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const priority = this.determinePriority(requirement.description);

    let title = '';
    let precondition = '系统正常运行，网络连接正常';
    let steps: string[] = [];
    let expectedResult = '';

    const action = this.extractAction(requirement.description);
    const target = this.extractTarget(requirement.description);

    switch (caseType) {
      case 'positive':
        title = `验证${requirement.description}功能正常`;
        steps = this.generatePositiveSteps(action, target, requirement.description);
        expectedResult = `功能正常执行，${requirement.description}，结果符合预期`;
        break;

      case 'negative':
        title = `验证${requirement.description}异常场景处理`;
        precondition += '，准备异常测试数据';
        steps = this.generateNegativeSteps(action, target, requirement.description);
        expectedResult = '系统能够正确识别异常输入，给出合理的错误提示，不发生崩溃或数据异常';
        break;

      case 'edge':
        title = `验证${requirement.description}边界条件处理`;
        precondition += '，准备边界值测试数据';
        steps = this.generateEdgeSteps(action, target, requirement.description);
        expectedResult = '系统能够正确处理边界值，结果符合预期，不发生越界或溢出';
        break;
    }

    return {
      id,
      requirementId: requirement.id,
      requirement: requirement.description,
      module: requirement.module,
      title,
      precondition,
      steps,
      expectedResult,
      priority,
      type: requirement.type,
    };
  }

  private createBoundaryTestCases(requirement: Requirement): TestCase[] {
    const cases: TestCase[] = [];
    const description = requirement.description;

    const numberMatch = description.match(/(\d+)\s*[到~-]\s*(\d+)/);
    if (numberMatch) {
      const min = parseInt(numberMatch[1]);
      const max = parseInt(numberMatch[2]);

      const minCase: TestCase = {
        id: `TC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        requirementId: requirement.id,
        requirement: requirement.description,
        module: requirement.module,
        title: `验证${requirement.description}最小值边界（${min}）`,
        precondition: '系统正常运行，网络连接正常',
        steps: [
          `1. 进入相关功能页面`,
          `2. 输入最小值 ${min}`,
          `3. 执行相关操作`,
          `4. 观察系统响应`,
        ],
        expectedResult: `系统能够正确处理最小值 ${min}，结果符合预期`,
        priority: this.determinePriority(requirement.description),
        type: requirement.type,
      };
      cases.push(minCase);

      const maxCase: TestCase = {
        id: `TC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        requirementId: requirement.id,
        requirement: requirement.description,
        module: requirement.module,
        title: `验证${requirement.description}最大值边界（${max}）`,
        precondition: '系统正常运行，网络连接正常',
        steps: [
          `1. 进入相关功能页面`,
          `2. 输入最大值 ${max}`,
          `3. 执行相关操作`,
          `4. 观察系统响应`,
        ],
        expectedResult: `系统能够正确处理最大值 ${max}，结果符合预期`,
        priority: this.determinePriority(requirement.description),
        type: requirement.type,
      };
      cases.push(maxCase);
    }

    return cases;
  }

  private determinePriority(description: string): TestCasePriority {
    let score: Record<TestCasePriority, number> = { high: 0, medium: 0, low: 0 };

    for (const [priority, keywords] of Object.entries(this.priorityKeywords)) {
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          score[priority as TestCasePriority] += 1;
        }
      }
    }

    if (score.high >= score.medium && score.high >= score.low && score.high > 0) {
      return 'high';
    } else if (score.medium >= score.low && score.medium > 0) {
      return 'medium';
    } else if (score.low > 0) {
      return 'low';
    }

    return 'medium';
  }

  private extractAction(description: string): string {
    for (const keyword of this.actionKeywords) {
      if (description.includes(keyword)) {
        return keyword;
      }
    }
    return '操作';
  }

  private extractTarget(description: string): string {
    const patterns = [
      /(.+?)\s*(?:的|之|上|中|内|里)/,
      /[在从对将把](.+?)(?:进行|执行|操作|处理)/,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return description.length > 20 ? description.slice(0, 20) + '...' : description;
  }

  private generatePositiveSteps(action: string, target: string, description: string): string[] {
    return [
      `1. 打开系统并登录`,
      `2. 进入${target}相关功能页面`,
      `3. ${action}${description}相关内容`,
      `4. 确认操作已成功执行`,
      `5. 验证系统响应和结果`,
    ];
  }

  private generateNegativeSteps(action: string, target: string, description: string): string[] {
    return [
      `1. 打开系统并登录`,
      `2. 进入${target}相关功能页面`,
      `3. 输入异常或无效的数据`,
      `4. ${action}相关内容`,
      `5. 验证系统错误处理`,
    ];
  }

  private generateEdgeSteps(action: string, target: string, description: string): string[] {
    return [
      `1. 打开系统并登录`,
      `2. 进入${target}相关功能页面`,
      `3. 输入边界值数据`,
      `4. ${action}相关内容`,
      `5. 验证边界值处理是否正确`,
    ];
  }
}

export const testCaseGenerator = new TestCaseGenerator();