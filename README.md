# Melona🍈 - 멜론 API 비공식 구현

[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![stars - melonchart](https://img.shields.io/github/stars/vientorepublic/melonchart?style=social)](https://github.com/vientorepublic/melonchart)
[![forks - melonchart](https://img.shields.io/github/forks/vientorepublic/melonchart?style=social)](https://github.com/vientorepublic/melonchart)
[![npm version](https://badge.fury.io/js/melona.svg)](https://badge.fury.io/js/melona)
[![Build](https://github.com/vientorepublic/melona/actions/workflows/build.yml/badge.svg)](https://github.com/vientorepublic/melona/actions/workflows/build.yml)
[![Test](https://github.com/vientorepublic/melona/actions/workflows/test.yml/badge.svg)](https://github.com/vientorepublic/melona/actions/workflows/test.yml)

[![https://nodei.co/npm/melona.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/melona.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/melona)

![og_image](https://github.com/user-attachments/assets/fcf7f8af-3492-4b91-8ac6-9538094a65a5)

[멜론](https://www.melon.com) 음원 서비스의 여러 데이터를 쉽게 스크래핑 할 수 있는 API 입니다.

---

## 📖 Table of Contents

- [Features](#features)
- [Install](#install)
- [Configuration](#configuration)
- [Base Types](#base-types)
- [API Methods](#api-methods)
  - [searchSong](#searchsongparams-isearchparams--promiseisearchsong)
  - [getChart](#getchart--promiseichartdata)
  - [getTable](#gettable--promisenewmusicdata)
  - [getKeywords](#getkeywords--promiseikeywordchart)
- [License](#license)

---

## Features

<img width="1312" alt="Screenshot" src="https://github.com/user-attachments/assets/79ac4846-2364-4314-806c-63a3c3c8c043" />

- 멜론 웹 사이트의 다양한 종류의 데이터를 JSON으로 변환:
  - 멜론차트 TOP100
  - 멜론 최신 음악
  - 멜론 음악 검색
  - 멜론 인기 키워드
- 비동기(async/await) 지원
- 내장 타입 선언(d.ts) 제공
- 커스텀 HTTP 설정 지원:
  - User-Agent 설정
  - 커스텀 헤더 추가
  - 재시도 횟수 설정
  - 타임아웃 시간 설정

---

## Install

```bash
npm install melona
```

---

## Configuration

각 클래스 생성 시 옵션을 전달하여 HTTP 클라이언트의 동작을 커스터마이징할 수 있습니다.

### 기본 설정 옵션

```typescript
interface ConfigOptions {
  userAgent?: string; // User-Agent 헤더 (기본값: Chrome 131.0.0)
  customHeaders?: Record<string, string>; // 추가 헤더
  retryCount?: number; // 재시도 횟수 (기본값: 3) - 하위 호환용
  timeout?: number; // 타임아웃 시간(ms, 기본값: 10000)
  retryOptions?: RetryOptions; // 고급 재시도 설정
}
```

### 고급 재시도 옵션 (지수 백오프)

```typescript
interface RetryOptions {
  maxRetries?: number; // 최대 재시도 횟수 (기본값: 3)
  baseDelay?: number; // 초기 지연 시간(ms, 기본값: 1000)
  maxDelay?: number; // 최대 지연 시간(ms, 기본값: 30000)
  exponentialBase?: number; // 지수 백오프 배수 (기본값: 2)
  jitter?: boolean; // 무작위 지연 추가 여부 (기본값: true)
  retryableStatusCodes?: number[]; // 재시도할 HTTP 상태 코드
  retryableErrors?: string[]; // 재시도할 에러 타입
}
```

### 예시

#### 기본 설정

```javascript
const melonSearch = new MelonSearch({
  userAgent: 'MyApp/1.0',
  timeout: 15000,
  retryCount: 5, // 간단한 재시도 설정
});
```

#### 고급 지수 백오프 설정

```javascript
const melonChart = new MelonChart({
  retryOptions: {
    maxRetries: 5, // 최대 5번 재시도
    baseDelay: 1500, // 1.5초 기본 지연
    maxDelay: 60000, // 최대 60초까지 지연
    exponentialBase: 2.5, // 지연 시간이 2.5배씩 증가
    jitter: true, // ±25% 무작위 지연으로 서버 부하 분산
    retryableStatusCodes: [429, 500, 502, 503, 504], // 특정 상태 코드만 재시도
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT'], // 특정 네트워크 에러만 재시도
  },
  timeout: 20000,
  customHeaders: {
    'X-API-Key': 'your-api-key',
  },
});
```

#### 프로덕션 환경용 안정성 설정

```javascript
const robustMelonSearch = new MelonSearch({
  retryOptions: {
    maxRetries: 10, // 높은 재시도 횟수
    baseDelay: 2000, // 긴 초기 지연
    maxDelay: 120000, // 최대 2분 지연
    exponentialBase: 3, // 큰 지수 백오프
    jitter: true,
    retryableStatusCodes: [
      408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524,
    ],
  },
  timeout: 30000, // 긴 타임아웃
});
```

#### 개발 환경용 빠른 설정

```javascript
const fastMelonKeywords = new MelonKeywords({
  retryOptions: {
    maxRetries: 2, // 적은 재시도 횟수
    baseDelay: 500, // 짧은 초기 지연
    maxDelay: 2000, // 짧은 최대 지연
    jitter: false, // 정확한 지연 시간
  },
  timeout: 5000, // 짧은 타임아웃
});
```

### 재시도 작동 방식

1. **지수 백오프**: 실패할 때마다 지연 시간이 exponentialBase 배수만큼 증가
   - 1번째 재시도: baseDelay ms 후
   - 2번째 재시도: baseDelay \* exponentialBase ms 후
   - 3번째 재시도: baseDelay \* exponentialBase^2 ms 후

2. **Jitter**: 무작위 지연(±25%)으로 동시 재시도 방지

3. **조건부 재시도**: 특정 HTTP 상태 코드와 에러 타입만 재시도

4. **최대 지연 제한**: maxDelay를 넘지 않도록 제한

---

## Base Types

```typescript
interface ISongData {
  songNo: number;
  title: string;
  artist: string;
  album: string;
  likeCnt: number;
}
```

---

## API Methods

### searchSong(params: ISearchParams) => Promise<ISearchSong[]>

**멜론에서 음원을 검색하는 메서드입니다.**

- **기능**: 키워드를 통해 음원, 아티스트, 앨범을 검색할 수 있습니다.
- **검색 범위**: 전체, 아티스트, 음원, 앨범별 검색 지원
- **반환 데이터**: 검색된 음원의 상세 정보 (제목, 아티스트, 앨범, 좋아요 수 포함)
- **자동 기능**: 좋아요 수 조회가 자동으로 포함됩니다.

```javascript
import { MelonSearch, SearchSection } from 'melona';

// 기본 설정 사용
const melonSearch = new MelonSearch();
const data = await melonSearch.searchSong({
  query: '윤하', // 실제 검색어로 치환하세요.
  section: SearchSection.ARTIST, // ALL, ARTIST, SONG, ALBUM
});

// 커스텀 설정 사용
const melonSearchWithOptions = new MelonSearch({
  userAgent: 'MyCustomUserAgent/1.0',
  timeout: 15000,
  retryOptions: {
    maxRetries: 5,
    baseDelay: 1000,
  },
  customHeaders: {
    'X-Custom-Header': 'value',
  },
});
const dataWithOptions = await melonSearchWithOptions.searchSong({
  query: '윤하',
  section: SearchSection.ARTIST,
});

console.log(`검색 결과: ${data.length}개`);
data.forEach((song, index) => {
  console.log(
    `${song.num}. ${song.title} - ${song.artist} (♡ ${song.likeCnt})`,
  );
});
```

```typescript
export enum SearchSection {
  ALL = 'all',
  ARTIST = 'artist',
  SONG = 'song',
  ALBUM = 'album',
}

interface ISearchParams {
  query: string;
  section?: SearchSection;
}

interface ISearchSong extends ISongData {
  num: number;
}
```

---

### getChart() => Promise<IChartData[]>

**멜론 차트 TOP 100 데이터를 가져오는 메서드입니다.**

- **기능**: 실시간 멜론 차트 순위 1위~100위 정보를 제공합니다.
- **포함 데이터**: 순위, 음원 정보, 앨범 이미지 URL, 좋아요 수
- **자동 기능**: 각 음원의 좋아요 수가 자동으로 조회됩니다.

```javascript
import { MelonChart } from 'melona';

// 기본 설정 사용
const melonChart = new MelonChart();
const chart = await melonChart.getChart();

// 커스텀 설정 사용 (안정성 강화)
const melonChartWithOptions = new MelonChart({
  userAgent: 'MyCustomUserAgent/1.0',
  timeout: 20000,
  retryOptions: {
    maxRetries: 5,
    baseDelay: 2000,
    exponentialBase: 2,
  },
});
const chartWithOptions = await melonChartWithOptions.getChart();

// 차트 데이터 활용 예시
console.log(`오늘의 1위: ${chart[0].title} - ${chart[0].artist}`);
console.log(`총 ${chart.length}개의 차트 데이터`);

// 상위 10위까지 출력
chart.slice(0, 10).forEach((song) => {
  console.log(
    `${song.rank}위: ${song.title} - ${song.artist} (♡ ${song.likeCnt})`,
  );
});
```

```typescript
interface IChartData extends ISongData {
  rank: number;
  albumImg: string;
}
```

---

### getTable() => Promise<INewMusicData[]>

**멜론 최신 음악 50곡 데이터를 가져오는 메서드입니다.**

- **기능**: 최근 발매된 신곡 50개의 상세 정보를 제공합니다.
- **포함 데이터**: 순서 번호, 음원 정보, 앨범 이미지 URL, 좋아요 수
- **활용**: 최신 트렌드 파악, 신곡 발견, 음악 추천 서비스 등

```javascript
import { MelonNewMusic } from 'melona';

// 기본 설정 사용
const melonNewMusic = new MelonNewMusic();
const table = await melonNewMusic.getTable();

// 커스텀 설정 사용 (헤더 인증 추가)
const melonNewMusicWithOptions = new MelonNewMusic({
  customHeaders: {
    Authorization: 'Bearer token',
    'X-Client-Version': '1.0.0',
  },
  timeout: 10000,
  retryOptions: {
    maxRetries: 3,
    jitter: false,
  },
});
const tableWithOptions = await melonNewMusicWithOptions.getTable();

// 신곡 데이터 활용 예시
console.log(`오늘의 신곡 ${table.length}개 로드 완료`);
console.log(`첫 번째 신곡: ${table[0].title} - ${table[0].artist}`);

// 인기 신곡 (좋아요 수 기준 상위 5곡)
const popularNewSongs = table.sort((a, b) => b.likeCnt - a.likeCnt).slice(0, 5);

console.log('인기 신곡 TOP 5:');
popularNewSongs.forEach((song, index) => {
  console.log(
    `${index + 1}. ${song.title} - ${song.artist} (♡ ${song.likeCnt})`,
  );
});
```

```typescript
interface INewMusicData extends ISongData {
  num: number;
  songNo: number;
  albumImg: string;
}
```

---

### getKeywords() => Promise\<IKeywordChart>

**멜론 인기 키워드 차트를 가져오는 메서드입니다.**

- **기능**: 실시간 급상승 키워드와 인기 키워드 각각 10개씩 제공
- **포함 데이터**: 키워드 순위, 키워드명, 순위 변동 정보 (상승/하락/신규/유지)

```javascript
import { MelonKeywords } from 'melona';

// 기본 설정 사용
const melonKeywords = new MelonKeywords();
const keywords = await melonKeywords.getKeywords();

// 커스텀 설정 사용 (빠른 응답 최적화)
const melonKeywordsWithOptions = new MelonKeywords({
  userAgent: 'TrendAnalyzer/1.0',
  retryOptions: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 2000,
  },
  timeout: 8000,
});
const keywordsWithOptions = await melonKeywordsWithOptions.getKeywords();

// 키워드 데이터 활용 예시
console.log('🔥 실시간 급상승 키워드:');
keywords.trending.forEach((keyword, index) => {
  const changeIcon = keyword.rankChanges.includes('상승')
    ? '↗️'
    : keyword.rankChanges.includes('하락')
      ? '↘️'
      : keyword.rankChanges.includes('신규')
        ? '🆕'
        : '➖';
  console.log(`${keyword.rank}위: ${keyword.keyword} ${changeIcon}`);
});

console.log('\n⭐ 인기 키워드:');
keywords.popular.forEach((keyword, index) => {
  console.log(`${keyword.rank}위: ${keyword.keyword} (${keyword.rankChanges})`);
});

// 키워드 기반 검색 연동 예시
const trendingKeyword = keywords.trending[0].keyword;
console.log(`\n"${trendingKeyword}" 관련 음원 검색 중...`);
// 이후 searchSong 메서드와 연동 가능
```

```typescript
interface IKeyword {
  rank: number;
  keyword: string;
  rankChanges: string;
}
interface IKeywordChart {
  trending: IKeyword[];
  popular: IKeyword[];
}
```

---

## License

MIT
