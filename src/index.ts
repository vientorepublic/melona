/**
 * 기본 음원 데이터 인터페이스
 * 모든 멜론 음원 데이터의 공통 속성들을 정의합니다.
 */
export interface ISongData {
  /** 음원 고유 번호 */
  songNo: number;
  /** 음원 제목 */
  title: string;
  /** 아티스트명 */
  artist: string;
  /** 앨범명 */
  album: string;
  /** 좋아요 수 */
  likeCnt: number;
}

/**
 * 음원 검색 섹션 열거형
 * 검색 대상을 지정할 때 사용합니다.
 */
export enum SearchSection {
  /** 전체 검색 */
  ALL = 'all',
  /** 아티스트 검색 */
  ARTIST = 'artist',
  /** 음원 검색 */
  SONG = 'song',
  /** 앨범 검색 */
  ALBUM = 'album',
}

// Configuration types export
export type { ConfigOptions, RetryOptions } from './config';
export { Config } from './config';

// Main classes export
export { MelonNewMusic } from './new_music';
export { MelonKeywords } from './keywords';
export { MelonSearch } from './search';
export { MelonChart } from './chart';

// Utility classes export (for advanced usage)
export { HTTP, Utility } from './utility';
export type { ILikeCntList, ISongLikeCntData, LikeYN } from './utility';
