import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { taskManager } from './taskManager';
import type { Requirement, TestCaseType } from '../../shared/types';
import type { CrawlResult } from './crawler';

export class ParserService {
  private readonly moduleKeywords: Record<string, string[]> = {
    '用户管理': ['用户', '账号', '注册', '登录', '个人中心', '会员', '权限', '角色'],
    '订单管理': ['订单', '下单', '支付', '结算', '退款', '购物车', '商品'],
    '内容管理': ['内容', '文章', '新闻', '公告', '评论', '留言', '反馈'],
    '系统设置': ['设置', '配置', '系统', '参数', '字典', '日志', '监控'],
    '数据统计': ['统计', '报表', '分析', '图表', '数据', '导出'],
    '界面展示': ['页面', '界面', 'UI', '显示', '样式', '布局', '列表', '详情'],
    '性能优化': ['性能', '速度', '响应', '加载', '并发', '压力'],
    '安全防护': ['安全', '加密', '验证', '权限', '防攻击', '审计', '日志'],
  };

  private readonly typeKeywords: Record<TestCaseType, string[]> = {
    functional: ['功能', '实现', '支持', '提供', '可以', '能够', '应', '需', '要', '必须'],
    interface: ['界面', '页面', '显示', '展示', '样式', '布局', '按钮', '输入框', '表单'],
    performance: ['性能', '速度', '响应时间', '加载', '并发', '压力', '吞吐量', '延迟'],
    security: ['安全', '加密', '验证', '授权', '权限', '攻击', '注入', 'XSS', 'CSRF'],
  };

  private readonly requirementPatterns = [
    /^[1-9]\d*[、.．]\s*(.+)/,
    /^[（(][1-9]\d*[）)]\s*(.+)/,
    /^[一二三四五六七八九十]+[、.．]\s*(.+)/,
    /^•\s*(.+)/,
    /^●\s*(.+)/,
    /^-\s*(.+)/,
    /^\*\s*(.+)/,
    /^(功能|需求|要求|规则|说明)[:：]\s*(.+)/,
  ];

  parse(taskId: string, crawlResult: CrawlResult): Requirement[] {
    taskManager.addLog(taskId, 'info', '开始解析需求内容...');
    taskManager.updateProgress(taskId, 25, '正在解析网页结构...');

    if (taskManager.isCancelled(taskId)) {
      throw new Error('任务已取消');
    }

    const $ = cheerio.load(crawlResult.html);
    const requirements: Requirement[] = [];
    const seenContents = new Set<string>();

    this.extractFromHeadings($, requirements, seenContents);
    this.extractFromLists($, requirements, seenContents);
    this.extractFromParagraphs($, requirements, seenContents);
    this.extractFromTables($, requirements, seenContents);

    if (taskManager.isCancelled(taskId)) {
      throw new Error('任务已取消');
    }

    const enrichedRequirements = requirements.map(req => ({
      ...req,
      module: this.detectModule(req.description),
      type: this.detectType(req.description),
    }));

    taskManager.addLog(taskId, 'info', `需求解析完成，共提取 ${enrichedRequirements.length} 条需求`);
    taskManager.updateProgress(taskId, 40, '需求解析完成');

    return enrichedRequirements;
  }

  private extractFromHeadings($: cheerio.CheerioAPI, requirements: Requirement[], seen: Set<string>): void {
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      if (this.isValidRequirement(text) && !seen.has(text)) {
        seen.add(text);
        requirements.push({
          id: uuidv4(),
          rawContent: text,
          description: this.cleanText(text),
          module: '',
          type: 'functional',
        });
      }
    });
  }

  private extractFromLists($: cheerio.CheerioAPI, requirements: Requirement[], seen: Set<string>): void {
    $('ul li, ol li').each((_, el) => {
      const text = $(el).text().trim();
      if (this.isValidRequirement(text) && !seen.has(text)) {
        seen.add(text);
        requirements.push({
          id: uuidv4(),
          rawContent: text,
          description: this.cleanText(text),
          module: '',
          type: 'functional',
        });
      }
    });
  }

  private extractFromParagraphs($: cheerio.CheerioAPI, requirements: Requirement[], seen: Set<string>): void {
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      const lines = text.split(/[。；;\n]+/);
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        for (const pattern of this.requirementPatterns) {
          const match = trimmedLine.match(pattern);
          if (match) {
            const content = match[1] || match[2] || trimmedLine;
            if (this.isValidRequirement(content) && !seen.has(content)) {
              seen.add(content);
              requirements.push({
                id: uuidv4(),
                rawContent: trimmedLine,
                description: this.cleanText(content),
                module: '',
                type: 'functional',
              });
            }
            break;
          }
        }
        
        if (this.isValidRequirement(trimmedLine) && !seen.has(trimmedLine)) {
          const hasRequirementKeyword = /(功能|需求|要求|规则|说明|应|需|必须|支持|实现)/.test(trimmedLine);
          if (hasRequirementKeyword) {
            seen.add(trimmedLine);
            requirements.push({
              id: uuidv4(),
              rawContent: trimmedLine,
              description: this.cleanText(trimmedLine),
              module: '',
              type: 'functional',
            });
          }
        }
      });
    });
  }

  private extractFromTables($: cheerio.CheerioAPI, requirements: Requirement[], seen: Set<string>): void {
    $('table tr').each((_, el) => {
      const cells = $(el).find('td, th');
      cells.each((_, cell) => {
        const text = $(cell).text().trim();
        if (this.isValidRequirement(text) && !seen.has(text)) {
          const hasRequirementKeyword = /(功能|需求|要求|规则|说明|应|需|必须)/.test(text);
          if (hasRequirementKeyword || text.length > 10) {
            seen.add(text);
            requirements.push({
              id: uuidv4(),
              rawContent: text,
              description: this.cleanText(text),
              module: '',
              type: 'functional',
            });
          }
        }
      });
    });
  }

  private isValidRequirement(text: string): boolean {
    if (!text || text.length < 5 || text.length > 500) return false;
    
    const invalidPatterns = [
      /^(点击|进入|返回|查看|更多|了解|详情)$/,
      /^(首页|关于我们|联系方式|产品中心|新闻动态)$/,
      /^https?:\/\//,
      /^\d+$/,
      /^[（(][^）)]*[）)]$/,
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(text));
  }

  private cleanText(text: string): string {
    return text
      .replace(/^[1-9]\d*[、.．\s]+/, '')
      .replace(/^[（(][1-9]\d*[）)]\s*/, '')
      .replace(/^[一二三四五六七八九十]+[、.．\s]+/, '')
      .replace(/^[•●\-\*]\s*/, '')
      .replace(/^(功能|需求|要求|规则|说明)[:：]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private detectModule(text: string): string {
    for (const [module, keywords] of Object.entries(this.moduleKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return module;
        }
      }
    }
    return '通用功能';
  }

  private detectType(text: string): TestCaseType {
    let maxScore = 0;
    let detectedType: TestCaseType = 'functional';

    for (const [type, keywords] of Object.entries(this.typeKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score += 1;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        detectedType = type as TestCaseType;
      }
    }

    return detectedType;
  }
}

export const parserService = new ParserService();
