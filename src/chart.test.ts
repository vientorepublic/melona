import { MelonChart } from './chart';

describe('MelonChart', () => {
  test('array length should be 100', async () => {
    const melonChart = new MelonChart();
    const chart = await melonChart.getChart();
    expect(chart).toHaveLength(100);
  });
});
