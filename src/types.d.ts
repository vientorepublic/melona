// 차트 JSON 데이터 매핑
export interface IChartData {
  songNo: number;
  rank: number;
  title: string;
  artist: string;
  album: string;
  likeCnt: number;
  albumImg: string;
}

// export type LikeYN = 'Y' | 'N';

// 멜론차트 좋아요 데이터 타입 매핑
export interface ISongLikeCntData {
  CONTSID: number;
  LIKEYN: string; // 아마도 LikeYN 타입일 듯.
  SUMMCNT: number;
}

export interface ILikeCntList {
  contsLike: ISongLikeCntData[];
  httpDomain: string;
  httpsDomain: string;
  staticDomain: string;
}
