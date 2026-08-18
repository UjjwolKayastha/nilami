/**
 * Turns a pasted video link into something renderable. YouTube and Vimeo get
 * their embed players; a direct media file is played inline. Anything else is
 * rejected rather than dropped into an iframe.
 */
export type VideoEmbed =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string }
  | null;

const FILE_EXT = /\.(mp4|webm|ogg|ogv|mov)(\?.*)?$/i;

export function videoEmbed(raw: string | null | undefined): VideoEmbed {
  const value = (raw ?? "").trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const id =
      url.searchParams.get("v") ??
      (url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] : null) ??
      (url.pathname.startsWith("/embed/") ? url.pathname.split("/")[2] : null);
    return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop();
    return id && /^\d+$/.test(id)
      ? { kind: "iframe", src: `https://player.vimeo.com/video/${id}` }
      : null;
  }
  if (FILE_EXT.test(url.pathname)) return { kind: "file", src: url.toString() };

  return null;
}
