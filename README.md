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

```typescript
interface ConfigOptions {
  userAgent?: string; // User-Agent 헤더 (기본값: Chrome 131.0.0)
  customHeaders?: Record<string, string>; // 추가 헤더
  retryCount?: number; // 재시도 횟수 (기본값: 3)
  timeout?: number; // 타임아웃 시간(ms, 기본값: 10000)
}
```

### 예시

```javascript
const melonSearch = new MelonSearch({
  userAgent: 'MyApp/1.0',
  customHeaders: {
    'X-API-Key': 'your-api-key',
  },
  retryCount: 5,
  timeout: 15000,
});
```

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
  retryCount: 5,
  customHeaders: {
    'X-Custom-Header': 'value',
  },
});
const dataWithOptions = await melonSearchWithOptions.searchSong({
  query: '윤하',
  section: SearchSection.ARTIST,
});

console.log(data);
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

```javascript
import { MelonChart } from 'melona';

// 기본 설정 사용
const melonChart = new MelonChart();
const chart = await melonChart.getChart();

// 커스텀 설정 사용
const melonChartWithOptions = new MelonChart({
  userAgent: 'MyCustomUserAgent/1.0',
  timeout: 20000,
  retryCount: 3,
});
const chartWithOptions = await melonChartWithOptions.getChart();

console.log(chart);
```

```typescript
interface IChartData extends ISongData {
  rank: number;
  albumImg: string;
}
```

---

### getTable() => Promise<INewMusicData[]>

```javascript
import { MelonNewMusic } from 'melona';

// 기본 설정 사용
const melonNewMusic = new MelonNewMusic();
const table = await melonNewMusic.getTable();

// 커스텀 설정 사용
const melonNewMusicWithOptions = new MelonNewMusic({
  customHeaders: {
    Authorization: 'Bearer token',
  },
  timeout: 10000,
});
const tableWithOptions = await melonNewMusicWithOptions.getTable();

console.log(table);
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

```javascript
import { MelonKeywords } from 'melona';

// 기본 설정 사용
const melonKeywords = new MelonKeywords();
const keywords = await melonKeywords.getKeywords();

// 커스텀 설정 사용
const melonKeywordsWithOptions = new MelonKeywords({
  userAgent: 'CustomBot/1.0',
  retryCount: 2,
  timeout: 8000,
});
const keywordsWithOptions = await melonKeywordsWithOptions.getKeywords();

console.log(keywords.trending); // 실시간 급상승 키워드
console.log(keywords.popular); // 인기 키워드
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
