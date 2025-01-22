import { MelonSearch } from './melon';

// async function melonChart() {
//   const melonChart = new MelonChart();
//   const chart = await melonChart.getChart();
//   console.log('[MelonChart]', chart);
// }
// melonChart();

// async function melonNewMusic() {
//   const melonNewMusic = new MelonNewMusic();
//   const table = await melonNewMusic.getTable();
//   console.log('[MelonNewMusic]', table);
// }
// melonNewMusic();

async function melonSearch() {
  const melonSearch = new MelonSearch();
  const data = await melonSearch.searchSong({
    query: '윤하',
    section: 'song',
  });
  console.log(data);
}
melonSearch();
