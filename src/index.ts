import type { IChartData, ILikeCntList } from "./types";
import axios, { isAxiosError } from "axios";
import * as cheerio from "cheerio";
import { Config } from "./config";

export class MelonChart {
  public async getHTML(): Promise<string> {
    try {
      const req = await axios.get<string>(Config.URL, {
        baseURL: Config.DOMAIN,
        headers: {
          "User-Agent": Config.USER_AGENT,
        },
      });
      return req.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        throw new Error(`Invalid response: ${err.response.status} ${err.response.statusText}`);
      } else if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error("Unknown Error");
      }
    }
  }

  public async getLikeCnt(songs: number[]): Promise<ILikeCntList> {
    try {
      const list = encodeURIComponent(songs.join(","));
      const params = new URLSearchParams();
      params.append("contsIds", list);
      const req = await axios.get<ILikeCntList>(Config.LIKE_CNT_JSON, {
        baseURL: Config.DOMAIN,
        params,
        headers: {
          "User-Agent": Config.USER_AGENT,
        },
      });
      return req.data;
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        throw new Error(`Invalid response: ${err.response.status} ${err.response.statusText}`);
      } else if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error("Unknown Error");
      }
    }
  }

  public parseChart(html: string): IChartData {
    const $ = cheerio.load(html);
    const body = $("body");
    const table = body.find("table > tbody");
    const chart: IChartData = {
      songs: [],
      songIds: [],
    };
    table.map((i, el) => {
      const tr = $(el).find("tr");
      tr.map((i, el) => {
        const rank = i + 1;
        const songNo = Number($(el).attr("data-song-no")) || 0;
        const title = $(el).find("td:nth-child(6) > div.wrap > div.wrap_song_info > div.rank01 > span > a").text().trim();
        const artist = $(el).find("td:nth-child(6) > div.wrap > div.wrap_song_info > div.rank02 > span > a").text().trim();
        const album = $(el).find("td:nth-child(7) > div.wrap > div.wrap_song_info > div.rank03 > a").text().trim();
        chart.songIds.push(songNo);
        chart.songs.push({
          songNo,
          rank,
          title,
          artist,
          album,
        });
      });
    });
    return chart;
  }

  public async main(): Promise<void> {
    const html = await this.getHTML();
    const chart = this.parseChart(html);
    const likeCnt = await this.getLikeCnt(chart.songIds);
    console.log(chart);
    console.log(likeCnt);
  }
}

const melonChart = new MelonChart();
melonChart.main();
