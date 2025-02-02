import * as cheerio from 'cheerio';
import { Config } from './config';
import { HTTP } from './utility';

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
