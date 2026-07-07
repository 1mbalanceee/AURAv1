"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Category, GoodDeed } from "../types";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  TrendingUp, 
  Info, 
  Download, 
  Upload, 
  Sparkles,
  RefreshCw,
  X
} from "lucide-react";

// 1. Categories configuration
const CATEGORIES: Category[] = [
  { id: "health", name: "Спорт / Здоровье", color: "#A855F7", icon: "✦" }, // purple
  { id: "projects", name: "Продуктивность", color: "#EAB308", icon: "❖" }, // yellow
  { id: "mental", name: "Менталка / Отдых", color: "#22C55E", icon: "✿" }, // green
  { id: "routine", name: "Быт / Рутина", color: "#3B82F6", icon: "⬓" },  // blue
];

// Dreamcore / webpunk supportive quotes
const SUPPORTIVE_QUOTES = [
  "Ты делаешь достаточно. Не нужно спешить. ☾",
  "Каждое маленькое дело — это победа над энтропией. ✦",
  "Твой темп уникален. Сравнивать себя с другими — иллюзия. 🪐",
  "Остановись на секунду. Вдохни. Твои усилия имеют значение. 👁",
  "Даже если день прошел в покое, ты заслуживаешь уважения. ✿",
  "Ошибаться и уставать — это нормально. Ты человек, а не машина. ❖",
  "Маленькие шаги ведут к великим созвездиям. ☄",
  "Твоя ценность не измеряется только продуктивностью. 🖤",
  "Замечай свои победы. Они реальны, даже самые крошечные. ☼",
  "Твой внутренний свет сияет ярче, чем ты думаешь. ✦"
];

