import { request } from 'https';
import { URL } from 'url';
import { Config } from './config';

export type LikeYN = 'Y' | 'N';

export interface ISongLikeCntData {
  CONTSID: number;
  LIKEYN: LikeYN;
  SUMMCNT: number;
}

export interface ILikeCntList {
  contsLike: ISongLikeCntData[];
  httpDomain: string;
  httpsDomain: string;
  staticDomain: string;
}

export class HTTP {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  public async getHTML(url: string, params?: URLSearchParams): Promise<string> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.config.RETRY_COUNT; attempt++) {
      try {
        return await this._getHTML(url, params);
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.RETRY_COUNT) {
          // Wait before retry, simple backoff
          await new Promise((resolve) => {
            const timer = setTimeout(resolve, 1000 * (attempt + 1));
            timer.unref();
          });
        }
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

export class Utility {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  public async getLikeCnt(songs: number[]): Promise<ILikeCntList> {
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
