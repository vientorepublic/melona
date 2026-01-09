import { HTTP, Utility } from './utility';
import { Config } from './config';

describe('HTTP Client with Exponential Backoff', () => {
  describe('Default Configuration Tests', () => {
    test('should set default retry options correctly', () => {
      const config = new Config();

      expect(config.RETRY_OPTIONS.maxRetries).toBe(3);
      expect(config.RETRY_OPTIONS.baseDelay).toBe(1000);
      expect(config.RETRY_OPTIONS.maxDelay).toBe(30000);
      expect(config.RETRY_OPTIONS.exponentialBase).toBe(2);
      expect(config.RETRY_OPTIONS.jitter).toBe(true);
      expect(config.RETRY_OPTIONS.retryableStatusCodes).toContain(503);
      expect(config.RETRY_OPTIONS.retryableErrors).toContain('ECONNRESET');
    });

    test('should set custom retry options correctly', () => {
      const config = new Config({
        retryOptions: {
          maxRetries: 5,
          baseDelay: 2000,
          maxDelay: 60000,
          exponentialBase: 3,
          jitter: false,
          retryableStatusCodes: [429, 500],
          retryableErrors: ['ETIMEDOUT'],
        },
      });

      expect(config.RETRY_OPTIONS.maxRetries).toBe(5);
      expect(config.RETRY_OPTIONS.baseDelay).toBe(2000);
      expect(config.RETRY_OPTIONS.maxDelay).toBe(60000);
      expect(config.RETRY_OPTIONS.exponentialBase).toBe(3);
      expect(config.RETRY_OPTIONS.jitter).toBe(false);
      expect(config.RETRY_OPTIONS.retryableStatusCodes).toEqual([429, 500]);
      expect(config.RETRY_OPTIONS.retryableErrors).toEqual(['ETIMEDOUT']);
    });

    test('should use retryCount as maxRetries for backward compatibility', () => {
      const config = new Config({
        retryCount: 7,
      });

      expect(config.RETRY_OPTIONS.maxRetries).toBe(7);
      expect(config.RETRY_COUNT).toBe(7);
    });

    test('should prioritize retryOptions over retryCount when both are present', () => {
      const config = new Config({
        retryCount: 3,
        retryOptions: {
          maxRetries: 8,
        },
      });

      expect(config.RETRY_OPTIONS.maxRetries).toBe(8);
      expect(config.RETRY_COUNT).toBe(3); // Keep existing setting
    });
  });

  describe('HTTP Client Behavior Tests', () => {
    let config: Config;
    let http: HTTP;

    beforeEach(() => {
      config = new Config({
        retryOptions: {
          maxRetries: 2,
          baseDelay: 100, // Short for testing
          maxDelay: 1000,
          exponentialBase: 2,
          jitter: false, // Disabled for testing
        },
        timeout: 5000,
      });
      http = new HTTP(config);
    });

    test('should return successful requests immediately', async () => {
      const startTime = Date.now();
      const result = await http.getHTML('https://httpbin.org/status/200');
      const elapsed = Date.now() - startTime;

      expect(typeof result).toBe('string');
      expect(elapsed).toBeLessThan(5000); // Faster than timeout
    });

    test('should fail immediately for non-retryable errors', async () => {
      await expect(
        http.getHTML('https://httpbin.org/status/404'),
      ).rejects.toThrow('Invalid response: 404');
    });

    test('should retry retryable errors for the configured number of times', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      try {
        await http.getHTML('https://httpbin.org/status/503');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Check if retry log was printed
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('HTTP 요청 실패'),
      );

      consoleSpy.mockRestore();
    }, 10000);
  });

  describe('Utility Client Behavior Tests', () => {
    let config: Config;
    let utility: Utility;

    beforeEach(() => {
      config = new Config({
        retryOptions: {
          maxRetries: 1,
          baseDelay: 100,
          jitter: false,
        },
      });
      utility = new Utility(config);
    });

    test('should work correctly for getLikeCnt', async () => {
      const data = await utility.getLikeCnt([1, 2, 3]);

      expect(data).toHaveProperty('contsLike');
      expect(Array.isArray(data.contsLike)).toBe(true);
      expect(typeof data.httpDomain).toBe('string');
    });
  });

  describe('Delay Calculation Tests', () => {
    test('should calculate exponential backoff correctly', () => {
      const config = new Config({
        retryOptions: {
          baseDelay: 1000,
          exponentialBase: 2,
          jitter: false,
        },
      });

      const http = new HTTP(config);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const calculateDelayMs = (http as any).calculateDelayMs.bind(http);

      expect(calculateDelayMs(0)).toBe(1000); // 1000 * 2^0
      expect(calculateDelayMs(1)).toBe(2000); // 1000 * 2^1
      expect(calculateDelayMs(2)).toBe(4000); // 1000 * 2^2
      expect(calculateDelayMs(3)).toBe(8000); // 1000 * 2^3
    });

    test('should limit maximum delay time', () => {
      const config = new Config({
        retryOptions: {
          baseDelay: 1000,
          maxDelay: 5000,
          exponentialBase: 2,
          jitter: false,
        },
      });

      const http = new HTTP(config);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const calculateDelayMs = (http as any).calculateDelayMs.bind(http);

      expect(calculateDelayMs(0)).toBe(1000); // 1000 * 2^0
      expect(calculateDelayMs(1)).toBe(2000); // 1000 * 2^1
      expect(calculateDelayMs(2)).toBe(4000); // 1000 * 2^2
      expect(calculateDelayMs(3)).toBe(5000); // Limited by maxDelay
      expect(calculateDelayMs(4)).toBe(5000); // Limited by maxDelay
    });

    test('should apply jitter correctly', () => {
      const config = new Config({
        retryOptions: {
          baseDelay: 1000,
          exponentialBase: 1,
          jitter: true,
        },
      });

      const http = new HTTP(config);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const calculateDelayMs = (http as any).calculateDelayMs.bind(http);

      const delays = [];
      for (let i = 0; i < 10; i++) {
        delays.push(calculateDelayMs(0));
      }

      // Values should differ due to jitter
      const uniqueValues = new Set(delays);
      expect(uniqueValues.size).toBeGreaterThan(1);

      // All values should be within ±25% of base delay time
      delays.forEach((delay) => {
        expect(delay).toBeGreaterThanOrEqual(750); // 1000 * 0.75
        expect(delay).toBeLessThanOrEqual(1250); // 1000 * 1.25
      });
    });
  });

  describe('Error Classification Tests', () => {
    test('should identify retryable status codes correctly', () => {
      const config = new Config({
        retryOptions: {
          retryableStatusCodes: [503, 504],
        },
      });

      const http = new HTTP(config);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isRetryableError = (http as any).isRetryableError.bind(http);

      const error503 = new Error('Invalid response: 503 Service Unavailable');
      const error404 = new Error('Invalid response: 404 Not Found');

      expect(isRetryableError(error503, 503)).toBe(true);
      expect(isRetryableError(error404, 404)).toBe(false);
    });

    test('should identify retryable network errors correctly', () => {
      const config = new Config({
        retryOptions: {
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
        },
      });

      const http = new HTTP(config);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isRetryableError = (http as any).isRetryableError.bind(http);

      const networkError = Object.assign(new Error('Connection reset'), {
        code: 'ECONNRESET',
      });
      const timeoutError = Object.assign(new Error('Request timeout'), {
        code: 'ETIMEDOUT',
      });
      const otherError = Object.assign(new Error('Other error'), {
        code: 'EOTHER',
      });

      expect(isRetryableError(networkError)).toBe(true);
      expect(isRetryableError(timeoutError)).toBe(true);
      expect(isRetryableError(otherError)).toBe(false);
    });

    test('should identify retryable errors by timeout message', () => {
      const config = new Config();
      const http = new HTTP(config);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isRetryableError = (http as any).isRetryableError.bind(http);

      const timeoutError1 = new Error('Request timeout');
      const timeoutError2 = new Error('Connection timeout occurred');
      const normalError = new Error('Normal error');

      expect(isRetryableError(timeoutError1)).toBe(true);
      expect(isRetryableError(timeoutError2)).toBe(true);
      expect(isRetryableError(normalError)).toBe(false);
    });
  });
});
