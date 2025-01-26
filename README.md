# Melona🍈

[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![stars - melonchart](https://img.shields.io/github/stars/vientorepublic/melonchart?style=social)](https://github.com/vientorepublic/melonchart)
[![forks - melonchart](https://img.shields.io/github/forks/vientorepublic/melonchart?style=social)](https://github.com/vientorepublic/melonchart)
[![npm version](https://badge.fury.io/js/melona.svg)](https://badge.fury.io/js/melona)
[![Build](https://github.com/vientorepublic/melona/actions/workflows/build.yml/badge.svg)](https://github.com/vientorepublic/melona/actions/workflows/build.yml)
[![Test](https://github.com/vientorepublic/melona/actions/workflows/test.yml/badge.svg)](https://github.com/vientorepublic/melona/actions/workflows/test.yml)

[![https://nodei.co/npm/melona.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/melona.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/melona)

![og_image](https://github.com/user-attachments/assets/fcf7f8af-3492-4b91-8ac6-9538094a65a5)

[멜론](https://www.melon.com) 음원 서비스의 여러 데이터를 JSON으로 변환하는 크롤러

## Features

<img width="1312" alt="Screenshot" src="https://github.com/user-attachments/assets/79ac4846-2364-4314-806c-63a3c3c8c043" />

- 멜론 웹 사이트의 다양한 종류의 데이터를 JSON으로 변환
  - 멜론차트 TOP100
  - 멜론 최신 음악
  - 멜론 음악 검색
  - 멜론 인기 키워드

## How to use

- 모듈 설치

```
npm install melona
```

- 멜론 음악 검색

```javascript
import { MelonSearch } from 'melona';

const melonSearch = new MelonSearch();
const data = await melonSearch.searchSong({
  query: '윤하', // 실제 검색어로 치환하세요.
  section: 'artist', // 사용 가능한 옵션: all, artist, song, album
});

console.log(data);
```

- 멜론차트 TOP100

```javascript
import { MelonChart } from 'melona';

const melonChart = new MelonChart();
const chart = await melonChart.getChart();

console.log(chart);
```

- 멜론 최신음악

```javascript
import { MelonNewMusic } from 'melona';

const melonNewMusic = new MelonNewMusic();
const table = await melonNewMusic.getTable();

console.log(table);
```

- 멜론 인기 키워드

```javascript
import { MelonKeywords } from 'melona';

const melonKeywords = new MelonKeywords();
const keywords = await melonKeywords.getKeywords();

console.log(keywords.trending); // 실시간 급상승 키워드
console.log(keywords.popular); // 인기 키워드
```

## License

MIT
