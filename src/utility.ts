import { request } from 'https';
import { URL } from 'url';
import { Config } from './config';

/** 좋아요 여부 (‘Y’ 또는 ‘N’) */
export type LikeYN = 'Y' | 'N';

/**
 * 개별 음원의 좋아요 수 데이터
 */
export interface ISongLikeCntData {
  /** 콘텐츠 ID */
  CONTSID: number;
  /** 좋아요 여부 */
  LIKEYN: LikeYN;
  /** 좋아요 총 수 */
  SUMMCNT: number;
}

/**
 * 좋아요 수 조회 API의 응답 데이터
 */
export interface ILikeCntList {
  /** 음원별 좋아요 데이터 배열 */
  contsLike: ISongLikeCntData[];
  /** HTTP 도메인 */
  httpDomain: string;
  /** HTTPS 도메인 */
  httpsDomain: string;
  /** 정적 리소스 도메인 */
  staticDomain: string;
}

/** 네트워크 에러를 나타내는 인터페이스 */
interface NodeError extends Error {
  /** 에러 코드 (예: 'ECONNRESET', 'ETIMEDOUT') */
  code?: string;
}

/**
 * 안정성이 강화된 HTTP 클라이언트 클래스
 * 지수 백오프(Exponential Backoff)와 재시도 로직을 지원합니다.
 *
 * @example
 * ```typescript
 * const config = new Config();
 * const http = new HTTP(config);
 *
 * try {
 *   const html = await http.getHTML('https://www.melon.com/chart/index.htm');
 *   console.log('페이지 로드 성공');
 * } catch (error) {
 *   console.error('페이지 로드 실패:', error);
 * }
 * ```
 */
export class HTTP {
  /** 설정 인스턴스 */
  private config: Config;

  /**
   * HTTP 클라이언트를 생성합니다.
   * @param config 설정 객체
   */
  constructor(config: Config) {
    this.config = config;
  }

  /**
   * 지수 백오프 지연 시간을 계산합니다.
   * @param attempt 시도 횟수 (0부터 시작)
   * @returns 지연 시간(밀리초)
   */
  private calculateDelayMs(attempt: number): number {
    const { baseDelay, maxDelay, exponentialBase, jitter } =
      this.config.RETRY_OPTIONS;

    // 지수 백오프 계산
    let delay = baseDelay * Math.pow(exponentialBase, attempt);

    // 최대 지연 시간 제한
    delay = Math.min(delay, maxDelay);

    // Jitter 추가 (±25%)
    if (jitter) {
      const jitterAmount = delay * 0.25;
      const randomJitter = (Math.random() - 0.5) * 2 * jitterAmount;
      delay += randomJitter;
    }

    return Math.max(delay, 0);
  }

  /**
   * 에러가 재시도 가능한지 확인합니다.
   * @param error 발생한 에러
   * @param statusCode HTTP 상태 코드 (있는 경우)
   * @returns 재시도 가능 여부
   */
  private isRetryableError(error: Error, statusCode?: number): boolean {
    const { retryableStatusCodes, retryableErrors } = this.config.RETRY_OPTIONS;

    // HTTP 상태 코드 확인
    if (statusCode && retryableStatusCodes.includes(statusCode)) {
      return true;
    }

    // 에러 타입 확인
    const errorCode = (error as NodeError).code;
    if (errorCode && retryableErrors.includes(errorCode)) {
      return true;
    }

    // 타임아웃 에러 확인
    if (
      error.message.includes('timeout') ||
      error.message.includes('Request timeout')
    ) {
      return true;
    }

    return false;
  }

  /**
   * HTTP GET 요청을 수행합니다.
   * 실패 시 지수 백오프를 사용하여 자동으로 재시도합니다.
   *
   * @param url 요청할 URL (상대 경로 또는 절대 URL)
   * @param params URL 매개변수 (옵션)
   * @returns HTML 문자열을 Promise로 반환
   * @throws {Error} 모든 재시도 시도가 실패할 경우
   *
   * @example
   * ```typescript
   * // 기본 사용
   * const html = await http.getHTML('/chart/index.htm');
   *
   * // 매개변수와 함께 사용
   * const params = new URLSearchParams();
   * params.append('q', '윤하');
   * const searchHtml = await http.getHTML('/search/song/index.htm', params);
   * ```
   */
  public async getHTML(url: string, params?: URLSearchParams): Promise<string> {
    let lastError: Error | null = null;

    for (
      let attempt = 0;
      attempt <= this.config.RETRY_OPTIONS.maxRetries;
      attempt++
    ) {
      try {
        return await this._getHTML(url, params);
      } catch (error) {
        lastError = error as Error;

        // 마지막 시도이면 에러를 던짐
        if (attempt === this.config.RETRY_OPTIONS.maxRetries) {
          break;
        }

        // HTTP 응답 에러에서 상태 코드 추출
        let statusCode: number | undefined;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const statusMatch = errorMessage.match(/Invalid response: (\d+)/);
        if (statusMatch) {
          statusCode = parseInt(statusMatch[1]);
        }

        // 재시도 가능한 에러인지 확인
        if (!this.isRetryableError(lastError, statusCode)) {
          break; // 재시도 불가능한 에러는 바로 던짐
        }

        // 지수 백오프 지연 적용
        const delayMs = this.calculateDelayMs(attempt);
        console.log(
          `HTTP 요청 실패 (시도 ${attempt + 1}/${this.config.RETRY_OPTIONS.maxRetries + 1}), ${delayMs}ms 후 재시도: ${errorMessage}`,
        );

        await new Promise((resolve) => {
          const timer = setTimeout(resolve, delayMs);
          timer.unref();
        });
      }
    }

    throw lastError;
  }

