import { HTTP, Utility } from './utility';
import type { ISongData } from '.';
import * as cheerio from 'cheerio';
import { Config } from './config';

export enum SearchSection {
  ALL = 'all',
  ARTIST = 'artist',
  SONG = 'song',
  ALBUM = 'album',
}

export interface ISearchParams {
  query: string;
  section?: SearchSection;
}

export interface ISearchSong extends ISongData {
  num: number;
}

export class MelonSearch {
  private http: HTTP;
  constructor() {
    this.http = new HTTP();
  }

  public async parseTable(html: string): Promise<ISearchSong[]> {
    const $ = cheerio.load(html);
    const body = $('body');
    const table = body.find('table > tbody');
    const data: ISearchSong[] = [];
    const likeCnt = 0;
    table.map((i, el) => {
      const tr = $(el).find('tr');
      tr.map((i, el) => {
        const num = i + 1;
        const songNo =
          Number(
            $(el)
              .find('td:nth-child(6) > div.wrap > button')
              .attr('data-song-no'),
          ) || 0;
        const title = $(el)
          .find('td:nth-child(3) > div.wrap > div.ellipsis > a.fc_gray')
          .text()
          .trim();
        const artist = $(el)
          .find('td:nth-child(4) > div.wrap > div#artistName > span')
          .text()
          .trim();
        const album = $(el)
          .find('td:nth-child(5) > div.wrap > div.ellipsis')
          .text()
          .trim();
        data.push({
          num,
          songNo,
          title,
          artist,
          album,
          likeCnt,
        });
      });
    });
    const songIds: number[] = [];
    data.map((e) => {
      songIds.push(e.songNo);
    });
    const utility = new Utility();
    const likeCntData = await utility.getLikeCnt(songIds);
    data.map((e, i) => {
      data[i].likeCnt = likeCntData.contsLike[i].SUMMCNT;
    });
    return data;
  }

  public async searchSong(params: ISearchParams): Promise<ISearchSong[]> {
    const { query, section } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (section) {
      queryParams.append('section', section);
    }
    const html = await this.http.getHTML(Config.SEARCH_URL, queryParams);
    const data = await this.parseTable(html);
    return data;
  }
}
