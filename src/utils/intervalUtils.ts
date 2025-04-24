/**
 * Merges overlapping intervals into non-overlapping intervals
 * @param intervals Array of [start, end] intervals
 * @returns Array of merged non-overlapping intervals
 */
export const mergeIntervals = (intervals: Array<[number, number]>): Array<[number, number]> => {
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
   * Calculates total unique watched time from intervals
   * @param intervals Array of [start, end] intervals
   * @returns Total seconds watched without duplicates
   */
  export const calculateTotalWatchedTime = (intervals: Array<[number, number]>): number => {
    // First merge overlapping intervals
    const mergedIntervals = mergeIntervals(intervals);
    
    // Sum up the duration of each merged interval
    return mergedIntervals.reduce((total, [start, end]) => {
      return total + (end - start);
    }, 0);
  };
  
  /**
   * Calculates progress percentage based on watched intervals and total duration
   * @param intervals Array of [start, end] intervals
   * @param totalDuration Total video duration in seconds
   * @returns Progress percentage (0-100)
   */
  export const calculateProgressPercentage = (
    intervals: Array<[number, number]>, 
    totalDuration: number
  ): number => {
    if (!totalDuration) return 0;
    
    const totalWatched = calculateTotalWatchedTime(intervals);
    return (totalWatched / totalDuration) * 100;
  };