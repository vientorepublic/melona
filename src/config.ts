export interface ConfigOptions {
  userAgent?: string;
  customHeaders?: Record<string, string>;
  retryCount?: number;
  timeout?: number;
}

export class Config {
  public readonly DOMAIN = 'https://www.melon.com';
  public readonly SEARCH_URL = '/search/song/index.htm';
  public readonly CHART_URL = '/chart/index.htm';
  public readonly NEW_MUSIC_URL = '/new/index.htm';
  public readonly LIKE_CNT_JSON = '/commonlike/getSongLike.json';
  public readonly KEYWORD_CHART_URL = '/search/side/keywordChart.htm';
  public readonly USER_AGENT: string;
  public readonly CUSTOM_HEADERS: Record<string, string>;
  public readonly RETRY_COUNT: number;
  public readonly TIMEOUT: number;

  constructor(options: ConfigOptions = {}) {
    this.USER_AGENT =
      options.userAgent ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
    this.CUSTOM_HEADERS = options.customHeaders || {};
    this.RETRY_COUNT = options.retryCount || 3;
    this.TIMEOUT = options.timeout || 10000; // 10 seconds
  }
}
