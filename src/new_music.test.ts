import { MelonNewMusic } from './new_music';

describe('MelonNewMusic', () => {
  test('array length should be 50', async () => {
    const melonNewMusic = new MelonNewMusic();
    const table = await melonNewMusic.getTable();
    expect(table).toHaveLength(50);
  });
});
