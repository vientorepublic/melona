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

export type LikeYN = 'Y' | 'N';

export interface ISongLikeCntData {
  CONTSID: number;
  LIKEYN: LikeYN;
  SUMMCNT: number;
}

export interface ILikeCntList {
  contsLike: ISongLikeCntData[];
  httpDomain: string;
  httpsDomain: string;
  staticDomain: string;
}

export interface INewMusicData extends ISongData {
  num: number;
  songNo: number;
  albumImg: string;
}
