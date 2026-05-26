import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import { taskManager } from './taskManager';
import https from 'https';
import http from 'http';
import tls from 'tls';

export interface CrawlResult {
  html: string;
  title: string;
  textContent: string;
}

export type TlsVersion = 'TLSv1' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3' | 'auto';

export interface CrawlOptions {
  timeout?: number;
  maxRetries?: number;
  useProxy?: boolean;
  proxyUrl?: string;
  verifySSL?: boolean;
  tlsVersion?: TlsVersion;
  ciphers?: string;
}

interface TlsStrategy {
  name: string;
  minVersion?: tls.SecureVersion;
  maxVersion?: tls.SecureVersion;
  ciphers?: string;
  ecdhCurve?: string;
}

export class CrawlerService {
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
  ];

  private readonly defaultCiphers = [
    'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'AES128-GCM-SHA256',
    'AES256-GCM-SHA384',
    'AES128-SHA256',
    'AES256-SHA256',
  ].join(':');

  private readonly tlsStrategies: TlsStrategy[] = [
    {
      name: 'Modern (TLS 1.2-1.3)',
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3',
      ecdhCurve: 'auto',
    },
    {
      name: 'Intermediate (TLS 1.0-1.3)',
      minVersion: 'TLSv1',
      maxVersion: 'TLSv1.3',
      ciphers: 'DEFAULT:@SECLEVEL=0',
    },
    {
      name: 'Legacy (TLS 1.0-1.2)',
      minVersion: 'TLSv1',
      maxVersion: 'TLSv1.2',
      ciphers: 'ALL:@SECLEVEL=0',
    },
    {
      name: 'Compatibility Mode',
      minVersion: 'TLSv1',
      maxVersion: 'TLSv1.3',
      ciphers: 'DEFAULT:!DH:!EDH:!DHE:@SECLEVEL=0',
    },
  ];

  private httpAgent = new http.Agent({
    keepAlive: true,
    timeout: 60000,
    keepAliveMsecs: 30000,
  });

  private createHttpsAgent(strategy: TlsStrategy, verifySSL: boolean): https.Agent {
    return new https.Agent({
      rejectUnauthorized: verifySSL,
      minVersion: strategy.minVersion,
      maxVersion: strategy.maxVersion,
      ciphers: strategy.ciphers || this.defaultCiphers,
      ecdhCurve: strategy.ecdhCurve || 'auto',
      honorCipherOrder: true,
    });
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private getSystemProxy(url: string): string | null {
    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
    const allProxy = process.env.ALL_PROXY || process.env.all_proxy;

    if (allProxy) return allProxy;
    if (url.startsWith('https://') && httpsProxy) return httpsProxy;
    if (url.startsWith('http://') && httpProxy) return httpProxy;

    return null;
  }

  private parseProxyUrl(proxyUrl: string) {
    try {
      const url = new URL(proxyUrl);
      return {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
        auth: url.username && url.password ? {
          username: url.username,
          password: url.password,
        } : undefined,
      };
    } catch {
      return null;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getTlsStrategy(tlsVersion: TlsVersion): TlsStrategy {
    switch (tlsVersion) {
      case 'TLSv1':
        return { name: 'TLS 1.0', minVersion: 'TLSv1', maxVersion: 'TLSv1' };
      case 'TLSv1.1':
        return { name: 'TLS 1.1', minVersion: 'TLSv1.1', maxVersion: 'TLSv1.1' };
      case 'TLSv1.2':
        return { name: 'TLS 1.2', minVersion: 'TLSv1.2', maxVersion: 'TLSv1.2' };
      case 'TLSv1.3':
        return { name: 'TLS 1.3', minVersion: 'TLSv1.3', maxVersion: 'TLSv1.3' };
      default:
        return this.tlsStrategies[0];
    }
  }

  async crawl(taskId: string, url: string, options?: CrawlOptions): Promise<CrawlResult> {
    taskManager.addLog(taskId, 'info', `开始抓取网页内容: ${url}`);
    taskManager.updateProgress(taskId, 5, '正在连接目标网页...');

    const maxRetries = options?.maxRetries ?? 3;
    const timeout = options?.timeout ?? 60000;
    const verifySSL = options?.verifySSL ?? false;
    const tlsVersion = options?.tlsVersion ?? 'auto';

    let lastError: Error | null = null;

    const totalAttempts = tlsVersion === 'auto'
      ? maxRetries * this.tlsStrategies.length
      : maxRetries;

    let attemptCount = 0;

    for (let retry = 1; retry <= maxRetries; retry++) {
      const strategies = tlsVersion === 'auto'
        ? this.tlsStrategies
        : [this.getTlsStrategy(tlsVersion)];

      for (const strategy of strategies) {
        attemptCount++;

        if (taskManager.isCancelled(taskId)) {
          throw new Error('任务已取消');
        }

        try {
          taskManager.addLog(taskId, 'info', `第 ${attemptCount}/${totalAttempts} 次尝试 (${strategy.name})...`);

          const systemProxy = this.getSystemProxy(url);
          let proxyConfig = undefined;

          if (systemProxy) {
            taskManager.addLog(taskId, 'debug', `检测到系统代理: ${systemProxy}`);
            const proxy = this.parseProxyUrl(systemProxy);
            if (proxy) {
              proxyConfig = proxy;
            }
          }

          if (options?.useProxy && options?.proxyUrl) {
            taskManager.addLog(taskId, 'debug', `使用自定义代理: ${options.proxyUrl}`);
            const proxy = this.parseProxyUrl(options.proxyUrl);
            if (proxy) {
              proxyConfig = proxy;
            }
          }

          const httpsAgent = this.createHttpsAgent(strategy, verifySSL);

          const axiosConfig: AxiosRequestConfig = {
            url,
            method: 'GET',
            headers: {
              'User-Agent': this.getRandomUserAgent(),
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Cache-Control': 'max-age=0',
              'Upgrade-Insecure-Requests': '1',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'none',
              'Sec-Fetch-User': '?1',
              'Sec-Ch-Ua': '"Chromium";v="125", "Not.A/Brand";v="24"',
              'Sec-Ch-Ua-Mobile': '?0',
              'Sec-Ch-Ua-Platform': '"Windows"',
            },
            timeout,
            responseType: 'arraybuffer',
            maxRedirects: 10,
            proxy: proxyConfig,
            httpAgent: this.httpAgent,
            httpsAgent,
            withCredentials: false,
            decompress: true,
            transitional: {
              clarifyTimeoutError: true,
            },
          };

          taskManager.addLog(taskId, 'debug', `TLS配置: ${strategy.name}, 超时=${timeout}ms, SSL验证=${verifySSL ? '启用' : '禁用'}`);

          const response = await axios(axiosConfig);

          if (taskManager.isCancelled(taskId)) {
            throw new Error('任务已取消');
          }

          taskManager.updateProgress(taskId, 15, '网页内容抓取成功，正在解析...');
          taskManager.addLog(taskId, 'info', `网页抓取成功，状态码: ${response.status}`);
          taskManager.addLog(taskId, 'info', `使用TLS策略: ${strategy.name}`);

          const contentType = response.headers['content-type'] || '';
          const contentTypeStr = Array.isArray(contentType) ? contentType[0] : String(contentType);
          let html = '';

          if (contentTypeStr.includes('charset=gbk') || contentTypeStr.includes('charset=gb2312') || contentTypeStr.includes('charset=gb18030')) {
            const decoder = new TextDecoder('gbk');
            html = decoder.decode(response.data);
          } else {
            try {
              const decoder = new TextDecoder('utf-8');
              html = decoder.decode(response.data);
              if (!html || html.includes('\ufffd')) {
                throw new Error('UTF-8解码失败');
              }
            } catch {
              const decoder = new TextDecoder('gbk');
              html = decoder.decode(response.data);
            }
          }

          const $ = cheerio.load(html);
          const title = $('title').text().trim() || $('h1').first().text().trim() || '未命名文档';

          $('script, style, noscript, iframe, nav, footer, header, aside').remove();

          const textContent = $('body').text()
            .replace(/\s+/g, ' ')
            .trim();

          taskManager.addLog(taskId, 'info', `网页标题: ${title}`);
          taskManager.addLog(taskId, 'info', `提取文本长度: ${textContent.length} 字符`);

          return { html, title, textContent };

        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          const errorMessage = lastError.message;

          taskManager.addLog(taskId, 'warn', `第 ${attemptCount} 次尝试失败 (${strategy.name}): ${errorMessage}`);

          if (attemptCount < totalAttempts) {
            const delayMs = Math.min(1000 * Math.pow(1.5, attemptCount - 1), 5000);
            taskManager.addLog(taskId, 'debug', `${delayMs}ms 后进行下一次尝试...`);
            await this.delay(delayMs);
          }
        }
      }
    }

    const errorMessage = lastError?.message || '未知错误';
    taskManager.addLog(taskId, 'error', `网页抓取失败，已尝试 ${totalAttempts} 次: ${errorMessage}`);
    taskManager.addLog(taskId, 'error', '可能的原因: 网络连接问题、目标网站不可访问、TLS协议不兼容、需要代理或防火墙限制');
    taskManager.addLog(taskId, 'error', '建议: 尝试调整TLS版本配置或启用代理');

    throw new Error(`网页抓取失败: ${errorMessage}。请检查网络连接、URL地址是否正确，或尝试调整TLS配置/代理设置。`);
  }
}

export const crawlerService = new CrawlerService();