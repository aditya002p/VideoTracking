// Video-related types
export interface Video {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnail?: string;
    duration: number; // in seconds
  }
  
  // Progress tracking types
  export interface WatchedInterval {
    start: number;
    end: number;
  }
  
  export interface UpdateProgressPayload {
    user_id: string;
    video_id: string;
    intervals: WatchedInterval[];
    video_duration: number;
  }
  
  export interface ProgressResponse {
    progress_percentage: number;
    last_position: number;
  }
  
  // User-related types
  export interface User {
    id: string;
    name: string;
  }