import { HTTP, Utility } from './utility';
import type { ISongData } from '.';
import * as cheerio from 'cheerio';
import { Config, ConfigOptions } from './config';

/**
 * 멜론 차트 데이터 인터페이스
 * 기본 음원 데이터에 순위와 앨범 이미지 정보가 추가됩니다.
 */
export interface IChartData extends ISongData {
  /** 차트 순위 (1위부터 시작) */
  rank: number;
  /** 앨범 이미지 URL */
  albumImg: string;
}

/**
 * 멜론 차트 TOP 100 데이터를 가져오는 클래스
 * 실시간 차트 정보를 웹 스크래핑하여 구조화된 데이터로 반환합니다.
 *
 * @example
 * ```typescript
 * // 기본 사용
 * const melonChart = new MelonChart();
 * const chartData = await melonChart.getChart();
 * console.log(`차트 1위: ${chartData[0].title} - ${chartData[0].artist}`);
 *
 * // 커스텀 설정
 * const melonChart = new MelonChart({
 *   timeout: 15000,
 *   retryOptions: { maxRetries: 5 }
 * });
 * ```
 */
export class MelonChart {
  /** HTTP 클라이언트 인스턴스 */
  private http: HTTP;
  /** 유틸리티 인스턴스 */
  private utility: Utility;
  /** 설정 인스턴스 */
  private config: Config;

  /**
   * MelonChart 인스턴스를 생성합니다.
   * @param options 선택적 설정 옵션들
   */
  constructor(options: ConfigOptions = {}) {
    this.config = new Config(options);
    this.http = new HTTP(this.config);
    this.utility = new Utility(this.config);
  }

  /**
   * 멜론 차트 HTML을 파싱하여 구조화된 데이터로 변환합니다.
   * 좋아요 수 조회도 동시에 수행됩니다.
   *
   * @param html 멜론 차트 페이지의 HTML 문자열
   * @returns 파싱된 차트 데이터 배열
   *
   * @internal
   * 이 메서드는 내부용입니다. 대신 getChart() 메서드를 사용하세요.
   */
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
    const likeCntData = await this.utility.getLikeCnt(songIds);
    chart.map((e, i) => {
      chart[i].likeCnt = likeCntData.contsLike[i].SUMMCNT;
    });
    return chart;
  }

  /**
   * 멜론 차트 TOP 100 데이터를 가져옵니다.
   * 자동으로 HTML을 다운로드하고 파싱하여 음원 정보를 반환합니다.
   *
   * @returns 차트 데이터 배열 (100개 항목)
   * @throws {Error} 네트워크 오류 또는 파싱 오류 발생 시
   *
   * @example
   * ```typescript
   * const melonChart = new MelonChart();
   *
   * try {
   *   const chart = await melonChart.getChart();
   *   console.log(`오늘의 1위: ${chart[0].title}`);
   *   chart.forEach((song, index) => {
   *     console.log(`${index + 1}위: ${song.title} - ${song.artist}`);
   *   });
   * } catch (error) {
   *   console.error('차트 로드 실패:', error);
   * }
   * ```
   */
  public async getChart(): Promise<IChartData[]> {
    const html = await this.http.getHTML(this.config.CHART_URL);
    const chart = await this.parseChart(html);
    return chart;
  }
}
