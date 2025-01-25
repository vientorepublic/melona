import { MelonChart, MelonNewMusic, MelonSearch } from './melon';

function getRandomString(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

describe('MelonSearch', () => {
  test('array length must be 0 when no result', async () => {
    const melonSearch = new MelonSearch();
    const search = await melonSearch.searchSong({
      query: getRandomString(10),
    });
    expect(search).toHaveLength(0);
  });
});

describe('MelonChart', () => {
  test('array length must be 100', async () => {
    const melonChart = new MelonChart();
    const chart = await melonChart.getChart();
    expect(chart).toHaveLength(100);
  });
});

describe('MelonNewMusic', () => {
  test('array length must be 50', async () => {
    const melonNewMusic = new MelonNewMusic();
    const table = await melonNewMusic.getTable();
    expect(table).toHaveLength(50);
  });
});
