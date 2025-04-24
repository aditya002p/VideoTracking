'use client';

import React, { useState, useEffect } from 'react';
import VideoList from '../components/VideoList';
import VideoPlayer from '../components/VideoPlayer';
import { Video } from '../types';

// Mock user ID (in a real app, this would come from authentication)
const MOCK_USER_ID = 'user-123';

// Mock videos for demonstration
const SAMPLE_VIDEOS: Video[] = [
  {
    id: 'video-1',
    title: 'Introduction to JavaScript',
    description: 'Learn the basics of JavaScript programming language.',
    url: '/videos/intro-js.mp4',
    thumbnail: '/api/placeholder/400/225',
    duration: 300 // 5 minutes
  },
  {
    id: 'video-2',
    title: 'Advanced React Hooks',
    description: 'Dive deep into React Hooks and learn advanced patterns.',
    url: '/videos/react-hooks.mp4',
    thumbnail: '/api/placeholder/400/225',
    duration: 480 // 8 minutes
  },
  {
    id: 'video-3',
    title: 'CSS Grid Layout',
    description: 'Master CSS Grid layout for modern web design.',
    url: '/videos/css-grid.mp4',
    thumbnail: '/api/placeholder/400/225',
    duration: 420 // 7 minutes
  }
];

export default function Home() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // For demo purposes, use a default video
  useEffect(() => {
    // Select the first video by default
    setSelectedVideo(SAMPLE_VIDEOS[0]);
  }, []);

  return (
    <main className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Learning Platform</h1>
        <p className="text-gray-600">
          Track your progress and learn at your own pace
        </p>
      </header>

      {selectedVideo && (
        <VideoPlayer 
          videoUrl={selectedVideo.url}
          videoId={selectedVideo.id}
          userId={MOCK_USER_ID}
          videoDuration={selectedVideo.duration}
          title={selectedVideo.title}
        />
      )}

      <section className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Available Lectures</h2>
        <VideoList videos={SAMPLE_VIDEOS} />
      </section>
    </main>
  );
}