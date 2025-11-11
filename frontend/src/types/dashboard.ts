export interface DashboardStats {
  totalUsers: number;
  totalSongs: number;
  pendingApproval: number;
  totalSessions: number;
}

export interface TrafficData {
  date: string;
  traffic: number;
}

export interface SongsByMood {
  mood: string | { type: string; percentage: number };
  songs: number;
}

export interface DashboardData {
  stats: DashboardStats;
  trafficData: TrafficData[];
  songsByMood: SongsByMood[];
}

