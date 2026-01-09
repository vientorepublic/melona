import { HTTP, Utility } from './utility';
import { Config } from './config';

const config = new Config();
const http = new HTTP(config);
const utility = new Utility(config);

describe('getLikeCnt', () => {
  test('should be return like count', async () => {
    const data = await utility.getLikeCnt([1]);
    expect(typeof data.contsLike[0].SUMMCNT).toBe('number');
  });
});

describe('getHTML', () => {
  test('should be return string', async () => {
    const data = await http.getHTML('https://www.google.com');
    expect(typeof data).toBe('string');
  });
  test('should return an Error instance when an error occurs', () => {
    expect(async () => {
      await http.getHTML('https://www.google.com/404');
    }).rejects.toThrow(Error);
  });
});
