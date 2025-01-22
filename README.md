# Melona🍈

[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![stars - melonchart](https://img.shields.io/github/stars/vientorepublic/melonchart?style=social)](https://github.com/vientorepublic/melonchart)
[![forks - melonchart](https://img.shields.io/github/forks/vientorepublic/melonchart?style=social)](https://github.com/vientorepublic/melonchart)

[멜론](https://www.melon.com/) 음원 서비스의 여러 데이터를 JSON으로 변환하는 Typescript 구현체

## Features

<img width="1312" alt="Screenshot" src="https://github.com/user-attachments/assets/79ac4846-2364-4314-806c-63a3c3c8c043" />

- Type-safe 코드 / 데이터 타입이 매핑된 인터페이스 제공
- 멜론 웹 사이트의 다양한 종류의 데이터를 JSON으로 변환
  - 멜론차트 TOP100
  - 멜론 최신 음악
  - 멜론 음악 검색
- 개별 음악의 좋아요 수 JSON 데이터 제공

## How to use

`src` 폴더의 `index.ts`를 참고하세요.

- 멜론 음악 검색

```javascript
const melonSearch = new MelonSearch();
const data = await melonSearch.searchSong({
  query: '윤하', // 실제 검색어로 치환하세요.
});
console.log(data);
```

- 멜론차트 TOP100

```javascript
const melonChart = new MelonChart();
const chart = await melonChart.getChart();
console.log(chart);
```

- 멜론 최신음악

```javascript
const melonNewMusic = new MelonNewMusic();
const table = await melonNewMusic.getTable();
console.log(table);
```

## License

저장소의 `LICENSE` 파일을 참고하세요.

## Give me a star please

사용하기 전에 스타 한번씩만 눌러주세요. 제게 큰 힘이 됩니다.
