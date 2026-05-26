import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { taskManager } from './taskManager.js';
import type { TestCase } from '../../shared/types.js';

export interface ExportResult {
  filePath: string;
  fileName: string;
}

class ExcelService {
  async exportToExcel(
    taskId: string,
    testCases: TestCase[],
    folderPath: string,
    fileName?: string
  ): Promise<ExportResult> {
    taskManager.addLog(taskId, 'info', '开始生成Excel文件...');

    let finalFileName = fileName || `测试用例_${new Date().toISOString().slice(0, 10)}_${Date.now()}.xlsx`;
    if (!finalFileName.endsWith('.xlsx')) {
      finalFileName = finalFileName + '.xlsx';
    }

    const filePath = path.join(folderPath, finalFileName);

    const workbook = XLSX.utils.book_new();

    const mainData = testCases.map((tc, index) => ({
      '序号': index + 1,
      '用例编号': tc.id,
      '所属模块': tc.module,
      '需求描述': tc.requirement,
      '用例标题': tc.title,
      '优先级': this.getPriorityLabel(tc.priority),
      '用例类型': this.getTypeLabel(tc.type),
      '前置条件': tc.precondition,
      '测试步骤': tc.steps.join('\n'),
      '预期结果': tc.expectedResult,
      '用例状态': '待执行',
      '备注': '',
    }));

    const mainWorksheet = XLSX.utils.json_to_sheet(mainData);

    const colWidths = [
      { wch: 6 },
      { wch: 25 },
      { wch: 15 },
      { wch: 40 },
      { wch: 50 },
      { wch: 8 },
      { wch: 10 },
      { wch: 30 },
      { wch: 60 },
      { wch: 40 },
      { wch: 10 },
      { wch: 20 },
    ];
    mainWorksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, mainWorksheet, '测试用例');

    const summaryData = this.generateSummaryData(testCases);
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '统计汇总');

    const moduleData = this.generateModuleData(testCases);
    const moduleWorksheet = XLSX.utils.json_to_sheet(moduleData);
    moduleWorksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, moduleWorksheet, '模块统计');

    XLSX.writeFile(workbook, filePath);

    taskManager.addLog(taskId, 'info', `Excel文件已生成: ${filePath}`);
    taskManager.updateProgress(taskId, 95, 'Excel文件生成完成');

    return { filePath, fileName: finalFileName };
  }

  private generateSummaryData(testCases: TestCase[]): Array<Record<string, string | number>> {
    const summary: Array<Record<string, string | number>> = [];

    const totalCases = testCases.length;
  const uniqueRequirements = new Set(testCases.map(tc => tc.requirementId)).size;

    summary.push({ '统计项': '总用例数', '数量': totalCases });
    summary.push({ '统计项': '需求数量', '数量': uniqueRequirements });

    const priorityCount: Record<string, number> = {};
    testCases.forEach(tc => {
      const label = this.getPriorityLabel(tc.priority);
      priorityCount[label] = (priorityCount[label] || 0) + 1;
    });

    Object.entries(priorityCount).forEach(([priority, count]) => {
      summary.push({ '统计项': `优先级-${priority}`, '数量': count });
    });

    const typeCount: Record<string, number> = {};
    testCases.forEach(tc => {
      const label = this.getTypeLabel(tc.type);
      typeCount[label] = (typeCount[label] || 0) + 1;
    });

    Object.entries(typeCount).forEach(([type, count]) => {
      summary.push({ '统计项': `类型-${type}`, '数量': count });
    });

    return summary;
  }

  private generateModuleData(testCases: TestCase[]): Array<Record<string, string | number>> {
    const moduleStats: Record<string, { total: number; requirements: Set<string>; priorities: Record<string, number> }> = {};

    testCases.forEach(tc => {
      const module = tc.module || '未分类';
      if (!moduleStats[module]) {
        moduleStats[module] = {
          total: 0,
          requirements: new Set(),
          priorities: {},
        };
      }
      moduleStats[module].total++;
      moduleStats[module].requirements.add(tc.requirementId);

      const priorityLabel = this.getPriorityLabel(tc.priority);
      moduleStats[module].priorities[priorityLabel] =
        (moduleStats[module].priorities[priorityLabel] || 0) + 1;
    });

    return Object.entries(moduleStats).map(([module, stats]) => ({
      '模块名称': module,
      '用例数量': stats.total,
      '需求数量': stats.requirements.size,
      '优先级分布': Object.entries(stats.priorities)
        .map(([p, c]) => `${p}: ${c}`)
        .join(', '),
    }));
  }

  private getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低',
    };
    return labels[priority] || priority;
  }

  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      functional: '功能测试',
      interface: '界面测试',
      performance: '性能测试',
      security: '安全测试',
    };
    return labels[type] || type;
  }
}

export const excelService = new ExcelService();