  private async _getHTML(
    url: string,
    params?: URLSearchParams,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url, this.config.DOMAIN);
      if (params) {
        urlObj.search = params.toString();
      }

      const headers = {
        'User-Agent': this.config.USER_AGENT,
        ...this.config.CUSTOM_HEADERS,
      };

      const options = {
        headers,
        timeout: this.config.TIMEOUT,
      };

      const req = request(urlObj, options, (res) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          res.resume();
          req.destroy();
          reject(
            new Error(
              `Invalid response: ${res.statusCode} ${res.statusMessage}`,
            ),
          );
          return;
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(data);
        });
      });

      req.on('error', (err) => {
        req.destroy();
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }
}

/**
 * 멜론 API의 보조 기능들을 제공하는 유틸리티 클래스
 * 좋아요 수 조회 등의 기능을 포함합니다.
 */
export class Utility {
  /** 설정 인스턴스 */
  private config: Config;

  /**
   * Utility 클래스를 생성합니다.
   * @param config 설정 객체
   */
  constructor(config: Config) {
    this.config = config;
  }

  /**
   * 지수 백오프 지연 시간을 계산합니다.
   * @param attempt 시도 횟수 (0부터 시작)
   * @returns 지연 시간(밀리초)
   */
  private calculateDelayMs(attempt: number): number {
    const { baseDelay, maxDelay, exponentialBase, jitter } =
      this.config.RETRY_OPTIONS;

    let delay = baseDelay * Math.pow(exponentialBase, attempt);
    delay = Math.min(delay, maxDelay);

    if (jitter) {
      const jitterAmount = delay * 0.25;
      const randomJitter = (Math.random() - 0.5) * 2 * jitterAmount;
      delay += randomJitter;
    }

    return Math.max(delay, 0);
  }

  /**
   * 에러가 재시도 가능한지 확인합니다.
   * @param error 발생한 에러
   * @param statusCode HTTP 상태 코드 (있는 경우)
   * @returns 재시도 가능 여부
   */
  private isRetryableError(error: Error, statusCode?: number): boolean {
    const { retryableStatusCodes, retryableErrors } = this.config.RETRY_OPTIONS;

    if (statusCode && retryableStatusCodes.includes(statusCode)) {
      return true;
    }

    const errorCode = (error as NodeError).code;
    if (errorCode && retryableErrors.includes(errorCode)) {
      return true;
    }

    if (
      error.message.includes('timeout') ||
      error.message.includes('Request timeout')
    ) {
      return true;
    }

    return false;
  }

  /**
   * 음원들의 좋아요 수를 조회합니다.
   * 실패 시 지수 백오프를 사용하여 자동으로 재시도합니다.
   *
   * @param songs 좋아요 수를 조회할 음원 번호 배열
   * @returns 좋아요 데이터를 Promise로 반환
   * @throws {Error} 모든 재시도 시도가 실패할 경우
   *
   * @example
   * ```typescript
   * const songIds = [1, 2, 3];
   * const likeCntData = await utility.getLikeCnt(songIds);
   * console.log('첫 번째 음원 좋아요 수:', likeCntData.contsLike[0].SUMMCNT);
   * ```
   */
  public async getLikeCnt(songs: number[]): Promise<ILikeCntList> {
    let lastError: Error | null = null;

    for (
      let attempt = 0;
      attempt <= this.config.RETRY_OPTIONS.maxRetries;
      attempt++
    ) {
      try {
        return await this._getLikeCnt(songs);
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.config.RETRY_OPTIONS.maxRetries) {
          break;
        }

        let statusCode: number | undefined;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const statusMatch = errorMessage.match(/Invalid response: (\d+)/);
        if (statusMatch) {
          statusCode = parseInt(statusMatch[1]);
        }

        if (!this.isRetryableError(lastError, statusCode)) {
          break;
        }

        const delayMs = this.calculateDelayMs(attempt);
        console.log(
          `좋아요 수 요청 실패 (시도 ${attempt + 1}/${this.config.RETRY_OPTIONS.maxRetries + 1}), ${delayMs}ms 후 재시도: ${errorMessage}`,
        );

        await new Promise((resolve) => {
          const timer = setTimeout(resolve, delayMs);
          timer.unref();
        });
      }
    }

    throw lastError;
  }

  private async _getLikeCnt(songs: number[]): Promise<ILikeCntList> {
    return new Promise((resolve, reject) => {
      const list = songs.join(',');
      const params = new URLSearchParams();
      params.append('contsIds', list);

      const urlObj = new URL(this.config.LIKE_CNT_JSON, this.config.DOMAIN);
      urlObj.search = params.toString();

      const headers = {
        'User-Agent': this.config.USER_AGENT,
        Referer: this.config.DOMAIN + this.config.CHART_URL,
        ...this.config.CUSTOM_HEADERS,
      };

      const options = {
        headers,
        timeout: this.config.TIMEOUT,
      };

      const req = request(urlObj, options, (res) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          res.resume();
          req.destroy();
          reject(
            new Error(
              `Invalid response: ${res.statusCode} ${res.statusMessage}`,
            ),
          );
          return;
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data) as ILikeCntList;
            resolve(jsonData);
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', (err) => {
        req.destroy();
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }
}
