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
  public async getHTML(url: string, params?: URLSearchParams): Promise<string> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url, Config.DOMAIN);
      if (params) {
        urlObj.search = params.toString();
      }

      const options = {
        headers: {
          'User-Agent': Config.USER_AGENT,
        },
      };

      const req = request(urlObj, options, (res) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
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
        reject(err);
      });

      req.end();
    });
  }
}

export class Utility {
  public async getLikeCnt(songs: number[]): Promise<ILikeCntList> {
    return new Promise((resolve, reject) => {
      const list = songs.join(',');
      const params = new URLSearchParams();
      params.append('contsIds', list);

      const urlObj = new URL(Config.LIKE_CNT_JSON, Config.DOMAIN);
      urlObj.search = params.toString();

      const options = {
        headers: {
          'User-Agent': Config.USER_AGENT,
          Referer: Config.DOMAIN + Config.CHART_URL,
        },
      };

      const req = request(urlObj, options, (res) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
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
        reject(err);
      });

      req.end();
    });
  }
}
