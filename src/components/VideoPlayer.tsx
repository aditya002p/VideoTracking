import React, { useEffect, useRef, useState } from 'react';
import ProgressBar from './ProgressBar';
import useVideoProgress from '../hooks/useVideoProgress';

interface VideoPlayerProps {
  videoUrl: string;
  videoId: string;
  userId: string;
  videoDuration: number;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  videoId,
  userId,
  videoDuration,
  title
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const {
    progress,
    lastPosition,
    registerTimeUpdate,
    saveProgress
  } = useVideoProgress(userId, videoId, videoDuration);

  // Set initial position when component mounts
  useEffect(() => {
    if (videoRef.current && lastPosition > 0) {
      videoRef.current.currentTime = lastPosition;
    }
  }, [lastPosition]);

  // Add timeupdate event listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Track when video is playing
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => {
      setIsPlaying(false);
      saveProgress(); // Save progress when paused
    };

    // Track time updates while playing
    const handleTimeUpdate = () => {
      if (isPlaying && video) {
        registerTimeUpdate(video.currentTime);
      }
    };

    // Track when video ends
    const handleEnded = () => {
      setIsPlaying(false);
      saveProgress();
    };

    // Handle seeking events to capture skipping
    const handleSeeking = () => {
      if (video && isPlaying) {
        saveProgress();
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('seeking', handleSeeking);

    // Save progress when component unmounts
    return () => {
      if (isPlaying) {
        saveProgress();
      }
      
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('seeking', handleSeeking);
    };
  }, [isPlaying, registerTimeUpdate, saveProgress]);

  // Handle window close or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isPlaying) {
        saveProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPlaying, saveProgress]);

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full rounded-lg"
          src={videoUrl}
          controls
          controlsList="nodownload"
        />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress: {progress.toFixed(2)}%</span>
          <span className="text-sm">{formatTime(lastPosition)} / {formatTime(videoDuration)}</span>
        </div>
        <ProgressBar progress={progress} />
      </div>
    </div>
  );
};

// Helper function to format time in MM:SS format
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default VideoPlayer;