// Helper to get formatted date string
const formatDateStr = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Parse date string in format YYYY-MM-DD to local Date object (avoids timezone shift bugs)
const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export default function Home() {
  // App states
  const [deeds, setDeeds] = useState<GoodDeed[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"tracker" | "stats">("tracker");
  
  // Input form states
  const [newDeedText, setNewDeedText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // UI states
  const [isMounted, setIsMounted] = useState(false);
  const [activeDeed, setActiveDeed] = useState<GoodDeed | null>(null);
  const [selectedCategoryForStatsList, setSelectedCategoryForStatsList] = useState<Category | null>(null);
  const [currentQuote, setCurrentQuote] = useState(SUPPORTIVE_QUOTES[0]);
  const [showQuoteBubble, setShowQuoteBubble] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Swipe detection refs
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  // Set initial client-side states
  useEffect(() => {
    setIsMounted(true);
    
    // Set selected date to today (local)
    setSelectedDate(formatDateStr(new Date()));

    // Load achievements from localStorage
    const saved = localStorage.getItem("aura_deeds");
    if (saved) {
      try {
        setDeeds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse deeds", e);
      }
    } else {
      // Seed initial data for a beautiful cold start
      const today = formatDateStr(new Date());
      const yesterday = formatDateStr(new Date(Date.now() - 86400000));
      const twoDaysAgo = formatDateStr(new Date(Date.now() - 172800000));
      
      const seedDeeds: GoodDeed[] = [
        { id: "s1", text: "Сделал разминку и выпил стакан воды", date: today, category_ids: ["health"] },
        { id: "s2", text: "Дописал базовый функционал для личного кабинета", date: today, category_ids: ["projects"] },
        { id: "s3", text: "Прочитал 10 страниц книги и помедитировал", date: today, category_ids: ["mental"] },
        { id: "s4", text: "Разобрал старые вещи на рабочем столе", date: yesterday, category_ids: ["routine"] },
        { id: "s5", text: "Пробежал 5 километров в парке", date: yesterday, category_ids: ["health"] },
        { id: "s6", text: "Завершил MVP версию проекта и созвонился с другом", date: yesterday, category_ids: ["projects", "mental"] }, // Combo!
        { id: "s7", text: "Сходил на сессию к психотерапевту", date: twoDaysAgo, category_ids: ["mental"] },
        { id: "s8", text: "Помыл посуду и вынес мусор сразу после обеда", date: twoDaysAgo, category_ids: ["routine"] }
      ];
      
      setDeeds(seedDeeds);
      localStorage.setItem("aura_deeds", JSON.stringify(seedDeeds));
    }

    // Set a random supportive quote
    setCurrentQuote(SUPPORTIVE_QUOTES[Math.floor(Math.random() * SUPPORTIVE_QUOTES.length)]);
  }, []);

  // Save achievements to localStorage on change
  const saveDeeds = (updatedDeeds: GoodDeed[]) => {
    setDeeds(updatedDeeds);
    localStorage.setItem("aura_deeds", JSON.stringify(updatedDeeds));
  };

  // Day navigation helper
  const handleDayOffset = (offset: number) => {
    if (!selectedDate) return;
    const current = parseLocalDate(selectedDate);
    current.setDate(current.getDate() + offset);
    setSelectedDate(formatDateStr(current));
  };

  // Touch handlers for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStart.current === null || touchEnd.current === null) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > 60;
    const isRightSwipe = distance < -60;

    if (isLeftSwipe) {
      handleDayOffset(1); // Swipe left -> Tomorrow
    } else if (isRightSwipe) {
      handleDayOffset(-1); // Swipe right -> Yesterday
    }
  };

  // Select random quote on totem tap
  const handleTotemTap = () => {
    const available = SUPPORTIVE_QUOTES.filter(q => q !== currentQuote);
    const randomQuote = available[Math.floor(Math.random() * available.length)];
    setCurrentQuote(randomQuote);
    setShowQuoteBubble(true);
    
    // Auto hide bubble after 4.5 seconds
    setTimeout(() => {
      setShowQuoteBubble(false);
    }, 4500);
  };

  // Toggle category in entry form
  const toggleFormCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // Submit new deed
  const handleSubmitDeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeedText.trim()) return;

    const newDeed: GoodDeed = {
      id: Date.now().toString(),
      text: newDeedText.trim(),
      date: selectedDate,
      category_ids: selectedCategories.length > 0 ? selectedCategories : ["routine"] // Default to routine if none selected
    };

    const updated = [newDeed, ...deeds];
    saveDeeds(updated);
    
    // Clear form
    setNewDeedText("");
    setSelectedCategories([]);
    
    // Trigger totem pulse animation
    setSuccessPulse(true);
    setTimeout(() => setSuccessPulse(false), 1000);
  };

  // Delete a deed
  const handleDeleteDeed = (deedId: string) => {
    const updated = deeds.filter(d => d.id !== deedId);
    saveDeeds(updated);
    setActiveDeed(null);
  };

  // Backup data functions
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deeds, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aura_achievements_backup_${selectedDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Simple validation of fields
          const isValid = parsed.every(item => item.id && item.text && item.date && Array.isArray(item.category_ids));
          if (isValid) {
            saveDeeds(parsed);
            alert("Импорт завершен успешно!");
            setShowSettings(false);
          } else {
            alert("Ошибка импорта: Неверный формат файла.");
          }
        } else {
          alert("Ошибка импорта: Файл должен содержать массив данных.");
        }
      } catch (error) {
        alert("Ошибка импорта: Не удалось прочитать JSON файл.");
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm("Вы уверены, что хотите удалить все достижения? Это действие необратимо.")) {
      saveDeeds([]);
      setShowSettings(false);
    }
  };

  // --- Memos & Derived State ---

  // Generate day ribbon (7 days centered on selectedDate)
  const dayRibbon = useMemo(() => {
    if (!selectedDate) return [];
    
    const centerDate = parseLocalDate(selectedDate);
    const ribbon = [];
    const todayStr = formatDateStr(new Date());

    for (let i = -3; i <= 3; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      const dateStr = formatDateStr(d);
      
      // Check if this day has achievements
      const dayDeeds = deeds.filter(deed => deed.date === dateStr);
      const hasDeeds = dayDeeds.length > 0;
      
      // Determine dot color if day has deeds
      let dotGradient = "bg-white/20";
      if (hasDeeds) {
        const activeCats = Array.from(new Set(dayDeeds.flatMap(deed => deed.category_ids)));
        if (activeCats.length === 1) {
          const cat = CATEGORIES.find(c => c.id === activeCats[0]);
          if (cat) dotGradient = `bg-[${cat.color}] shadow-[0_0_8px_${cat.color}]`;
        } else {
          dotGradient = "bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]";
        }
      }

      // Format short day name in Russian
      const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
      const dayName = dayNames[d.getDay()];

      ribbon.push({
        dateStr,
        dayNum: d.getDate(),
        dayName,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasDeeds,
        dotGradient
      });
    }
    
    return ribbon;
  }, [selectedDate, deeds]);

  // Daily deeds list
  const dailyDeeds = useMemo(() => {
    return deeds.filter(deed => deed.date === selectedDate);
  }, [deeds, selectedDate]);

  // Totem state computation
  const totemState = useMemo(() => {
    const count = dailyDeeds.length;
    const catIds = Array.from(new Set(dailyDeeds.flatMap(d => d.category_ids)));
    
    // Shape/wobble speed and size
    let sizeClass = "w-32 h-32";
    let pulseSpeedClass = "animate-float";
    let wobbleClass = "";
    
    if (count === 0) {
      sizeClass = "w-28 h-28";
      pulseSpeedClass = "";
    } else if (count === 1) {
      sizeClass = "w-32 h-32";
      wobbleClass = "animate-wobble";
    } else if (count === 2) {
      sizeClass = "w-36 h-36";
      wobbleClass = "animate-wobble";
      pulseSpeedClass = "animate-float";
    } else {
      sizeClass = "w-40 h-40";
      wobbleClass = "animate-wobble";
      pulseSpeedClass = "animate-float";
    }

    // Gradient calculation
    let gradientStyle = {};
    let glowClass = "neon-glow-white";

    if (count === 0) {
      // Void dreamcore styling
      gradientStyle = {
        background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 80%)",
        border: "1px dashed rgba(255, 255, 255, 0.15)",
      };
      glowClass = "neon-glow-white";
    } else if (catIds.length === 1) {
      // Single category
      const cat = CATEGORIES.find(c => c.id === catIds[0]);
      if (cat) {
        gradientStyle = {
          background: `radial-gradient(circle, ${cat.color}33 0%, ${cat.color}aa 60%, ${cat.color}ee 100%)`,
          boxShadow: `0 0 35px -5px ${cat.color}88, inset 0 0 15px rgba(255,255,255,0.3)`
        };
        glowClass = `neon-glow-${cat.id}`;
      }
    } else {
      // Combo category gradient
      const activeColors = catIds
        .map(id => CATEGORIES.find(c => c.id === id)?.color)
        .filter(Boolean) as string[];
      
      const gradStops = activeColors.join(", ");
      gradientStyle = {
        background: `linear-gradient(135deg, ${gradStops})`,
        boxShadow: `0 0 45px -5px ${activeColors[0]}88, 0 0 45px -5px ${activeColors[1] || activeColors[0]}88, inset 0 0 20px rgba(255,255,255,0.4)`
      };
      glowClass = "neon-glow-combo";
    }

    return {
      count,
      catIds,
      sizeClass,
      pulseSpeedClass,
      wobbleClass,
      gradientStyle,
      glowClass
    };
  }, [dailyDeeds]);

  // Month Statistics Calculations
  const statsData = useMemo(() => {
    if (!isMounted || !selectedDate) {
      return {
        monthName: "",
        daysInMonth: [],
        catCounts: { health: 0, projects: 0, mental: 0, routine: 0 },
        totalCount: 0
      };
    }

    const centerDate = parseLocalDate(selectedDate);
    const currentYear = centerDate.getFullYear();
    const currentMonth = centerDate.getMonth(); // 0-indexed

    const monthNames = [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    // Number of days in current month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Find the weekday of the 1st of the month (adjusted so Mon = 0, Sun = 6)
    const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

    const daysArray = [];

    // Pad before the first day of the month for grid alignment (Mon-Sun layout)
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push(null);
    }

    // Category tallies for this specific month
    const tallies = { health: 0, projects: 0, mental: 0, routine: 0 };
    let monthTotal = 0;

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      const dayDeeds = deeds.filter(deed => deed.date === dateStr);
      const hasDeeds = dayDeeds.length > 0;
      
      let pixelStyle = {};
      let dominantCategory: string | null = null;
      let categoriesInDay: string[] = [];

      if (hasDeeds) {
        // Collect all categories for this day
        categoriesInDay = Array.from(new Set(dayDeeds.flatMap(d => d.category_ids)));
        
        // Count frequencies of each category on this day
        const catFreq: Record<string, number> = {};
        dayDeeds.forEach(d => {
          d.category_ids.forEach(cid => {
            catFreq[cid] = (catFreq[cid] || 0) + 1;
            // Increment overall monthly tallies
            if (cid in tallies) {
              tallies[cid as keyof typeof tallies]++;
            }
          });
          monthTotal++;
        });

        // Determine dominant category of the day
        let maxCount = 0;
        Object.entries(catFreq).forEach(([cid, freq]) => {
          if (freq > maxCount) {
            maxCount = freq;
            dominantCategory = cid;
          }
        });

        // Map pixel visual gradient
        if (categoriesInDay.length === 1) {
          const catColor = CATEGORIES.find(c => c.id === categoriesInDay[0])?.color || "#ffffff";
          pixelStyle = {
            backgroundColor: catColor,
            boxShadow: `0 0 10px ${catColor}55`
          };
        } else {
          const colors = categoriesInDay
            .map(cid => CATEGORIES.find(c => c.id === cid)?.color)
            .filter(Boolean) as string[];
          
          pixelStyle = {
            background: `linear-gradient(135deg, ${colors.join(", ")})`,
            boxShadow: `0 0 12px ${colors[0]}66`
          };
        }
      }

      daysArray.push({
        dayNum: day,
        dateStr,
        hasDeeds,
        deedsCount: dayDeeds.length,
        pixelStyle,
        categories: categoriesInDay
      });
    }

    return {
      monthName: `${monthNames[currentMonth]} ${currentYear}`,
      daysInMonth: daysArray,
      catCounts: tallies,
      totalCount: monthTotal
    };
  }, [deeds, selectedDate, isMounted]);

  // Memo to get achievements for the selected category in the current month (Stats view detail)
  const statsCategoryDeeds = useMemo(() => {
    if (!selectedCategoryForStatsList || !selectedDate) return [];
    const centerDate = parseLocalDate(selectedDate);
    const currentYear = centerDate.getFullYear();
    const currentMonth = centerDate.getMonth();
    
    return deeds.filter(deed => {
      const deedDate = parseLocalDate(deed.date);
      const isSameMonth = deedDate.getFullYear() === currentYear && deedDate.getMonth() === currentMonth;
      const hasCategory = deed.category_ids.includes(selectedCategoryForStatsList.id);
      return isSameMonth && hasCategory;
    });
  }, [deeds, selectedCategoryForStatsList, selectedDate]);

  // Form input category string for border highlight
  const activeInputGlow = useMemo(() => {
    if (selectedCategories.length === 0) return "border-white/10";
    if (selectedCategories.length === 1) {
      const cat = CATEGORIES.find(c => c.id === selectedCategories[0]);
      if (cat?.id === "health") return "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]";
      if (cat?.id === "projects") return "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]";
      if (cat?.id === "mental") return "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]";
      if (cat?.id === "routine") return "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
    }
    return "border-purple-500/40 border-r-cyan-500/40 border-b-cyan-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]";
  }, [selectedCategories]);

  // Loading safety
  if (!isMounted) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-[#09080f]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-white/40 text-xs tracking-widest uppercase">Загрузка ауры...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-0 sm:p-6 min-h-screen relative z-10">
      
      {/* Dynamic light sources in background */}
      <div className="hidden sm:block absolute top-[10%] left-[15%] w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-float" />
      <div className="hidden sm:block absolute bottom-[10%] right-[15%] w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none animate-float" />

      {/* Main Container - Phone Mockup on Desktop, fullscreen on Mobile */}
      <div className="w-full sm:w-[415px] sm:h-[860px] sm:max-h-[92vh] sm:rounded-[40px] sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(168,85,247,0.1)] flex flex-col relative overflow-hidden bg-[#09080f]/95 glass sm:neon-glow-white">
        
        {/* Decorative Camera Notch */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50 border-b border-x border-white/5" />

        {/* 1. Header Area */}
        <header className="flex flex-col pt-6 px-5 pb-3 border-b border-white/5 z-40 bg-[#09080f]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-400 font-bold animate-pulse-glow">✦</span>
              <h1 className="text-sm font-black tracking-[0.25em] text-white flex items-center gap-1.5">
                AURA 
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse-glow" />
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-white/50 hover:text-white/90 active:scale-95 hover:bg-white/5 rounded-full transition-all"
                title="О проекте / Настройки"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Sliding Capsule Style) */}
          <div className="relative mt-4 flex p-[3px] bg-white/2 rounded-full border border-white/5">
            <div 
              className={`absolute top-[3px] bottom-[3px] w-[50%] bg-white/5 border border-white/10 rounded-full transition-transform duration-300 ease-out ${
                activeTab === "stats" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <button 
              onClick={() => setActiveTab("tracker")}
              className={`flex-1 py-1.5 text-[11px] font-bold tracking-widest text-center transition-colors relative z-10 ${
                activeTab === "tracker" ? "text-white" : "text-white/40"
              }`}
            >
              ✦ ПОТОК
            </button>
            <button 
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-1.5 text-[11px] font-bold tracking-widest text-center transition-colors relative z-10 ${
                activeTab === "stats" ? "text-white" : "text-white/40"
              }`}
            >
              ❖ МАТРИЦА
            </button>
          </div>
        </header>

        {/* 2. Main Content Screens */}
        <main className="flex-1 overflow-y-auto relative flex flex-col min-h-0 bg-[#09080f]/30">
          
          {/* TRACKER TAB */}
          {activeTab === "tracker" && (
            <div className="flex flex-col flex-1 pb-6">
              
              {/* Day Swiper Ribbon */}
              <div className="py-3 px-4 border-b border-white/5 bg-[#09080f]/20 shrink-0">
                <div className="flex items-center justify-between gap-1">
                  <button 
                    onClick={() => handleDayOffset(-1)}
                    className="p-2 text-white/40 hover:text-white active:scale-90 transition-all rounded-full hover:bg-white/5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Ribbon list */}
                  <div className="flex justify-between flex-1 overflow-x-hidden">
                    {dayRibbon.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={`flex flex-col items-center gap-1.5 py-1.5 px-2.5 rounded-xl transition-all relative ${
                          day.isSelected 
                            ? "bg-white/10 border border-white/15 scale-105" 
                            : "opacity-40 hover:opacity-80"
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold tracking-wider">{day.dayName}</span>
                        <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg ${
                          day.isSelected ? "text-purple-300 font-extrabold" : "text-white"
                        }`}>
                          {day.dayNum}
                        </span>
                        
                        {/* Little achievement dot */}
                        {day.hasDeeds && (
                          <span 
                            className={`w-1 h-1 rounded-full absolute bottom-1.5 ${day.dotGradient}`}
                            style={!day.dotGradient.includes("bg-[") ? {} : {
                              backgroundColor: day.dotGradient.match(/bg-\[(#\w+)\]/)?.[1]
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleDayOffset(1)}
                    className="p-2 text-white/40 hover:text-white active:scale-90 transition-all rounded-full hover:bg-white/5"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Central Section: Totem View */}
              <div 
                className="flex flex-col items-center justify-center py-8 relative cursor-pointer select-none shrink-0"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleTotemTap}
              >
                {/* Floating/Glow Effect Rings under Totem */}
                {totemState.count > 0 && (
                  <div className="absolute w-44 h-44 rounded-full border border-white/3 opacity-30 animate-pulse-glow pointer-events-none" />
                )}
                
                {/* Dynamic Totem Sphere */}
                <div 
                  className={`flex items-center justify-center relative transition-all duration-[800ms] ${totemState.sizeClass} ${totemState.wobbleClass} ${totemState.pulseSpeedClass} ${
                    successPulse ? "scale-125 duration-150 rotate-6" : ""
                  }`}
                  style={totemState.gradientStyle}
                >
                  {/* Totem Core Symbol / Abstract Figure */}
                  <div className="text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] select-none">
                    {totemState.count === 0 && <span className="text-white/20 font-light">☾</span>}
                    {totemState.count === 1 && (
                      <span className="text-white font-bold animate-pulse-glow">
                        {CATEGORIES.find(c => c.id === totemState.catIds[0])?.icon || "✦"}
                      </span>
                    )}
                    {totemState.count === 2 && (
                      <span className="text-white text-3xl font-extrabold animate-pulse">❖</span>
                    )}
                    {totemState.count >= 3 && (
                      <span className="text-white text-3xl font-black drop-shadow-[0_0_12px_rgba(255,255,255,1)]">🪐</span>
                    )}
                  </div>

                  {/* Ring orbits (glowing dots) spinning around active totem */}
                  {totemState.count > 1 && (
                    <>
                      <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-orbit-1" />
                      <div className="absolute w-2 h-2 bg-purple-400 rounded-full animate-orbit-2" />
                    </>
                  )}
                </div>

                {/* Quote Bubble Overlay */}
                <div className={`absolute top-full -mt-2 mx-6 p-3 glass rounded-2xl transition-all duration-300 pointer-events-none max-w-[280px] text-center z-30 ${
                  showQuoteBubble 
                    ? "opacity-100 scale-100 translate-y-0" 
                    : "opacity-0 scale-90 -translate-y-2"
                }`}>
                  <p className="text-[10px] leading-relaxed text-white/80 font-medium">
                    {currentQuote}
                  </p>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#171424] border-t border-l border-white/10 rotate-45" />
                </div>

                {/* Small indicator label */}
                <div className="mt-4 flex flex-col items-center gap-0.5">
                  <span className="text-[8px] tracking-[0.3em] text-white/30 uppercase">Тотем Дня</span>
                  <span className="text-[10px] font-bold text-white/70">
                    {totemState.count === 0 
                      ? "Спящий разум" 
                      : totemState.count === 1 
                        ? "Пробуждение" 
                        : totemState.count === 2 
                          ? "Резонанс" 
                          : "Космическое равновесие"}
                  </span>
                </div>
              </div>

              {/* Bottom Section: Good Deeds List */}
              <div className="flex-1 px-5 mt-2 flex flex-col gap-3 min-h-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">Достижения ({dailyDeeds.length})</span>
                  {dailyDeeds.length > 0 && (
                    <span className="text-[8px] text-white/20 italic">нажмите для деталей</span>
                  )}
                </div>

                {dailyDeeds.length === 0 ? (
                  /* Beautiful empty state */
                  <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-white/5 bg-white/1 text-center min-h-[140px]">
                    <p className="text-xs text-white/40 italic leading-relaxed max-w-[240px]">
                      Сегодня здесь тихо. Не торопи себя. Просто дышать — это уже достижение. ☾
                    </p>
                    <p className="text-[9px] text-white/20 mt-2">
                      запиши любое небольшое дело внизу
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {dailyDeeds.map(deed => {
                      // Determine gradient if combo category
                      let cardGradient = "border-white/10";
                      let bgStyle = { background: "rgba(255, 255, 255, 0.02)" };
                      let glowType = "neon-glow-white";

                      if (deed.category_ids.length === 1) {
                        const cat = CATEGORIES.find(c => c.id === deed.category_ids[0]);
                        if (cat) {
                          bgStyle = { background: `linear-gradient(90deg, ${cat.color}15 0%, rgba(255,255,255,0.02) 100%)` };
                          cardGradient = `border-[${cat.color}]/30 border-l-[4px]`;
                          glowType = `neon-glow-${cat.id}`;
                        }
                      } else {
                        // Multi categories gradient
                        const colors = deed.category_ids
                          .map(cid => CATEGORIES.find(c => c.id === cid)?.color)
                          .filter(Boolean) as string[];
                        
                        bgStyle = { background: `linear-gradient(90deg, ${colors[0]}15 0%, ${colors[1] || colors[0]}15 100%)` };
                        cardGradient = "border-purple-500/20 border-r-cyan-500/20 border-l-[4px] border-l-purple-500 border-r-[1px]";
                        glowType = "neon-glow-combo";
                      }

                      return (
                        <div 
                          key={deed.id}
                          onClick={() => setActiveDeed(deed)}
                          className={`p-3.5 rounded-xl border glass-interactive flex items-start gap-3 cursor-pointer text-left ${cardGradient} ${glowType}`}
                          style={bgStyle}
                        >
                          {/* Left category icons inside card */}
                          <div className="flex gap-1 shrink-0 mt-0.5">
                            {deed.category_ids.map(cid => {
                              const cat = CATEGORIES.find(c => c.id === cid);
                              return (
                                <span 
                                  key={cid} 
                                  className="text-[10px] w-4 h-4 flex items-center justify-center rounded bg-white/5 border border-white/10"
                                  style={{ color: cat?.color }}
                                  title={cat?.name}
                                >
                                  {cat?.icon}
                                </span>
                              );
                            })}
                          </div>
                          
                          {/* Deed Text */}
                          <p className="text-xs text-white/95 leading-relaxed break-words flex-1 pr-1">
                            {deed.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === "stats" && (
            <div className="flex flex-col flex-1 p-5 gap-6 pb-20">
              
              {/* Matrix of the Month */}
              <div className="p-4 rounded-2xl border border-white/10 glass">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold tracking-widest text-purple-400">❖ {statsData.monthName}</span>
                  <div className="flex items-center gap-1.5 text-[8px] text-white/30 uppercase tracking-widest">
                    <span>сетка дней</span>
                  </div>
                </div>

                {/* Calendar Days Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(day => (
                    <span key={day} className="text-[9px] text-white/30 font-semibold">{day}</span>
                  ))}
                </div>

                {/* Grid container */}
                <div className="grid grid-cols-7 gap-1.5 justify-items-center">
                  {statsData.daysInMonth.map((dayData, idx) => {
                    if (dayData === null) {
                      // Pad empty weekday cells
                      return <div key={`pad-${idx}`} className="w-8 h-8 opacity-0" />;
                    }

                    const isCurrentSelected = dayData.dateStr === selectedDate;

                    return (
                      <button
                        key={dayData.dayNum}
                        onClick={() => {
                          setSelectedDate(dayData.dateStr);
                          setActiveTab("tracker");
                        }}
                        style={dayData.hasDeeds ? dayData.pixelStyle : {}}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative text-[10px] ${
                          dayData.hasDeeds 
                            ? "font-extrabold text-[#09080f] scale-100 hover:scale-110 active:scale-95" 
                            : "bg-white/2 border border-white/5 text-white/30 hover:bg-white/5"
                        } ${
                          isCurrentSelected 
                            ? "ring-2 ring-white/70 scale-105 z-10" 
                            : ""
                        }`}
                        title={`${dayData.dayNum}: ${dayData.deedsCount} дел`}
                      >
                        {dayData.dayNum}
                        
                        {/* Glow halo overlay for days with deeds */}
                        {dayData.hasDeeds && (
                          <span className="absolute inset-0 rounded-lg opacity-25 animate-pulse-glow" style={dayData.pixelStyle} />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 flex items-center justify-between text-[8px] text-white/30 border-t border-white/5 pt-3">
                  <span>* нажмите на день для просмотра</span>
                  <div className="flex items-center gap-1.5">
                    <span>менее</span>
                    <span className="w-2.5 h-2.5 bg-white/5 border border-white/10 rounded" />
                    <span className="w-2.5 h-2.5 bg-purple-500/50 rounded" />
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded" />
                    <span>более</span>
                  </div>
                </div>
              </div>

              {/* Monthly Stats Counters */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    РЕЗУЛЬТАТЫ ЗА МЕСЯЦ
                  </span>
                  <span className="text-[8px] text-white/20 italic">нажмите на категорию</span>
                </div>
                
                {/* Total achievements card */}
                <div className="p-3.5 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 to-cyan-950/20 flex items-center justify-between neon-glow-combo">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white">Всего побед</span>
                      <span className="text-[9px] text-white/40">акты заботы о себе</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    {statsData.totalCount}
                  </span>
                </div>

                {/* Individual Categories count cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {CATEGORIES.map(cat => {
                    const count = statsData.catCounts[cat.id as keyof typeof statsData.catCounts] || 0;
                    
                    return (
                      <div 
                        key={cat.id} 
                        onClick={() => {
                          if (count > 0) {
                            setSelectedCategoryForStatsList(
                              selectedCategoryForStatsList?.id === cat.id ? null : cat
                            );
                          }
                        }}
                        className={`p-3.5 rounded-xl border border-white/5 bg-white/2 flex flex-col justify-between items-start text-left min-h-[90px] ${
                          count > 0 ? "cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all" : "opacity-60"
                        } ${selectedCategoryForStatsList?.id === cat.id ? "ring-1 ring-white/30 bg-white/5" : ""}`}
                        style={{ borderLeft: `3px solid ${cat.color}` }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-lg" style={{ color: cat.color }}>{cat.icon}</span>
                          <span className="text-[10px] text-white/40 font-semibold">{cat.name.split("/")[0].trim()}</span>
                        </div>
                        <div className="mt-2 w-full flex items-baseline justify-between">
                          <span className="text-xl font-black text-white">{count}</span>
                          <span className="text-[9px] text-white/20 uppercase tracking-widest">раз</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inline Category Deeds List */}
                {selectedCategoryForStatsList && (
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-3 transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5" style={{ color: selectedCategoryForStatsList.color }}>
                        <span>{selectedCategoryForStatsList.icon}</span>
                        <span>{selectedCategoryForStatsList.name} ({statsCategoryDeeds.length})</span>
                      </span>
                      <button 
                        type="button"
                        onClick={() => setSelectedCategoryForStatsList(null)}
                        className="text-[9px] text-white/30 hover:text-white cursor-pointer"
                      >
                        свернуть [x]
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {statsCategoryDeeds.length === 0 ? (
                        <p className="text-xs text-white/40 italic">Нет достижений в этой категории</p>
                      ) : (
                        statsCategoryDeeds.map(deed => (
                          <div 
                            key={deed.id}
                            className="p-3 rounded-lg border border-white/5 bg-[#09080f]/50 flex flex-col gap-1 text-left"
                            style={{ borderLeft: `3px solid ${selectedCategoryForStatsList.color}` }}
                          >
                            <span className="text-[8px] text-white/30 font-bold">
                              {parseLocalDate(deed.date).toLocaleDateString("ru-RU", { 
                                day: "numeric", 
                                month: "short"
                              })}
                            </span>
                            <p className="text-xs text-white leading-relaxed font-mono">
                              {deed.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {/* Encouraging Quote for anti-devaluation */}
                <div className="p-3.5 rounded-xl bg-white/1 border border-white/5 text-center mt-2">
                  <p className="text-[10px] leading-relaxed text-white/50 italic">
                    Каждая цифра выше — это доказательство того, что ты двигаешься вперед. Не обесценивай свой труд. 🖤
                  </p>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* 3. Sticky Glass Input Bar */}
        {activeTab === "tracker" && (
          <div className="relative p-4 bg-[#09080f]/90 backdrop-blur-lg border-t border-white/5 z-40 shrink-0">
            <form onSubmit={handleSubmitDeed} className="flex flex-col gap-3">
              
              {/* Category Quick Selector Buttons */}
              <div className="flex items-center justify-between gap-1 px-1">
                <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Категории:</span>
                <div className="flex gap-2">
                  {CATEGORIES.map(cat => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleFormCategory(cat.id)}
                        style={{ 
                          borderColor: isSelected ? cat.color : "rgba(255, 255, 255, 0.08)",
                          color: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                          backgroundColor: isSelected ? `${cat.color}25` : "transparent"
                        }}
                        className="w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                        title={cat.name}
                      >
                        {cat.icon}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Input Block */}
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border glass bg-[#0c0a15]/60 transition-all ${activeInputGlow}`}>
                <span className="text-purple-400 font-bold shrink-0 text-xs">✦</span>
                <input
                  type="text"
                  value={newDeedText}
                  onChange={(e) => setNewDeedText(e.target.value)}
                  placeholder="Запиши хорошее дело сегодня..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none font-mono"
                  maxLength={160}
                />
                
                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!newDeedText.trim()}
                  className={`p-1.5 rounded-lg transition-all ${
                    newDeedText.trim() 
                      ? "bg-purple-500 text-white hover:bg-purple-600 active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
                      : "text-white/20 bg-white/2 cursor-not-allowed"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

            </form>
          </div>
        )}

        {/* 4. DETAILS DRAWER MODAL */}
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 flex items-end justify-center ${
          activeDeed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}>
          {activeDeed && (
            <div className={`w-full max-w-md p-6 bg-[#0c0a18] border-t border-white/10 rounded-t-3xl shadow-[0_-15px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 transform flex flex-col gap-4 text-left ${
              activeDeed ? "translate-y-0" : "translate-y-full"
            }`}>
              
              {/* Header inside details */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-[10px] text-white/50 tracking-wider font-bold">
                    {parseLocalDate(activeDeed.date).toLocaleDateString("ru-RU", { 
                      day: "numeric", 
                      month: "long", 
                      year: "numeric" 
                    })}
                  </span>
                </div>
                
                {/* Close modal */}
                <button 
                  onClick={() => setActiveDeed(null)}
                  className="p-1 text-white/40 hover:text-white rounded-full hover:bg-white/5 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Deed content text */}
              <div className="py-2">
                <p className="text-sm text-white leading-relaxed font-mono font-medium border-l border-white/10 pl-3">
                  {activeDeed.text}
                </p>
              </div>

              {/* Deed categories list */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Категории:</span>
                <div className="flex flex-wrap gap-2">
                  {activeDeed.category_ids.map(cid => {
                    const cat = CATEGORIES.find(c => c.id === cid);
                    if (!cat) return null;
                    return (
                      <span 
                        key={cid} 
                        style={{ border: `1px solid ${cat.color}40`, background: `${cat.color}15`, color: cat.color }}
                        className="px-2.5 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1.5"
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleDeleteDeed(activeDeed.id)}
                  className="flex-1 py-2 px-3 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 bg-red-950/10 hover:bg-red-950/20 rounded-xl text-[10px] font-bold tracking-widest flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  УДАЛИТЬ ЗАПИСЬ
                </button>
              </div>

            </div>
          )}
        </div>

        {/* 5. SETTINGS / ABOUT MODAL */}
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 flex items-center justify-center p-5 ${
          showSettings ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}>
          <div className={`w-full max-w-sm p-6 bg-[#0c0a18] border border-white/10 rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 transform flex flex-col gap-5 text-left ${
            showSettings ? "scale-100" : "scale-90"
          }`}>
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] tracking-widest text-purple-400 font-bold uppercase">КОНСОЛЬ УПРАВЛЕНИЯ</span>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 text-white/40 hover:text-white rounded-full hover:bg-white/5 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* App philosophy / Dreamcore vibes */}
            <div className="flex flex-col gap-2 p-3 bg-white/2 rounded-xl border border-white/5 text-[10px] leading-relaxed text-white/60">
              <span className="font-bold text-white text-[11px]">✦ Проект AURA ✦</span>
              <p>
                AURA — это минималистичное ментальное зеркало. Оно создано для отслеживания твоих успехов и борьбы с обесцениванием. Каждый маленький шаг — это победа.
              </p>
              <p className="italic text-purple-400/80">
                Создано в стиле Dreamcore / Webpunk с заботой о твоем ментальном балансе.
              </p>
            </div>

            {/* Actions list */}
            <div className="flex flex-col gap-3">
              <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Данные (Local Storage)</span>
              
              <button
                onClick={exportData}
                className="py-2.5 px-4 bg-white/3 hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white flex items-center justify-between active:scale-98 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  Экспорт данных (.json)
                </span>
                <span className="text-[8px] text-white/30">backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-4 bg-white/3 hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white flex items-center justify-between active:scale-98 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  Импорт данных (.json)
                </span>
                <span className="text-[8px] text-white/30">restore</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={importData} 
                accept=".json" 
                className="hidden" 
              />

              <button
                onClick={clearAllData}
                className="py-2.5 px-4 bg-red-950/10 hover:bg-red-950/20 border border-red-500/20 hover:border-red-500/40 rounded-xl text-[10px] font-bold text-red-400 flex items-center justify-between active:scale-98 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" />
                  Очистить все данные
                </span>
                <span className="text-[8px] text-red-400/30">reset</span>
              </button>
            </div>

            <div className="text-[8px] text-white/20 text-center mt-2 pt-2 border-t border-white/5">
              Aura App v1.0.0 • Local Storage Database
            </div>

          </div>
        </div>



      </div>
    </div>
  );
}
