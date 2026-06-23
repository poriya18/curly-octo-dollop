import { X, Share2, Download } from 'lucide-react';
import { TrackData } from '../types';

interface VideoPlayerModalProps {
  track: TrackData | null;
  onClose: () => void;
}

export function VideoPlayerModal({ track, onClose }: VideoPlayerModalProps) {
  if (!track || !track.isVideo) return null;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: `دیدن نماهنگ «${track.title}» در نماهنگ یار`,
          url: track.originalUrl || window.location.href,
        });
      }
    } catch (e) {
      console.error('Error sharing:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-800">
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {navigator.share && (
              <button 
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-neutral-800 transition-colors"
                title="اشتراک گذاری"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            <a 
              href={`/api/download?url=${encodeURIComponent(track.mediaUrl)}&title=${encodeURIComponent(track.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-neutral-800 transition-colors"
              title="دانلود"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
          <h3 className="font-medium text-lg drop-shadow-md truncate pl-4" dir="rtl">{track.title}</h3>
        </div>
        
        <video 
          controls 
          autoPlay 
          src={`/api/stream?url=${encodeURIComponent(track.mediaUrl)}`}
          className="w-full max-h-[85vh] aspect-video object-contain"
        >
        </video>
      </div>
    </div>
  );
}
