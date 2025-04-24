import { WatchedInterval, UpdateProgressPayload, ProgressResponse } from '../types';

// Base URL for the API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// In-memory cache for development/testing when backend is not available
let inMemoryCache: {
  [key: string]: {
    intervals: Array<[number, number]>;
    lastPosition: number;
  };
} = {};

/**
 * Merge intervals utility for in-memory storage
 */
const mergeIntervals = (intervals: Array<[number, number]>): Array<[number, number]> => {
  if (!intervals.length) return [];
  
  // Sort intervals by start time
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  
  const result: Array<[number, number]> = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const lastMerged = result[result.length - 1];
    
    // If current interval overlaps with last merged interval
    if (current[0] <= lastMerged[1]) {
      // Merge by updating end time to max of both intervals
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      // No overlap, add as a new interval
      result.push(current);
    }
  }
  
  return result;
};

/**
 * Calculate progress percentage
 */
const calculateProgress = (intervals: Array<[number, number]>, duration: number): number => {
  if (!duration) return 0;
  
  const totalWatched = intervals.reduce((sum, [start, end]) => sum + (end - start), 0);
  return (totalWatched / duration) * 100;
};

/**
 * Update progress to backend or in-memory cache
 */
export const updateProgress = async (payload: UpdateProgressPayload): Promise<ProgressResponse> => {
  try {
    // Try to update via API
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch(`${API_URL}/update_progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('API unavailable, using in-memory cache instead');
      }
    }
    
    // Fallback to in-memory cache if API fails or during SSR
    const key = `${payload.user_id}:${payload.video_id}`;
    const intervals = payload.intervals.map(i => [i.start, i.end] as [number, number]);
    
    if (!inMemoryCache[key]) {
      inMemoryCache[key] = {
        intervals,
        lastPosition: Math.max(...intervals.map(([_, end]) => end))
      };
    } else {
      const allIntervals = [...inMemoryCache[key].intervals, ...intervals];
      const merged = mergeIntervals(allIntervals);
      const lastPos = Math.max(
        inMemoryCache[key].lastPosition,
        Math.max(...intervals.map(([_, end]) => end))
      );
      
      inMemoryCache[key] = {
        intervals: merged,
        lastPosition: lastPos
      };
    }
    
    const progressPercentage = calculateProgress(inMemoryCache[key].intervals, payload.video_duration);
    
    return {
      progress_percentage: parseFloat(progressPercentage.toFixed(2)),
      last_position: inMemoryCache[key].lastPosition
    };
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

/**
 * Get progress from backend or in-memory cache
 */
export const getProgress = async (
  userId: string, 
  videoId: string, 
  duration: number
): Promise<ProgressResponse> => {
  try {
    // Try to get from API
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch(
          `${API_URL}/get_progress/${userId}/${videoId}/${duration}`
        );
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('API unavailable, using in-memory cache instead');
      }
    }
    
    // Fallback to in-memory cache
    const key = `${userId}:${videoId}`;
    
    if (!inMemoryCache[key]) {
      return {
        progress_percentage: 0,
        last_position: 0
      };
    }
    
    const progressPercentage = calculateProgress(inMemoryCache[key].intervals, duration);
    
    return {
      progress_percentage: parseFloat(progressPercentage.toFixed(2)),
      last_position: inMemoryCache[key].lastPosition
    };
  } catch (error) {
    console.error('Error getting progress:', error);
    throw error;
  }
};