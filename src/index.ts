import { MelonChart } from './melon';

async function melonChart() {
  const melonChart = new MelonChart();
  const chart = await melonChart.getChart();
  console.log('[MelonChart]', chart);
}
melonChart();

// async function melonNewMusic() {
//   const melonNewMusic = new MelonNewMusic();
//   const table = await melonNewMusic.getTable();
//   console.log('[MelonNewMusic]', table);
// }
// melonNewMusic();
