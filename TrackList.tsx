import { SearchResult } from '../types';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';

interface TrackListProps {
  tracks: SearchResult[];
  onPlay: (href: string) => void;
  isLoadingItem: string | null;
}

export function TrackList({ tracks, onPlay, isLoadingItem }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-neutral-500">
        <p dir="rtl">نتیجه‌ای برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 pb-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tracks.map((track, i) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          key={track.id + i}
          onClick={() => onPlay(track.href)}
          className="group relative flex flex-col bg-neutral-900 rounded-xl overflow-hidden hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800 hover:border-neutral-700 hover:shadow-2xl hover:-translate-y-1"
        >
          <div className="relative aspect-square w-full bg-neutral-800 overflow-hidden shadow-sm">
            {track.img ? (
              <img src={`/api/stream?url=${encodeURIComponent(track.img)}`} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 font-mono">
                بدون تصویر
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="absolute right-3 bottom-3 left-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                {isLoadingItem === track.href ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Play className="w-5 h-5 ml-1" fill="currentColor" />
                )}
              </div>
              <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white">
                {track.href.includes('/video/') ? 'ویدیو' : 'صوت'}
              </div>
            </div>
          </div>
          
          <div className="p-4 flex flex-col items-start text-right" dir="rtl">
            <h4 className="text-white font-medium text-sm line-clamp-2 leading-snug w-full">{track.title}</h4>
            {track.subtitle && (
              <span className="text-neutral-400 text-xs truncate mt-2 w-full block">{track.subtitle}</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
