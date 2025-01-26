import { HTTP, Utility } from './utility';
import * as cheerio from 'cheerio';
import { Config } from './config';

export interface ISongData {
  songNo: number;
  title: string;
  artist: string;
  album: string;
  likeCnt: number;
}

export type SearchSection = 'all' | 'artist' | 'song' | 'album';

export interface ISearchParams {
  query: string;
  section?: SearchSection;
}

export interface ISearchSong extends ISongData {
  num: number;
}

export interface IChartData extends ISongData {
  rank: number;
  albumImg: string;
}

export interface INewMusicData extends ISongData {
  num: number;
  songNo: number;
  albumImg: string;
}

export interface IKeyword {
  rank: number;
  keyword: string;
  rankChanges: string;
}

export interface IKeywordChart {
  trending: IKeyword[];
  popular: IKeyword[];
}

export class MelonKeywords {
  private http: HTTP;
  constructor() {
    this.http = new HTTP();
  }

  public async parseTable(html: string): Promise<IKeywordChart> {
    const $ = cheerio.load(html);
    const body = $('body');
    const content = body.find('div#side_conts > div.side_cont');
    const data: IKeywordChart = {
      trending: [],
      popular: [],
    };
    const trending = content.find('div:nth-child(2)');
    const trendingTable = trending.find('ul');
    trendingTable.map((i, el) => {
      const li = $(el).find('li');
      li.map((i, el) => {
        const rank = i + 1;
        const keyword = $(el)
          .find('div.wrap > div.cntt > div.ellipsis > a')
          .text()
          .trim();
        const rankChanges = $(el).find('div.rank > span').attr('title').trim();
        data.trending.push({
          rank,
          keyword,
          rankChanges,
        });
      });
    });
    const popular = content.find('div:nth-child(4)');
    const popularTable = popular.find('ul');
    popularTable.map((i, el) => {
      const li = $(el).find('li');
      li.map((i, el) => {
        const rank = i + 1;
        const keyword = $(el)
          .find('div.wrap > div.cntt > div.ellipsis > a')
          .text()
          .trim();
        const rankChanges = $(el).find('div.rank > span').attr('title').trim();
        data.popular.push({
          rank,
          keyword,
          rankChanges,
        });
      });
    });
    return data;
  }

  public async getKeywords(): Promise<IKeywordChart> {
    const params = new URLSearchParams();
    params.append('query', '');
    const html = await this.http.getHTML(Config.KEYWORD_CHART_URL, params);
    const data = await this.parseTable(html);
    return data;
  }
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
