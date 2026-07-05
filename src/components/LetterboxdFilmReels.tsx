import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Film, AlertCircle, Loader2, Sparkles, RefreshCw, ExternalLink, Hand } from 'lucide-react';

export interface FilmReelItem {
  title: string;
  link: string;
  year?: string;
}

interface ReelLayout {
  id: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
  tiltX: number;
  tiltY: number;
}

const CINEMA_FALLBACK_LIST: FilmReelItem[] = [
  { title: "Backrooms", link: "https://letterboxd.com/film/backrooms-2026/", year: "2026" },
  { title: "Disclosure Day", link: "https://letterboxd.com/film/disclosure-day/", year: "" },
  { title: "Anora", link: "https://letterboxd.com/film/anora/", year: "2024" },
  { title: "Megalopolis", link: "https://letterboxd.com/film/megalopolis-2024/", year: "2024" },
  { title: "The Seed of the Sacred Fig", link: "https://letterboxd.com/film/the-seed-of-the-sacred-fig/", year: "2024" },
  { title: "Emilia Pérez", link: "https://letterboxd.com/film/emilia-perez/", year: "2024" },
  { title: "Challengers", link: "https://letterboxd.com/film/challengers/", year: "2024" },
  { title: "Kinds of Kindness", link: "https://letterboxd.com/film/kinds-of-kindness/", year: "2024" },
  { title: "Dune: Part Two", link: "https://letterboxd.com/film/dune-part-two/", year: "2024" },
  { title: "The Substance", link: "https://letterboxd.com/film/the-substance-2024/", year: "2024" }
];

interface LetterboxdFilmReelsProps {
  sharedXml?: string | null;
  sharedLoading?: boolean;
  sharedError?: string | null;
  sharedIsReal?: boolean;
  themeColor?: string;
}

