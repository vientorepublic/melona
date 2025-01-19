// 차트 JSON 데이터 매핑
export interface ISongData {
  songNo: number;
  rank: number;
  title: string;
  artist: string;
  album: string;
  // likeCount: number;
  // albumImg: string;
}

export interface IChartData {
  songs: ISongData[];
  songIds: number[];
}

// export type LikeYN = 'Y' | 'N';

// 멜론차트 좋아요 데이터 타입 매핑
export interface ISongLikeCntData {
  CONTSID: number;
  LIKEYN: string; // Maybe type LikeYN
  SUMMCNT: number;
}

export interface ILikeCntList {
  contsLike: ISongLikeCntData[];
  httpDomain: string;
  httpsDomain: string;
  staticDomain: string;
}
