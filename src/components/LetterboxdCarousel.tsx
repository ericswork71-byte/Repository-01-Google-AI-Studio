import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink, Film, Loader2, AlertCircle, Calendar } from 'lucide-react';

export interface LetterboxdItem {
  title: string;
  year: string;
  rating: string;
  ratingValue: number;
  imageUrl: string;
  link: string;
  watchedDate: string;
  reviewExcerpt: string;
}

const DEFAULT_LOWER_FALLBACK: LetterboxdItem[] = [
  {
    title: "La Chimera",
    year: "2023",
    rating: "★★★★½",
    ratingValue: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&h=600&q=80",
    link: "https://letterboxd.com/erics71/film/la-chimera/",
    watchedDate: "2026-06-12",
    reviewExcerpt: "A beautifully woven poetic tale of love, loss, and ancient ruins. Josh O'Connor is breathtaking."
  },
  {
    title: "Challengers",
    year: "2024",
    rating: "★★★★",
    ratingValue: 4.0,
    imageUrl: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=400&h=600&q=80",
    link: "https://letterboxd.com/erics71/film/challengers/",
    watchedDate: "2026-06-10",
    reviewExcerpt: "The editing, cinematography, and score are electric. Luca Guadagnino crafted one of the most intense psychological thrillers."
  },
  {
    title: "Dune: Part Two",
    year: "2024",
    rating: "★★★★★",
    ratingValue: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&h=600&q=80",
    link: "https://letterboxd.com/erics71/film/dune-part-two/",
    watchedDate: "2026-06-08",
    reviewExcerpt: "Denis Villeneuve crafts a grand sci-fi epic. Perfect sound design and monumental visuals."
  },
  {
    title: "Anatomy of a Fall",
    year: "2023",
    rating: "★★★★½",
    ratingValue: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&h=600&q=80",
    link: "https://letterboxd.com/erics71/film/anatomy-of-a-fall/",
    watchedDate: "2026-06-05",
    reviewExcerpt: "Superb courtroom thriller that is actually a forensic investigation of a marriage. Astonishing performances."
  },
  {
    title: "Perfect Days",
    year: "2023",
    rating: "★★★★★",
    ratingValue: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=400&h=600&q=80",
    link: "https://letterboxd.com/erics71/film/perfect-days-2023/",
    watchedDate: "2026-06-01",
    reviewExcerpt: "Wim Wenders crafts a quiet masterpiece about the elegance of simple routines, Tokyo public toilets, and cassettes."
  },
  {
    title: "Past Lives",
    year: "2023",
    rating: "★★★★½",
    ratingValue: 4.5,
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&h=600&q=80",
    link: "https://letterboxd.com/erics71/film/past-lives/",
    watchedDate: "2026-05-28",
    reviewExcerpt: "A heart-wrenchingly mature romance about choice, fate (In-Yun), and paths not taken. Brilliantly written."
  }
];

interface LetterboxdCarouselProps {
  feedUrl: string;
  themeColor: string;
  sharedXml?: string | null;
  sharedLoading?: boolean;
  sharedError?: string | null;
  sharedIsReal?: boolean;
}

