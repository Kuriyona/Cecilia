import type { PlaylistSummary } from "../types/common";

const RELATED_PLAYLIST =
  /<div class="cver u-cover u-cover-3">[\s\S]*?<img src="([^"]+)">[\s\S]*?<a class="sname f-fs1 s-fc0" href="([^"]+)"[^>]*>([^<]+?)<\/a>[\s\S]*?<a class="nm nm f-thide s-fc3" href="([^"]+)"[^>]*>([^<]+?)<\/a>/g;

export const parseRelatedPlaylists = (html: string): PlaylistSummary[] => {
  const playlists: PlaylistSummary[] = [];
  for (const match of html.matchAll(RELATED_PLAYLIST)) {
    const [, cover = "", playlistHref = "", name = "", userHref = "", user = ""] =
      match;
    playlists.push({
      id: Number(playlistHref.replace("/playlist?id=", "")),
      name,
      coverUrl: cover.replace(/\?param=.*$/, ""),
      creator: {
        id: Number(userHref.replace("/user/home?id=", "")),
        name: user,
      },
    });
  }
  return playlists;
};
