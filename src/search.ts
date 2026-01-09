import { HTTP, Utility } from './utility';
import type { ISongData, SearchSection } from '.';
import * as cheerio from 'cheerio';
import { Config, ConfigOptions } from './config';

/**
 * 음원 검색 매개변수 인터페이스
 */
export interface ISearchParams {
  /** 검색할 키워드 */
  query: string;
  /** 검색 대상 섹션 (전체, 아티스트, 음원, 앨범) */
  section?: SearchSection;
}

/**
 * 검색 결과 음원 데이터 인터페이스
 * 기본 음원 데이터에 검색 결과 순서 번호가 추가됩니다.
 */
export interface ISearchSong extends ISongData {
  /** 검색 결과에서의 순서 번호 */
  num: number;
}

/**
 * 멜론 음원 검색 기능을 제공하는 클래스
 * 아티스트, 음원, 앨범 등다양한 카테고리로 검색할 수 있습니다.
 *
 * @example
 * ```typescript
 * // 기본 사용
 * const melonSearch = new MelonSearch();
 * const results = await melonSearch.searchSong({ query: '윤하' });
 *
 * // 아티스트 검색
 * const artistResults = await melonSearch.searchSong({
 *   query: 'BTS',
 *   section: SearchSection.ARTIST
 * });
 * ```
 */
export class MelonSearch {
  /** HTTP 클라이언트 인스턴스 */
  private http: HTTP;
  /** 유틸리티 인스턴스 */
  private utility: Utility;
  /** 설정 인스턴스 */
  private config: Config;

  /**
   * MelonSearch 인스턴스를 생성합니다.
   * @param options 선택적 설정 옵션들
   */
  constructor(options: ConfigOptions = {}) {
    this.config = new Config(options);
    this.http = new HTTP(this.config);
    this.utility = new Utility(this.config);
  }

  /**
   * 검색 결과 HTML을 파싱하여 구조화된 데이터로 변환합니다.
   * 좋아요 수 조회도 동시에 수행됩니다.
   *
   * @param html 검색 결과 페이지의 HTML 문자열
   * @returns 파싱된 검색 결과 데이터 배열
   *
   * @internal
   * 이 메서드는 내부용입니다. 대신 searchSong() 메서드를 사용하세요.
   */
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
    const likeCntData = await this.utility.getLikeCnt(songIds);
    data.map((e, i) => {
      data[i].likeCnt = likeCntData.contsLike[i].SUMMCNT;
    });
    return data;
  }

  /**
   * 멜론에서 음원을 검색합니다.
   * 자동으로 HTML을 다운로드하고 파싱하여 검색 결과를 반환합니다.
   *
   * @param params 검색 매개변수 (키워드와 옵션 섹션)
   * @returns 검색 결과 데이터 배열
   * @throws {Error} 네트워크 오류 또는 파싱 오류 발생 시
   *
   * @example
   * ```typescript
   * const melonSearch = new MelonSearch();
   *
   * // 전체 검색
   * const allResults = await melonSearch.searchSong({ query: '윤하' });
   *
   * // 아티스트 검색
   * const artistResults = await melonSearch.searchSong({
   *   query: 'IU',
   *   section: SearchSection.ARTIST
   * });
   *
   * // 음원 검색
   * const songResults = await melonSearch.searchSong({
   *   query: '루비',
   *   section: SearchSection.SONG
   * });
   * ```
   */
  public async searchSong(params: ISearchParams): Promise<ISearchSong[]> {
    const { query, section } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (section) {
      queryParams.append('section', section);
    }
    const html = await this.http.getHTML(this.config.SEARCH_URL, queryParams);
    const data = await this.parseTable(html);
    return data;
  }
}
