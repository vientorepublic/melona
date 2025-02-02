import { HTTP, Utility } from './utility';
import * as cheerio from 'cheerio';
import { Config } from './config';
import { ISongData } from '.';

export interface INewMusicData extends ISongData {
  num: number;
  songNo: number;
  albumImg: string;
}

export class MelonNewMusic {
  private http: HTTP;
  constructor() {
    this.http = new HTTP();
  }

  public async parseTable(html: string): Promise<INewMusicData[]> {
    const $ = cheerio.load(html);
    const body = $('body');
    const table = body.find('table > tbody');
    const chart: INewMusicData[] = [];
    const likeCnt = 0;
    table.map((i, el) => {
      const tr = $(el).find('tr');
      tr.map((i, el) => {
        const num = i + 1;
        const songNo =
          Number(
            $(el)
              .find('td:nth-child(7) > div.wrap > button')
              .attr('data-song-no'),
          ) || 0;
        const title = $(el)
          .find(
            'td:nth-child(5) > div.wrap > div.wrap_song_info > div.rank01 > span',
          )
          .text()
          .trim();
        const artist = $(el)
          .find(
            'td:nth-child(5) > div.wrap > div.wrap_song_info > div.rank02 > span',
          )
          .text()
          .trim();
        const album = $(el)
          .find('td:nth-child(6) > div.wrap > div.wrap_song_info > div.rank03')
          .text()
          .trim();
        const reducedAlbumImg =
          $(el).find('td:nth-child(3) > div.wrap > a > img').attr('src') || '';
        const albumImg = reducedAlbumImg.split('/melon')[0];
        chart.push({
          num,
          songNo,
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

  public async getTable(): Promise<INewMusicData[]> {
    const html = await this.http.getHTML(Config.NEW_MUSIC_URL);
    const chart = await this.parseTable(html);
    return chart;
  }
}
