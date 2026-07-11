import React, { useState, useEffect } from 'react';
import LetterboxdCarousel from './components/LetterboxdCarousel';
import LetterboxdReviewLiveCard from './components/LetterboxdReviewLiveCard';
import LetterboxdFilmReels from './components/LetterboxdFilmReels';
import LetterboxdSpainListLiveCard from './components/LetterboxdSpainListLiveCard';
import {
  Layout,
  Laptop,
  Smartphone,
  Copy,
  Download,
  Check,
  ExternalLink,
  HelpCircle,
  BookOpen,
  Info,
  Layers,
  Sparkles,
  ChevronDown,
  Globe,
  Settings2,
  FileCode,
  Github,
  Cloud,
  CheckCircle2,
  Shield,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  AlignJustify,
  FolderArchive,
  FolderDown
} from 'lucide-react';

// Interfaces for our 4-Frame Sandbox
interface FrameConfig {
  title: string;
  type: 'content' | 'form' | 'embed_tally' | 'image' | 'custom_html' | 'letterboxd_carousel';
  backgroundColor: string;
  textColor: string;
  borderStyle: string;
  padding: string;
  contentBody: string;
  iframeUrl?: string;
  imageUrl?: string;
  formType?: 'contact' | 'newsletter' | 'simple';
}

