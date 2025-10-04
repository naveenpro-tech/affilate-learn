'use client';

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  publicId: string;
  onEnded?: () => void;
  onTimeUpdate?: (seconds: number) => void;
}

export default function VideoPlayer({ publicId, onEnded, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load Cloudinary Video Player script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/cloudinary-video-player@1.10.4/dist/cld-video-player.min.js';
    script.async = true;
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://unpkg.com/cloudinary-video-player@1.10.4/dist/cld-video-player.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    script.onload = () => {
      if (videoRef.current && (window as any).cloudinary) {
        try {
          playerRef.current = (window as any).cloudinary.videoPlayer(videoRef.current, {
            cloud_name: 'dihv0v8hr',
            secure: true,
            controls: true,
            fluid: true,
          });

          playerRef.current.source(publicId);

          if (onEnded) {
            playerRef.current.on('ended', onEnded);
          }
          if (onTimeUpdate) {
            playerRef.current.on('timeupdate', () => {
              try {
                const t = playerRef.current.currentTime();
                if (typeof t === 'number') onTimeUpdate(t);
              } catch (e) {
                // ignore
              }
            });
          }
        } catch (error) {
          console.error('Error initializing video player:', error);
        }
      }
    };

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (error) {
          console.error('Error disposing player:', error);
        }
      }
    };
  }, [publicId, onEnded]);

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="cld-video-player w-full"
        controls
      />
    </div>
  );
}

