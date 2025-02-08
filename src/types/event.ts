export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  imageUrl: string | null;
}

export interface LineupArtist {
  id: string;
  nickname: string;
  firstName: string | null;
  lastName1: string | null;
  lastName2: string | null;
  description: string | null;
  instagram_username: string | null;
  soundcloud_url: string | null;
  beatport_url: string | null;
  role: string | null;
  avatarUrl: string | null;
  isHeadliner: boolean;
  performanceOrder: number;
  startTime: string | null;
  endTime: string | null;
}
