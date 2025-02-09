export interface Artist {
  id: string;
  nickname: string;
  normalized_nickname: string;
  firstName: string | null;
  lastName1: string | null;
  lastName2: string | null;
  avatarUrl: string | null;
  description: string | null;
  instagram_username: string | null;
  soundcloud_url: string | null;
  beatport_url: string | null;
  role: string | null;
  is_active: boolean;
}
