import React, { useState, useEffect } from 'react';
import { Film, ExternalLink, Loader2, Award, ListVideo } from 'lucide-react';

interface MovieListItem {
  title: string;
  link: string;
  ordinal: string;
}

const FALLBACK_LIST: MovieListItem[] = [
  { title: "The Seed of the Sacred Fig", link: "https://letterboxd.com/film/the-seed-of-the-sacred-fig/", ordinal: "1st" },
  { title: "Misericordia", link: "https://letterboxd.com/film/misericordia-2024/", ordinal: "2nd" },
  { title: "The Portuguese House", link: "https://letterboxd.com/film/the-portuguese-house/", ordinal: "3rd" },
  { title: "Sirāt", link: "https://letterboxd.com/film/sirat-2025/", ordinal: "4th" },
  { title: "One Battle After Another", link: "https://letterboxd.com/film/one-battle-after-another/", ordinal: "5th" }
];

interface LetterboxdSpainListLiveCardProps {
  sharedXml?: string | null;
  sharedLoading?: boolean;
  themeColor?: string;
}

export default function LetterboxdSpainListLiveCard({
  sharedXml,
  sharedLoading,
  themeColor
}: LetterboxdSpainListLiveCardProps = {}) {
  const [items, setItems] = useState<MovieListItem[]>(FALLBACK_LIST);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  const isRedTheme = !themeColor || themeColor === 'slate';

  const getOrdinalStr = (index: number): string => {
    const suffixes = ["th", "st", "nd", "rd"];
    const val = index % 100;
    return index + (suffixes[(val - 20) % 10] || suffixes[val] || suffixes[0]);
  };

  useEffect(() => {
    let active = true;

    if (sharedLoading) {
      setLoading(true);
      return;
    }

    const fetchList = async () => {
      setLoading(true);
      setError(null);

      let xmlText = "";
      let success = false;

      if (sharedXml) {
        console.log("[SpainList] Using shared RSS feed xml...");
        xmlText = sharedXml;
        success = true;
      } else {
        const feedUrl = "https://letterboxd.com/erics71/rss/";

        const proxies = [
          { url: `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`, name: "CORSProxy" },
          { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`, name: "AllOrigins" },
          { url: `/api/letterboxd-proxy?url=${encodeURIComponent(feedUrl)}`, name: "ServerProxy" }
        ];

        for (const p of proxies) {
          try {
            console.log(`[SpainList] Fetching from ${p.name}: ${p.url}`);
            const res = await fetch(p.url);
            if (res.ok) {
              const text = await res.text();
              if (text && text.includes("<rss")) {
                xmlText = text;
                success = true;
                break;
              }
            }
          } catch (err) {
            console.warn(`[SpainList] Proxy ${p.name} failed:`, err);
          }
        }
      }

      if (!success || !xmlText) {
        console.log("[SpainList] No live list RSS feed available. Using high-fidelity hardcoded list.");
        if (active) {
          setItems(FALLBACK_LIST);
          setIsLive(false);
          setLoading(false);
        }
        return;
      }

      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const rssItems = xmlDoc.getElementsByTagName("item");
        let foundTargetItem = false;

        for (let i = 0; i < rssItems.length; i++) {
          const item = rssItems[i];
          const title = item.getElementsByTagName("title")[0]?.textContent || "";

          if (title.toLowerCase().includes("ranking of film releases in spain in 2025")) {
            const desc = item.getElementsByTagName("description")[0]?.textContent || "";
            if (desc) {
              const htmlParser = new DOMParser();
              const descDoc = htmlParser.parseFromString(desc, "text/html");
              const liTags = descDoc.querySelectorAll("li");

              if (liTags.length > 0) {
                const parsed: MovieListItem[] = [];
                const limit = Math.min(5, liTags.length);
                for (let j = 0; j < limit; j++) {
                  const li = liTags[j];
                  const aTag = li.querySelector("a");
                  const movieTitle = aTag ? aTag.textContent?.trim() : li.textContent?.trim();
                  const movieLink = aTag ? aTag.getAttribute("href") : "";

                  parsed.push({
                    title: movieTitle || "Untitled Film",
                    link: movieLink || "https://letterboxd.com/",
                    ordinal: getOrdinalStr(j + 1)
                  });
                }

                if (parsed.length > 0 && active) {
                  setItems(parsed);
                  setIsLive(true);
                  foundTargetItem = true;
                  break;
                }
              }
            }
          }
        }

        if (!foundTargetItem && active) {
          console.log("[SpainList] Target list item not found in feed. Defaulting to local items.");
          setItems(FALLBACK_LIST);
          setIsLive(false);
        }
      } catch (err) {
        console.error("[SpainList] Failed to parse live feed items:", err);
        if (active) {
          setItems(FALLBACK_LIST);
          setIsLive(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchList();
    return () => {
      active = false;
    };
  }, [sharedXml, sharedLoading]);

  return (
    <div id="spain-2025-ranking-card" className="space-y-4 text-left">
      <div className={`flex items-center justify-between border-b pb-2.5 ${isRedTheme ? 'border-white/10' : 'border-slate-900'}`}>
        <div 
          className="flex items-center gap-2 relative group cursor-help select-none"
          title="films released in Spain in 2025 that I have seen until 31/1/2026"
        >
          <Award className={`w-4 h-4 animate-pulse shrink-0 ${isRedTheme ? 'text-amber-300' : 'text-amber-500'}`} />
          <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${isRedTheme ? 'text-white' : 'text-slate-100'}`}>
            My best of 2025
          </h4>
          
          {/* Rich CSS Tooltip on Hover */}
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-slate-950 border border-indigo-500/50 text-[11px] text-slate-300 rounded-lg shadow-2xl z-30 pointer-events-none normal-case leading-relaxed font-sans animate-fade-in">
            films released in Spain in 2025 that I have seen until 31/1/2026
            <div className="w-2 h-2 bg-slate-950 border-r border-b border-indigo-500/50 transform rotate-45 absolute -bottom-1 left-4"></div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {loading ? (
            <div className="flex items-center gap-1 text-[9px] font-mono text-indigo-400">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              <span>Syncing...</span>
            </div>
          ) : (
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
              isRedTheme 
                ? 'bg-black/20 border-white/10 text-white/70' 
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              {isLive ? "Live Sync 🟢" : "Offline 🔒"}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((movie, index) => (
          <a
            key={index}
            href={movie.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center justify-between p-2.5 rounded-lg border transition duration-300 pointer-events-auto ${
              isRedTheme 
                ? 'bg-black/20 border-white/5 hover:bg-black/35 hover:border-white/20 text-white' 
                : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/60 hover:border-indigo-500/40 text-slate-200'
            }`}
            id={`spain-ranking-item-${index + 1}`}
          >
            <div className="flex items-center gap-2">
              {/* Custom simple popcorn bullet directly at the beginning of each list item */}
              <span className="text-base select-none shrink-0 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] animate-bounce" style={{ animationDelay: `${index * 150}ms`, animationDuration: '3s' }}>
                🍿
              </span>
              <span className={`text-xs font-bold transition-colors duration-300 ${isRedTheme ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                <span className={`font-mono text-[10px] mr-1.5 font-semibold ${isRedTheme ? 'text-amber-300' : 'text-indigo-400'}`}>{movie.ordinal}</span>
                {movie.title}
              </span>
            </div>
            
            <div className={`flex items-center gap-1 text-[10px] transition-colors font-mono ${isRedTheme ? 'text-white/40 group-hover:text-amber-300' : 'text-slate-500 group-hover:text-indigo-400'}`}>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px]">letterboxd</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </a>
        ))}
      </div>

      <div className={`flex items-center justify-between pt-2 border-t text-[9px] font-mono ${isRedTheme ? 'border-white/10 text-white/50' : 'border-slate-900 text-slate-500'}`}>
        <span className="flex items-center gap-1">
          <ListVideo className={`w-3 h-3 ${isRedTheme ? 'text-white/40' : 'text-slate-600'}`} />
          <span>Source: Frédéric's Letterboxd List</span>
        </span>
        <a 
          href="https://letterboxd.com/erics71/list/ranking-of-film-releases-in-spain-in-2025/" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`hover:underline flex items-center gap-0.5 ${isRedTheme ? 'text-white/70 hover:text-white' : 'hover:text-slate-350'}`}
        >
          Full List ↗
        </a>
      </div>
    </div>
  );
}
