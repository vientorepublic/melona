import type { IChartData, ILikeCntList } from './types';
import axios, { isAxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { Config } from './config';

export class MelonChart {
  public async getHTML(): Promise<string> {
    try {
      const req = await axios.get<string>(Config.URL, {
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
          Referer: Config.DOMAIN + Config.URL,
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

  public async parseChart(html: string): Promise<IChartData[]> {
    const $ = cheerio.load(html);
    const body = $('body');
    const table = body.find('table > tbody');
    const chart: IChartData[] = [];
    const likeCnt = 0;
    // Parse chart table
    table.map((i, el) => {
      const tr = $(el).find('tr');
      tr.map((i, el) => {
        const rank = i + 1;
        const songNo = Number($(el).attr('data-song-no')) || 0;
        const title = $(el)
          .find(
            'td:nth-child(6) > div.wrap > div.wrap_song_info > div.rank01 > span > a',
          )
          .text()
          .trim();
        const artist = $(el)
          .find(
            'td:nth-child(6) > div.wrap > div.wrap_song_info > div.rank02 > span > a',
          )
          .text()
          .trim();
        const album = $(el)
          .find(
            'td:nth-child(7) > div.wrap > div.wrap_song_info > div.rank03 > a',
          )
          .text()
          .trim();
        const reducedAlbumImg =
          $(el).find('td:nth-child(4) > div.wrap > a > img').attr('src') || '';
        const albumImg = reducedAlbumImg.split('/melon')[0];
        chart.push({
          songNo,
          rank,
          title,
          artist,
          album,
          likeCnt,
          albumImg,
        });
      });
    });
    // Get like count data
    const songIds: number[] = [];
    chart.map((e) => {
      songIds.push(e.songNo);
    });
    const likeCntData = await this.getLikeCnt(songIds);
    chart.map((e, i) => {
      chart[i].likeCnt = likeCntData.contsLike[i].SUMMCNT;
    });
    return chart;
  }

  public async main(): Promise<void> {
    const html = await this.getHTML();
    const chart = await this.parseChart(html);
    console.log(chart);
  }
}

const melonChart = new MelonChart();
melonChart.main();
