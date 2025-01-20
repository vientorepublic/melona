import axios, { isAxiosError } from 'axios';
import type { ILikeCntList } from './types';
import { Config } from './config';

export class HTTP {
  public async getHTML(url: string): Promise<string> {
    try {
      const req = await axios.get<string>(url, {
        baseURL: Config.DOMAIN,
        headers: {
          'User-Agent': Config.USER_AGENT,
        },
      });
      return req.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        throw new Error(
          `Invalid response: ${err.response.status} ${err.response.statusText}`,
        );
      } else if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown Error');
      }
    }
  }
}

export class Utility {
  public async getLikeCnt(songs: number[]): Promise<ILikeCntList> {
    try {
      const list = songs.join(',');
      const params = new URLSearchParams();
      params.append('contsIds', list);
      const req = await axios.get<ILikeCntList>(Config.LIKE_CNT_JSON, {
        baseURL: Config.DOMAIN,
        params,
        headers: {
          'User-Agent': Config.USER_AGENT,
          Referer: Config.DOMAIN + Config.CHART_URL,
        },
      });
      return req.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        throw new Error(
          `Invalid response: ${err.response.status} ${err.response.statusText}`,
        );
      } else if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown Error');
      }
    }
  }
}
