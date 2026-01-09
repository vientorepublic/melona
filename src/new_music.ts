import { HTTP, Utility } from './utility';
import * as cheerio from 'cheerio';
import { Config, ConfigOptions } from './config';
import { ISongData } from '.';

/**
 * 멜론 신곡 데이터 인터페이스
 * 기본 음원 데이터에 순서 번호와 앨범 이미지 정보가 추가됩니다.
 */
export interface INewMusicData extends ISongData {
  /** 신곡 목록에서의 순서 번호 */
  num: number;
  /** 음원 번호 (중복) */
  songNo: number;
  /** 앨범 이미지 URL */
  albumImg: string;
}

/**
 * 멜론 신곡 데이터를 가져오는 클래스
 * 최신 음원 50곡의 정보를 웹 스크래핑하여 구조화된 데이터로 반환합니다.
 *
 * @example
 * ```typescript
 * const melonNewMusic = new MelonNewMusic();
 * const newMusic = await melonNewMusic.getTable();
 * console.log(`오늘의 신곡: ${newMusic[0].title} - ${newMusic[0].artist}`);
 * ```
 */
export class MelonNewMusic {
  /** HTTP 클라이언트 인스턴스 */
  private http: HTTP;
  /** 유틸리티 인스턴스 */
  private utility: Utility;
  /** 설정 인스턴스 */
  private config: Config;

  /**
   * MelonNewMusic 인스턴스를 생성합니다.
   * @param options 선택적 설정 옵션들
   */
  constructor(options: ConfigOptions = {}) {
    this.config = new Config(options);
    this.http = new HTTP(this.config);
    this.utility = new Utility(this.config);
  }

  /**
   * 신곡 목록 HTML을 파싱하여 구조화된 데이터로 변환합니다.
   * 좋아요 수 조회도 동시에 수행됩니다.
   *
   * @param html 신곡 목록 페이지의 HTML 문자열
   * @returns 파싱된 신곡 데이터 배열
   *
   * @internal
   * 이 메서드는 내부용입니다. 대신 getTable() 메서드를 사용하세요.
   */
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
    const likeCntData = await this.utility.getLikeCnt(songIds);
    chart.map((e, i) => {
      chart[i].likeCnt = likeCntData.contsLike[i].SUMMCNT;
    });
    return chart;
  }

  /**
   * 멜론 신곡 목록 (50곡)을 가져옵니다.
   * 자동으로 HTML을 다운로드하고 파싱하여 신곡 정보를 반환합니다.
   *
   * @returns 신곡 데이터 배열 (50개 항목)
   * @throws {Error} 네트워크 오류 또는 파싱 오류 발생 시
   *
   * @example
   * ```typescript
   * const melonNewMusic = new MelonNewMusic();
   *
   * try {
   *   const newMusic = await melonNewMusic.getTable();
   *   console.log(`오늘의 신곡 ${newMusic.length}개`);
   *   newMusic.forEach((song, index) => {
   *     console.log(`${index + 1}번: ${song.title} - ${song.artist}`);
   *   });
   * } catch (error) {
   *   console.error('신곡 로드 실패:', error);
   * }
   * ```
   */
  public async getTable(): Promise<INewMusicData[]> {
    const html = await this.http.getHTML(this.config.NEW_MUSIC_URL);
    const chart = await this.parseTable(html);
    return chart;
  }
}
