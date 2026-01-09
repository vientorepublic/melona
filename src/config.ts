/**
 * 고급 재시도 옵션을 위한 설정 인터페이스
 * 지수 백오프(Exponential Backoff)와 Jitter를 지원합니다.
 */
export interface RetryOptions {
  /** 최대 재시도 횟수 (기본값: 3) */
  maxRetries?: number;
  /** 초기 지연 시간(ms, 기본값: 1000) */
  baseDelay?: number;
  /** 최대 지연 시간(ms, 기본값: 30000) */
  maxDelay?: number;
  /** 지수 백오프 배수 (기본값: 2) */
  exponentialBase?: number;
  /** 무작위 지연 추가 여부 (±25%, 기본값: true) */
  jitter?: boolean;
  /** 재시도할 HTTP 상태 코드 (기본값: [408, 429, 500, 502, 503, 504]) */
  retryableStatusCodes?: number[];
  /** 재시도할 네트워크 에러 타입 (기본값: ECONNRESET, ETIMEDOUT 등) */
  retryableErrors?: string[];
}

/**
 * 멜론 API 클라이언트의 전체 설정 옵션
 * @example
 * ```typescript
 * const options: ConfigOptions = {
 *   userAgent: 'MyApp/1.0',
 *   timeout: 15000,
 *   retryOptions: {
 *     maxRetries: 5,
 *     baseDelay: 2000
 *   }
 * };
 * ```
 */
export interface ConfigOptions {
  /** 사용자 에이전트 문자열 (기본값: Chrome 131.0.0) */
  userAgent?: string;
  /** 추가 HTTP 헤더들 */
  customHeaders?: Record<string, string>;
  /** 재시도 횟수 (하위 호환성용, retryOptions.maxRetries를 사용하세요) */
  retryCount?: number;
  /** 요청 타임아웃 시간(ms, 기본값: 10000) */
  timeout?: number;
  /** 고급 재시도 설정 옵션 */
  retryOptions?: RetryOptions;
}

/**
 * 멜론 API 클라이언트의 설정을 관리하는 클래스
 * URL, 헤더, 재시도 옵션 등을 포함합니다.
 *
 * @example
 * ```typescript
 * // 기본 설정 사용
 * const config = new Config();
 *
 * // 커스텀 설정 사용
 * const config = new Config({
 *   timeout: 20000,
 *   retryOptions: {
 *     maxRetries: 5,
 *     exponentialBase: 2.5
 *   }
 * });
 * ```
 */
export class Config {
  /** 멜론 웹사이트 기본 도메인 */
  public readonly DOMAIN = 'https://www.melon.com';
  /** 음악 검색 API 경로 */
  public readonly SEARCH_URL = '/search/song/index.htm';
  /** 차트 API 경로 */
  public readonly CHART_URL = '/chart/index.htm';
  /** 신곡 API 경로 */
  public readonly NEW_MUSIC_URL = '/new/index.htm';
  /** 좋아요 수 조회 API 경로 */
  public readonly LIKE_CNT_JSON = '/commonlike/getSongLike.json';
  /** 키워드 차트 API 경로 */
  public readonly KEYWORD_CHART_URL = '/search/side/keywordChart.htm';
  /** 사용자 에이전트 문자열 */
  public readonly USER_AGENT: string;
  /** 커스텀 HTTP 헤더들 */
  public readonly CUSTOM_HEADERS: Record<string, string>;
  /** 재시도 횟수 (하위 호환성) */
  public readonly RETRY_COUNT: number;
  /** 요청 타임아웃 시간(ms) */
  public readonly TIMEOUT: number;
  /** 고급 재시도 설정 옵션들 */
  public readonly RETRY_OPTIONS: Required<RetryOptions>;

  /**
   * Config 인스턴스를 생성합니다.
   * @param options 설정 옵션들
   */
  constructor(options: ConfigOptions = {}) {
    this.USER_AGENT =
      options.userAgent ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
    this.CUSTOM_HEADERS = options.customHeaders || {};
    this.RETRY_COUNT = options.retryCount || 3;
    this.TIMEOUT = options.timeout || 10000; // 10 seconds

    // 기본 재시도 옵션 설정
    this.RETRY_OPTIONS = {
      maxRetries: options.retryOptions?.maxRetries || this.RETRY_COUNT,
      baseDelay: options.retryOptions?.baseDelay || 1000, // 1초
      maxDelay: options.retryOptions?.maxDelay || 30000, // 30초
      exponentialBase: options.retryOptions?.exponentialBase || 2,
      jitter: options.retryOptions?.jitter ?? true,
      retryableStatusCodes: options.retryOptions?.retryableStatusCodes || [
        408, // Request Timeout
        429, // Too Many Requests
        500, // Internal Server Error
        502, // Bad Gateway
        503, // Service Unavailable
        504, // Gateway Timeout
      ],
      retryableErrors: options.retryOptions?.retryableErrors || [
        'ECONNRESET',
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT',
        'ECONNABORTED',
        'ENETDOWN',
        'ENETUNREACH',
        'EHOSTDOWN',
        'EHOSTUNREACH',
      ],
    };
  }
}