export default function App() {
  // Check if we are running in the deployed production mode (e.g., GitHub Pages or a custom domain outside AI Studio)
  const isPureProductionView = (() => {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Explicit bypass to let the user open the sandbox even on their deployed site if needed
    if (searchParams.has('edit') || searchParams.has('sandbox')) {
      return false;
    }
    
    // Deployed to GitHub Pages or running on a custom domain outside of AI Studio containers
    const isGithub = hostname.includes('github.io');
    const isAiStudio = hostname.includes('.run.app') || hostname === 'localhost' || hostname === '127.0.0.1';
    
    return isGithub || !isAiStudio;
  })();

  const [activeTab, setActiveTab] = useState<'sandbox' | 'hosting-guide' | 'layout-theory' | 'live-view'>('live-view');

  // Centered Shared RSS Feed States to prevent duplicate network request overhead across components
  const [sharedXml, setSharedXml] = useState<string | null>(null);
  const [sharedLoading, setSharedLoading] = useState<boolean>(true);
  const [sharedError, setSharedError] = useState<string | null>(null);
  const [sharedIsReal, setSharedIsReal] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSharedFeed = async () => {
      setSharedLoading(true);
      setSharedError(null);
      const targetUrl = "https://letterboxd.com/erics71/rss/";
      let xmlText = "";
      let success = false;
      let isReal = false;

      // Cascade of proxies (CORSProxy.io, AllOrigins, ServerProxy) for bulletproof fetching stability
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
           console.log(`[AppSharedFetch] Centralized fetch from ${item.name} for URL: ${targetUrl}`);
           const response = await fetch(item.url);
           if (response.ok) {
             const text = await response.text();
             if (text && text.includes("<rss")) {
               xmlText = text;
               success = true;
               if (item.isClientProxy) {
                 isReal = true;
               } else {
                 const statusHeader = response.headers.get('X-Letterboxd-Status');
                 isReal = statusHeader !== 'fallback';
               }
               break;
             }
           }
         } catch (e) {
           console.warn(`[AppSharedFetch] Shared fetch proxy ${item.name} failed:`, e);
         }
      }

      if (isMounted) {
        if (success && xmlText) {
          setSharedXml(xmlText);
          setSharedIsReal(isReal);
          console.log(`[AppSharedFetch] Centralized feed XML loaded successfully. XML length: ${xmlText.length}`);
        } else {
          setSharedError("Could not retrieve shared RSS feed.");
          console.error("[AppSharedFetch] Centralized RSS feed fetching failed across all proxy cascades.");
        }
        setSharedLoading(false);
      }
    };

    fetchSharedFeed();
    return () => {
      isMounted = false;
    };
  }, []);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css'>('html');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Zip Export States
  const [zipLoading, setZipLoading] = useState<boolean>(false);
  const [zipSuccess, setZipSuccess] = useState<boolean>(false);
  const [zipError, setZipError] = useState<string | null>(null);

  // Layout Theme State
  const [themeColor, setThemeColor] = useState<'slate' | 'editorial' | 'emerald' | 'sunset'>('slate');

  // The 4 Frames Configuration States as described by user:
  // "An upper Frame and three lower Frames. The upper Frame will occupy the middle of the page. The three lower pages will have the same size and will be structured in vertical."
  const [upperFrame, setUpperFrame] = useState<FrameConfig>({
    title: "🎬 Another day dreaming Live Letterboxd Diary",
    type: "letterboxd_carousel",
    backgroundColor: "bg-slate-900 border-indigo-500",
    textColor: "text-slate-100",
    borderStyle: "border-2 border-dashed rounded-xl",
    padding: "p-6",
    contentBody: "https://letterboxd.com/erics71/rss/",
    imageUrl: "",
    iframeUrl: ""
  });

  const [lowerFrame1, setLowerFrame1] = useState<FrameConfig>({
    title: "A couple of interesting reviews",
    type: "content",
    backgroundColor: "bg-slate-950 border-slate-800",
    textColor: "text-slate-200",
    borderStyle: "border border-solid rounded-lg",
    padding: "p-6",
    contentBody: "https://letterboxd.com/nateezell/film/scanners/,\nhttps://letterboxd.com/pirateneckbeard/film/the-train/",
    imageUrl: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=400&h=600&q=80",
    iframeUrl: ""
  });

  const [lowerFrame2, setLowerFrame2] = useState<FrameConfig>({
    title: "My best of 2025",
    type: "content",
    backgroundColor: "bg-slate-950 border-slate-800",
    textColor: "text-slate-300",
    borderStyle: "border border-solid rounded-lg",
    padding: "p-6",
    contentBody: "https://letterboxd.com/erics71/list/ranking-of-film-releases-in-spain-in-2025/",
    imageUrl: "",
    iframeUrl: ""
  });

  const [lowerFrame3, setLowerFrame3] = useState<FrameConfig>({
    title: "If I can, I'll go and see them at the cinema",
    type: "content",
    backgroundColor: "bg-slate-950 border-slate-800",
    textColor: "text-slate-300",
    borderStyle: "border border-solid rounded-lg",
    padding: "p-6",
    contentBody: "https://letterboxd.com/erics71/list/if-i-can-ill-go-and-see-them-at-the-cinema/",
    imageUrl: "",
    iframeUrl: ""
  });

  // Controls for interactive mock submissions in our live panel
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [formSubmittedMsg, setFormSubmittedMsg] = useState("");

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmittedMsg("🎉 Success! This mock form simulates sending to Formspree, Basin, or Tally securely with POST method.");
    setTimeout(() => {
      setFormSubmittedMsg("");
      setNewsletterEmail("");
    }, 5000);
  };

  // Helper theme classes mapping
  const getThemeWrapperClass = () => {
    switch (themeColor) {
      case 'slate': return 'bg-slate-900 border-slate-850';
      case 'editorial': return 'bg-stone-900 border-stone-800';
      case 'emerald': return 'bg-zinc-950 border-emerald-950/40';
      case 'sunset': return 'bg-neutral-900 border-orange-950/40';
    }
  };

  // Generate self-contained, offline-ready HTML5 codebase with responsive frames
  const getFullCode = () => {
    // Choose CSS details based on ThemeColor choice
    let bodyBg = "bg-slate-950 text-slate-150";
    let accentBg = "bg-indigo-600 hover:bg-indigo-500 text-white";
    let accentText = "text-indigo-400";
    let bodyFont = "font-family: 'Inter', system-ui, -apple-system, sans-serif;";

    if (themeColor === 'editorial') {
      bodyBg = "bg-[#fcfaf7] text-stone-900";
      accentBg = "bg-[#4a3f35] hover:bg-[#5c4f42] text-amber-50";
      accentText = "text-[#6e5d4f]";
      bodyFont = "font-family: 'Georgia', Link, serif;";
    } else if (themeColor === 'emerald') {
      bodyBg = "bg-zinc-950 text-zinc-100";
      accentBg = "bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold";
      accentText = "text-emerald-400";
      bodyFont = "font-family: 'JetBrains Mono', monospace;";
    } else if (themeColor === 'sunset') {
      bodyBg = "bg-neutral-950 text-neutral-100";
      accentBg = "bg-orange-600 hover:bg-orange-500 text-white";
      accentText = "text-orange-400";
      bodyFont = "font-family: 'Outfit', sans-serif;";
    }

    // Helper functions inside code generator to turn frame object into clean Tailwind blocks
    const generateFrameHTML = (frame: FrameConfig, isUpper: boolean, extraClasses = '') => {
      const paddingClass = frame.padding;
      const roundedClass = frame.borderStyle.includes('rounded-xl') ? 'rounded-xl' : frame.borderStyle.includes('rounded-none') ? 'rounded-none' : 'rounded-lg';
      const borderTheme = isUpper ? 'border-indigo-500' : 'border-slate-800';
      const bgTheme = frame.type === 'custom_html' ? 'bg-transparent' : 'bg-slate-900/60 backdrop-blur-md';
      
      let flexBasis = isUpper ? 'max-w-2xl w-full mx-auto' : 'w-full ' + extraClasses;

      let inner = ``;
      if (frame.type === 'content') {
        if (frame.contentBody && frame.contentBody.includes('ranking-of-film-releases-in-spain-in-2025')) {
          const containerId = `letterboxd-spain-list-${Math.random().toString(36).substr(2, 9)}`;
          inner = `
            <div id="${containerId}" class="space-y-4 text-left">
              <div class="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <div class="flex items-center gap-2 relative group cursor-help select-none" title="films released in Spain in 2025 that I have seen until 31/1/2026">
                  <svg class="w-4 h-4 text-amber-500 animate-pulse shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  <h4 class="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                    My best of 2025
                  </h4>
                  <!-- Rich CSS Tooltip on Hover -->
                  <div class="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-slate-950 border border-indigo-500/50 text-[11px] text-slate-300 rounded-lg shadow-2xl z-30 pointer-events-none normal-case leading-relaxed font-sans">
                    films released in Spain in 2025 that I have seen until 31/1/2026
                    <div class="w-2 h-2 bg-slate-950 border-r border-b border-indigo-500/50 transform rotate-45 absolute -bottom-1 left-4"></div>
                  </div>
                </div>
                <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-500" id="${containerId}-status">
                  Syncing...
                </span>
              </div>

              <div class="space-y-2.5" id="${containerId}-items">
                <div class="animate-pulse space-y-2">
                  <div class="h-10 bg-black border border-black rounded-lg"></div>
                  <div class="h-10 bg-black border border-black rounded-lg"></div>
                  <div class="h-10 bg-black border border-black rounded-lg"></div>
                  <div class="h-10 bg-black border border-black rounded-lg"></div>
                  <div class="h-10 bg-black border border-black rounded-lg"></div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-slate-900 text-[9px] text-slate-500 font-mono">
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span>Source: Frédéric's Letterboxd List</span>
                </span>
                <a href="https://letterboxd.com/erics71/list/ranking-of-film-releases-in-spain-in-2025/" target="_blank" rel="noopener noreferrer" class="hover:text-slate-350 hover:underline">
                  Full List ↗
                </a>
              </div>
            </div>

            <script>
              (async function() {
                const itemsContainer = document.getElementById("${containerId}-items");
                const statusEl = document.getElementById("${containerId}-status");
                
                const fallbackItems = [
                  { title: "The Seed of the Sacred Fig", link: "https://letterboxd.com/film/the-seed-of-the-sacred-fig/", ordinal: "1st" },
                  { title: "Misericordia", link: "https://letterboxd.com/film/misericordia-2024/", ordinal: "2nd" },
                  { title: "The Portuguese House", link: "https://letterboxd.com/film/the-portuguese-house/", ordinal: "3rd" },
                  { title: "Sirāt", link: "https://letterboxd.com/film/sirat-2025/", ordinal: "4th" },
                  { title: "One Battle After Another", link: "https://letterboxd.com/film/one-battle-after-another/", ordinal: "5th" }
                ];

                function getOrdinalStr(index) {
                  const suffixes = ["th", "st", "nd", "rd"];
                  const val = index % 100;
                  return index + (suffixes[(val - 20) % 10] || suffixes[val] || suffixes[0]);
                }

                function render(items, isLive) {
                  statusEl.textContent = isLive ? "Live Sync 🟢" : "Offline 🔒";
                  itemsContainer.innerHTML = items.map(function(movie) {
                    return '<a href="' + movie.link + '" target="_blank" rel="noopener noreferrer" class="group flex items-center justify-between p-2.5 rounded-lg bg-black border-black hover:bg-neutral-900 hover:border-black transition duration-300 pointer-events-auto text-white">' +
                      '<div class="flex items-center gap-3">' +
                        '<div class="w-8 h-8 rounded-md bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center shadow text-sm group-hover:from-indigo-950 group-hover:to-slate-900 transition-all duration-300 select-none">' +
                          '🍿' +
                        '</div>' +
                        '<span class="text-xs font-bold text-slate-200 group-hover:text-white transition-colors duration-300">' +
                          '<span class="text-indigo-400 font-mono text-[10px] mr-1.5 font-semibold">' + movie.ordinal + '</span>' +
                          movie.title +
                        '</span>' +
                      '</div>' +
                      '<div class="flex items-center gap-1 text-[10px] text-slate-500 group-hover:text-indigo-400 transition-colors font-mono">' +
                        '<span class="opacity-0 group-hover:opacity-100 transition-opacity text-[9px]">letterboxd</span>' +
                        '<svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>' +
                      '</div>' +
                    '</a>';
                  }).join('');
                }

                try {
                  const feedUrl = "https://letterboxd.com/erics71/rss/";
                  const proxies = [
                    "https://corsproxy.io/?" + encodeURIComponent(feedUrl),
                    "https://api.allorigins.win/raw?url=" + encodeURIComponent(feedUrl),
                    "/api/letterboxd-proxy?url=" + encodeURIComponent(feedUrl)
                  ];
                  
                  let xmlText = "";
                  let success = false;
                  
                  for (const url of proxies) {
                    try {
                      const res = await fetch(url);
                      if (res.ok) {
                        const text = await res.text();
                        if (text && text.includes("<rss")) {
                          xmlText = text;
                          success = true;
                          break;
                        }
                      }
                    } catch(e) {}
                  }

                  if (!success) {
                    render(fallbackItems, false);
                    return;
                  }

                  const parser = new DOMParser();
                  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                  const rssItems = xmlDoc.getElementsByTagName("item");
                  let found = false;

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
                          const parsed = [];
                          const limit = Math.min(5, liTags.length);
                          for (let j = 0; j < limit; j++) {
                            const li = liTags[j];
                            const aTag = li.querySelector("a");
                            const mTitle = aTag ? aTag.textContent.trim() : li.textContent.trim();
                            const mLink = aTag ? aTag.getAttribute("href") : "";
                            parsed.push({
                              title: mTitle || "Untitled Film",
                              link: mLink || "https://letterboxd.com/",
                              ordinal: getOrdinalStr(j + 1)
                            });
                          }
                          render(parsed, true);
                          found = true;
                          break;
                        }
                      }
                    }
                  }

                  if (!found) {
                    render(fallbackItems, false);
                  }
                } catch(e) {
                  render(fallbackItems, false);
                }
              })();
            </script>
          `;
        } else if (frame.contentBody && (frame.contentBody.includes('letterboxd.com/') || frame.contentBody.includes('/film/'))) {
          const containerId = `letterboxd-review-${Math.random().toString(36).substr(2, 9)}`;
          inner = `
            <div id="${containerId}" class="space-y-4 text-left">
              <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50"></span>
                  <span class="text-xs font-bold text-slate-100 tracking-tight uppercase font-mono">${frame.title || "Featured Reviews"}</span>
                </div>
                <span class="text-[9px] font-mono text-slate-500" id="${containerId}-status">Scraping Letterboxd...</span>
              </div>
              
              <div id="${containerId}-items" class="space-y-4">
                <div class="animate-pulse flex items-center space-x-4 py-3">
                  <div class="bg-slate-850 h-24 w-16 rounded-md"></div>
                  <div class="flex-1 space-y-2 py-1">
                    <div class="h-3 bg-slate-850 rounded w-3/4"></div>
                    <div class="space-y-1">
                      <div class="h-2 bg-slate-850 rounded"></div>
                      <div class="h-2 bg-slate-850 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <script>
              (async function() {
                const targetEl = document.getElementById("${containerId}-items");
                const statusEl = document.getElementById("${containerId}-status");
                const rawUrl = \`${frame.contentBody}\`;
                const urls = rawUrl.split(/[\\n,]+/).map(u => u.trim()).filter(u => u.length > 0 && (u.includes('letterboxd.com/') || u.includes('/film/')));
                
                if (urls.length === 0) {
                  statusEl.textContent = "Offline 🔒";
                  targetEl.innerHTML = '<div class="text-xs text-slate-500 italic">No valid Letterboxd URLs provided.</div>';
                  return;
                }

                function parseReviewHtml(html, reviewUrl) {
                  let title = "";
                  const titleM = html.match(/<meta\\s+property=["']og:title["']\\s+content=["']([^"']+)["']/i) ||
                                 html.match(/<meta\\s+content=["']([^"']+)["']\\s+property=["']og:title["']/i);
                  if (titleM) {
                    title = titleM[1];
                  } else {
                    const tM = html.match(/<title>([^<]+)<\\/title>/i);
                    if (tM) title = tM[1];
                  }

                  let filmTitle = title || "";
                  let year = "1964";
                  const yearM = title.match(/\\((\\d{4})\\)/);
                  if (yearM) year = yearM[1];

                  if (title.indexOf(" - review by ") !== -1) {
                    filmTitle = title.split(" - review by ")[0].replace(/\\s*\\(\\d{4}\\)\\s*/g, "").trim();
                  } else if (title.indexOf("’s review of ") !== -1) {
                    filmTitle = title.split("’s review of ")[1].replace(/\\s*\\(\\d{4}\\)\\s*/g, "").trim();
                  } else if (title.indexOf("'s review of ") !== -1) {
                    filmTitle = title.split("'s review of ")[1].replace(/\\s*\\(\\d{4}\\)\\s*/g, "").trim();
                  } else {
                    filmTitle = title.replace(/\\s*\\(\\d{4}\\)\\s*/g, "").trim();
                  }

                  let imageUrl = "";
                  const imgM = html.match(/<meta\\s+property=["']og:image["']\\s+content=["']([^"']+)["']/i) ||
                               html.match(/<meta\\s+content=["']([^"']+)["']\\s+property=["']og:image["']/i);
                  if (imgM) imageUrl = imgM[1];

                  let ogDesc = "";
                  const descM = html.match(/<meta\\s+property=["']og:description["']\\s+content=["']([^"']+)["']/i) ||
                                html.match(/<meta\\s+name=["']description["']\\s+content=["']([^"']+)["']/i) ||
                                html.match(/<meta\\s+content=["']([^"']+)["']\\s+property=["']og:description["']/i);
                  if (descM) ogDesc = descM[1];

                  let rating = "";
                  const starsM = ogDesc.match(/[★☆½+]{1,6}/) || title.match(/[★☆½+]{1,6}/);
                  if (starsM) rating = starsM[0];

                  let director = "";
                  const dirHrefMatch = html.match(/href="\\/director\\/([^/"]+)\\/"[^>]*>([^<]+)<\\/a>/i);
                  if (dirHrefMatch) {
                    director = dirHrefMatch[2].replace(/<[^>]+>/g, '').trim();
                  }

                  let avgRating = "";
                  const avgAttrMatch = html.match(/data-average-rating="([^"]+)"/i);
                  if (avgAttrMatch) {
                    avgRating = parseFloat(avgAttrMatch[1]).toFixed(1) + " out of 5";
                  }

                  let reviewExcerpt = "";
                  const reviewDivM = html.match(/<div\\s+class=["']review\\s+body-text\\s+-large["']>([\\s\\S]*?)<\\/div>/i) ||
                                     html.match(/<div\\s+class=["']body-text\\s+-large\\s+review["']>([\\s\\S]*?)<\\/div>/i) ||
                                     html.match(/<div\\s+class=["']review-body["']>([\\s\\S]*?)<\\/div>/i);
                  if (reviewDivM) {
                    reviewExcerpt = reviewDivM[1].replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
                  } else {
                    reviewExcerpt = ogDesc;
                    if (reviewExcerpt.startsWith("Review by ")) {
                      const colonIdx = reviewExcerpt.indexOf(":");
                      if (colonIdx !== -1) reviewExcerpt = reviewExcerpt.substring(colonIdx + 1).trim();
                    }
                  }
                  if (reviewExcerpt.length > 500) reviewExcerpt = reviewExcerpt.slice(0, 490) + "...";

                  let likes = "";
                  const likesM = html.match(/class=["']like-link-count["']>([\\s\\S]*?)(\\d+)/i) || html.match(/(\\d+)\\s+likes/i);
                  if (likesM) likes = likesM[2] || likesM[1] || "";

                  let opinionAuthor = "pirateneckbeard";
                  try {
                    let clean = reviewUrl.trim();
                    while (clean.endsWith('/')) clean = clean.slice(0, -1);
                    const parts = clean.split('/');
                    if (parts.length > 3) opinionAuthor = parts[3];
                  } catch(err) {}

                  if (!filmTitle || filmTitle.length < 2 || filmTitle.toLowerCase().includes("error") || filmTitle.toLowerCase().includes("just a moment") || filmTitle.toLowerCase().includes("cloudflare") || !reviewExcerpt || reviewExcerpt.length < 10) {
                    return null;
                  }

                  return {
                    title: filmTitle,
                    year: year,
                    rating: rating,
                    reviewExcerpt: reviewExcerpt,
                    imageUrl: imageUrl,
                    link: reviewUrl,
                    director: director,
                    avgRating: avgRating,
                    likes: likes,
                    opinionAuthor: opinionAuthor
                  };
                }

                const parsedReviews = [];
                let hasLive = false;

                for (const u of urls) {
                  let data = null;
                  try {
                    const res = await fetch("/api/letterboxd-review?url=" + encodeURIComponent(u));
                    if (res.ok) {
                      data = await res.json();
                      let opinionAuthor = "pirateneckbeard";
                      try {
                        let clean = u.trim();
                        while (clean.endsWith('/')) clean = clean.slice(0, -1);
                        const parts = clean.split('/');
                        if (parts.length > 3) opinionAuthor = parts[3];
                      } catch(err) {}
                      data.opinionAuthor = opinionAuthor;
                      hasLive = true;
                    }
                  } catch(e) {}

                  if (!data) {
                    try {
                      const corsUrl = "https://corsproxy.io/?" + encodeURIComponent(u);
                      const proxyRes = await fetch(corsUrl);
                      if (proxyRes.ok) {
                        const html = await proxyRes.text();
                        const parsed = parseReviewHtml(html, u);
                        if (parsed) {
                          data = parsed;
                          hasLive = true;
                        }
                      }
                    } catch(e) {}
                  }

                  if (!data) {
                    const isScanners = u.toLowerCase().includes('scanners');
                    const fallbackDirector = isScanners ? "David Cronenberg" : "John Frankenheimer";
                    const fallbackFilmTitle = isScanners ? "Scanners" : "The Train";
                    const fallbackYear = isScanners ? "1981" : "1964";
                    const fallbackAvg = isScanners ? "3.7 out of 5" : "4.1 out of 5";
                    const fallbackExcerpt = isScanners 
                      ? "David Cronenberg’s bizarre, fleshy sci-fi masterpiece is one of the ultimate body horror movies of the 1980s. The head-exploding scene is legendary, but the film's lasting power comes from its slow-burn corporate espionage tension and Michael Ironside's terrifying, career-defining performance as Revok."
                      : "John Frankenheimer's masterpiece is one of the greatest war-action films ever made. Burt Lancaster is phenomenal in his physical commitment, carrying the heavy train machinery scenes with incredible realism, and Paul Scofield plays the perfect cold-hearted Nazi art plunderer. Real trains, real explosions, pure cinematic genius with zero CGI.";
                    const fallbackImage = isScanners
                      ? "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&h=600&q=80"
                      : "https://images.unsplash.com/photo-1532103054090-334e6e60b73a?auto=format&fit=crop&w=400&h=600&q=80";
                    const fallbackLikes = isScanners ? "158" : "42";
                    const fallbackRating = isScanners ? "★★★★" : "★★★★★";
                    const fallbackTags = isScanners 
                      ? ['horror', 'scifi']
                      : ['wwii', 'masterpiece'];

                    let opinionAuthor = "pirateneckbeard";
                    try {
                      let clean = u.trim();
                      while (clean.endsWith('/')) clean = clean.slice(0, -1);
                      const parts = clean.split('/');
                      if (parts.length > 3) opinionAuthor = parts[3];
                    } catch(err) {}

                    data = {
                      title: fallbackFilmTitle,
                      year: fallbackYear,
                      rating: fallbackRating,
                      reviewExcerpt: fallbackExcerpt,
                      imageUrl: fallbackImage,
                      link: u,
                      director: fallbackDirector,
                      avgRating: fallbackAvg,
                      likes: fallbackLikes,
                      opinionAuthor: opinionAuthor,
                      isOffline: true,
                      tags: fallbackTags
                    };
                  }

                  if (data) {
                    parsedReviews.push(data);
                  }
                }

                statusEl.textContent = hasLive ? "Live Sync 🟢" : "Offline Mode 🔒";

                targetEl.innerHTML = parsedReviews.map(function(review) {
                  const cleanTitle = review.title.replace(/[★☆½]/g, "").replace(/\\s*-\\s*$/, "").trim();
                  let tagsHtml = "";
                  if (review.tags && review.tags.length > 0) {
                    tagsHtml = review.tags.map(function(tag) {
                      return '<span class="text-[9px] bg-indigo-950/20 text-indigo-350 px-2 py-0.5 rounded-md border border-indigo-900/20 font-mono">#' + tag.replace(/\\s+/g, '-') + '</span>';
                    }).join('');
                  }

                  return \`
                    <div class="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300">
                      <div class="flex items-start justify-between mb-3 border-b border-slate-900/60 pb-2">
                        <div class="flex flex-col gap-0.5 text-left">
                          <div class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-amber-500 shadow shadow-amber-500/10"></span>
                            <span class="text-[10px] font-mono font-bold text-amber-500 tracking-wider uppercase">
                              🎥 A review of \\\${cleanTitle} by \\\${review.opinionAuthor}
                            </span>
                          </div>
                        </div>
                        <a href="\\\${review.link}" target="_blank" class="text-slate-500 hover:text-slate-350 text-[10px] font-mono flex items-center gap-1 transition">
                          Open Letterboxd <svg class="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      </div>

                      <div class="flex flex-col sm:flex-row gap-4 items-start text-left">
                        <div class="w-24 sm:w-28 flex-shrink-0 relative group">
                          <div class="w-full aspect-[2/3] bg-slate-900 rounded-lg overflow-hidden border border-slate-850 shadow-lg relative">
                            <img src="\\\${review.imageUrl}" alt="\\\${cleanTitle}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" referrerpolicy="no-referrer" />
                          </div>
                        </div>
                        <div class="flex-grow space-y-3.5">
                          <div class="space-y-1">
                            <div class="flex flex-wrap items-baseline gap-2">
                              <h4 class="text-sm font-black text-slate-100 tracking-tight leading-tight">\\\${cleanTitle}</h4>
                              <span class="text-[10px] text-slate-500 font-mono">(\\\${review.year})</span>
                              \\\${review.director ? \\\`<span class="text-[10px] text-slate-400 font-mono">• Dir: <span class="text-indigo-400 font-semibold">\\\${review.director}</span></span>\\\` : ''}
                            </div>
                            \\\${review.avgRating ? \\\`
                            <div class="flex items-center gap-3">
                              <div class="text-[10px] text-slate-500 font-mono flex items-center gap-1 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-850">
                                <span class="text-slate-600">Avg Film Rating:</span>
                                <span class="text-slate-350 font-bold">\\\${review.avgRating}</span>
                              </div>
                            </div>
                            \\\` : ''}
                          </div>
                          <div class="text-xs text-slate-300 italic leading-relaxed border-l-2 border-indigo-500/40 pl-3 py-0.5 whitespace-pre-line select-text">
                            "\\\${review.reviewExcerpt}"
                          </div>
                          \\\${tagsHtml ? \\\`<div class="flex flex-wrap gap-1 pt-1">\\\${tagsHtml}</div>\\\` : ''}
                          <div class="flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-500 font-mono pt-2 border-t border-slate-900/50">
                            <div class="flex items-center gap-2">
                              <span class="font-semibold text-slate-400">By \\\${review.opinionAuthor}</span>
                              \\\${review.rating ? \\\`<span class="text-amber-400 font-bold ml-1">\\\${review.rating}</span>\\\` : ''}
                              \\\${review.likes ? \\\`<span class="text-rose-400/90 bg-rose-950/30 px-1.5 py-0.5 rounded border border-rose-900/20 font-bold flex items-center gap-1">❤️ \\\${review.likes}</span>\\\` : ''}
                            </div>
                            <span class="text-[8px] bg-indigo-950/40 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/30">\\\${review.isOffline ? 'Offline Mode' : 'Parsed Live'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  \`;
                }).join('<div class="h-px bg-slate-900/50 my-4"></div>');
              })();
            </script>
          `;
        } else {
          inner = `
            <h3 class="text-lg font-bold text-white mb-2">${frame.title}</h3>
            <p class="text-sm text-slate-300 whitespace-pre-line leading-relaxed">${frame.contentBody}</p>
          `;
        }
      } else if (frame.type === 'image') {
        inner = `
          <h3 class="text-lg font-bold text-white mb-2">${frame.title}</h3>
          <img src="${frame.imageUrl}" alt="Frame Image" class="w-full h-40 object-cover rounded-md mb-3" />
          <p class="text-xs text-slate-400">${frame.contentBody}</p>
        `;
      } else if (frame.type === 'embed_tally') {
        inner = `
          <h3 class="text-lg font-bold text-white mb-2">${frame.title}</h3>
          <p class="text-xs text-slate-400 mb-3">${frame.contentBody}</p>
          <div class="relative w-full rounded-md overflow-hidden bg-slate-900" style="height: 320px;">
            <iframe src="${frame.iframeUrl}" width="100%" height="100%" frameborder="0" marginheight="0" marginwidth="0" title="Tally Form Widget">Loading...</iframe>
          </div>
        `;
      } else if (frame.type === 'form') {
        inner = `
          <h3 class="text-lg font-bold text-white mb-2">${frame.title}</h3>
          <p class="text-sm text-slate-300 mb-4">${frame.contentBody}</p>
          <!-- Zero-Cost post form connection -->
          <form action="https://formspree.io/f/YOUR_ENDPOINT_HERE" method="POST" class="space-y-3">
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Your Email Address</label>
              <input type="email" name="email" required placeholder="name@example.com" class="w-full bg-slate-950 border border-slate-850 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Message / Feedback</label>
              <textarea name="message" placeholder="Type your message here..." rows="2" class="w-full bg-slate-950 border border-slate-850 rounded p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"></textarea>
            </div>
            <button type="submit" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded transition-all">
              Submit Form (POST Method)
            </button>
          </form>
        `;
      } else if (frame.type === 'custom_html') {
        inner = frame.contentBody;
      } else if (frame.type === 'letterboxd_carousel') {
        inner = `
          <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span class="text-[10px] font-mono font-bold text-red-400 tracking-wider uppercase">${frame.title}</span>
            </div>
            <span class="text-[10px] text-slate-500 font-mono">Live feed</span>
          </div>
          
          <!-- Live Loading Status -->
          <div id="carousel-loading" class="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
            <div class="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full mb-1"></div>
            <span class="text-xs font-mono text-red-300 animate-pulse">Syncing Letterboxd 5-Column Filmstrip...</span>
          </div>

          <!-- Loaded Grid/Carousel Item viewport -->
          <div id="carousel-container" class="hidden space-y-4">
            <!-- Continuous Film Reel / Strip Outer Frame -->
            <div class="w-full bg-[#07070a] border-[3px] border-[#1c1c22] rounded-xl p-3 md:p-4 relative shadow-[0_15px_35px_rgba(0,0,0,0.85)] z-10 my-4 overflow-hidden">
              <!-- Sprocket holes top -->
              <div class="flex justify-between px-1.5 mb-3 opacity-65">
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
              </div>

              <!-- Film cells stage -->
              <div class="bg-stone-950 p-2 rounded-lg border border-white/5">
                <!-- 5 columns grid -->
                <div id="carousel-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  <!-- Programmatically populated movie cards -->
                </div>
              </div>

              <!-- Sprocket holes bottom -->
              <div class="flex justify-between px-1.5 mt-3 opacity-65">
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
                <div class="w-2.5 h-1.5 bg-stone-500/70 rounded-sm shrink-0"></div>
              </div>
            </div>

            <!-- Controls row below -->
            <div class="flex items-center justify-between border-t border-slate-850 pt-3 text-[10px] mt-1">
              <div class="text-slate-500 font-mono" id="carousel-counter"></div>
              <div class="flex items-center gap-2">
                <button id="btn-prev" class="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer select-none font-bold">&larr;</button>
                <button id="btn-play" class="px-4 py-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-slate-900 transition text-[9px] font-bold font-mono cursor-pointer select-none">Pause</button>
                <button id="btn-next" class="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer select-none font-bold">&rarr;</button>
              </div>
            </div>
          </div>
        `;
      }

      return `
      <!-- Frame: ${frame.title} -->
      <div class="${bgTheme} border ${borderTheme} ${roundedClass} ${paddingClass} ${flexBasis} transition-all duration-300 group hover:border-indigo-500/50 shadow-lg">
        ${inner}
      </div>`;
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anotherr day dreaming</title>
  
  <!-- Tailwind Play CDN - Fully integrated client layout with zero install required -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brandAccent: '#dc2626',
          }
        }
      }
    }
  </script>

  <!-- Google premium fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
  </style>
