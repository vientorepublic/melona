export interface ISongData {
  songNo: number;
  title: string;
  artist: string;
  album: string;
  likeCnt: number;
}

export enum SearchSection {
  ALL = 'all',
  ARTIST = 'artist',
  SONG = 'song',
  ALBUM = 'album',
}

export { MelonNewMusic } from './new_music';
export { MelonKeywords } from './keywords';
export { MelonSearch } from './search';
export { MelonChart } from './chart';
