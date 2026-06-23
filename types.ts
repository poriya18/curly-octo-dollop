export interface SearchResult {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  img: string;
}

export interface TrackData {
  mediaUrl: string;
  title: string;
  isVideo?: boolean;
  originalUrl?: string;
}
