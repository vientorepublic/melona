import { HTTP, Utility } from './utility';
import type { ISongData } from '.';
import * as cheerio from 'cheerio';
import { Config } from './config';

export interface IChartData extends ISongData {
  rank: number;
  albumImg: string;
}

export class MelonChart {
  private http: HTTP;
  constructor() {
    this.http = new HTTP();
  }

  public async parseChart(html: string): Promise<IChartData[]> {
    const $ = cheerio.load(html);
    const body = $('body');
    const table = body.find('table > tbody');
    const chart: IChartData[] = [];
    const likeCnt = 0;
    table.map((i, el) => {
      const tr = $(el).find('tr');
      tr.map((i, el) => {
        const rank = i + 1;
        const songNo = Number($(el).attr('data-song-no')) || 0;
        const title = $(el)
          .find(
            'td:nth-child(6) > div.wrap > div.wrap_song_info > div.rank01 > span',
          )
          .text()
          .trim();
        const artist = $(el)
          .find(
            'td:nth-child(6) > div.wrap > div.wrap_song_info > div.rank02 > span',
          )
          .text()
          .trim();
        const album = $(el)
          .find('td:nth-child(7) > div.wrap > div.wrap_song_info > div.rank03')
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
    const songIds: number[] = [];
    chart.map((e) => {
      songIds.push(e.songNo);
    });
    const utility = new Utility();
    const likeCntData = await utility.getLikeCnt(songIds);
    chart.map((e, i) => {
      chart[i].likeCnt = likeCntData.contsLike[i].SUMMCNT;
    });
    return chart;
  }

  public async getChart(): Promise<IChartData[]> {
    const html = await this.http.getHTML(Config.CHART_URL);
    const chart = await this.parseChart(html);
    return chart;
  }
}
