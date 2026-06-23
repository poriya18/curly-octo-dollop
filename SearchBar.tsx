import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export function SearchBar({ value, onChange, onSearch, isLoading }: SearchBarProps) {
  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); onSearch(); }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div className="relative flex items-center w-full h-14 rounded-full focus-within:ring-2 focus-within:ring-emerald-500 bg-neutral-800 border border-neutral-700 shadow-lg overflow-hidden transition-all">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="جستجوی نوا، نماهنگ، مداح..."
          dir="rtl"
          className="peer h-full w-full outline-none text-md text-white bg-transparent pr-6 pl-14 font-sans placeholder-neutral-400"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="absolute left-0 top-0 h-full px-4 flex items-center justify-center text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-neutral-400 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}
