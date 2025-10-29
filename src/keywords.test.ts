import { MelonKeywords } from './keywords';

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
