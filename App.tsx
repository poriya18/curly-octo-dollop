import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { TrackList } from './components/TrackList';
import { AudioPlayer } from './components/AudioPlayer';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { SearchResult, TrackData } from './types';
import { Music, Disc3 } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<TrackData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const executeSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      setHasSearched(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => executeSearch(query);

  const handlePlay = async (href: string) => {
    try {
      setIsLoadingTrack(href);
      const res = await fetch(`/api/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ href })
      });
      const data = await res.json();
      if (data.mediaUrl) {
        setCurrentTrack({
          mediaUrl: data.mediaUrl,
          title: data.title || 'در حال پخش...',
          isVideo: data.isVideo,
          originalUrl: href
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTrack(null);
    }
  };

  const handleClosePlayer = () => setCurrentTrack(null);

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-200 font-sans selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#09090b] to-[#09090b] pointer-events-none"></div>

      <header className="relative w-full max-w-5xl mx-auto pt-16 px-6 flex flex-col items-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-4 mb-10"
        >
          <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20"></div>
            <img src="/icon.png" alt="نماهنگ یار" className="w-full h-full object-cover z-10" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
            <Disc3 className="w-8 h-8 text-emerald-500 hidden absolute" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight" dir="rtl">نماهنگ یار</h1>
          <p className="text-neutral-500 text-sm" dir="rtl">جستجو و پخش قطعات صوتی و مذهبی</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full z-10"
        >
          <SearchBar 
            value={query} 
            onChange={setQuery} 
            onSearch={handleSearch} 
            isLoading={isSearching} 
          />
          <div className="flex overflow-x-auto hide-scrollbar items-center justify-start sm:justify-center gap-2 sm:gap-3 mt-6 pb-2 w-full max-w-2xl mx-auto px-4" dir="rtl">
            {['محرم', 'فاطمیه', 'ولادت', 'شهادت', 'مناجات', 'شور', 'زمینه'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setQuery(cat);
                  // Since we just set query, we need to manually trigger search with this query
                  // But setQuery is async in state updates, so we call a helper.
                  executeSearch(cat);
                }}
                className="flex-shrink-0 px-4 py-1.5 sm:py-2 rounded-full bg-neutral-800/80 border border-neutral-700/50 hover:bg-neutral-700 text-xs sm:text-sm text-neutral-300 transition-colors shadow-sm"
                dir="rtl"
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 mt-8">
        {!hasSearched ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center py-20 text-neutral-600 gap-4"
          >
            <Music className="w-12 h-12 opacity-20" />
            <p dir="rtl">عبارتی را برای جستجو وارد کنید. (مثال: علی، محرم...)</p>
          </motion.div>
        ) : (
          <TrackList 
            tracks={results} 
            onPlay={handlePlay} 
            isLoadingItem={isLoadingTrack}
          />
        )}
      </main>

      {currentTrack?.isVideo ? (
        <VideoPlayerModal track={currentTrack} onClose={handleClosePlayer} />
      ) : (
        <AudioPlayer track={currentTrack} onClose={handleClosePlayer} />
      )}
    </div>
  );
}
