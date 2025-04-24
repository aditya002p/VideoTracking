import React from 'react';
import Link from 'next/link';
import { Video } from '../types';

interface VideoListProps {
  videos: Video[];
}

const VideoList: React.FC<VideoListProps> = ({ videos }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div 
          key={video.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative pb-[56.25%]">
            <img 
              src={video.thumbnail || `/api/placeholder/400/225`} 
              alt={video.title}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-2">{video.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{video.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{formatDuration(video.duration)}</span>
              <Link 
                href={`/video/${video.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Watch Now
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to format duration in minutes and seconds
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default VideoList;