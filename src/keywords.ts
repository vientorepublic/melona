import * as cheerio from 'cheerio';
import { Config, ConfigOptions } from './config';
import { HTTP } from './utility';

/**
 * 개별 키워드 정보 인터페이스
 */
export interface IKeyword {
  /** 키워드 순위 (1위부터 시작) */
  rank: number;
  /** 키워드 문자열 */
  keyword: string;
  /** 순위 변동 정보 (예: '상승', '하락', '신규' 등) */
  rankChanges: string;
}

/**
 * 멜론 키워드 차트 데이터 인터페이스
 * 실시간 급상승 키워드와 인기 키워드를 포함합니다.
 */
export interface IKeywordChart {
  /** 실시간 급상승 키워드 TOP 10 */
  trending: IKeyword[];
  /** 인기 키워드 TOP 10 */
  popular: IKeyword[];
}

/**
 * 멜론 인기 키워드 데이터를 가져오는 클래스
 * 실시간 급상승 키워드와 인기 키워드를 웹 스크래핑하여 반환합니다.
 *
 * @example
 * ```typescript
 * const melonKeywords = new MelonKeywords();
 * const keywords = await melonKeywords.getKeywords();
 * console.log('오늘의 트렌딩 키워드:', keywords.trending[0].keyword);
 * ```
 */
export class MelonKeywords {
  /** HTTP 클라이언트 인스턴스 */
  private http: HTTP;
  /** 설정 인스턴스 */
  private config: Config;

  /**
   * MelonKeywords 인스턴스를 생성합니다.
   * @param options 선택적 설정 옵션들
   */
  constructor(options: ConfigOptions = {}) {
    this.config = new Config(options);
    this.http = new HTTP(this.config);
  }

  /**
   * 키워드 차트 HTML을 파싱하여 구조화된 데이터로 변환합니다.
   *
   * @param html 키워드 차트 페이지의 HTML 문자열
   * @returns 파싱된 키워드 차트 데이터
   *
   * @internal
   * 이 메서드는 내부용입니다. 대신 getKeywords() 메서드를 사용하세요.
   */
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

  /**
   * 멜론 인기 키워드 차트를 가져옵니다.
   * 실시간 급상승 키워드 10개와 인기 키워드 10개를 반환합니다.
   *
   * @returns 키워드 차트 데이터
   * @throws {Error} 네트워크 오류 또는 파싱 오류 발생 시
   *
   * @example
   * ```typescript
   * const melonKeywords = new MelonKeywords();
   *
   * try {
   *   const keywords = await melonKeywords.getKeywords();
   *
   *   console.log('실시간 급상승 키워드:');
   *   keywords.trending.forEach((keyword, index) => {
   *     console.log(`${index + 1}위: ${keyword.keyword} (${keyword.rankChanges})`);
   *   });
   *
   *   console.log('인기 키워드:');
   *   keywords.popular.forEach((keyword, index) => {
   *     console.log(`${index + 1}위: ${keyword.keyword} (${keyword.rankChanges})`);
   *   });
   * } catch (error) {
   *   console.error('키워드 로드 실패:', error);
   * }
   * ```
   */
  public async getKeywords(): Promise<IKeywordChart> {
    const params = new URLSearchParams();
    params.append('query', '');
    const html = await this.http.getHTML(this.config.KEYWORD_CHART_URL, params);
    const data = await this.parseTable(html);
    return data;
  }
}
