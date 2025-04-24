import { useState, useEffect, useCallback, useRef } from 'react';
import { updateProgress, getProgress } from '../services/progressService';
import { mergeIntervals, calculateTotalWatchedTime } from '../utils/intervalUtils';

type Interval = [number, number]; // [start, end] in seconds

const useVideoProgress = (userId: string, videoId: string, videoDuration: number) => {
  // Track progress percentage
  const [progress, setProgress] = useState<number>(0);
  // Track last position for resuming
  const [lastPosition, setLastPosition] = useState<number>(0);
  // Track intervals that user has watched
  const [watchedIntervals, setWatchedIntervals] = useState<Interval[]>([]);
  
  // Current watching interval
  const currentIntervalRef = useRef<Interval | null>(null);
  
  // Load the initial progress when the component mounts
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getProgress(userId, videoId, videoDuration);
        setProgress(data.progress_percentage);
        setLastPosition(data.last_position);
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      }
    };
    
    fetchProgress();
  }, [userId, videoId, videoDuration]);

  // Register time update during video playback
  const registerTimeUpdate = useCallback((currentTime: number) => {
    // Round to nearest second to avoid too frequent updates
    const time = Math.floor(currentTime);
    
    if (currentIntervalRef.current === null) {
      // Start a new interval
      currentIntervalRef.current = [time, time + 1];
    } else {
      // Update the end time of current interval
      currentIntervalRef.current = [currentIntervalRef.current[0], time + 1];
    }
  }, []);

  // Save progress to server
  const saveProgress = useCallback(async () => {
    // Only save if there's an active interval
    if (currentIntervalRef.current) {
      // Add the current interval to watched intervals
      const newIntervals = [...watchedIntervals, currentIntervalRef.current];
      
      // Merge overlapping intervals to get unique watched parts
      const mergedIntervals = mergeIntervals(newIntervals);
      setWatchedIntervals(mergedIntervals);

      // Reset current interval
      const lastTime = currentIntervalRef.current[1];
      currentIntervalRef.current = null;

      try {
        // Format intervals for API
        const formattedIntervals = mergedIntervals.map(([start, end]) => ({
          start,
          end
        }));

        // Update progress on server
        const response = await updateProgress({
          user_id: userId,
          video_id: videoId,
          intervals: formattedIntervals,
          video_duration: videoDuration
        });

        // Update local state with server response
        setProgress(response.progress_percentage);
        setLastPosition(response.last_position);
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }
  }, [userId, videoId, videoDuration, watchedIntervals]);

  // Return exposed values and functions
  return {
    progress,
    lastPosition,
    registerTimeUpdate,
    saveProgress,
    watchedIntervals
  };
};

export default useVideoProgress;