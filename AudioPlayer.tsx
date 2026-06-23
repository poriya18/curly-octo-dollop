import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Download, X, Share2 } from 'lucide-react';
import { TrackData } from '../types';

interface AudioPlayerProps {
  track: TrackData | null;
  onClose?: () => void;
}

export function AudioPlayer({ track, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const handleShare = async () => {
    if (!track) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: `شنیدن قطعه «${track.title}» در نماهنگ یار`,
          url: track.originalUrl || window.location.href,
        });
      }
    } catch (e) {
      console.error('Error sharing:', e);
    }
  };

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [track]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 text-white p-4 z-50 flex items-center justify-between">
      <audio
        ref={audioRef}
        src={`/api/stream?url=${encodeURIComponent(track.mediaUrl)}`}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
      />
      
      <div className="flex-1 flex items-center w-1/3 overflow-hidden">
        <div className="w-12 h-12 bg-neutral-800 rounded flex items-center justify-center mr-3 flex-shrink-0">
          <Play className="w-5 h-5 text-neutral-500" />
        </div>
        <div className="truncate">
          <h3 className="text-sm font-medium truncate" dir="rtl">{track.title}</h3>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl px-4">
        <div className="flex items-center gap-4 mb-2">
          <button className="text-neutral-400 hover:text-white transition-colors p-1">
            <SkipBack className="w-5 h-5" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" className="ml-1" />}
          </button>
          <button className="text-neutral-400 hover:text-white transition-colors p-1">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-center w-full gap-2 text-xs text-neutral-400">
          <span className="w-10 text-right">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 bg-neutral-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125"
          />
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="flex-1 flex justify-end items-center gap-4 w-1/3 pr-4">
        {navigator.share && (
          <button 
            onClick={handleShare}
            title="اشتراک گذاری"
            className="text-neutral-400 hover:text-white transition-colors p-1"
          >
            <Share2 className="w-5 h-5" />
          </button>
        )}
        <a 
          href={`/api/download?url=${encodeURIComponent(track.mediaUrl)}&title=${encodeURIComponent(track.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          title="دانلود"
          className="text-neutral-400 hover:text-white transition-colors p-1"
        >
          <Download className="w-5 h-5" />
        </a>
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-neutral-400 hover:text-white transition-colors p-1">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="w-24 h-1 bg-neutral-700 rounded-full hidden md:block">
            <div className="h-full bg-white rounded-full mx-w-full" style={{ width: isMuted ? '0%' : '80%' }}></div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-1 ml-4" title="بستن">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
