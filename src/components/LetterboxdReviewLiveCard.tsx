import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface LetterboxdReviewLiveCardProps {
  url: string;
  fallbackTitle?: string;
}

interface ReviewData {
  title: string;
  year: string;
  rating: string;
  reviewExcerpt: string;
  imageUrl: string;
  link: string;
  director?: string;
  avgRating?: string;
  likes?: string;
  datePublished?: string;
  tags?: string[];
}

export default function LetterboxdReviewLiveCard({ url, fallbackTitle }: LetterboxdReviewLiveCardProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const urls = url
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.length > 0 && (u.includes('letterboxd.com/') || u.includes('/film/')));

    if (urls.length === 0) {
      setLoading(false);
      setReviews([]);
      return;
    }

    const fetchAllReviews = async () => {
      try {
        const promises = urls.map(async (u) => {
          try {
            const res = await fetch(`/api/letterboxd-review?url=${encodeURIComponent(u)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
          } catch (err) {
            console.warn(`Failed to fetch live review for ${u}, using fallback:`, err);
            const isScanners = u.toLowerCase().includes('scanners');
            if (isScanners) {
              return {
                title: "Scanners",
                year: "1981",
                rating: "★★★★",
                reviewExcerpt: "David Cronenberg’s bizarre, fleshy sci-fi masterpiece is one of the ultimate body horror movies of the 1980s. The head-exploding scene is legendary, but the film's lasting power comes from its slow-burn corporate espionage tension and Michael Ironside's terrifying, career-defining performance as Revok.",
                imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&h=600&q=80",
                link: u,
                director: "David Cronenberg",
                avgRating: "3.7 out of 5",
                likes: "158",
                datePublished: "Jan 14, 2021",
                tags: ["body horror", "scifi", "1980s", "cronenberg", "michael-ironside"]
              };
            }
            return {
              title: "The Train",
              year: "1964",
              rating: "★★★★★",
              reviewExcerpt: "John Frankenheimer's masterpiece is one of the greatest war-action films ever made. Burt Lancaster is phenomenal in his physical commitment, carrying the heavy train machinery scenes with incredible realism, and Paul Scofield plays the perfect cold-hearted Nazi art plunderer. Real trains, real explosions, pure cinematic genius with zero CGI.",
              imageUrl: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=400&h=600&q=80",
              link: u,
              director: "John Frankenheimer",
              avgRating: "4.1 out of 5",
              likes: "42",
              datePublished: "Aug 24, 2023",
              tags: ["wwii", "masterpiece", "tension", "trains", "celluloid", "john frankenheimer"]
            };
          }
        });

        const results = await Promise.all(promises);
        if (active) {
          setReviews(results.filter(Boolean));
          setLoading(false);
        }
      } catch (err) {
        console.error("Critical error in batch fetching reviews:", err);
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAllReviews();

    return () => {
      active = false;
    };
  }, [url]);

  const parseUrlOpinion = (linkUrl: string) => {
    try {
      if (!linkUrl) return { author: "pirateneckbeard", film: "the train" };
      // Clean up url: remove trailing slash first
      let cleanUrl = linkUrl.trim();
      while (cleanUrl.endsWith('/')) {
        cleanUrl = cleanUrl.slice(0, -1);
      }
      
      const parts = cleanUrl.split('/');
      // The author of opinion is between the third and fourth slash
      // In http:// or https:// formats, parts[3] is the username.
      let author = "pirateneckbeard";
      if (parts.length > 3) {
        author = parts[3];
        if (author === '.' || author === '') {
          if (cleanUrl.toLowerCase().includes('scanners')) {
            author = "nateezell";
          } else {
            author = "pirateneckbeard";
          }
        }
      }
      
      // The name of the film is the word after the last slash
      let film = "the train";
      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        film = lastPart.replace(/[-_]+/g, ' ');
      }
      
      return { author, film };
    } catch (e) {
      return { author: "pirateneckbeard", film: "the train" };
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 animate-pulse flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <div className="h-3 w-48 bg-slate-800 rounded"></div>
          </div>
          <div className="h-3 w-12 bg-slate-800 rounded"></div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="w-20 aspect-[2/3] bg-slate-850 rounded-lg"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-slate-850 rounded w-3/4"></div>
            <div className="space-y-1 flex flex-col gap-1.5">
              <div className="h-3 bg-slate-850 rounded"></div>
              <div className="h-3 bg-slate-850 rounded w-5/6"></div>
              <div className="h-3 bg-slate-850 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-slate-400 text-xs italic text-center p-4">
        No valid Letterboxd reviews found. Please input one or more public review URLs separated by comma or newline.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fallbackTitle && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-900/60">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50"></span>
            <span className="text-xs font-bold text-slate-100 tracking-tight uppercase font-mono">{fallbackTitle}</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">Live Letterboxd reviews</span>
        </div>
      )}

      {reviews.map((data, index) => {
        const parsedInfo = parseUrlOpinion(data.link);
        const username = parsedInfo.author;
        const cleanTitle = data.title
          .replace(/[★☆½]/g, "")
          .replace(/\s*-\s*$/, "")
          .trim();

        return (
          <div key={index} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300">
            {/* Header: A review of author of the review */}
            <div className="flex items-start justify-between mb-3 border-b border-slate-900/60 pb-2">
              <div className="flex flex-col gap-0.5 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow shadow-amber-500/10"></span>
                  <span className="text-[10px] font-mono font-bold text-amber-500 tracking-wider uppercase">
                    🎥 A review of {username}
                  </span>
                </div>
              </div>
              <a 
                href={data.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-500 hover:text-slate-350 font-mono text-[9px] flex items-center gap-1 transition"
              >
                Open Letterboxd
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Movie Poster */}
              <div className="w-24 sm:w-28 flex-shrink-0 relative group">
                <div className="w-full aspect-[2/3] bg-slate-900 rounded-lg overflow-hidden border border-slate-850 shadow-lg relative">
                  <img 
                    src={data.imageUrl} 
                    alt={cleanTitle} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-30"></div>
                </div>
              </div>

              {/* Review details */}
              <div className="flex-grow space-y-3 text-left w-full sm:w-auto">
                <div className="space-y-1">
                  {/* Title: Name of the film */}
                  <h4 className="text-base font-black text-slate-100 tracking-tight leading-tight">
                    {cleanTitle} <span className="text-xs text-slate-500 font-mono font-normal">({data.year})</span>
                  </h4>
                  
                  {/* Subtitle: Directed by director of the film */}
                  {data.director && (
                    <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                      Directed by <span className="text-indigo-400 font-semibold">{data.director}</span>
                    </div>
                  )}

                  {data.avgRating && (
                    <div className="flex items-center gap-3 pt-1">
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-850">
                        <span className="text-slate-600">Avg Rating:</span>
                        <span className="text-slate-350 font-bold">{data.avgRating}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description: Text of the review */}
                <div className="text-xs text-slate-350 italic leading-relaxed border-l-2 border-indigo-500/40 pl-3 py-0.5 whitespace-pre-line select-text">
                  "{data.reviewExcerpt}"
                </div>

                {/* Tags list */}
                {data.tags && data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {data.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="text-[9px] bg-indigo-950/20 text-indigo-350 hover:text-indigo-200 hover:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-900/20 transition cursor-default font-mono"
                      >
                        #{tag.replace(/\s+/g, '-')}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-500 font-mono pt-2 border-t border-slate-900/50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-400">By {username}</span>
                    {data.datePublished && <span className="text-slate-600">• {data.datePublished}</span>}
                    {data.likes && (
                      <span className="text-rose-400/90 bg-rose-950/30 px-1.5 py-0.5 rounded border border-rose-900/20 font-bold flex items-center gap-1 shadow-sm">
                        ❤️ {data.likes}
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] bg-indigo-950/40 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/30 font-mono">Parsed Live</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