export default function LetterboxdCarousel({
  feedUrl,
  themeColor,
  sharedXml,
  sharedLoading,
  sharedError,
  sharedIsReal
}: LetterboxdCarouselProps) {
  const [items, setItems] = useState<LetterboxdItem[]>(DEFAULT_LOWER_FALLBACK);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    if (sharedLoading) {
      setLoading(true);
      return;
    }

    const fetchLetterboxdFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        const urlToFetch = feedUrl || "https://letterboxd.com/erics71/rss/";
        let rssText = "";
        let success = false;
        let fetchedReal = false;

        if (sharedXml && urlToFetch === "https://letterboxd.com/erics71/rss/") {
          console.log("[Carousel] Using shared RSS feed xml...");
          rssText = sharedXml;
          success = true;
          fetchedReal = !!sharedIsReal;
        } else {
          const urlsToTry = [
            {
              url: `https://corsproxy.io/?${encodeURIComponent(urlToFetch)}`,
              isClientProxy: true,
              name: "CORSProxy.io"
            },
            {
              url: `https://api.allorigins.win/raw?url=${encodeURIComponent(urlToFetch)}`,
              isClientProxy: true,
              name: "AllOrigins"
            },
            {
              url: `/api/letterboxd-proxy?url=${encodeURIComponent(urlToFetch)}`,
              isClientProxy: false,
              name: "ServerProxy"
            }
          ];

          for (const proxyItem of urlsToTry) {
            try {
              console.log(`[Carousel] Attempting feed fetch from ${proxyItem.name}: ${proxyItem.url}`);
              const response = await fetch(proxyItem.url);
              if (response.ok) {
                const text = await response.text();
                if (text && text.includes("<rss")) {
                  rssText = text;
                  success = true;
                  if (proxyItem.isClientProxy) {
                    fetchedReal = true;
                  } else {
                    const statusHeader = response.headers.get('X-Letterboxd-Status');
                    fetchedReal = statusHeader !== 'fallback';
                  }
                  break;
                }
              }
            } catch (e) {
              console.warn(`[Carousel] Failed to fetch via ${proxyItem.name}:`, e);
            }
          }
        }

        if (!success || !rssText) {
          throw new Error("Could not retrieve feed XML from any source.");
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(rssText, "text/xml");
        const rssItems = xmlDoc.getElementsByTagName("item");

        if (rssItems.length === 0) {
          throw new Error("No feed items found.");
        }

        const parsedItems: LetterboxdItem[] = [];
        for (let i = 0; i < rssItems.length; i++) {
          if (parsedItems.length >= 15) break;
          const item = rssItems[i];
          const rawTitle = item.getElementsByTagName("title")[0]?.textContent || "";
          const link = item.getElementsByTagName("link")[0]?.textContent || "";
          const description = item.getElementsByTagName("description")[0]?.textContent || "";

          // Skip list items in the main diary carousel since they represent lists of films, not a single movie diary entry
          if (link.includes("/list/") || rawTitle.toLowerCase().includes("list of")) {
            continue;
          }

          let filmTitle = "";
          let filmYear = "";
          let ratingValueStr = "";

          try {
            filmTitle = item.getElementsByTagName("letterboxd:filmTitle")[0]?.textContent || 
                        item.getElementsByTagName("filmTitle")[0]?.textContent || "";
            filmYear = item.getElementsByTagName("letterboxd:filmYear")[0]?.textContent || 
                       item.getElementsByTagName("filmYear")[0]?.textContent || "";
            ratingValueStr = item.getElementsByTagName("letterboxd:memberRating")[0]?.textContent || 
                             item.getElementsByTagName("memberRating")[0]?.textContent || "";
          } catch (e) {
            console.warn("Direct namespace query warning:", e);
          }

          if (!filmTitle) {
            const commaIndex = rawTitle.indexOf(",");
            const dashIndex = rawTitle.indexOf(" - ");
            if (commaIndex !== -1) {
              filmTitle = rawTitle.slice(0, commaIndex).trim();
            } else if (dashIndex !== -1) {
              filmTitle = rawTitle.slice(0, dashIndex).trim();
            } else {
              filmTitle = rawTitle.trim();
            }
          }

          if (!filmYear) {
            const yearMatch = rawTitle.match(/, (\d{4})/);
            filmYear = yearMatch ? yearMatch[1] : "";
          }

          let rating = "";
          let ratingValue = 0;
          if (ratingValueStr) {
            ratingValue = parseFloat(ratingValueStr);
            const fullStars = Math.floor(ratingValue);
            const half = ratingValue % 1 !== 0;
            rating = "★".repeat(fullStars) + (half ? "½" : "");
          } else {
            const ratingMatch = rawTitle.match(/ - ([★+½]+)$/);
            if (ratingMatch) {
              rating = ratingMatch[1];
              ratingValue = rating.replace("½", "").length + (rating.includes("½") ? 0.5 : 0);
            }
          }

          let imageUrl = "";
          let reviewExcerpt = "";
          if (description) {
            // Support both standard <img src="..." /> and entity-escaped &lt;img src=&quot;...&quot;
            let imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
            if (!imgMatch) {
              imgMatch = description.match(/&lt;img[^&]+src=&quot;([^&]+)&quot;/);
            }
            imageUrl = imgMatch ? imgMatch[1] : "";

            const cleanText = description
              .replace(/<p><img[^>]+><\/p>/gi, "")
              .replace(/<p>Watched on[^<]+<\/p>/gi, "")
              .replace(/&lt;p&gt;&lt;img[^&]+&gt;&lt;\/p&gt;/gi, "")
              .replace(/&lt;p&gt;Watched on[^&]+&lt;\/p&gt;/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/&lt;[^&]+&gt;/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            reviewExcerpt = cleanText;
            if (reviewExcerpt.length > 200) {
              reviewExcerpt = reviewExcerpt.slice(0, 190) + "...";
            }
          }

          let watchedDate = "";
          try {
            watchedDate = item.getElementsByTagName("letterboxd:watchedDate")[0]?.textContent || 
                          item.getElementsByTagName("watchedDate")[0]?.textContent || "";
          } catch (e) {}

          if (!watchedDate) {
            const pubDate = item.getElementsByTagName("pubDate")[0]?.textContent || "";
            if (pubDate) {
              watchedDate = new Date(pubDate).toLocaleDateString(undefined, { dateStyle: 'medium' });
            }
          }

          if (!imageUrl) {
            imageUrl = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=350&q=80`;
          }

          parsedItems.push({
            title: filmTitle || "Unknown Movie",
            year: filmYear || "",
            rating: rating || "No rating",
            ratingValue: ratingValue,
            imageUrl,
            link,
            watchedDate,
            reviewExcerpt: reviewExcerpt || ""
          });
        }

        if (isMounted) {
          if (parsedItems.length > 0) {
            setItems(parsedItems);
          } else {
            throw new Error("Parsing matched zero elements");
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Direct Letterboxd fetch caught error:", err);
        if (isMounted) {
          setError("Direct feed offline or CORS blocked. loaded cached diary archive gracefully.");
          setItems(DEFAULT_LOWER_FALLBACK);
          setLoading(false);
        }
      }
    };

    fetchLetterboxdFeed();

    return () => {
      isMounted = false;
    };
  }, [feedUrl, sharedXml, sharedLoading, sharedError, sharedIsReal]);

  // Autoplay cycle: advance by 1 card
  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, items.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-mono text-indigo-300">Syncing live Letterboxd feed (5-Column Cinematic layout)...</span>
      </div>
    );
  }

  // Get exactly 5 visible items dynamically looping them
  const getVisibleItems = () => {
    if (items.length === 0) return [];
    const visible: (LetterboxdItem & { originalIdx: number })[] = [];
    const countToShow = Math.min(5, items.length);
    for (let i = 0; i < countToShow; i++) {
      const idx = (currentIndex + i) % items.length;
      visible.push({ ...items[idx], originalIdx: idx });
    }
    return visible;
  };

  const visibleMovies = getVisibleItems();

  const getAccentColorClass = () => {
    if (themeColor === 'editorial') return 'border-amber-900/60 bg-amber-950/20';
    if (themeColor === 'emerald') return 'border-emerald-900/60 bg-emerald-950/20';
    if (themeColor === 'sunset') return 'border-orange-900/60 bg-orange-950/20';
    return 'border-indigo-900/60 bg-indigo-950/20';
  };

  const getButtonAccentClass = () => {
    if (themeColor === 'editorial') return 'bg-[#9c785d]/30 text-[#e6dfd9] hover:bg-[#9c785d]/50';
    if (themeColor === 'emerald') return 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400';
    if (themeColor === 'sunset') return 'bg-orange-950 hover:bg-orange-900 text-orange-400';
    return 'bg-indigo-950 hover:bg-indigo-900 text-indigo-400';
  };

  const getAccentIconText = () => {
    if (themeColor === 'editorial') return 'text-[#cfa484]';
    if (themeColor === 'emerald') return 'text-emerald-400';
    if (themeColor === 'sunset') return 'text-orange-400';
    return 'text-indigo-400';
  };

  return (
    <div className="w-full text-left font-sans">
      {error && (
        <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-900/40 text-amber-300 text-[10px] rounded p-2 mb-3 font-mono">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Continuous Film Reel / Strip Outer Frame */}
      <div className="w-full bg-[#07070a] border-[3px] border-[#1c1c22] rounded-xl p-3 md:p-4 relative shadow-[0_15px_35px_rgba(0,0,0,0.85)] z-10 my-4 overflow-hidden">
        {/* Sprocket holes top */}
        <div className="flex justify-between px-1.5 mb-3 opacity-65">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
          ))}
        </div>

        {/* Film cells stage */}
        <div className="bg-stone-950 p-2 rounded-lg border border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {visibleMovies.map((movie, index) => (
              <div 
                key={`${movie.title}-${index}`}
                className="group relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden shadow-lg hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300"
              >
                {/* Visual Film Poster & Star rating overlay */}
                <div className="w-full aspect-[2/3] relative bg-slate-950 overflow-hidden">
                  <img 
                    src={movie.imageUrl} 
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Rating Star Badge */}
                  {movie.rating && movie.rating !== "No rating" && (
                    <div className="absolute top-1.5 left-1.5 bg-slate-950/90 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-800/80 font-mono shadow">
                      {movie.rating}
                    </div>
                  )}

                  {/* Hover overlay exhibiting review excerpt */}
                  {movie.reviewExcerpt && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-between text-left">
                      <div className="space-y-1.5 overflow-hidden">
                        <span className="text-[8px] tracking-wider uppercase font-mono font-bold text-slate-400 block border-b border-slate-800 pb-1">
                          Review Excerpt
                        </span>
                        <p className="text-[10px] text-slate-200 line-clamp-6 leading-relaxed italic">
                          "{movie.reviewExcerpt}"
                        </p>
                      </div>
                      <div className="border-t border-slate-900 pt-1.5 text-[8px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>Logged {movie.watchedDate || "recently"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Film bottom metadata panel */}
                <div className="p-2.5 flex-grow flex flex-col justify-between bg-slate-900/60 border-t border-slate-800/50">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-slate-100 truncate tracking-tight group-hover:text-indigo-400 transition">
                      {movie.title}
                    </h5>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">({movie.year || "N/A"})</span>
                      <a 
                        href={movie.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-500 hover:text-white transition"
                        title="View review entry on Letterboxd"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sprocket holes bottom */}
        <div className="flex justify-between px-1.5 mt-3 opacity-65">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
          ))}
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3.5 text-[10px]">
        <div className="flex items-center gap-2 text-slate-500 font-mono">
          <Film className={`w-3.5 h-3.5 ${getAccentIconText()}`} />
          <span>Active starting from <strong className="text-slate-300 font-bold">{currentIndex + 1}</strong> of {items.length} total logged films</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={handlePrev}
            className={`p-1.5 rounded border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer ${getButtonAccentClass()}`}
            title="Slide Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 font-bold font-mono text-[9px] cursor-pointer ${getButtonAccentClass()}`}
            title={isPlaying ? "Pause cinematic loop" : "Play cinematic loop"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400" />
                <span>ACTIVE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span>PAUSED</span>
              </>
            )}
          </button>
          <button 
            onClick={handleNext}
            className={`p-1.5 rounded border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer ${getButtonAccentClass()}`}
            title="Slide Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Miniature slide indicators */}
      <div className="flex justify-center gap-1 mt-4">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-5 bg-indigo-500' : 'w-1.5 bg-slate-800'
            }`}
            title={`Slide starting index ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
