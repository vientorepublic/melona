import { SearchSection } from '.';
import { MelonSearch } from './search';
import { randomBytes } from 'crypto';

describe('MelonSearch', () => {
  test('searchSong: array length should be 0 when no result', async () => {
    const melonSearch = new MelonSearch();
    const query = randomBytes(10).toString('hex');
    const search = await melonSearch.searchSong({
      query,
    });
    expect(search).toHaveLength(0);
  });
  test('searchSong: array length should not be 0 when result', async () => {
    const melonSearch = new MelonSearch();
    const query = '윤하';
    const search = await melonSearch.searchSong({
      section: SearchSection.ARTIST,
      query,
    });
    expect(search).not.toHaveLength(0);
  });
  test('parseTable: array length should be 0 when no result', async () => {
    const melonSearch = new MelonSearch();
    const randomStr = randomBytes(10).toString('hex');
    const table = await melonSearch.parseTable(randomStr);
    expect(table).toHaveLength(0);
  });
});
