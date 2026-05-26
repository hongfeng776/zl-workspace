import { useState, useEffect, useRef } from 'react';
import {
  Play,
  FolderOpen,
  Download,
  XCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  FileSpreadsheet,
  Link as LinkIcon,
  Folder,
  History,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings,
  Globe,
  Shield,
  Repeat,
  Lock,
} from 'lucide-react';
import type {
  GenerateRequest,
  GenerateResponse,
  TaskStatusResponse,
  HistoryRecord,
  FolderValidateResponse,
  GenerateOptions,
  TlsVersion,
} from '../../shared/types';

export default function Home() {
  const [url, setUrl] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [template, setTemplate] = useState<'standard' | 'detailed' | 'simple'>('standard');
  const [includeBoundary, setIncludeBoundary] = useState(true);
  const [fileName, setFileName] = useState('');

  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [timeout, setTimeout] = useState(60000);
  const [maxRetries, setMaxRetries] = useState(3);
  const [useProxy, setUseProxy] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [verifySSL, setVerifySSL] = useState(false);
  const [tlsVersion, setTlsVersion] = useState<TlsVersion>('auto');

  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatusResponse | null>(null);
  const [showLogs, setShowLogs] = useState(true);

  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [folderValidation, setFolderValidation] = useState<FolderValidateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadHistory();
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (folderPath) {
      validateFolder(folderPath);
    } else {
      setFolderValidation(null);
    }
  }, [folderPath]);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/generate/history');
      const data = await response.json();
      setHistory(data);
    } catch {
      console.error('加载历史记录失败');
    }
  };

  const validateFolder = async (path: string) => {
    try {
      const response = await fetch('/api/generate/validate-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: path }),
      });
      const data = await response.json();
      setFolderValidation(data);
    } catch {
      setFolderValidation({ valid: false, exists: false, writable: false, message: '验证失败' });
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setSuccess(null);

    if (!url.trim()) {
      setError('请输入URL地址');
      return;
    }
    if (!folderPath.trim()) {
      setError('请输入文件夹路径');
      return;
    }

    setIsGenerating(true);
    setTaskStatus(null);

    const options: GenerateOptions = {
      template,
      includeBoundary,
      fileName: fileName || undefined,
      timeout,
      maxRetries,
      useProxy,
      proxyUrl: proxyUrl || undefined,
      verifySSL,
      tlsVersion,
    };

    const request: GenerateRequest = {
      url: url.trim(),
      folderPath: folderPath.trim(),
      options,
    };

    try {
      const response = await fetch('/api/generate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data: GenerateResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '生成失败');
      }

      setTaskId(data.taskId);
      startPolling(data.taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setIsGenerating(false);
    }
  };

  const startPolling = (id: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate/status/${id}`);
        const data: TaskStatusResponse = await response.json();
        setTaskStatus(data);

        if (data.status === 'completed' || data.status === 'failed') {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          setIsGenerating(false);

          if (data.status === 'completed') {
            setSuccess(`测试用例生成完成！已保存至：${data.result?.filePath}`);
          } else {
            setError(data.error || '生成失败');
          }

          loadHistory();
        }
      } catch {
        console.error('轮询状态失败');
      }
    }, 1000);
  };

  const handleCancel = async () => {
    if (!taskId) return;

    try {
      await fetch(`/api/generate/cancel/${taskId}`, { method: 'POST' });
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setIsGenerating(false);
      setError('任务已取消');
    } catch {
      console.error('取消任务失败');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      window.open(`/api/generate/download/${id}`, '_blank');
    } catch {
      console.error('下载失败');
    }
  };

  const handleOpenFolder = async () => {
    if (!folderPath) return;

    try {
      await fetch('/api/generate/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath }),
      });
    } catch {
      console.error('打开文件夹失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'running':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'running':
        return '进行中';
      case 'pending':
        return '等待中';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">测试用例自动生成工具</h1>
                <p className="text-sm text-gray-500">根据需求文档URL自动生成测试用例</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              历史记录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {showHistory && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4" />
                历史记录
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XCircle className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  暂无历史记录
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">URL</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">文件名</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">用例数</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">时间</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">状态</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 max-w-xs truncate" title={record.url}>
                          {record.url}
                        </td>
                        <td className="px-4 py-2">{record.fileName}</td>
                        <td className="px-4 py-2">{record.totalTestCases}</td>
                        <td className="px-4 py-2 text-gray-500">
                          {new Date(record.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <span className={getStatusColor(record.status)}>
                            {getStatusText(record.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {record.status === 'completed' && (
                            <button
                              onClick={() => handleDownload(record.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="下载"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">生成配置</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    需求文档URL
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="请输入需求文档的URL地址，例如：https://example.com/requirements"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    保存文件夹路径
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={folderPath}
                        onChange={(e) => setFolderPath(e.target.value)}
                        placeholder="请输入保存文件夹的绝对路径，例如：C:/testcases"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        disabled={isGenerating}
                      />
                    </div>
                    <button
                      onClick={handleOpenFolder}
                      disabled={!folderPath || isGenerating}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="打开文件夹"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                  </div>
                  {folderValidation && (
                    <p
                      className={`mt-1 text-sm flex items-center gap-1 ${
                        folderValidation.valid || folderValidation.exists
                          ? 'text-green-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {folderValidation.valid ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : folderValidation.exists ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                      {folderValidation.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      用例模板
                    </label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value as 'standard' | 'detailed' | 'simple')}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      disabled={isGenerating}
                    >
                      <option value="simple">简单模板</option>
                      <option value="standard">标准模板</option>
                      <option value="detailed">详细模板</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      文件名（可选）
                    </label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="留空则自动生成"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeBoundary"
                    checked={includeBoundary}
                    onChange={(e) => setIncludeBoundary(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    disabled={isGenerating}
                  />
                  <label htmlFor="includeBoundary" className="text-sm text-gray-700">
                    包含边界测试用例
                  </label>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    disabled={isGenerating}
                  >
                    <Settings className="w-4 h-4" />
                    高级配置
                    {showAdvancedConfig ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showAdvancedConfig && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            超时时间（毫秒）
                          </label>
                          <input
                            type="number"
                            value={timeout}
                            onChange={(e) => setTimeout(Math.max(5000, parseInt(e.target.value) || 60000))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            disabled={isGenerating}
                            min={5000}
                            step={5000}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Repeat className="w-3.5 h-3.5" />
                            最大重试次数
                          </label>
                          <input
                            type="number"
                            value={maxRetries}
                            onChange={(e) => setMaxRetries(Math.max(0, Math.min(10, parseInt(e.target.value) || 3)))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            disabled={isGenerating}
                            min={0}
                            max={10}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="verifySSL"
                          checked={verifySSL}
                          onChange={(e) => setVerifySSL(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          disabled={isGenerating}
                        />
                        <label htmlFor="verifySSL" className="text-sm text-gray-700 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" />
                          严格SSL证书验证（可能导致部分站点无法访问）
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          TLS 协议版本
                        </label>
                        <select
                          value={tlsVersion}
                          onChange={(e) => setTlsVersion(e.target.value as TlsVersion)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          disabled={isGenerating}
                        >
                          <option value="auto">自动尝试（推荐，兼容性最佳）</option>
                          <option value="TLSv1.3">TLS 1.3（最安全）</option>
                          <option value="TLSv1.2">TLS 1.2</option>
                          <option value="TLSv1.1">TLS 1.1</option>
                          <option value="TLSv1">TLS 1.0（旧系统兼容）</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          自动模式会依次尝试多种TLS策略，直到连接成功
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="useProxy"
                          checked={useProxy}
                          onChange={(e) => setUseProxy(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          disabled={isGenerating}
                        />
                        <label htmlFor="useProxy" className="text-sm text-gray-700 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          使用自定义代理
                        </label>
                      </div>

                      {useProxy && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            代理服务器地址
                          </label>
                          <input
                            type="text"
                            value={proxyUrl}
                            onChange={(e) => setProxyUrl(e.target.value)}
                            placeholder="例如: http://proxy.example.com:8080"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            disabled={isGenerating}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            格式: http://[用户名:密码@]主机:端口
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-amber-600 flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        提示：系统会自动检测环境变量中的代理配置（HTTP_PROXY, HTTPS_PROXY）
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !url || !folderPath}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        开始生成
                      </>
                    )}
                  </button>

                  {isGenerating && (
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
                    >
                      取消
                    </button>
                  )}
                </div>
              </div>
            </div>

            {taskStatus && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        taskStatus.status === 'running'
                          ? 'bg-blue-500 animate-pulse'
                          : taskStatus.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="font-medium text-gray-900">
                      任务状态：{getStatusText(taskStatus.status)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {taskStatus.progress}%
                  </span>
                </div>

                <div className="px-6 py-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        taskStatus.status === 'completed'
                          ? 'bg-green-500'
                          : taskStatus.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${taskStatus.progress}%` }}
                    />
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{taskStatus.currentStep}</p>

                  {taskStatus.result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                        <CheckCircle className="w-5 h-5" />
                        生成完成
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>需求数量：{taskStatus.result.totalRequirements} 条</p>
                        <p>用例数量：{taskStatus.result.totalTestCases} 条</p>
                        <p className="flex items-center gap-1">
                          文件路径：{taskStatus.result.filePath}
                          <button
                            onClick={() => handleDownload(taskId!)}
                            className="ml-2 text-blue-600 hover:text-blue-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {showLogs ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    日志详情
                  </button>

                  {showLogs && (
                    <div className="mt-3 bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
                      {taskStatus.logs.map((log, index) => (
                        <div key={index} className="text-xs mb-1">
                          <span className="text-gray-500">
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                          </span>
                          <span
                            className={
                              log.level === 'error'
                                ? 'text-red-400'
                                : log.level === 'warn'
                                ? 'text-amber-400'
                                : 'text-green-400'
                            }
                          >
                            {' '}
                            [{log.level.toUpperCase()}]{' '}
                          </span>
                          <span className="text-gray-300">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-green-700">{success}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                使用说明
              </h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </span>
                  <span>输入需求文档的URL地址</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </span>
                  <span>指定保存测试用例的文件夹路径</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </span>
                  <span>选择用例模板和是否包含边界测试</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    4
                  </span>
                  <span>点击"开始生成"按钮</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    5
                  </span>
                  <span>等待生成完成，查看结果</span>
                </li>
              </ol>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                注意事项
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>确保URL可以正常访问</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>文件夹路径需要有写入权限</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>生成的Excel文件包含多个工作表</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>可以在历史记录中下载之前生成的用例</span>
                </li>
              </ul>
            </div>

            {taskStatus?.result && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  快速操作
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleDownload(taskId!)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载Excel文件
                  </button>
                  <button
                    onClick={handleOpenFolder}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    打开文件夹
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}