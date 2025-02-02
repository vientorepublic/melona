import { MelonChart, MelonKeywords, MelonNewMusic, MelonSearch } from './melon';
import { randomBytes } from 'crypto';

describe('MelonKeywords', () => {
  test('trending: array length should be 10', async () => {
    const melonKeywords = new MelonKeywords();
    const keywords = await melonKeywords.getKeywords();
    expect(keywords.trending).toHaveLength(10);
  });
  test('popular: array length should be 10', async () => {
    const melonKeywords = new MelonKeywords();
    const keywords = await melonKeywords.getKeywords();
    expect(keywords.popular).toHaveLength(10);
  });
});

describe('MelonSearch', () => {
  test('searchSong: array length should be 0 when no result', async () => {
    const melonSearch = new MelonSearch();
    const query = randomBytes(10).toString('hex');
    const search = await melonSearch.searchSong({
      query,
    });
    expect(search).toHaveLength(0);
  });
  test('parseTable: array length should be 0 when no result', async () => {
    const melonSearch = new MelonSearch();
    const randomStr = randomBytes(10).toString('hex');
    const table = await melonSearch.parseTable(randomStr);
    expect(table).toHaveLength(0);
  });
});

describe('MelonChart', () => {
  test('array length should be 100', async () => {
    const melonChart = new MelonChart();
    const chart = await melonChart.getChart();
    expect(chart).toHaveLength(100);
  });
});

describe('MelonNewMusic', () => {
  test('array length should be 50', async () => {
    const melonNewMusic = new MelonNewMusic();
    const table = await melonNewMusic.getTable();
    expect(table).toHaveLength(50);
  });
});