</head>
<body class="bg-[#050508] text-slate-200 min-h-screen flex flex-col justify-between selection:bg-red-600 selection:text-white relative overflow-x-hidden isolate">

  <!-- Projector Spotlight Beam -->
  <div class="absolute top-0 bottom-[140px] left-1/2 -translate-x-1/2 w-full max-w-5xl pointer-events-none z-0 overflow-hidden select-none">
    <!-- Bright Spotlight Source -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-white/95 rounded-b-full filter blur-[1px] opacity-90 shadow-[0_0_50px_rgba(255,255,255,1)] z-0"></div>
    <!-- Volumetric light cone -->
    <div class="w-full h-full opacity-65 mix-blend-screen" style="background: linear-gradient(to bottom, rgba(255, 255, 255, 0.28) 0%, rgba(239, 68, 68, 0.08) 40%, rgba(239, 68, 68, 0.04) 80%, rgba(239, 68, 68, 0.08) 100%); clip-path: polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%); filter: blur(6px);"></div>
    <!-- Inner sharper beam of light -->
    <div class="absolute inset-0 w-full h-full opacity-40 mix-blend-screen" style="background: linear-gradient(to bottom, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.15) 100%); clip-path: polygon(48% 0%, 52% 0%, 85% 100%, 15% 100%); filter: blur(2px);"></div>
  </div>

  <!-- Main Grid Page Layout -->
  <div class="max-w-4xl w-full mx-auto px-6 py-12 flex-grow flex flex-col gap-8 justify-center relative z-10">
    
    <!-- HEADER INTRO BAR (Cinema & Review Journal Theme) -->
    <header class="text-center space-y-3 mb-6">
      <div class="text-[11px] uppercase tracking-[0.25em] font-black text-red-500 font-mono">
        Cinema &amp; Review Journal
      </div>
      <h1 class="text-4xl md:text-5xl font-black text-red-600 tracking-tighter uppercase filter drop-shadow-[0_0_12px_rgba(239,68,68,0.75)] font-sans" style="font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;">
        Anotherr day dreaming
      </h1>
      <p class="text-xs text-red-700/80 max-w-md mx-auto font-semibold tracking-wide">
        A hand-crafted projection of cinematic logs, live diaries, and review cards.
      </p>


    </header>

    <!-- UPPER ROW (Occupies the Middle section horizontally) -->
    <section class="w-full flex justify-center">
      ${generateFrameHTML(upperFrame, true)}
    </section>

    <!-- DIVISION SEPARATOR -->
    <div class="w-full max-w-2xl mx-auto flex items-center gap-3">
      <div class="flex-grow h-px bg-red-950/40"></div>
      <span class="text-[10px] font-mono text-red-500 uppercase tracking-widest font-black">Lower Stack Elements Grid</span>
      <div class="flex-grow h-px bg-red-950/40"></div>
    </div>

    <!-- SECOND FRAME (Reviews - Full Width under Frame 1) -->
    <div class="max-w-2xl w-full mx-auto mb-6">
      ${generateFrameHTML(lowerFrame1, false, "w-full")}
    </div>

    <!-- THIRD & FOURTH FRAMES (Two Columns Layout) -->
    <section class="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      ${generateFrameHTML(lowerFrame3, false, "w-full")}
      ${generateFrameHTML(lowerFrame2, false, "w-full")}
    </section>

    <!-- Cinema Seats Row at bottom -->
    <div class="w-full overflow-hidden mt-10 select-none pointer-events-none">
      <svg viewBox="0 0 1000 120" class="w-full h-auto text-red-700" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <g>
          <g transform="translate(0, 10)">
            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
          </g>
          <g transform="translate(100, 10)">
            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
          </g>
          <g transform="translate(200, 10)">
            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
          </g>
          <g transform="translate(300, 10)">
            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
          </g>
          <g transform="translate(400, 10)">
            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
          </g>
          <g transform="translate(500, 10)">
            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
          </g>
          <g transform="translate(600, 10)">
            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
          </g>
          <g transform="translate(700, 10)">
            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
          </g>
          <g transform="translate(800, 10)">
            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
          </g>
          <g transform="translate(900, 10)">
            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
          </g>
        </g>
      </svg>
    </div>

    <footer class="text-center text-[11px] text-red-900/60 border-t border-red-950/20 pt-8 mt-4 space-y-1">
      <p>© \${new Date().getFullYear()} Centered 4-Frame Site. Constructed entirely free.</p>
      <p class="font-mono text-[10px]">Hosted securely with 100% zero hosting costs via free platforms.</p>
    </footer>

  </div>

  <script>
    // Live Letterboxd Feed integration
    const feedUrl = "${upperFrame.contentBody}" || "https://letterboxd.com/erics71/rss/";
    let feeds = [
      {
        title: "La Chimera",
        year: "2023",
        rating: "★★★★½",
        imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&h=600&q=80",
        link: "https://letterboxd.com/erics71/film/la-chimera/",
        watchedDate: "12 Jun 2026",
        reviewExcerpt: "A beautifully woven poetic tale of love, loss, and ancient ruins. Josh O'Connor is breathtaking."
      },
      {
        title: "Challengers",
        year: "2024",
        rating: "★★★★",
        imageUrl: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=400&h=600&q=80",
        link: "https://letterboxd.com/erics71/film/challengers/",
        watchedDate: "10 Jun 2026",
        reviewExcerpt: "The editing, cinematography, and score are absolutely electric. Luca Guadagnino crafted one of the most intense sports thrillers."
      },
      {
        title: "Dune: Part Two",
        year: "2024",
        rating: "★★★★★",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&h=600&q=80",
        link: "https://letterboxd.com/erics71/film/dune-part-two/",
        watchedDate: "08 Jun 2026",
        reviewExcerpt: "Denis Villeneuve crafts a grand sci-fi epic that cements itself alongside movie history. Perfect sound design."
      },
      {
        title: "Anatomy of a Fall",
        year: "2023",
        rating: "★★★★½",
        imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&h=600&q=80",
        link: "https://letterboxd.com/erics71/film/anatomy-of-a-fall/",
        watchedDate: "05 Jun 2026",
        reviewExcerpt: "Superb courtroom thriller that is actually a forensic investigation of a marriage."
      },
      {
        title: "Perfect Days",
        year: "2023",
        rating: "★★★★★",
        imageUrl: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=400&h=600&q=80",
        link: "https://letterboxd.com/erics71/film/perfect-days-2023/",
        watchedDate: "01 Jun 2026",
        reviewExcerpt: "Wim Wenders crafts a quiet masterpiece about the elegance of simple routines, Tokyo public toilets, and cassettes."
      }
    ];

    let currentIdx = 0;
    let autoPlayInterval = null;
    let isAutoPlay = true;

    function renderActiveSlide() {
      if (feeds.length === 0) return;
      const gridEl = document.getElementById("carousel-grid");
      if (!gridEl) return;
      
      gridEl.innerHTML = "";
      
      const countToShow = Math.min(5, feeds.length);
      for (let i = 0; i < countToShow; i++) {
        const itemIdx = (currentIdx + i) % feeds.length;
        const movie = feeds[itemIdx];
        
        var ratingHtml = "";
        if (movie.rating && movie.rating !== "Not rated" && movie.rating !== "No rating") {
          ratingHtml = '<div class="absolute top-1.5 left-1.5 bg-slate-950/95 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-800/80 font-mono shadow">' + movie.rating + '</div>';
        }

        var overlayHtml = "";
        if (movie.reviewExcerpt) {
          overlayHtml = 
            '<!-- Hover overlay exhibiting review excerpt -->' +
            '<div class="absolute inset-0 bg-slate-950/90 opacity-0 hover:opacity-100 transition-opacity duration-300 p-2.5 flex flex-col justify-between text-left">' +
              '<div class="space-y-1.5 overflow-hidden">' +
                '<span class="text-[8px] tracking-wider uppercase font-mono font-bold text-slate-400 block border-b border-slate-800 pb-1">Review Excerpt</span>' +
                '<p class="text-[10px] text-slate-300 leading-normal italic line-clamp-6">"' + movie.reviewExcerpt + '"</p>' +
              '</div>' +
              '<div class="border-t border-slate-900 pt-1.5 text-[8px] font-mono text-slate-400">' +
                'Logged ' + (movie.watchedDate || "recently") +
              '</div>' +
            '</div>';
        }

        var cardHtml = 
          '<div class="group relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden shadow-lg hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">' +
            '<div class="w-full aspect-[2/3] relative bg-slate-950 overflow-hidden">' +
              '<img src="' + movie.imageUrl + '" alt="' + movie.title + '" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerpolicy="no-referrer" />' +
              ratingHtml +
              overlayHtml +
            '</div>' +
            
            '<div class="p-2.5 flex-grow flex flex-col justify-between bg-slate-900/60 border-t border-slate-800/50 text-left">' +
              '<div class="space-y-0.5">' +
                '<h5 class="text-xs font-black text-slate-100 truncate tracking-tight hover:text-indigo-400 transition">' + movie.title + '</h5>' +
                '<div class="flex items-center justify-between">' +
                  '<span class="text-[10px] text-slate-500 font-mono">(' + (movie.year || "N/A") + ')</span>' +
                  '<a href="' + movie.link + '" target="_blank" class="text-slate-500 hover:text-white transition">' +
                    '<svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
                      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />' +
                    '</svg>' +
                  '</a>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        
        gridEl.insertAdjacentHTML("beforeend", cardHtml);
      }

      const counterEl = document.getElementById("carousel-counter");
      if (counterEl) {
        counterEl.textContent = "Active starting from " + (currentIdx + 1) + " of " + feeds.length + " logged entries";
      }
    }

    function toggleAutoPlay() {
      isAutoPlay = !isAutoPlay;
      const btn = document.getElementById("btn-play");
      if (btn) {
        if (isAutoPlay) {
          btn.textContent = "Pause";
          startInterval();
        } else {
          btn.textContent = "Play";
          clearInterval(autoPlayInterval);
        }
      }
    }

    function startInterval() {
      clearInterval(autoPlayInterval);
      autoPlayInterval = setInterval(() => {
        if (feeds.length > 0) {
          currentIdx = (currentIdx + 1) % feeds.length;
          renderActiveSlide();
        }
      }, 5000);
    }

    const prevBtn = document.getElementById("btn-prev");
    const nextBtn = document.getElementById("btn-next");
    const playBtn = document.getElementById("btn-play");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (feeds.length > 0) {
          currentIdx = (currentIdx - 1 + feeds.length) % feeds.length;
          renderActiveSlide();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (feeds.length > 0) {
          currentIdx = (currentIdx + 1) % feeds.length;
          renderActiveSlide();
        }
      });
    }

    if (playBtn) {
      playBtn.addEventListener("click", toggleAutoPlay);
    }

    async function initFeed() {
      try {
        let text = "";
        try {
          const res = await fetch("/api/letterboxd-proxy?url=" + encodeURIComponent(feedUrl));
          if (!res.ok) throw new Error();
          text = await res.text();
        } catch(e) {
          try {
            const res = await fetch("https://corsproxy.io/?" + encodeURIComponent(feedUrl));
            if (!res.ok) throw new Error();
            text = await res.text();
          } catch(err) {
            const backup = await fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(feedUrl));
            if (backup.ok) text = await backup.text();
          }
        }

        if (text && text.includes("<rss")) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, "text/xml");
          const items = doc.getElementsByTagName("item");
          const tempFeeds = [];

          for (let i = 0; i < Math.min(items.length, 15); i++) {
            const item = items[i];
            const rawTitle = item.getElementsByTagName("title")[0]?.textContent || "";
            const link = item.getElementsByTagName("link")[0]?.textContent || "";
            const desc = item.getElementsByTagName("description")[0]?.textContent || "";
            
            let name = "";
            let year = "";
            let rValueStr = "";

            try {
              name = item.getElementsByTagName("letterboxd:filmTitle")[0]?.textContent || 
                     item.getElementsByTagName("filmTitle")[0]?.textContent || "";
              year = item.getElementsByTagName("letterboxd:filmYear")[0]?.textContent || 
                     item.getElementsByTagName("filmYear")[0]?.textContent || "";
              rValueStr = item.getElementsByTagName("letterboxd:memberRating")[0]?.textContent || 
                           item.getElementsByTagName("memberRating")[0]?.textContent || "";
            } catch(e){}
            
            if (!name) {
              const commaIdx = rawTitle.indexOf(",");
              name = (commaIdx !== -1) ? rawTitle.slice(0, commaIdx).trim() : rawTitle.split(" - ")[0].trim();
            }
            if (!year) {
              const yrM = rawTitle.match(/, (\d{4})/);
              if (yrM) year = yrM[1];
            }

            let rating = "";
            if (rValueStr) {
               const val = parseFloat(rValueStr);
               rating = "★".repeat(Math.floor(val)) + (val % 1 !== 0 ? "½" : "");
            } else {
              const rM = rawTitle.match(/ - ([★+½]+)$/);
              if (rM) rating = rM[1];
            }

            let imgUrl = "";
            let excerpt = "";
            if (desc) {
              const imgM = desc.match(/<img[^>]+src="([^">]+)"/);
              if (imgM) imgUrl = imgM[1];
              
              excerpt = desc
                .replace(/<p><img[^>]+><\/p>/gi, "")
                .replace(/<p>Watched on[^<]+<\/p>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
              if (excerpt.length > 200) excerpt = excerpt.slice(0, 190) + "...";
            }

            if (!imgUrl) imgUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=350&q=80";

            let dateVal = "";
            try {
              dateVal = item.getElementsByTagName("letterboxd:watchedDate")[0]?.textContent || 
                        item.getElementsByTagName("watchedDate")[0]?.textContent || "";
            } catch(e){}

            if (!dateVal) {
              const pub = item.getElementsByTagName("pubDate")[0]?.textContent || "";
              if (pub) dateVal = new Date(pub).toLocaleDateString(undefined, {dateStyle: "medium"});
            }

            tempFeeds.push({
              title: name || "Untitled Movie",
               year: year,
              rating: rating,
              imageUrl: imgUrl,
              link: link,
              watchedDate: dateVal,
              reviewExcerpt: excerpt || ""
            });
          }

          if (tempFeeds.length > 0) feeds = tempFeeds;
        }
      } catch(err) {
        console.warn("Could not sync live Letterboxd feed:", err);
      } finally {
        const loadEl = document.getElementById("carousel-loading");
        const entryCont = document.getElementById("carousel-container");
        if (loadEl) loadEl.classList.add("hidden");
        if (entryCont) entryCont.classList.remove("hidden");
        renderActiveSlide();
        if (isAutoPlay) startInterval();
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initFeed);
    } else {
      initFeed();
    }
  </script>