export default function LetterboxdFilmReels({
  sharedXml,
  sharedLoading,
  sharedError,
  sharedIsReal,
  themeColor
}: LetterboxdFilmReelsProps = {}) {
  const [films, setFilms] = useState<FilmReelItem[]>(CINEMA_FALLBACK_LIST);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [layouts, setLayouts] = useState<ReelLayout[]>([]);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [isStacked, setIsStacked] = useState<boolean>(true);
  
  const floorRef = useRef<HTMLDivElement>(null);

  // Generate beautiful coin-like piles/stacks of film canisters side by side
  const generateVerticalStackLayouts = (count: number) => {
    const newLayouts: ReelLayout[] = [];
    const numPiles = 3;
    const baseXs = [-85, 0, 85]; // Left, center, right piles
    
    for (let i = 0; i < count; i++) {
      const pileIdx = i % numPiles;
      const stackIdx = Math.floor(i / numPiles);
      
      // Base X coordinate for the pile plus small organic offsets
      const x = baseXs[pileIdx] + (Math.sin(stackIdx * 2.3) * 3);
      
      // Stack vertically upwards. The bottom canister starts at y = 80, stacking upwards.
      // 14px separation is perfect for a clear pile appearance under rotateX: 81
      const y = 80 - (stackIdx * 14); 
      
      // Organic rotation for label sticker / metallic details
      const rotate = (stackIdx * 12 + pileIdx * 45) % 360;
      
      const scale = 0.95;
      const zIndex = 10 + stackIdx * 5 + pileIdx; // Render the top of the stack above the bottom

      newLayouts.push({
        id: `reel-${i}-${Math.random().toString(36).substring(2, 6)}`,
        x,
        y,
        rotate,
        scale,
        zIndex,
        tiltX: 0, // Face-on flat view
        tiltY: 0
      });
    }
    return newLayouts;
  };

  // Generate organic, 3D pile positions on the floor (scattered layout)
  const generateScatteredLayouts = (count: number) => {
    const newLayouts: ReelLayout[] = [];
    for (let i = 0; i < count; i++) {
      // Create a nice organic pile clustered towards the center-bottom of the floor
      const angle = i * 2.39996 + (Math.sin(i) * 0.2); // Golden spiral with minor jitter
      
      // Expand radius as we add more reels so they stack but spread out
      const baseRadius = Math.min(100, i * 8 + 10);
      
      // X and Y offset from center of container. 
      // Squish Y axis (e.g. multiplied by 0.35) to simulate perspective height on the floor.
      const x = Math.cos(angle) * baseRadius * 1.6;
      const y = Math.sin(angle) * baseRadius * 0.45 + 10; // offset slightly down
      
      // Spin the reels randomly
      const rotate = (i * 73 + Math.floor(Math.sin(i * 3) * 20)) % 360;
      
      // Face-on flat view across the studio floor
      const tiltX = 0;
      const tiltY = 0;

      // Back elements are smaller, front are bigger
      // Normalized Y: smaller value means higher up (deeper back on floor)
      // Height of container floor area is roughly around 220px, so Y is from -70 to +70
      const normalizedY = (y + 70) / 140; // 0 to 1
      const scale = 0.85 + normalizedY * 0.25;

      // Stack order: back elements have lower zIndex, front have higher
      // Plus a little random seed offset
      const zIndex = 10 + Math.floor(normalizedY * 40) + (i % 2);

      newLayouts.push({
        id: `reel-${i}-${Math.random().toString(36).substring(2, 6)}`,
        x,
        y,
        rotate,
        scale,
        zIndex,
        tiltX,
        tiltY
      });
    }
    return newLayouts;
  };

  // Toggle layout between neat vertical stack and scattered floor pile
  const handleToggleLayout = () => {
    if (films.length > 0) {
      if (isStacked) {
        setLayouts(generateScatteredLayouts(films.length));
        setIsStacked(false);
      } else {
        setLayouts(generateVerticalStackLayouts(films.length));
        setIsStacked(true);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (sharedLoading) {
      setLoading(true);
      return;
    }

    const fetchListRSS = async () => {
      setLoading(true);
      setError(null);
      
      const tryFetchFeed = async (targetUrl: string) => {
        // Define cascade of proxy URLs to try. Client-side proxies bypass Cloud Run IP blockades.
        const urlsToTry = [
          {
            url: `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
            isClientProxy: true,
            name: "CORSProxy.io"
          },
          {
            url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
            isClientProxy: true,
            name: "AllOrigins"
          },
          {
            url: `/api/letterboxd-proxy?url=${encodeURIComponent(targetUrl)}`,
            isClientProxy: false,
            name: "ServerProxy"
          }
        ];

        for (const item of urlsToTry) {
          try {
            console.log(`[FilmReels] Attempting feed fetch from ${item.name} for URL: ${targetUrl}`);
            const response = await fetch(item.url);
            if (response.ok) {
              const text = await response.text();
              if (text && text.includes("<rss")) {
                const isReal = item.isClientProxy || (response.headers.get('X-Letterboxd-Status') !== 'fallback');
                return { xmlText: text, isReal };
              }
            }
          } catch (e) {
            console.warn(`[FilmReels] Failed to fetch via ${item.name}:`, e);
          }
        }
        return null;
      };

      try {
        let parsedFilms: FilmReelItem[] = [];
        let fetchedReal = false;

        // 1. Primary Option: Attempt to load from the general user profile RSS feed
        let mainFeedResult: { xmlText: string; isReal: boolean } | null = null;
        if (sharedXml) {
          console.log("[FilmReels] Using shared user profile RSS feed xml...");
          mainFeedResult = { xmlText: sharedXml, isReal: !!sharedIsReal };
        } else {
          console.log("[FilmReels] Trying primary option: user profile RSS feed...");
          mainFeedResult = await tryFetchFeed("https://letterboxd.com/erics71/rss/");
        }

        if (mainFeedResult) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(mainFeedResult.xmlText, "text/xml");
          const rssItems = xmlDoc.getElementsByTagName("item");
          
          let listContainerItem: Element | null = null;
          for (let i = 0; i < rssItems.length; i++) {
            const item = rssItems[i];
            const link = item.getElementsByTagName("link")[0]?.textContent || "";
            const title = item.getElementsByTagName("title")[0]?.textContent || "";
            
            // Decode HTML entities (like &#039;) for robust matching
            const decodeEntities = (str: string) => {
              return str
                .replace(/&#039;/g, "'")
                .replace(/&apos;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            };
            
            const titleDecoded = decodeEntities(title).toLowerCase();
            const titleRawLower = title.toLowerCase();
            const linkLower = link.toLowerCase();

            if (
              linkLower.includes("/list/if-i-can-ill-go-and-see-them-at-the-cinema") || 
              titleDecoded.includes("if i can, i'll go and see them at the cinema") ||
              titleRawLower.includes("if i can, i&#039;ll go and see them at the cinema") ||
              titleDecoded.includes("if i can, i’ll go and see them at the cinema") ||
              titleDecoded.includes("if i can") ||
              titleDecoded.includes("cinema") ||
              linkLower.includes("cinema")
            ) {
              listContainerItem = item;
              break;
            }
          }

          if (listContainerItem) {
            console.log("[FilmReels] Found list container item in general feed. Parsing description HTML...");
            const descriptionText = listContainerItem.getElementsByTagName("description")[0]?.textContent || "";
            if (descriptionText) {
              const descDoc = parser.parseFromString(descriptionText, "text/html");
              const aTags = descDoc.getElementsByTagName("a");
              for (let j = 0; j < aTags.length; j++) {
                const a = aTags[j];
                const title = a.textContent?.trim() || "";
                const href = a.getAttribute("href") || "";
                if (title && href && href.includes("/film/")) {
                  let filmYear = "";
                  const yearMatchInUrl = href.match(/-(\d{4})\/?$/);
                  const yearMatchInTitle = title.match(/\b(19\d{2}|20\d{2})\b/);
                  if (yearMatchInUrl) {
                    filmYear = yearMatchInUrl[1];
                  } else if (yearMatchInTitle) {
                    filmYear = yearMatchInTitle[1];
                  }
                  
                  parsedFilms.push({
                    title,
                    link: href,
                    year: filmYear
                  });
                }
              }
              if (parsedFilms.length > 0) {
                fetchedReal = mainFeedResult.isReal;
                console.log(`[FilmReels] Successfully parsed ${parsedFilms.length} films from general feed's list item.`);
              }
            }
          }
        }

        // 2. Secondary Option: If list container was not found, try the direct list RSS feed
        if (parsedFilms.length === 0) {
          console.log("[FilmReels] Trying secondary option: list-specific RSS feed...");
          const listFeedResult = await tryFetchFeed("https://letterboxd.com/erics71/list/if-i-can-ill-go-and-see-them-at-the-cinema/rss/");
          if (listFeedResult) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(listFeedResult.xmlText, "text/xml");
            const rssItems = xmlDoc.getElementsByTagName("item");

            for (let i = 0; i < rssItems.length; i++) {
              const item = rssItems[i];
              const rawTitle = item.getElementsByTagName("title")[0]?.textContent || "";
              const link = item.getElementsByTagName("link")[0]?.textContent || "";

              let filmTitle = "";
              let filmYear = "";

              // Namespaced tags
              const titleNodes = item.getElementsByTagName("letterboxd:filmTitle");
              const titleNodesNS = item.getElementsByTagNameNS("*", "filmTitle");
              const titleNodesPlain = item.getElementsByTagName("filmTitle");

              if (titleNodes && titleNodes.length > 0) {
                filmTitle = titleNodes[0]?.textContent || "";
              } else if (titleNodesNS && titleNodesNS.length > 0) {
                filmTitle = titleNodesNS[0]?.textContent || "";
              } else if (titleNodesPlain && titleNodesPlain.length > 0) {
                filmTitle = titleNodesPlain[0]?.textContent || "";
              }

              const yearNodes = item.getElementsByTagName("letterboxd:filmYear");
              const yearNodesNS = item.getElementsByTagNameNS("*", "filmYear");
              const yearNodesPlain = item.getElementsByTagName("filmYear");

              if (yearNodes && yearNodes.length > 0) {
                filmYear = yearNodes[0]?.textContent || "";
              } else if (yearNodesNS && yearNodesNS.length > 0) {
                filmYear = yearNodesNS[0]?.textContent || "";
              } else if (yearNodesPlain && yearNodesPlain.length > 0) {
                filmYear = yearNodesPlain[0]?.textContent || "";
              }

              if (!filmTitle) {
                const parenMatch = rawTitle.match(/(.*)\s*\((\d{4})\)/);
                const commaMatch = rawTitle.match(/(.*),\s*(\d{4})/);

                if (parenMatch) {
                  filmTitle = parenMatch[1].trim();
                  if (!filmYear) filmYear = parenMatch[2];
                } else if (commaMatch) {
                  filmTitle = commaMatch[1].trim();
                  if (!filmYear) filmYear = commaMatch[2];
                } else {
                  filmTitle = rawTitle.trim();
                }
              }

              if (!filmYear) {
                const anyYearMatch = rawTitle.match(/\b(19\d{2}|20\d{2})\b/);
                filmYear = anyYearMatch ? anyYearMatch[1] : "";
              }

              // Only add actual films, skipping any other lists/links
              if (filmTitle && !link.includes("/list/") && !rawTitle.toLowerCase().includes("list of")) {
                parsedFilms.push({
                  title: filmTitle || "Unknown Film",
                  link: link || "https://letterboxd.com",
                  year: filmYear
                });
              }
            }

            if (parsedFilms.length > 0) {
              fetchedReal = listFeedResult.isReal;
              console.log(`[FilmReels] Successfully parsed ${parsedFilms.length} films from list-specific RSS feed.`);
            }
          }
        }

        if (parsedFilms.length === 0) {
          throw new Error("Could not parse any films from both RSS feed URLs.");
        }

        if (isMounted) {
          setFilms(parsedFilms);
          setLayouts(generateVerticalStackLayouts(parsedFilms.length));
          setIsStacked(true);
          setError(null);
          setLoading(false);
        }

      } catch (err: any) {
        console.error("[FilmReels] Failed to load list feed:", err);
        if (isMounted) {
          setError("Direct feed offline. Showing cached list of cinema reels.");
          setFilms(CINEMA_FALLBACK_LIST);
          setLayouts(generateVerticalStackLayouts(CINEMA_FALLBACK_LIST.length));
          setIsStacked(true);
          setLoading(false);
        }
      }
    };

    fetchListRSS();
    return () => {
      isMounted = false;
    };
  }, [sharedXml, sharedLoading, sharedError, sharedIsReal]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-mono text-indigo-300">Splicing cinema reels on floor...</span>
      </div>
    );
  }

  if (themeColor === 'slate' || !themeColor) {
    const gridFilms = films.slice(0, 6);
    return (
      <div className="w-full text-center space-y-4">
        <div className="relative bg-black/25 rounded-2xl p-6 border border-white/5 overflow-hidden shadow-inner">
          {/* Horizontal divider white/light line in the middle */}
          <div className="absolute top-1/2 left-4 right-4 h-px bg-white/10 -translate-y-1/2 pointer-events-none" />
          
          <div className="grid grid-cols-3 gap-y-10 gap-x-6 relative py-3">
            {gridFilms.map((movie, index) => {
              const isHovered = activeReelIndex === index;
              return (
                <div 
                  key={index}
                  className="flex flex-col items-center justify-center relative group"
                  onMouseEnter={() => setActiveReelIndex(index)}
                  onMouseLeave={() => setActiveReelIndex(null)}
                >
                  <a
                    href={movie.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-45 pointer-events-auto shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
                      border: '4px solid #f1f5f9'
                    }}
                  >
                    {/* Concentric rolled tape lines */}
                    <div className="absolute inset-1.5 rounded-full border border-slate-700/30 bg-slate-900/90 pointer-events-none" />
                    
                    <svg className="absolute inset-0 w-full h-full text-slate-950/80 opacity-60 pointer-events-none" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="4" strokeDasharray="1,1" />
                      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="3" strokeDasharray="2,1" />
                    </svg>

                    {/* Spoke lines & 5 holes */}
                    <svg 
                      className="absolute inset-0 w-full h-full text-slate-700 pointer-events-none"
                      viewBox="0 0 100 100" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2.5" />
                      <line x1="50" y1="50" x2="50" y2="4" stroke="currentColor" strokeWidth="2.5" />
                      <line x1="50" y1="50" x2="93.8" y2="31.3" stroke="currentColor" strokeWidth="2.5" />
                      <line x1="50" y1="50" x2="77.1" y2="75.6" stroke="currentColor" strokeWidth="2.5" />
                      <line x1="50" y1="50" x2="22.9" y2="75.6" stroke="currentColor" strokeWidth="2.5" />
                      <line x1="50" y1="50" x2="6.2" y2="31.3" stroke="currentColor" strokeWidth="2.5" />
                      
                      {/* 5 Holes cutouts */}
                      <circle cx="50" cy="22" r="6" fill="#000000" stroke="currentColor" strokeWidth="1" />
                      <circle cx="74" cy="39" r="6" fill="#000000" stroke="currentColor" strokeWidth="1" />
                      <circle cx="65" cy="69" r="6" fill="#000000" stroke="currentColor" strokeWidth="1" />
                      <circle cx="35" cy="69" r="6" fill="#000000" stroke="currentColor" strokeWidth="1" />
                      <circle cx="26" cy="39" r="6" fill="#000000" stroke="currentColor" strokeWidth="1" />
                    </svg>

                    {/* Spindle center */}
                    <div className="absolute w-4 h-4 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    </div>
                  </a>

                  {/* Elegant hover title bubble */}
                  <div className={`absolute top-[85%] z-30 bg-black/95 text-white border border-white/10 px-2 py-1 rounded shadow-xl text-[10px] font-sans pointer-events-none transition-all duration-300 max-w-[120px] text-center ${
                    isHovered ? 'opacity-100 scale-100 translate-y-1' : 'opacity-0 scale-90 translate-y-0'
                  }`}>
                    <p className="font-bold truncate">{movie.title}</p>
                    {movie.year && <p className="text-[8px] text-slate-400">({movie.year})</p>}
                    <p className="text-[7px] text-amber-400 font-mono tracking-wider mt-0.5">OPEN LINK ↗</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info label below */}
        <div className="flex items-center justify-between text-[9px] text-white/50 font-mono pt-1">
          <span>Flat Face-On Cinema Reels</span>
          <span>Source: Frédéric's Letterboxd RSS</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-left font-sans space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-amber-950/20 border border-amber-900/30 text-amber-300 text-[10px] rounded p-2 mb-1 font-mono">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* The Cinematic Floor Stage Container with 3D Perspective Grid */}
      <div 
        ref={floorRef}
        id="reels-floor-stage"
        className="relative w-full h-[320px] sm:h-[350px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden select-none flex flex-col justify-between p-4"
        style={{ perspective: '1000px' }}
        onClick={() => setActiveReelIndex(null)}
      >
        {/* Floor design textures & spotlight */}
        <div className="absolute inset-0 bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/25 via-slate-950/95 to-slate-950 pointer-events-none z-0" />
        
        {/* Linear Floorboard planks texture lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:100%_20px] pointer-events-none opacity-25 z-0" />
        
        {/* Studio spotlight flare circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-44 rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none z-0" />

        {/* Floating Instruction Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-800 px-2 py-1 rounded text-[9px] font-mono text-slate-400 flex items-center gap-1 z-30 shadow">
          <Hand className="w-3 h-3 text-indigo-400" />
          <span>{activeReelIndex !== null ? "Click / Tap reel to open in Letterboxd ↗" : "Hover or tap a reel to inspect"}</span>
        </div>

        {/* Toggle layout control */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleLayout();
          }}
          className="absolute top-3 right-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-[10px] font-mono text-slate-300 hover:text-indigo-300 px-2.5 py-1 rounded-md flex items-center gap-1.5 z-30 transition-all duration-300 shadow active:scale-95 cursor-pointer"
          title={isStacked ? "Scatter the film reels across the floor" : "Stack the film reels back into a neat vertical pile"}
        >
          <RefreshCw className={`w-3 h-3 ${isStacked ? 'animate-pulse' : 'rotate-180 transition-transform duration-500'}`} />
          <span>{isStacked ? "Kick Pile" : "Stack Pile"}</span>
        </button>

        {/* The heap of draggable Reels on the Floor */}
        <div className="relative w-full h-full flex items-center justify-center z-10">
          {films.map((movie, index) => {
            const layout = layouts[index];
            if (!layout) return null;

            const isActive = activeReelIndex === index;
            
            // Dynamic container tag: when active, the entire reel is a clean, direct link to Letterboxd
            const ReelContainer = isActive ? 'a' : 'div';
            const containerProps: any = isActive ? {
              href: movie.link,
              target: "_blank",
              rel: "noopener noreferrer",
              onClick: (e: React.MouseEvent) => e.stopPropagation(),
              className: "absolute inset-0 rounded-full border-[3px] border-indigo-500/95 shadow-[0_0_20px_rgba(99,102,241,0.45)] bg-slate-900 flex items-center justify-center overflow-hidden pointer-events-auto cursor-pointer"
            } : {
              className: "absolute inset-0 rounded-full border-[3px] border-slate-400/80 bg-gradient-to-br from-slate-500 via-slate-700 to-slate-900 flex items-center justify-center overflow-hidden"
            };

            return (
              <motion.div
                key={layout.id}
                drag
                dragConstraints={floorRef}
                dragElastic={0.05}
                dragMomentum={true}
                initial={{ 
                  x: layout.x, 
                  y: layout.y, 
                  rotateX: layout.tiltX,
                  rotateY: layout.tiltY,
                  rotate: layout.rotate,
                  scale: 0 
                }}
                animate={{ 
                  x: isActive ? 0 : layout.x,
                  y: isActive ? -25 : layout.y, // Lift up when active
                  rotateX: isActive ? 0 : layout.tiltX, // Face reader when active, else tilt
                  rotateY: isActive ? 0 : (layout.tiltY ?? 0),
                  rotate: isActive ? 0 : layout.rotate,    // Straighten on hover to read easily
                  scale: isActive ? 1.6 : layout.scale,  // Scale up more on hover for readability
                  zIndex: isActive ? 200 : layout.zIndex,   // Move to topmost stack layer
                  filter: isActive ? 'brightness(1.15)' : 'brightness(1)'
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: isActive ? 260 : 120, 
                  damping: isActive ? 22 : 15,
                  mass: 0.8
                }}
                onHoverStart={() => setActiveReelIndex(index)}
                onHoverEnd={() => setActiveReelIndex(null)}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setActiveReelIndex(index);
                }}
                className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center group"
                style={{
                  touchAction: 'none',
                  transformStyle: 'preserve-3d',
                  boxShadow: isActive 
                    ? '0 25px 40px rgba(0,0,0,0.85), 0 0 25px rgba(99,102,241,0.35)' 
                    : '0 6px 0 #334155, 0 10px 0 #1e293b, 0 14px 15px rgba(0,0,0,0.95)'
                }}
              >
                {/* Reel Shadow cast on floor */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-black/80 blur-md pointer-events-none -z-10"
                  animate={{
                    scale: isActive ? 0.95 : 1.0,
                    y: isActive ? 48 : 4, // shadow moves further down when lifted
                    opacity: isActive ? 0.35 : 0.85,
                    blur: isActive ? 10 : 4
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                />

                {/* 3D-like rim structure - acts as a solid metallic brushed lid when stacked/not active */}
                <ReelContainer {...containerProps}>
                  
                  {/* Internal concentric circles simulating rolled movie tape strip inside (faded when flat) */}
                  <div className="absolute inset-2 rounded-full border-2 border-[#151c2c] bg-[#070b14] pointer-events-none transition-opacity duration-500" style={{ opacity: isActive ? 1.0 : 0.8 }} />
                  <div className="absolute inset-4 rounded-full border border-dashed border-slate-950 pointer-events-none transition-opacity duration-500" style={{ opacity: isActive ? 0.9 : 0.6 }} />
                  <div className="absolute inset-5 rounded-full border border-[#1b253b] pointer-events-none transition-opacity duration-500" style={{ opacity: isActive ? 0.8 : 0.5 }} />
                  
                  {/* Concentric rings of fine-grain film tape lines */}
                  <svg className="absolute inset-0 w-full h-full text-slate-950 opacity-70 pointer-events-none transition-opacity duration-500" style={{ opacity: isActive ? 0.7 : 0.4 }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="6" strokeDasharray="1,1" />
                    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="5" strokeDasharray="2,1" />
                    <circle cx="50" cy="50" r="22" stroke="#111827" strokeWidth="4" />
                  </svg>

                  {/* SVG Spool spokes overlay rotates with kinetic motion */}
                  <svg 
                    className="absolute inset-0 w-full h-full text-slate-700 pointer-events-none transition-all duration-700 ease-out group-hover:rotate-45" 
                    style={{ opacity: isActive ? 1.0 : 0.75 }}
                    viewBox="0 0 100 100" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Outer Ring boundary */}
                    <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2.5" />
                    
                    {/* Spool spokes */}
                    <line x1="50" y1="50" x2="50" y2="4" stroke="currentColor" strokeWidth="2.5" />
                    <line x1="50" y1="50" x2="93.8" y2="31.3" stroke="currentColor" strokeWidth="2.5" />
                    <line x1="50" y1="50" x2="77.1" y2="75.6" stroke="currentColor" strokeWidth="2.5" />
                    <line x1="50" y1="50" x2="22.9" y2="75.6" stroke="currentColor" strokeWidth="2.5" />
                    <line x1="50" y1="50" x2="6.2" y2="31.3" stroke="currentColor" strokeWidth="2.5" />
                    
                    {/* Holes cutouts in reel spools (simulating light passing through holes) */}
                    <circle cx="50" cy="22" r="6" fill="#070b14" stroke="currentColor" strokeWidth="1" />
                    <circle cx="74" cy="39" r="6" fill="#070b14" stroke="currentColor" strokeWidth="1" />
                    <circle cx="65" cy="69" r="6" fill="#070b14" stroke="currentColor" strokeWidth="1" />
                    <circle cx="35" cy="69" r="6" fill="#070b14" stroke="currentColor" strokeWidth="1" />
                    <circle cx="26" cy="39" r="6" fill="#070b14" stroke="currentColor" strokeWidth="1" />
                  </svg>

                  {/* Metallic Spindle center hub */}
                  <div className="absolute w-5 h-5 rounded-full bg-slate-900 border border-slate-750 flex items-center justify-center z-10 shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                  </div>

                  {/* Adhesive labeling paper tape sticker wrapped across the reel face */}
                  <div 
                    className={`absolute z-20 px-2 py-1.5 max-w-[84px] text-center rounded-sm transition-all duration-500 select-none shadow border flex flex-col items-center justify-center gap-0.5 ${
                      isActive 
                        ? 'bg-amber-100 border-amber-300 text-slate-950 rotate-0 scale-105 shadow-md opacity-100 pointer-events-auto' 
                        : 'bg-[#faf8f2]/95 border-[#e2dccb] text-slate-900 -rotate-3 opacity-90 scale-95 pointer-events-auto'
                    }`}
                  >
                    <p className={`text-[8px] sm:text-[9px] font-mono font-black line-clamp-2 uppercase tracking-tighter leading-tight text-center ${isActive ? 'text-indigo-950' : 'text-slate-800'}`}>
                      {movie.title}
                    </p>
                    {isActive ? (
                      <span className="text-[6px] text-indigo-600 font-bold tracking-widest uppercase flex items-center gap-0.5 mt-0.5 animate-pulse">
                        OPEN ↗
                      </span>
                    ) : (
                      <span className="text-[5.5px] text-slate-400 font-bold tracking-widest uppercase flex items-center gap-0.5 mt-0.2">
                        REEL
                      </span>
                    )}
                  </div>

                  {/* Interactive details tag if active */}
                  {isActive && (
                    <div
                      className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded-full shadow-md z-30 transition pointer-events-auto"
                      title="Open on Letterboxd"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </div>
                  )}
                </ReelContainer>
              </motion.div>
            );
          })}
        </div>

        {/* Vintage studio floor edge bezel */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none z-20" />
      </div>

      {/* Real-time statistics overlay / floor logs info */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono border-t border-slate-850/60 pt-2.5">
        <div className="flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-slate-400" />
          <span>Stacked <strong className="text-slate-350">{films.length} spools</strong> on the studio floor</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
          <span>Interactive physical heap</span>
        </div>
      </div>
    </div>
  );
}