</body>
</html>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getFullCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCodeFile = () => {
    const textBlob = new Blob([getFullCode()], { type: 'text/html' });
    const downloadURL = URL.createObjectURL(textBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadURL;
    downloadLink.download = 'index.html';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadURL);
  };

  const handleExportZipFile = async () => {
    setZipLoading(true);
    setZipSuccess(false);
    setZipError(null);

    try {
      const response = await fetch('/api/export-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customHtml: getFullCode()
        })
      });

      if (!response.ok) {
        throw new Error('Export service returned an error response.');
      }

      const blob = await response.blob();
      const downloadURL = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadURL;
      downloadLink.download = 'centered-4frame-design-export.zip';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadURL);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
    } catch (err: any) {
      console.error('[ExportZip] Error exporting ZIP file:', err);
      setZipError(err.message || 'Could not generate ZIP archive.');
    } finally {
      setZipLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Visual Navigation Banner (Hidden in Live Webpage Mode for direct pristine preview) */}
      {activeTab !== 'live-view' && (
        <header className="bg-slate-950 border-b border-slate-900/60 p-5 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-indigo-500/10">
              <Layout className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-md font-extrabold tracking-tight text-white md:text-lg">Another day dreaming Sandbox</h1>
                <span className="bg-indigo-950/80 text-indigo-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-900/30">
                  100% Free
                </span>
              </div>
              <p className="text-xs text-slate-400">Interactive sandbox to design, test, and publish a premium 4-Frame centered web page at zero cost.</p>
            </div>
          </div>

          {/* Dynamic Navigation Mode */}
          <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1 self-stretch md:self-auto">
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'sandbox'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Live 4-Frame Sandbox
            </button>
            
            <button
              onClick={() => setActiveTab('hosting-guide')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'hosting-guide'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Zero-Cost Publishing Guide
            </button>

            <button
              onClick={() => setActiveTab('layout-theory')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'layout-theory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Layout &amp; Form School
            </button>

            <button
              onClick={() => setActiveTab('live-view')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all border border-solid ${
                activeTab === 'live-view'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/20 border-emerald-900/30'
              }`}
              title="View only your custom webpage in absolute full glory without sidebars or controls"
            >
              <Globe className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
              🌐 Pure Webpage Only
            </button>
          </div>
        </header>
      )}

      {/* Main Sandbox Interactive Workspace */}
      <main className={`${activeTab === 'live-view' ? 'p-0 max-w-none w-full flex-grow' : 'flex-grow p-4 md:p-6 max-w-[1600px] w-full mx-auto grid grid-cols-1 gap-6'}`}>

        {activeTab === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT CONFIGURATION CONTROL PANEL (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-850 p-5 md:p-6 rounded-2xl shadow-xl space-y-6">
              
              <div className="pb-3 border-b border-slate-800">
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold block mb-1">Layout Blueprint</span>
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Settings2 className="w-4 h-4 text-indigo-400" />
                  Customize the 4 Distinct Frames
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust text value, block types, backgrounds, and sizes. An upper frame occupies the center while the other three stack vertically.
                </p>
              </div>

              {/* Theme Settings Preset */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-extrabold">Palette Theme &amp; Personality</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setThemeColor('slate')}
                    className={`p-2 rounded-xl text-center text-xs border transition ${
                      themeColor === 'slate' ? 'bg-indigo-950/40 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="block w-3 h-3 rounded-full bg-slate-350 mx-auto mb-1"></span>
                    Slate Core
                  </button>
                  <button
                    onClick={() => setThemeColor('editorial')}
                    className={`p-2 rounded-xl text-center text-xs border transition ${
                      themeColor === 'editorial' ? 'bg-amber-950/20 border-amber-800 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="block w-3 h-3 rounded-full bg-amber-850 mx-auto mb-1"></span>
                    Playfair
                  </button>
                  <button
                    onClick={() => setThemeColor('emerald')}
                    className={`p-2 rounded-xl text-center text-xs border transition ${
                      themeColor === 'emerald' ? 'bg-emerald-950/20 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="block w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1"></span>
                    Mono Mint
                  </button>
                  <button
                    onClick={() => setThemeColor('sunset')}
                    className={`p-2 rounded-xl text-center text-xs border transition ${
                      themeColor === 'sunset' ? 'bg-orange-950/20 border-orange-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="block w-3 h-3 rounded-full bg-orange-500 mx-auto mb-1"></span>
                    Sunset Warm
                  </button>
                </div>
              </div>

              {/* VERTICAL DESIGN CONTROLS FOR ALL 4 FRAMES */}
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2">
                
                {/* 1. UPPER FRAME (CENTERED) */}
                <div className="p-4 bg-slate-950 rounded-xl border border-indigo-950/50 space-y-3">
                  <div className="flex justify-between items-center bg-indigo-950/40 px-2 py-1 rounded">
                    <span className="text-[10px] font-mono font-black text-indigo-400">FRAME 1 of 4: UPPER (CENTERED)</span>
                    <span className="text-[9px] bg-indigo-900 text-indigo-200 px-1 rounded font-bold uppercase">Horizontal Center</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Frame Display Name</label>
                      <input 
                        type="text" 
                        value={upperFrame.title}
                        onChange={(e) => setUpperFrame({...upperFrame, title: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none focus:border-indigo-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Content Block Type</label>
                      <select 
                        value={upperFrame.type} 
                        onChange={(e) => setUpperFrame({...upperFrame, type: e.target.value as any})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 text-white focus:outline-none"
                      >
                        <option value="letterboxd_carousel">🎬 Letterboxd Live Feed Carousel</option>
                        <option value="content">📝 Rich Informational Text</option>
                        <option value="image">🖼️ Banner Image + Subtext</option>
                        <option value="form">📨 HTML Forms (POST Method)</option>
                        <option value="embed_tally">🔗 Tally/Google Forms Widget</option>
                        <option value="custom_html">💻 Custom Raw HTML Box</option>
                      </select>
                    </div>
                  </div>

                  {upperFrame.type === 'letterboxd_carousel' && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Letterboxd RSS Feed URL</label>
                      <input 
                        type="url" 
                        value={upperFrame.contentBody} 
                        onChange={(e) => setUpperFrame({...upperFrame, contentBody: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none focus:border-indigo-500 text-amber-400 font-mono"
                        placeholder="https://letterboxd.com/erics71/rss/"
                      />
                      <span className="text-[9px] text-slate-500 block mt-1 leading-normal">
                        Bypasses browser CORS dynamically in preview and final exported code.
                      </span>
                    </div>
                  )}

                  {upperFrame.type === 'embed_tally' && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Direct Embed widget URL</label>
                      <input 
                        type="url" 
                        value={upperFrame.iframeUrl} 
                        onChange={(e) => setUpperFrame({...upperFrame, iframeUrl: e.target.value})}
                        className="w-full bg-slate-905 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-emerald-400 font-mono"
                      />
                    </div>
                  )}

                  {upperFrame.type === 'image' && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Unsplash Image URL / Source</label>
                      <input 
                        type="url" 
                        value={upperFrame.imageUrl} 
                        onChange={(e) => setUpperFrame({...upperFrame, imageUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-slate-300"
                      />
                    </div>
                  )}

                  {upperFrame.type !== 'letterboxd_carousel' && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        {upperFrame.type === 'custom_html' ? 'Type Custom HTML Code' : 'Text / Description Body'}
                      </label>
                      <textarea 
                        rows={3}
                        value={upperFrame.contentBody}
                        onChange={(e) => setUpperFrame({...upperFrame, contentBody: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-slate-300 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* 2. LOWER FRAME 1 */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center bg-slate-900 px-2 py-1 rounded">
                    <span className="text-[10px] font-mono font-black text-slate-400">FRAME 2 of 4: LOWER STACK 1</span>
                    <span className="text-[9px] bg-slate-800 text-slate-200 px-1 rounded font-bold uppercase">Vertical Element</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Frame Display Name</label>
                      <input 
                        type="text" 
                        value={lowerFrame1.title} 
                        onChange={(e) => setLowerFrame1({...lowerFrame1, title: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Content Block Type</label>
                      <select 
                        value={lowerFrame1.type} 
                        onChange={(e) => setLowerFrame1({...lowerFrame1, type: e.target.value as any})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 text-white focus:outline-none"
                      >
                        <option value="content">📝 Rich Informational Text</option>
                        <option value="image">🖼️ Banner Image + Subtext</option>
                        <option value="form">📨 HTML Forms (POST Method)</option>
                        <option value="embed_tally">🔗 Tally/Google Forms Widget</option>
                        <option value="custom_html">💻 Custom Raw HTML Box</option>
                      </select>
                    </div>
                  </div>

                  {lowerFrame1.type === 'embed_tally' && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Direct Embed widget URL</label>
                      <input 
                        type="url" 
                        value={lowerFrame1.iframeUrl} 
                        onChange={(e) => setLowerFrame1({...lowerFrame1, iframeUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-emerald-400 font-mono"
                      />
                    </div>
                  )}

                  {lowerFrame1.type === 'image' && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Unsplash Image URL / Source</label>
                      <input 
                        type="url" 
                        value={lowerFrame1.imageUrl} 
                        onChange={(e) => setLowerFrame1({...lowerFrame1, imageUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-slate-300"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Text Body</label>
                    <textarea 
                      rows={3}
                      value={lowerFrame1.contentBody}
                      onChange={(e) => setLowerFrame1({...lowerFrame1, contentBody: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-slate-300"
                    />
                  </div>
                </div>

                {/* 3. LOWER FRAME 2 */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center bg-slate-900 px-2 py-1 rounded">
                    <span className="text-[10px] font-mono font-black text-slate-400">FRAME 3 of 4: LOWER STACK 2</span>
                    <span className="text-[9px] bg-slate-800 text-slate-200 px-1 rounded font-bold uppercase">Vertical Element</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Frame Display Name</label>
                      <input 
                        type="text" 
                        value={lowerFrame2.title} 
                        onChange={(e) => setLowerFrame2({...lowerFrame2, title: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Content Block Type</label>
                      <select 
                        value={lowerFrame2.type} 
                        onChange={(e) => setLowerFrame2({...lowerFrame2, type: e.target.value as any})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 text-white focus:outline-none"
                      >
                        <option value="form">📨 HTML Forms (POST Method)</option>
                        <option value="content">📝 Rich Informational Text</option>
                        <option value="image">🖼️ Banner Image + Subtext</option>
                        <option value="embed_tally">🔗 Tally/Google Forms Widget</option>
                        <option value="custom_html">💻 Custom Raw HTML Box</option>
                      </select>
                    </div>
                  </div>

                  {lowerFrame2.type === 'embed_tally' && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Direct Embed widget URL</label>
                      <input 
                        type="url" 
                        value={lowerFrame2.iframeUrl} 
                        onChange={(e) => setLowerFrame2({...lowerFrame2, iframeUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-emerald-400 font-mono"
                      />
                    </div>
                  )}

                  {lowerFrame2.type === 'image' && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Unsplash Image URL / Source</label>
                      <input 
                        type="url" 
                        value={lowerFrame2.imageUrl} 
                        onChange={(e) => setLowerFrame2({...lowerFrame2, imageUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-slate-300"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Text Body</label>
                    <textarea 
                      rows={3}
                      value={lowerFrame2.contentBody}
                      onChange={(e) => setLowerFrame2({...lowerFrame2, contentBody: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-slate-300"
                    />
                  </div>
                </div>

                {/* 4. LOWER FRAME 3 */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center bg-slate-900 px-2 py-1 rounded">
                    <span className="text-[10px] font-mono font-black text-slate-400">FRAME 4 of 4: LOWER STACK 3</span>
                    <span className="text-[9px] bg-slate-800 text-slate-200 px-1 rounded font-bold uppercase">Vertical Element</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Frame Display Name</label>
                      <input 
                        type="text" 
                        value={lowerFrame3.title} 
                        onChange={(e) => setLowerFrame3({...lowerFrame3, title: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Content Block Type</label>
                      <select 
                        value={lowerFrame3.type} 
                        onChange={(e) => setLowerFrame3({...lowerFrame3, type: e.target.value as any})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 text-white focus:outline-none"
                      >
                        <option value="embed_tally">🔗 Tally/Google Forms Widget</option>
                        <option value="content">📝 Rich Informational Text</option>
                        <option value="image">🖼️ Banner Image + Subtext</option>
                        <option value="form">📨 HTML Forms (POST Method)</option>
                        <option value="custom_html">💻 Custom Raw HTML Box</option>
                      </select>
                    </div>
                  </div>

                  {lowerFrame3.type === 'embed_tally' && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Direct Embed widget URL</label>
                      <input 
                        type="url" 
                        value={lowerFrame3.iframeUrl} 
                        onChange={(e) => setLowerFrame3({...lowerFrame3, iframeUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-emerald-400 font-mono"
                      />
                    </div>
                  )}

                  {lowerFrame3.type === 'image' && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Unsplash Image URL / Source</label>
                      <input 
                        type="url" 
                        value={lowerFrame3.imageUrl} 
                        onChange={(e) => setLowerFrame3({...lowerFrame3, imageUrl: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-slate-300"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Text Body</label>
                    <textarea 
                      rows={3}
                      value={lowerFrame3.contentBody}
                      onChange={(e) => setLowerFrame3({...lowerFrame3, contentBody: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-805 text-xs rounded p-1.5 focus:outline-none text-slate-300"
                    />
                  </div>
                </div>

              </div>

              {/* Export Full Codebase & Assets Section */}
              <div className="pt-5 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Export Offline Project Package</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Export the entire custom 4-frame design bundled alongside the development source files, configurations, and API proxies as a single downloadable ZIP.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={handleExportZipFile}
                    disabled={zipLoading}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all border border-solid ${
                      zipSuccess 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-950/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-950/20'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {zipLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : zipSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    ) : (
                      <FolderDown className="w-4 h-4 text-indigo-200" />
                    )}
                    <span>
                      {zipLoading ? 'Preparing Code Package...' : zipSuccess ? 'ZIP Package Downloaded!' : 'Download Complete ZIP Package'}
                    </span>
                  </button>

                  {zipSuccess && (
                    <div className="p-2.5 bg-emerald-950/50 border border-emerald-500/30 rounded-lg text-center animate-pulse">
                      <p className="text-[10px] text-emerald-400 font-medium">
                        ✨ ZIP generation complete! Check your browser downloads for <strong>centered-4frame-design-export.zip</strong>.
                      </p>
                    </div>
                  )}

                  {zipError && (
                    <div className="p-2.5 bg-red-950/50 border border-red-500/30 rounded-lg text-center">
                      <p className="text-[10px] text-red-400 font-medium">
                        ❌ Error generating ZIP: {zipError}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT WORKSPACE PREVIEW & CODE PANEL */}
            <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-4">
              
              {/* Device and Code toggles */}
              <div className="bg-slate-900 border border-slate-850 p-3 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      previewMode === 'desktop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Desktop Preview</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      previewMode === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile Screen</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-slate-300"
                    title="Copy full self-contained index.html source code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{copiedCode ? 'Copied' : 'Copy HTML'}</span>
                  </button>

                  <button
                    onClick={handleDownloadCodeFile}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-slate-300"
                    title="Download individual self-contained index.html file"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download HTML</span>
                  </button>

                  <button
                    onClick={handleExportZipFile}
                    disabled={zipLoading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-solid ${
                      zipSuccess 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-950/10'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-950/10'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    title="Export the entire custom 4-frame design along with all developer source files and configuration into a single ZIP file"
                  >
                    {zipLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : zipSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    ) : (
                      <FolderArchive className="w-3.5 h-3.5 text-indigo-200" />
                    )}
                    <span>{zipLoading ? 'Bundling...' : zipSuccess ? 'Downloaded!' : 'Export ZIP'}</span>
                  </button>
                </div>
              </div>

              {/* TABS FOR VISUAL WORKSPACE VS RAW EXPORT CODE */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Visual rendering browser container (Left lg:col-span-7) */}
                <div className="md:col-span-7 lg:col-span-8 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  
                  {/* Browser top-bar */}
                  <div className="bg-slate-950 border-b border-slate-900 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/70 inline-block"></span>
                    </div>

                    <div className="bg-slate-900 rounded-lg px-3 py-1 text-[10px] text-slate-400 font-mono text-center w-full max-w-sm border border-slate-850 truncate">
                      https://freehost.me/my-zero-cost-page/index.html
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono">Live Demo</div>
                  </div>

                  {/* HTML layout stage container */}
                  <div className="p-4 md:p-6 bg-slate-900 overflow-y-auto max-h-[700px] flex justify-center">
                    
                    {/* Simulated viewport card */}
                    <div className={`transition-all duration-300 w-full ${
                      previewMode === 'mobile' ? 'max-w-[360px] border-4 border-slate-800 rounded-3xl p-4' : 'max-w-3xl'
                    } bg-slate-950 text-slate-200 min-h-[500px] flex flex-col justify-between rounded-xl relative`}>
                      
                      {/* background ambient glow */}
                      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_50%)]"></div>

                      <div className="space-y-6 py-4">
                        
                        {/* 1. Page Header Indicator inside Mock */}
                        <header className="text-center space-y-1 mb-2">
                          <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded-full">
                            ✨ Free Sandbox Page
                          </span>
                          <h3 className="text-lg font-extrabold text-white">Another day dreaming</h3>
                        </header>

                        {/* upper frame: Center middle */}
                        <div className="w-full flex justify-center px-1">
                          <div className={`w-full max-w-lg ${
                            upperFrame.type === 'letterboxd_carousel' 
                              ? 'bg-transparent rounded-2xl transition-all' 
                              : 'bg-slate-900/60 backdrop-blur border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 rounded-2xl p-6 transition-all'
                          }`}>
                            {upperFrame.type !== 'letterboxd_carousel' && (
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-mono text-indigo-400 tracking-wider">UPPER FRAME (Centered)</span>
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              </div>
                            )}
                            
                            {/* Render content based on picked option */}
                            {upperFrame.type === 'letterboxd_carousel' && (
                              <LetterboxdCarousel 
                                feedUrl={upperFrame.contentBody} 
                                themeColor={themeColor}
                                sharedXml={sharedXml}
                                sharedLoading={sharedLoading}
                                sharedError={sharedError}
                                sharedIsReal={sharedIsReal}
                              />
                            )}

                            {upperFrame.type === 'content' && (
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-1.5">{upperFrame.title}</h4>
                                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{upperFrame.contentBody}</p>
                              </div>
                            )}

                            {upperFrame.type === 'image' && (
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-1.5">{upperFrame.title}</h4>
                                <img src={upperFrame.imageUrl} alt="Frame Upload Mock" className="w-full h-24 object-cover rounded mb-2" />
                                <p className="text-[11px] text-slate-400">{upperFrame.contentBody}</p>
                              </div>
                            )}

                            {upperFrame.type === 'embed_tally' && (
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-1.5">{upperFrame.title}</h4>
                                <p className="text-[10px] text-slate-400 mb-2">{upperFrame.contentBody}</p>
                                <div className="text-[10px] font-mono bg-slate-950 p-2 text-emerald-400 rounded flex items-center justify-between">
                                  <span>URL: {upperFrame.iframeUrl?.slice(0, 36)}...</span>
                                  <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                                </div>
                              </div>
                            )}

                            {upperFrame.type === 'form' && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-white">{upperFrame.title}</h4>
                                <p className="text-xs text-slate-400">{upperFrame.contentBody}</p>
                                <form onSubmit={handleMockSubmit} className="space-y-2">
                                  <input 
                                    type="email" 
                                    placeholder="Enter test email..." 
                                    required
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs focus:outline-none" 
                                  />
                                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-[10px] py-1.5 rounded uppercase tracking-wider">
                                    Mock Submit Form
                                  </button>
                                </form>
                              </div>
                            )}

                            {upperFrame.type === 'custom_html' && (
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-1">{upperFrame.title}</h4>
                                <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-amber-300">
                                  {upperFrame.contentBody}
                                </div>
                              </div>
                            )}

                          </div>
                        </div>

                        {/* spacer */}
                        <div className="flex items-center gap-2 max-w-2xl mx-auto">
                          <div className="h-px bg-slate-800 flex-grow"></div>
                          <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Lower Stack Elements Grid</span>
                          <div className="h-px bg-slate-800 flex-grow"></div>
                        </div>

                        {/* FRAME 2 (Reviews - Full Width under Frame 1) */}
                        <div className="max-w-2xl mx-auto w-full mb-4">
                          <div className="w-full bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all">
                            <span className="text-[9px] font-mono text-slate-500 mb-1 block">LOWER STACK FRAME 2 (Reviews - Full Width)</span>
                            {lowerFrame1.type === 'content' && (
                              <div>
                                {lowerFrame1.contentBody && (lowerFrame1.contentBody.includes('letterboxd.com/') || lowerFrame1.contentBody.includes('/film/')) ? (
                                  <LetterboxdReviewLiveCard url={lowerFrame1.contentBody} fallbackTitle={lowerFrame1.title} />
                                ) : (
                                  <>
                                    <h4 className="text-xs font-bold text-white mb-1">{lowerFrame1.title}</h4>
                                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{lowerFrame1.contentBody}</p>
                                  </>
                                )}
                              </div>
                            )}
                            {lowerFrame1.type === 'image' && (
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-white mb-1">{lowerFrame1.title}</h4>
                                <img src={lowerFrame1.imageUrl} alt="Frame Upload Mock" className="w-full h-20 object-cover rounded" />
                                <p className="text-[10px] text-slate-400">{lowerFrame1.contentBody}</p>
                              </div>
                            )}
                            {lowerFrame1.type === 'embed_tally' && (
                              <div>
                                <h4 className="text-xs font-bold text-white mb-1">{lowerFrame1.title}</h4>
                                <div className="text-[9px] font-mono bg-slate-950 p-1.5 text-emerald-400 rounded text-center">
                                  Embedded Iframe: Yes, Active Simulation
                                </div>
                              </div>
                            )}
                            {lowerFrame1.type === 'form' && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-white">{lowerFrame1.title}</h4>
                                <input type="email" placeholder="Email Input field style..." className="w-full text-xs p-1.5 bg-slate-950 rounded border border-slate-800" disabled />
                              </div>
                            )}
                            {lowerFrame1.type === 'custom_html' && (
                              <div className="bg-slate-950 p-1 rounded text-[10px] font-mono text-slate-400 truncate">
                                {lowerFrame1.contentBody}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* FRAMES 3 & 4 (Two Columns Layout) */}
                        <div className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* FRAME 3 (Reels) */}
                          <div className="w-full bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all">
                            <span className="text-[9px] font-mono text-slate-500 mb-1 block">LOWER STACK FRAME 3 (Reels - Left Column)</span>
                            {lowerFrame3.type === 'content' && (
                              <div>
                                {lowerFrame3.contentBody && lowerFrame3.contentBody.includes('if-i-can-ill-go-and-see-them-at-the-cinema') ? (
                                  <div>
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-900/60 mb-3">
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50"></span>
                                        <span className="text-xs font-bold text-slate-100 tracking-tight uppercase font-mono">{lowerFrame3.title}</span>
                                      </div>
                                      <span className="text-[9px] font-mono text-slate-500">Live Cinema List</span>
                                    </div>
                                    <LetterboxdFilmReels 
                                      sharedXml={sharedXml}
                                      sharedLoading={sharedLoading}
                                      sharedError={sharedError}
                                      sharedIsReal={sharedIsReal}
                                    />
                                  </div>
                                ) : lowerFrame3.contentBody && (lowerFrame3.contentBody.includes('letterboxd.com/') || lowerFrame3.contentBody.includes('/film/')) ? (
                                  <LetterboxdReviewLiveCard url={lowerFrame3.contentBody} fallbackTitle={lowerFrame3.title} />
                                ) : (
                                  <>
                                    <h4 className="text-xs font-bold text-white mb-1">{lowerFrame3.title}</h4>
                                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{lowerFrame3.contentBody}</p>
                                  </>
                                )}
                              </div>
                            )}
                            {lowerFrame3.type === 'image' && (
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-white mb-1">{lowerFrame3.title}</h4>
                                <img src={lowerFrame3.imageUrl} alt="Frame Upload Mock" className="w-full h-20 object-cover rounded" />
                                <p className="text-[10px] text-slate-400">{lowerFrame3.contentBody}</p>
                              </div>
                            )}
                            {lowerFrame3.type === 'embed_tally' && (
                              <div>
                                <h4 className="text-xs font-bold text-white mb-1">{lowerFrame3.title}</h4>
                                <div className="text-[9px] font-mono bg-slate-950 p-1.5 text-emerald-400 rounded text-center">
                                  Embedded Iframe: Yes, Active Simulation (URL: {lowerFrame3.iframeUrl})
                                </div>
                              </div>
                            )}
                            {lowerFrame3.type === 'form' && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-white">{lowerFrame3.title}</h4>
                                <p className="text-[11px] text-slate-400 mb-1">{lowerFrame3.contentBody}</p>
                                <input type="email" placeholder="Your email here..." className="w-full text-xs p-2 bg-slate-950 rounded border border-slate-850 text-white focus:outline-none" disabled />
                                <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-1 text-white font-bold text-[10px] uppercase rounded" disabled>Subscribe</button>
                              </div>
                            )}
                            {lowerFrame3.type === 'custom_html' && (
                              <div className="bg-slate-950 p-1 rounded text-[10px] font-mono text-slate-400 truncate">
                                {lowerFrame3.contentBody}
                              </div>
                            )}
                          </div>

                          {/* FRAME 4 (Spain List) */}
                          <div className="w-full bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all">
                            <span className="text-[9px] font-mono text-slate-500 mb-1 block">LOWER STACK FRAME 4 (Spain Releases - Right Column)</span>
                            {lowerFrame2.type === 'content' && (
                              <div>
                                {lowerFrame2.contentBody && lowerFrame2.contentBody.includes('ranking-of-film-releases-in-spain-in-2025') ? (
                                  <LetterboxdSpainListLiveCard 
                                    sharedXml={sharedXml}
                                    sharedLoading={sharedLoading}
                                  />
                                ) : lowerFrame2.contentBody && (lowerFrame2.contentBody.includes('letterboxd.com/') || lowerFrame2.contentBody.includes('/film/')) ? (
                                  <LetterboxdReviewLiveCard url={lowerFrame2.contentBody} fallbackTitle={lowerFrame2.title} />
                                ) : (
                                  <>
                                    <h4 className="text-xs font-bold text-white mb-1">{lowerFrame2.title}</h4>
                                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{lowerFrame2.contentBody}</p>
                                  </>
                                )}
                              </div>
                            )}
                            {lowerFrame2.type === 'image' && (
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-white mb-1">{lowerFrame2.title}</h4>
                                <img src={lowerFrame2.imageUrl} alt="Frame Upload Mock" className="w-full h-20 object-cover rounded" />
                                <p className="text-[10px] text-slate-400">{lowerFrame2.contentBody}</p>
                              </div>
                            )}
                            {lowerFrame2.type === 'embed_tally' && (
                              <div>
                                <h4 className="text-xs font-bold text-white mb-1">{lowerFrame2.title}</h4>
                                <div className="text-[9px] font-mono bg-slate-950 p-1.5 text-emerald-400 rounded text-center">
                                  Embedded Iframe: Yes, Active Simulation
                                </div>
                              </div>
                            )}
                            {lowerFrame2.type === 'form' && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-white">{lowerFrame2.title}</h4>
                                <p className="text-[11px] text-slate-400 mb-1">{lowerFrame2.contentBody}</p>
                                <input type="email" placeholder="Your email here..." className="w-full text-xs p-2 bg-slate-950 rounded border border-slate-850 text-white focus:outline-none" />
                                <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-1 text-white font-bold text-[10px] uppercase rounded">Subscribe</button>
                              </div>
                            )}
                            {lowerFrame2.type === 'custom_html' && (
                              <div className="bg-slate-950 p-1 rounded text-[10px] font-mono text-slate-400 truncate">
                                {lowerFrame2.contentBody}
                              </div>
                            )}
                          </div>

                        </div>

                      </div>

                      {/* submission debug state overlay */}
                      {formSubmittedMsg && (
                        <div className="absolute inset-x-4 bottom-4 bg-indigo-950 border border-indigo-700/85 p-3 rounded-xl text-center shadow-lg animate-fade-in text-xs font-semibold text-indigo-300">
                          {formSubmittedMsg}
                        </div>
                      )}

                      {/* Mockup footer */}
                      <footer className="text-center font-mono text-[9px] text-slate-600 border-t border-slate-900 py-4 mt-8">
                        Clean 4-Frame Layout • Hosted entirely free
                      </footer>

                    </div>

                  </div>
                </div>

                {/* Live Real-time Code Viewer (Right md:col-span-4) */}
                <div className="md:col-span-5 lg:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xs font-mono uppercase text-indigo-400 font-bold mb-2 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4" />
                      Dynamic Codebase Outliner
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                      This is the real, production-ready, clean HTML5 code representing your customized 4-frame design. You can copy it, paste into a file named <code className="text-white font-mono bg-slate-900 p-0.5 rounded">index.html</code>, and run it anywhere for 100% free!
                    </p>

                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto max-h-[440px] space-y-3 whitespace-pre">
                      <span className="text-indigo-400">&lt;!-- 1. Vertically Aligned Stack tags --&gt;</span>
                      <p className="text-slate-200">
                        &lt;main class="max-w-4xl w-full mx-auto"&gt;<br />
                        <br />
                        &nbsp;&nbsp;&lt;!-- Centered Upper Frame --&gt;<br />
                        &nbsp;&nbsp;&lt;div class="max-w-2xl mx-auto mb-8 border border-slate-800"&gt;<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&lt;h3&gt;{upperFrame.title.slice(0, 20)}...&lt;/h3&gt;<br />
                        &nbsp;&nbsp;&lt;/div&gt;<br />
                        <br />
                        &nbsp;&nbsp;&lt;!-- Lower Stack column arrangement --&gt;<br />
                        &nbsp;&nbsp;&lt;div class="max-w-xl mx-auto flex flex-col gap-6"&gt;<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&lt;div class="border border-slate-800"&gt;Lower 1&lt;/div&gt;<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&lt;div class="border border-slate-800"&gt;Lower 2&lt;/div&gt;<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&lt;div class="border border-slate-800"&gt;Lower 3&lt;/div&gt;<br />
                        &nbsp;&nbsp;&lt;/div&gt;<br />
                        <br />
                        &lt;/main&gt;
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl text-xs space-y-2">
                    <span className="font-bold text-white block">📁 Where to upload?</span>
                    <p className="text-slate-400 leading-normal text-[11px]">
                      Download this file and drag it into GitHub Pages or netlify.com. Both platforms of choice take less than 1.5 minutes to publish your live page completely free.
                    </p>
                    <button
                      onClick={() => setActiveTab('hosting-guide')}
                      className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 hover:underline text-[11px]"
                    >
                      Read step-by-step guides <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ZERO-COST HOSTING GUIDES DECK */}
        {activeTab === 'hosting-guide' && (
          <div className="max-w-5xl mx-auto w-full space-y-6">
            
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl">
              <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold block mb-1">Zero-Cost Infrastructure Desk</span>
              <h2 className="text-xl md:text-2xl font-black text-white">How and Where to Host Your Web Pages Completely Free</h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                As a student or creator, you do NOT need to pay monthly fees or supply billing credentials to host your page, configure forms submissions databases, or publish beautiful assets. The modern web ecosystem offers generous, highly robust free tiers. Here are the finest platforms to practice!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* PLATFORM 1: GITHUB PAGES */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -z-10"></div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-indigo-950/50 border border-indigo-900/60 px-3 py-1 rounded-full text-indigo-400 text-xs font-mono">
                      <Github className="w-3.5 h-3.5" />
                      GitHub Pages
                    </div>
                    <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-900/40">Highly Recommended</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white">100% Free Static HTML Hosting</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    By placing your web files (like the <code className="text-white font-mono bg-slate-950 p-0.5 rounded">index.html</code> code generated above) in a GitHub repository, GitHub will securely host it globally at <code className="text-indigo-400">username.github.io/repository</code>.
                  </p>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Steps to configure:</h4>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
                      <li>Create a free account at <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">github.com <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
                      <li>Click "New Repository" and name it (e.g. <code className="text-slate-300 font-mono">my-layout-page</code>).</li>
                      <li>Check the option "Add a README file" and click Create.</li>
                      <li>Click "Add File" → "Create new file", name it <strong className="text-white font-mono">index.html</strong>, and paste our generated code block inside.</li>
                      <li>Go to repository "Settings" → "Pages" tab on the left.</li>
                      <li>Under Build and deployment, change Source to <strong className="text-white">"Deploy from a branch"</strong>, select your main branch, and click Save.</li>
                      <li>Wait 1 minute, and enjoy your public, live, permanent website link!</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-indigo-950/30 p-3 rounded-xl border border-indigo-900/30 text-[11px] text-slate-350 mt-4 leading-relaxed">
                  💡 <strong>Pro Tip:</strong> Any time you edit your file inside GitHub repository, the physical URL updates automatically instantly. It is ideal for sandbox practice.
                </div>
              </div>

              {/* PLATFORM 2: NETLIFY / VERCEL DRAG & DROP */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -z-10"></div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-indigo-950/50 border border-indigo-900/60 px-3 py-1 rounded-full text-indigo-400 text-xs font-mono">
                      <Cloud className="w-3.5 h-3.5" />
                      Netlify Drop
                    </div>
                    <span className="bg-slate-950 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-850">Under 1 Minute Only</span>
                  </div>

                  <h3 className="text-lg font-bold text-white">Drag &amp; Drop Folder Hosting</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Don't want to use GitHub or type command parameters yet? You can physically drag your HTML files directly into a browser tab and receive an instant secured HTTPS website URL from Netlify.
                  </p>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Steps to configure:</h4>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
                      <li>Download the customized <strong className="text-white">index.html</strong> file from our Sandbox tab.</li>
                      <li>Place this file inside a new, empty folder on your desktop computer (e.g. named <code className="text-slate-300 font-mono">my-website-folder</code>).</li>
                      <li>Navigate to <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">app.netlify.com/drop <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
                      <li>Drag your whole folder onto the big circular target dotted region on the web page.</li>
                      <li>Netlify will instantly compile, build, and deploy a secure static site with an automated URL like <code className="text-indigo-400 font-mono">happy-galaxy-abc.netlify.app</code>!</li>
                      <li>You can sign up for a free permanent identity to edit custom text names for this URL.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-indigo-950/30 p-3 rounded-xl border border-indigo-900/30 text-[11px] text-slate-350 mt-4 leading-relaxed">
                  💡 <strong>Pro Tip:</strong> Vercel offers an identical zero-cost drag &amp; drop service at <a href="https://vercel.com" className="text-slate-200 underline">vercel.com</a>. Perfect to test client structures in tandem!
                </div>
              </div>

              {/* PLATFORM 3: FREE FORM BACKENDS FOR CODE PAGES */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-32 justify-center font-mono text-[10px] text-indigo-400">
                    Formspree &amp; Basin
                  </div>

                  <h3 className="text-lg font-bold text-white">How Form inputs post securely without servers</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    If you write your own HTML form with input fields, where do the entered values go when you click submit? Typically they require advanced Node/PHP servers and SQL databases. However, free API endpoints handle this securely.
                  </p>

                  <div className="space-y-2 pt-1 border-t border-slate-800/60 mt-3">
                    <h4 className="text-xs font-bold text-white">Formspree.io (50 free entries/month)</h4>
                    <p className="text-xs text-slate-300">
                      You create an account, gather a key, and use it inside your HTML code:
                    </p>
                    <pre className="bg-slate-950 text-emerald-400 text-[10px] p-2 rounded-lg font-mono overflow-x-auto">
{`<form action="https://formspree.io/f/YOUR_KEY" method="POST">
  <input type="email" name="email_address" required />
  <button type="submit">Publish</button>
</form>`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* PLATFORM 4: UNRESTRICTED DRAG-AND-DROP WIDGETS */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-28 justify-center font-mono text-[10px] text-indigo-400">
                    Tally.so &amp; Google
                  </div>

                  <h3 className="text-lg font-bold text-white">Embed Gorgeous Builders in Frames</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    By making an account on <strong className="text-white">Tally.so (which offers 99% of its attributes free of cost)</strong>, you can design full-screen forms visually like a Notion document. Tally hosts the entries and redirects safely. You then load those forms inside our 4-frame page by using the <code className="text-indigo-450">&lt;iframe&gt;</code> HTML code.
                  </p>

                  <div className="bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl text-xs space-y-1 mt-4">
                    <span className="font-bold text-white block">✅ Summary of Zero-Cost Stack</span>
                    <p className="text-[11px] text-slate-350 leading-relaxed">
                      1. Build design locally with our Sandbox.<br />
                      2. Host HTML file on GitHub Pages.<br />
                      3. Embed Tally.so forms inside the layout. <br />
                      4. Get full analytics, responsive forms, and responsive displays with NO CREDIT CARD needed.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: DESIGN THEORY & FORM LEARNING LESSONS */}
        {activeTab === 'layout-theory' && (
          <div className="max-w-4xl mx-auto w-full space-y-6">

            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl">
              <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold block mb-1">Interactive Lesson Desk</span>
              <h2 className="text-xl md:text-2xl font-black text-white">Understanding the 4-Frame Web Grid Layout</h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Why arrange web layouts with centered upper content and vertical lower stacks? Let's analyze layout theory, responsive viewport rules, and key HTML attributes that make free web integrations successful for practice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-mono text-indigo-400 font-bold block">1. The "Middle" Centering Hook</span>
                <p className="text-xs text-slate-305 leading-relaxed">
                  Centering your upper Frame in the horizontal middle (using Tailwind utility class <code className="text-white font-mono bg-slate-950 p-0.5 rounded">mx-auto max-w-2xl</code>) establishes a commanding focal point. When users open a page, their eyes look at the middle primary hero header first.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-mono text-indigo-400 font-bold block">2. Vertical Lower Stack Symmetry</span>
                <p className="text-xs text-slate-305 leading-relaxed">
                  Structuring your lower frames in a vertical stack ensures high-conversion readability. It mimics the natural scrolling viewport of mobile phones, meaning your website transitions flawlessly from desktop monitors to mobile screens with zero layout drift or overlapping components.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-mono text-indigo-400 font-bold block">3. Crucial "Name" Attribute Rule</span>
                <p className="text-xs text-slate-305 leading-relaxed">
                  Never forget: in HTML forms, you MUST specify a unique <code className="text-white font-mono bg-slate-950 p-0.5 rounded">name</code> attribute on every <code className="text-[#38bdf8]">&lt;input&gt;</code> tag. Free forms backends like Formspree or Basin rely entirely on these names as row headers to sync and map your entries securely!
                </p>
              </div>

            </div>

            {/* Interactive Concept Quiz */}
            <div className="bg-slate-900 border-2 border-indigo-900/60 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-400 w-5 h-5" />
                <h3 className="text-md font-bold text-white">Test Your Knowledge: Free Forms &amp; Web Hosting</h3>
              </div>
              
              <div className="p-4 bg-slate-950 rounded-xl space-y-3">
                <span className="text-[10px] font-mono text-indigo-400 block font-bold uppercase">Quick Practice Quiz Question:</span>
                <p className="text-sm font-semibold text-white">How does a static website host like GitHub Pages display your site by default when someone visits your public domain?</p>
                
                <div className="space-y-2">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-305 hover:border-slate-700 transition cursor-pointer">
                    A. It searches for a file named <strong className="text-white font-mono">index.html</strong> in the root folder, parsing its DOM hierarchy as the primary visual display page.
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-305 hover:border-slate-700 transition">
                    B. It requires you to set up highly complex Apache or MySQL databases running continuously on a remote Linux server.
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-305 hover:border-slate-700 transition">
                    C. It only works if you pay a monthly fee of $15/month for domain DNS routers.
                  </div>
                </div>

                <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-900/40 text-xs text-indigo-305 leading-relaxed mt-2">
                  ✅ <strong>Answer Insight:</strong> The correct answer is <strong>A</strong>! Standard web browsers and CDNs search specifically for root files named <strong>index.html</strong> to fetch first. By downloading and uploading our sandbox output with that exact file name, you ensure instant global delivery.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: PRISTINE LIVE WEBPAGE PREVIEW MODE (No developer sidebars, tools, or annotations) */}
        {activeTab === 'live-view' && (
          <div className={`min-h-screen flex flex-col w-full relative overflow-hidden isolate ${
            themeColor === 'editorial' ? 'bg-[#fcfaf7] text-stone-900 font-serif' :
            themeColor === 'emerald' ? 'bg-zinc-950 text-zinc-100 font-mono' :
            themeColor === 'sunset' ? 'bg-neutral-950 text-neutral-100' :
            'bg-[#050508] text-slate-100 font-sans'
          }`}>
            {/* Projector Spotlight Beam */}
            {themeColor !== 'editorial' && (
              <div className="absolute top-0 bottom-[140px] left-1/2 -translate-x-1/2 w-full max-w-5xl pointer-events-none z-0 overflow-hidden select-none">
                {/* Bright Spotlight Source */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-white/95 rounded-b-full filter blur-[1px] opacity-90 shadow-[0_0_50px_rgba(255,255,255,1)] z-0" />
                {/* Volumetric light cone */}
                <div 
                  className="w-full h-full opacity-65 mix-blend-screen" 
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.28) 0%, rgba(239, 68, 68, 0.08) 40%, rgba(239, 68, 68, 0.04) 80%, rgba(239, 68, 68, 0.08) 100%)',
                    clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)',
                    filter: 'blur(6px)'
                  }}
                />
                {/* Inner sharper beam of light */}
                <div 
                  className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen" 
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.15) 100%)',
                    clipPath: 'polygon(48% 0%, 52% 0%, 85% 100%, 15% 100%)',
                    filter: 'blur(2px)'
                  }}
                />
              </div>
            )}

            {/* Elegant Sticky Preview Action Bar */}
            {!isPureProductionView && (
              <div className="bg-slate-950 border-b border-slate-900 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-xl backdrop-blur-md bg-opacity-95">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                  <span className="text-xs font-mono font-bold text-slate-300">LIVE WEBSITE DEMO</span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    | Experiencing your custom 4-frame design exactly as a visitor sees it
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all font-semibold"
                    title="Copy full single-file index.html code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{copiedCode ? 'Copied HTML!' : 'Copy Page Code'}</span>
                  </button>
                  <button
                    onClick={handleExportZipFile}
                    disabled={zipLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all font-bold disabled:opacity-60"
                    title="Export complete web server packages & source files in ZIP"
                  >
                    {zipLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FolderArchive className="w-3.5 h-3.5 text-indigo-200" />}
                    <span>{zipLoading ? 'Bundling...' : 'Download ZIP Package'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('sandbox')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all shadow-lg shadow-emerald-950/20"
                  >
                    <span>✏️ Open Sandbox Editor</span>
                  </button>
                </div>
              </div>
            )}

            {/* Pristine 4-Frame Webpage Stage */}
            <div className="flex-grow py-12 px-4 md:px-8 max-w-5xl mx-auto w-full relative z-10">
              
              <div className="space-y-12">
                
                {/* 1. Brand Site Header */}
                <header className="text-center space-y-3 mb-10">
                  {themeColor === 'editorial' ? (
                    <>
                      <span className="text-[9px] uppercase tracking-widest font-mono border px-3 py-1 rounded-full inline-block text-stone-700 border-stone-300 bg-stone-100">
                        Cinema &amp; Review Journal
                      </span>
                      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-stone-900 font-serif">
                        Anotherr day dreaming
                      </h1>
                      <p className="text-xs max-w-md mx-auto text-stone-600">
                        This responsive web page combines an upper centered frame with three lower sections arranged side-by-side.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-[11px] uppercase tracking-[0.25em] font-black text-red-500 font-mono">
                        Cinema &amp; Review Journal
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black text-red-600 tracking-tighter uppercase filter drop-shadow-[0_0_12px_rgba(239,68,68,0.75)] font-sans" style={{ fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" }}>
                        Anotherr day dreaming
                      </h1>
                      <p className="text-xs text-red-700/80 max-w-md mx-auto font-semibold tracking-wide">
                        A hand-crafted projection of cinematic logs, live diaries, and review cards.
                      </p>


                    </>
                  )}
                </header>

                {/* 2. UPPER CENTERED FRAME CONTAINER */}
                <section className="w-full flex justify-center">
                  <div className={`w-full max-w-2xl mx-auto ${
                    upperFrame.type === 'letterboxd_carousel' 
                      ? 'bg-transparent' 
                      : `rounded-2xl p-6 border border-solid ${
                          themeColor === 'editorial' ? 'bg-stone-50 border-stone-200 shadow-sm' :
                          themeColor === 'emerald' ? 'bg-zinc-900 border-zinc-850' :
                          themeColor === 'sunset' ? 'bg-neutral-900 border-neutral-850' :
                          'bg-slate-900/60 border-slate-850 backdrop-blur shadow-2xl'
                        }`
                  }`}>
                    {upperFrame.type === 'letterboxd_carousel' && (
                      <LetterboxdCarousel 
                        feedUrl={upperFrame.contentBody} 
                        themeColor={themeColor}
                        sharedXml={sharedXml}
                        sharedLoading={sharedLoading}
                        sharedError={sharedError}
                        sharedIsReal={sharedIsReal}
                      />
                    )}

                    {upperFrame.type === 'content' && (
                      <div className="space-y-1">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{upperFrame.title}</h4>
                        <p className={`text-xs whitespace-pre-line leading-relaxed ${themeColor === 'editorial' ? 'text-stone-700' : 'text-slate-300'}`}>{upperFrame.contentBody}</p>
                      </div>
                    )}

                    {upperFrame.type === 'image' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{upperFrame.title}</h4>
                        <img src={upperFrame.imageUrl} alt="Visual Media" className="w-full h-44 object-cover rounded-xl shadow-md border border-slate-800/20" />
                        <p className={`text-xs ${themeColor === 'editorial' ? 'text-stone-600' : 'text-slate-400'}`}>{upperFrame.contentBody}</p>
                      </div>
                    )}

                    {upperFrame.type === 'embed_tally' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{upperFrame.title}</h4>
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          <iframe src={upperFrame.iframeUrl} width="100%" height="100%" frameBorder="0" title={upperFrame.title}>Loading...</iframe>
                        </div>
                      </div>
                    )}

                    {upperFrame.type === 'form' && (
                      <div className="space-y-3">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{upperFrame.title}</h4>
                        <p className={`text-xs ${themeColor === 'editorial' ? 'text-stone-600' : 'text-slate-400'}`}>{upperFrame.contentBody}</p>
                        <form onSubmit={handleMockSubmit} className="space-y-2">
                          <input 
                            type="email" 
                            placeholder="Your email address here..." 
                            required
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none transition-all ${
                              themeColor === 'editorial' 
                                ? 'bg-white border-stone-300 text-stone-900 focus:border-stone-500' 
                                : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                            }`} 
                          />
                          <button type="submit" className={`w-full text-[10px] font-bold py-2 rounded-lg uppercase tracking-wider transition-all ${
                            themeColor === 'editorial' ? 'bg-[#4a3f35] text-amber-50 hover:bg-[#5c4f42]' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                          }`}>
                            Send Submission
                          </button>
                        </form>
                      </div>
                    )}

                    {upperFrame.type === 'custom_html' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{upperFrame.title}</h4>
                        <div dangerouslySetInnerHTML={{ __html: upperFrame.contentBody }} />
                      </div>
                    )}
                  </div>
                </section>

                {/* Division Divider */}
                <div className="w-full max-w-3xl mx-auto flex items-center gap-3">
                  <div className={`flex-grow h-px ${themeColor === 'editorial' ? 'bg-stone-200' : 'bg-slate-900'}`}></div>
                  <span className={`text-[9px] uppercase tracking-widest font-semibold ${themeColor === 'editorial' ? 'text-stone-400' : 'text-slate-600'}`}>
                    Lower Stack Elements Grid
                  </span>
                  <div className={`flex-grow h-px ${themeColor === 'editorial' ? 'bg-stone-200' : 'bg-slate-900'}`}></div>
                </div>

                {/* 3. SECOND FRAME (lowerFrame1 - Reviews - Full Width under Frame 1) */}
                <div className="w-full max-w-2xl mx-auto mb-6">
                  <div className={`rounded-2xl p-6 border border-solid transition-all ${
                    themeColor === 'editorial' ? 'bg-stone-50 border-stone-200 shadow-sm' :
                    themeColor === 'emerald' ? 'bg-zinc-900 border-zinc-850' :
                    themeColor === 'sunset' ? 'bg-neutral-900 border-neutral-850' :
                    'bg-[#ab0c0c] border-[#8e0909] text-white shadow-[0_0_30px_rgba(171,12,12,0.15)] shadow-2xl'
                  }`}>
                    {lowerFrame1.type === 'content' && (
                      <div>
                        {lowerFrame1.contentBody && (lowerFrame1.contentBody.includes('letterboxd.com/') || lowerFrame1.contentBody.includes('/film/')) ? (
                          <LetterboxdReviewLiveCard url={lowerFrame1.contentBody} fallbackTitle={lowerFrame1.title} themeColor={themeColor} />
                        ) : (
                          <>
                            <h4 className={`text-sm font-bold mb-2 ${themeColor === 'editorial' ? 'text-stone-900 font-serif' : 'text-white'}`}>{lowerFrame1.title}</h4>
                            <p className={`text-xs whitespace-pre-line leading-relaxed ${themeColor === 'editorial' ? 'text-stone-700' : 'text-slate-300'}`}>{lowerFrame1.contentBody}</p>
                          </>
                        )}
                      </div>
                    )}
                    {lowerFrame1.type === 'image' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame1.title}</h4>
                        <img src={lowerFrame1.imageUrl} alt="Lower Visual 1" className="w-full h-44 object-cover rounded-xl shadow-md border border-slate-800/10" />
                        <p className={`text-xs ${themeColor === 'editorial' ? 'text-stone-600' : 'text-slate-400'}`}>{lowerFrame1.contentBody}</p>
                      </div>
                    )}
                    {lowerFrame1.type === 'embed_tally' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame1.title}</h4>
                        <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          <iframe src={lowerFrame1.iframeUrl} width="100%" height="100%" frameBorder="0" title={lowerFrame1.title}>Loading...</iframe>
                        </div>
                      </div>
                    )}
                    {lowerFrame1.type === 'form' && (
                      <div className="space-y-3">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame1.title}</h4>
                        <p className={`text-xs ${themeColor === 'editorial' ? 'text-stone-600' : 'text-slate-400'}`}>{lowerFrame1.contentBody}</p>
                        <form onSubmit={handleMockSubmit} className="space-y-2">
                          <input 
                            type="email" 
                            placeholder="Your email address..." 
                            required
                            className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${
                              themeColor === 'editorial' 
                                ? 'bg-white border-stone-300 text-stone-900 focus:border-stone-500' 
                                : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                            }`} 
                          />
                          <button type="submit" className={`w-full text-[10px] font-bold py-2 rounded-lg uppercase tracking-wider transition-all ${
                            themeColor === 'editorial' ? 'bg-[#4a3f35] text-amber-50 hover:bg-[#5c4f42]' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                          }`}>
                            Send Info
                          </button>
                        </form>
                      </div>
                    )}
                    {lowerFrame1.type === 'custom_html' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame1.title}</h4>
                        <div dangerouslySetInnerHTML={{ __html: lowerFrame1.contentBody }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. THIRD & FOURTH FRAMES (Two Columns Layout side-by-side below Frame 2) */}
                <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  
                  {/* FOURTH FRAME (lowerFrame3 - Visual / Info) */}
                  <div className={`rounded-2xl p-6 border border-solid transition-all ${
                    themeColor === 'editorial' ? 'bg-stone-50 border-stone-200 shadow-sm' :
                    themeColor === 'emerald' ? 'bg-zinc-900 border-zinc-850' :
                    themeColor === 'sunset' ? 'bg-neutral-900 border-neutral-850' :
                    'bg-[#ab0c0c] border-[#8e0909] text-white shadow-[0_0_30px_rgba(171,12,12,0.15)] shadow-2xl'
                  }`}>
                    {lowerFrame3.type === 'content' && (
                      <div>
                        {lowerFrame3.contentBody && lowerFrame3.contentBody.includes('if-i-can-ill-go-and-see-them-at-the-cinema') ? (
                          <div className="space-y-2">
                            <h4 className={`text-sm font-bold mb-2 ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame3.title}</h4>
                            <LetterboxdFilmReels 
                              sharedXml={sharedXml}
                              sharedLoading={sharedLoading}
                              sharedError={sharedError}
                              sharedIsReal={sharedIsReal}
                              themeColor={themeColor}
                            />
                          </div>
                        ) : lowerFrame3.contentBody && (lowerFrame3.contentBody.includes('letterboxd.com/') || lowerFrame3.contentBody.includes('/film/')) ? (
                          <LetterboxdReviewLiveCard url={lowerFrame3.contentBody} fallbackTitle={lowerFrame3.title} themeColor={themeColor} />
                        ) : (
                          <>
                            <h4 className={`text-sm font-bold mb-2 ${themeColor === 'editorial' ? 'text-stone-900 font-serif' : 'text-white'}`}>{lowerFrame3.title}</h4>
                            <p className={`text-xs whitespace-pre-line leading-relaxed ${themeColor === 'editorial' ? 'text-stone-700' : 'text-slate-300'}`}>{lowerFrame3.contentBody}</p>
                          </>
                        )}
                      </div>
                    )}
                    {lowerFrame3.type === 'image' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame3.title}</h4>
                        <img src={lowerFrame3.imageUrl} alt="Lower Visual 3" className="w-full h-44 object-cover rounded-xl shadow-md border border-slate-800/10" />
                        <p className={`text-xs ${themeColor === 'editorial' ? 'text-stone-600' : 'text-slate-400'}`}>{lowerFrame3.contentBody}</p>
                      </div>
                    )}
                    {lowerFrame3.type === 'embed_tally' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame3.title}</h4>
                        <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          <iframe src={lowerFrame3.iframeUrl} width="100%" height="100%" frameBorder="0" title={lowerFrame3.title}>Loading...</iframe>
                        </div>
                      </div>
                    )}
                    {lowerFrame3.type === 'form' && (
                      <div className="space-y-3">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame3.title}</h4>
                        <p className={`text-xs ${themeColor === 'editorial' ? 'text-stone-600' : 'text-slate-400'}`}>{lowerFrame3.contentBody}</p>
                        <form onSubmit={handleMockSubmit} className="space-y-2">
                          <input 
                            type="email" 
                            placeholder="Your email address..." 
                            required
                            className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${
                              themeColor === 'editorial' 
                                ? 'bg-white border-stone-300 text-stone-900 focus:border-stone-500' 
                                : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                            }`} 
                          />
                          <button type="submit" className={`w-full text-[10px] font-bold py-2 rounded-lg uppercase tracking-wider transition-all ${
                            themeColor === 'editorial' ? 'bg-[#4a3f35] text-amber-50 hover:bg-[#5c4f42]' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                          }`}>
                            Send Info
                          </button>
                        </form>
                      </div>
                    )}
                    {lowerFrame3.type === 'custom_html' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame3.title}</h4>
                        <div dangerouslySetInnerHTML={{ __html: lowerFrame3.contentBody }} />
                      </div>
                    )}
                  </div>

                  {/* THIRD FRAME (lowerFrame2 - Spain Film Releases) */}
                  <div className={`rounded-2xl p-6 border border-solid transition-all ${
                    themeColor === 'editorial' ? 'bg-stone-50 border-stone-200 shadow-sm' :
                    themeColor === 'emerald' ? 'bg-zinc-900 border-zinc-850' :
                    themeColor === 'sunset' ? 'bg-neutral-900 border-neutral-850' :
                    'bg-[#ab0c0c] border-[#8e0909] text-white shadow-[0_0_30px_rgba(171,12,12,0.15)] shadow-2xl'
                  }`}>
                    {lowerFrame2.type === 'content' && (
                      <div>
                        {lowerFrame2.contentBody && lowerFrame2.contentBody.includes('ranking-of-film-releases-in-spain-in-2025') ? (
                          <div className="space-y-2">
                            <h4 className={`text-sm font-bold mb-2 ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame2.title}</h4>
                            <LetterboxdSpainListLiveCard 
                              sharedXml={sharedXml}
                              sharedLoading={sharedLoading}
                              themeColor={themeColor}
                            />
                          </div>
                        ) : lowerFrame2.contentBody && (lowerFrame2.contentBody.includes('letterboxd.com/') || lowerFrame2.contentBody.includes('/film/')) ? (
                          <LetterboxdReviewLiveCard url={lowerFrame2.contentBody} fallbackTitle={lowerFrame2.title} themeColor={themeColor} />
                        ) : (
                          <>
                            <h4 className={`text-sm font-bold mb-2 ${themeColor === 'editorial' ? 'text-stone-900 font-serif' : 'text-white'}`}>{lowerFrame2.title}</h4>
                            <p className={`text-xs whitespace-pre-line leading-relaxed ${themeColor === 'editorial' ? 'text-stone-700' : 'text-slate-300'}`}>{lowerFrame2.contentBody}</p>
                          </>
                        )}
                      </div>
                    )}
                    {lowerFrame2.type === 'image' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame2.title}</h4>
                        <img src={lowerFrame2.imageUrl} alt="Lower Visual 2" className="w-full h-44 object-cover rounded-xl shadow-md border border-slate-800/10" />
                        <p className={`text-xs ${themeColor === 'editorial' ? 'text-stone-600' : 'text-slate-400'}`}>{lowerFrame2.contentBody}</p>
                      </div>
                    )}
                    {lowerFrame2.type === 'embed_tally' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame2.title}</h4>
                        <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          <iframe src={lowerFrame2.iframeUrl} width="100%" height="100%" frameBorder="0" title={lowerFrame2.title}>Loading...</iframe>
                        </div>
                      </div>
                    )}
                    {lowerFrame2.type === 'form' && (
                      <div className="space-y-3">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame2.title}</h4>
                        <p className={`text-xs ${themeColor === 'editorial' ? 'text-stone-600' : 'text-slate-400'}`}>{lowerFrame2.contentBody}</p>
                        <form onSubmit={handleMockSubmit} className="space-y-2">
                          <input 
                            type="email" 
                            placeholder="Your email address..." 
                            required
                            className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none ${
                              themeColor === 'editorial' 
                                ? 'bg-white border-stone-300 text-stone-900 focus:border-stone-500' 
                                : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                            }`} 
                          />
                          <button type="submit" className={`w-full text-[10px] font-bold py-2 rounded-lg uppercase tracking-wider transition-all ${
                            themeColor === 'editorial' ? 'bg-[#4a3f35] text-amber-50 hover:bg-[#5c4f42]' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                          }`}>
                            Send Info
                          </button>
                        </form>
                      </div>
                    )}
                    {lowerFrame2.type === 'custom_html' && (
                      <div className="space-y-2">
                        <h4 className={`text-sm font-bold ${themeColor === 'editorial' ? 'text-stone-900' : 'text-white'}`}>{lowerFrame2.title}</h4>
                        <div dangerouslySetInnerHTML={{ __html: lowerFrame2.contentBody }} />
                      </div>
                    )}
                  </div>

                </section>

                {/* Cinema Seats Row at bottom */}
                {themeColor !== 'editorial' && (
                  <div className="w-full overflow-hidden mt-10 select-none pointer-events-none">
                    <svg viewBox="0 0 1000 120" className="w-full h-auto text-red-700" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <g>
                        {Array.from({ length: 10 }).map((_, i) => (
                          <g key={i} transform={`translate(${i * 100}, 10)`}>
                            <path d="M10,75 Q10,95 25,95 L75,95 Q90,95 90,75 L90,65 L10,65 Z" fill="#9a0000" />
                            <rect x="15" y="10" width="70" height="65" rx="12" fill="#d60000" />
                            <rect x="30" y="22" width="5" height="40" rx="2" fill="#7a0000" />
                            <rect x="48" y="22" width="5" height="40" rx="2" fill="#7a0000" />
                            <rect x="66" y="22" width="5" height="40" rx="2" fill="#7a0000" />
                            <rect x="5" y="48" width="10" height="28" rx="5" fill="#6d0000" />
                            <rect x="85" y="48" width="10" height="28" rx="5" fill="#6d0000" />
                            <rect x="45" y="94" width="10" height="20" fill="#2a0000" />
                          </g>
                        ))}
                      </g>
                    </svg>
                  </div>
                )}

              </div>

              {/* Pure Webpage Footer */}
              <footer className={`text-center text-[10px] border-t pt-8 mt-16 space-y-1 ${
                themeColor === 'editorial' ? 'text-stone-500 border-stone-200' : 'text-slate-500 border-slate-900'
              }`}>
                <p>© {new Date().getFullYear()} Centered 4-Frame Site. Constructed entirely free.</p>
                <p className="font-mono text-[9px]">Hosted securely with 100% zero hosting costs via free platforms.</p>
              </footer>

            </div>

            {/* Float Back to Editor Action Pin */}
            {!isPureProductionView && (
              <div className="fixed bottom-6 right-6 z-50">
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className="flex items-center gap-2 px-4.5 py-3 rounded-full bg-slate-950 hover:bg-slate-900 text-slate-200 font-extrabold text-xs shadow-2xl shadow-indigo-950/50 hover:scale-105 transition-all border border-slate-800"
                >
                  <span>✏️ Open Editor</span>
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER (Hidden in Pure Webpage Preview for a pristine display) */}
      {activeTab !== 'live-view' && (
        <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-slate-500 text-xs mt-12 space-y-2">
          <div className="flex justify-center items-center gap-2 text-[10px] text-slate-400 font-mono">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>SSL Secured Static Sandbox</span>
            <span className="text-slate-700">•</span>
            <AlignJustify className="w-3.5 h-3.5 text-indigo-400" />
            <span>Perfect 4-Frame Viewport Aligned</span>
          </div>
          <p className="text-slate-600 text-[11px]">Designed recursively to support modern zero-cost developer practice.</p>
        </footer>
      )}

    </div>
  );
}
