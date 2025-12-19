
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RULES_DATA } from './data/rules';
import { REPORT_TEMPLATES, IMPORTANT_DATES, ADMIN_COMMANDS } from './data/admin_data';
import { ChatMessage } from './types';
import { getGeminiResponse } from './services/geminiService';

const SnowflakeBackground = () => {
  const [flakes, setFlakes] = useState<any[]>([]);
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 12 : 30;
    setFlakes(Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 5 + 5}s`,
      size: `${Math.random() * 0.3 + 0.2}rem`
    })));
  }, []);
  return (
    <div className="snow-container opacity-30">
      {flakes.map(f => (
        <div key={f.id} className="snowflake" style={{ left: f.left, animationDelay: f.delay, animationDuration: f.duration, fontSize: f.size }}>
          <i className="fas fa-snowflake"></i>
        </div>
      ))}
    </div>
  );
};

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [canStart, setCanStart] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startIntro = () => {
    setCanStart(true);
    // Даємо невелику затримку для рендеру елементів
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.error("Audio play failed:", err);
          setLoadError(true);
        });
      }
      if (videoRef.current) {
        videoRef.current.play().catch(err => {
          console.error("Video play failed:", err);
        });
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
      {!canStart ? (
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="w-24 h-24 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 animate-pulse">
            <i className="fas fa-shield-halved text-4xl text-emerald-500"></i>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Авторизація Системи</h2>
          <button 
            onClick={startIntro}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
          >
            УВІЙТИ В ТЕРМІНАЛ
          </button>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center animate-fadeIn">
          {/* Відео заставка */}
          <video 
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            muted
            loop
            playsInline
            onError={() => setLoadError(true)}
          >
            <source src="assets/intro_video.mp4" type="video/mp4" />
          </video>
          
          <div className="relative z-10 text-center px-6">
            <div className="inline-block p-1 rounded-full bg-emerald-500/20 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-2 drop-shadow-2xl">
              ВІТАЄМО, АДМІН
            </h1>
            <p className="text-emerald-400 font-bold tracking-[0.3em] text-xs uppercase animate-pulse">
              Встановлення зв'язку з базою правил...
            </p>
            
            {loadError && (
              <button 
                onClick={onFinish}
                className="mt-12 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase rounded-xl border border-white/10 transition-all"
              >
                Помилка завантаження. Увійти вручну
              </button>
            )}
          </div>

          {/* Аудіо супровід */}
          <audio 
            ref={audioRef}
            src="assets/intro_audio.mp3"
            onError={() => setLoadError(true)}
            onEnded={() => {
              // Плавне зникнення перед завершенням
              const overlay = document.querySelector('.fixed.inset-0.z-\\[200\\]');
              overlay?.classList.add('opacity-0', 'transition-opacity', 'duration-1000');
              setTimeout(onFinish, 1000);
            }}
          />
          
          <button 
            className="absolute bottom-10 opacity-20 hover:opacity-100 transition-opacity text-[10px] text-white font-bold uppercase tracking-widest"
            onClick={onFinish}
          >
            [ Пропустити заставку ]
          </button>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'rules' | 'ai' | 'tools' | 'dates' | 'peace'>('rules');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  
  // Radio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<any>(null);
  const [volume, setVolume] = useState(0.5);
  const [radioError, setRadioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const radioStations = [
    { title: "Radio ROKS 🎸", url: "https://online.radioroks.ua/RadioROKS", genre: "Рок хіти" },
    { title: "Kiss FM 🎧", url: "https://online.kissfm.ua/KissFM", genre: "Танцювальна" },
    { title: "Hit FM 🎤", url: "https://online.hitfm.ua/HitFM", genre: "Популярна" },
    { title: "Radio Relax ☕", url: "https://online.radiorelax.ua/RadioRelax", genre: "Спокійна" },
    { title: "Lounge FM ✨", url: "https://cast.loungefm.com.ua/loungefm", genre: "Лаунж" },
    { title: "Радіо НВ 🎙️", url: "https://online.radio-nv.com.ua/RadioNV", genre: "Новини / Розмови" },
    { title: "Армія FM 🎖️", url: "https://online.armyfm.com.ua/ArmyFM", genre: "Військове радіо" },
    { title: "Lux FM 💃", url: "https://onlineradio.lux.fm/luxfm", genre: "Хіти та гумор" }
  ];

  const [customDates, setCustomDates] = useState<any[]>(() => {
    const saved = localStorage.getItem('admin_custom_dates');
    return saved ? JSON.parse(saved) : IMPORTANT_DATES;
  });
  const [newDate, setNewDate] = useState({ date: '', event: '', type: 'work' });
  const [notes, setNotes] = useState(() => localStorage.getItem('admin_notes') || '');

  const [dutyState, setDutyState] = useState(() => {
    const saved = localStorage.getItem('duty_state_v5');
    return saved ? JSON.parse(saved) : { isActive: false, startTime: 0, accumulatedSeconds: 0 };
  });
  const [displayTime, setDisplayTime] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredRules = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return [];
    return RULES_DATA.filter(rule => 
      rule.title.toLowerCase().includes(lowerSearch) ||
      rule.description.toLowerCase().includes(lowerSearch) ||
      rule.id.toLowerCase().includes(lowerSearch) ||
      rule.abbreviations.some(abbr => abbr.toLowerCase().includes(lowerSearch))
    );
  }, [searchTerm]);

  useEffect(() => {
    const hasVisited = localStorage.getItem('ua_admin_v5_splash_done');
    if (!hasVisited) setShowSplash(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('duty_state_v5', JSON.stringify(dutyState));
    if (dutyState.isActive) {
      const elapsed = Math.floor((Date.now() - dutyState.startTime) / 1000);
      setDisplayTime(dutyState.accumulatedSeconds + elapsed);
    } else {
      setDisplayTime(dutyState.accumulatedSeconds);
    }
    let interval: any;
    if (dutyState.isActive) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - dutyState.startTime) / 1000);
        setDisplayTime(dutyState.accumulatedSeconds + elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [dutyState]);

  useEffect(() => {
    localStorage.setItem('admin_notes', notes);
    localStorage.setItem('admin_custom_dates', JSON.stringify(customDates));
  }, [notes, customDates]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const addDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate.date || !newDate.event) return;
    setCustomDates(prev => [...prev, newDate]);
    setNewDate({ date: '', event: '', type: 'work' });
  };

  const deleteDate = (index: number) => {
    setCustomDates(prev => prev.filter((_, i) => i !== index));
  };

  const toggleDuty = () => {
    if (!dutyState.isActive) {
      setDutyState({ isActive: true, startTime: Date.now(), accumulatedSeconds: dutyState.accumulatedSeconds });
    } else {
      const elapsed = Math.floor((Date.now() - dutyState.startTime) / 1000);
      setDutyState({ isActive: false, startTime: 0, accumulatedSeconds: dutyState.accumulatedSeconds + elapsed });
    }
  };

  const resetDuty = () => {
    if (window.confirm('Ви впевнені, що хочете скинути час чергування?')) {
      setDutyState({ isActive: false, startTime: 0, accumulatedSeconds: 0 });
      setDisplayTime(0);
    }
  };

  const playStation = (station: any) => {
    setRadioError(null);
    if (currentStation?.url === station.url) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(() => setRadioError("Помилка відтворення"));
        setIsPlaying(true);
      }
    } else {
      setCurrentStation(station);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = station.url;
        audioRef.current.load();
        audioRef.current.play().catch((e) => {
          console.error("Radio play error:", e);
          setRadioError("Станція тимчасово недоступна");
          setIsPlaying(false);
        });
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const years = Math.floor(totalSeconds / 31536000);
    const months = Math.floor((totalSeconds % 31536000) / 2592000);
    const days = Math.floor((totalSeconds % 2592000) / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const parts = [];
    if (years > 0) parts.push(`${years}р.`);
    if (months > 0) parts.push(`${months}міс.`);
    if (days > 0) parts.push(`${days}дн.`);
    return parts.length > 0 ? `${parts.join(' ')} ${timeStr}` : timeStr;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: inputMessage, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAiLoading(true);
    const response = await getGeminiResponse(inputMessage);
    setChatMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: Date.now() }]);
    setIsAiLoading(false);
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col transition-all duration-500 mx-auto px-4 pt-4 pb-24 max-w-lg md:max-w-5xl md:py-8">
      <SnowflakeBackground />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} onError={() => setRadioError("Помилка завантаження потоку")} />
      
      {showSplash && (
        <SplashScreen onFinish={() => {
          localStorage.setItem('ua_admin_v5_splash_done', 'true');
          setShowSplash(false);
        }} />
      )}

      <header className="flex flex-col items-center mb-6 space-y-4 no-select">
        <div className="w-full flex justify-center mb-2">
          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border transition-all cursor-pointer shadow-lg active:scale-95 ${dutyState.isActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`} onClick={toggleDuty} onDoubleClick={resetDuty}>
            <div className={`w-2.5 h-2.5 rounded-full ${dutyState.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${dutyState.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
              {dutyState.isActive ? 'В роботі: ' : 'Відпочинок: '} {formatTime(displayTime)}
            </span>
          </div>
        </div>

        <div className="relative">
           <img src="assets/logo.png" alt="Logo" className="w-32 h-32 md:w-40 md:h-40 transition-all duration-500 object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]" onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; }} />
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-yellow-400 uppercase">
            UA Online Admin Suite
          </h1>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">
            Author: <span className="text-emerald-400">Artem_Furrry</span>
          </p>
        </div>
      </header>

      <nav className="fixed left-4 right-4 z-[60] bottom-4 md:relative md:bottom-auto md:mb-8">
        <div className="glass-card p-1 rounded-2xl md:rounded-3xl flex justify-between gap-1 shadow-2xl border-white/10">
          <button onClick={() => setActiveTab('rules')} className={`flex-1 py-3.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 ${activeTab === 'rules' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
            <i className="fas fa-book-open"></i><span>Правила</span>
          </button>
          <button onClick={() => setActiveTab('ai')} className={`flex-1 py-3.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 ${activeTab === 'ai' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
            <i className="fas fa-robot"></i><span>Чат</span>
          </button>
          <button onClick={() => setActiveTab('tools')} className={`flex-1 py-3.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 ${activeTab === 'tools' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
            <i className="fas fa-hammer"></i><span>Панель</span>
          </button>
          <button onClick={() => setActiveTab('dates')} className={`flex-1 py-3.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 ${activeTab === 'dates' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
            <i className="fas fa-calendar"></i><span>Дати</span>
          </button>
          <button onClick={() => setActiveTab('peace')} className={`flex-1 py-3.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 ${activeTab === 'peace' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
            <i className="fas fa-couch"></i><span>Спокій</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow pb-12 overflow-y-auto no-select">
        {activeTab === 'peace' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 text-center">
              <h3 className="text-sm font-black mb-6 uppercase text-indigo-400 tracking-widest">UA Радіо Вузлик</h3>
              
              {currentStation && (
                <div className="mb-8 p-6 bg-slate-900/50 rounded-3xl border border-white/5 animate-pulse-slow">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl text-white">
                      <i className={`fas ${isPlaying ? 'fa-compact-disc fa-spin' : 'fa-volume-mute'}`}></i>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-indigo-400 uppercase">Зараз грає:</p>
                      <h4 className="text-base font-black text-white truncate max-w-[180px]">{currentStation.title}</h4>
                      <p className="text-[9px] text-slate-500 uppercase">{currentStation.genre}</p>
                    </div>
                  </div>
                  
                  {radioError && (
                    <div className="mb-4 text-[10px] text-red-400 font-bold bg-red-500/10 py-2 rounded-xl border border-red-500/20">
                      <i className="fas fa-circle-exclamation mr-1"></i> {radioError}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 px-4">
                    <i className="fas fa-volume-low text-slate-600 text-[10px]"></i>
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-grow accent-indigo-500 h-1 rounded-full cursor-pointer" />
                    <i className="fas fa-volume-high text-slate-600 text-[10px]"></i>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {radioStations.map((station) => (
                  <button key={station.url} onClick={() => playStation(station)} className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${currentStation?.url === station.url ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div>
                      <h5 className={`font-black text-xs ${currentStation?.url === station.url ? 'text-white' : 'text-slate-300'}`}>{station.title}</h5>
                      <p className="text-[9px] text-slate-500 uppercase mt-0.5">{station.genre}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentStation?.url === station.url && isPlaying ? 'bg-white text-indigo-600 scale-110' : 'bg-white/5 text-slate-500 group-hover:scale-110'}`}>
                      <i className={`fas ${currentStation?.url === station.url && isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase mb-4 tracking-widest">Музичні Новинки 🇺🇦</h4>
                <div className="space-y-2">
                  <button onClick={() => playStation({title: "Нова Музика 🚀", url: "https://online.hitfm.ua/HitFM_Best", genre: "Тільки свіжі треки"})} className="w-full p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-slate-400 hover:bg-white/10 transition-all flex items-center gap-3">
                    <i className="fas fa-bolt text-yellow-400"></i> Гарячі новинки тижня
                  </button>
                  <button onClick={() => playStation({title: "UA Rap & Pop 🎤", url: "https://online.kissfm.ua/KissFM_Ukr", genre: "Український потік"})} className="w-full p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-slate-400 hover:bg-white/10 transition-all flex items-center gap-3">
                    <i className="fas fa-microphone-lines text-indigo-400"></i> Сучасний UA потік
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4 animate-fadeIn">
            <input type="text" placeholder="Введіть DM, DB або назву правила..." className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 px-6 focus:outline-none focus:border-emerald-500 transition-all text-sm glass-card text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            
            <div className="flex flex-wrap gap-2">
              {['DM', 'DB', 'SK', 'TK', 'PG', 'MG', 'NRD'].map(tag => (
                <button key={tag} onClick={() => setSearchTerm(tag)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${searchTerm === tag ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>{tag}</button>
              ))}
            </div>

            <div className="space-y-3">
              {searchTerm === '' ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-20 text-center">
                  <i className="fas fa-magnifying-glass text-4xl mb-4"></i>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Почніть писати для пошуку правил</p>
                </div>
              ) : filteredRules.length > 0 ? (
                filteredRules.map(rule => (
                  <div key={rule.id} className="glass-card p-5 rounded-3xl border-l-4 border-l-emerald-500 shadow-md relative group hover:translate-x-1 transition-transform">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded">#{rule.id}</span>
                      <button onClick={() => { navigator.clipboard.writeText(`Пункт ${rule.id}. ${rule.title} - ${rule.punishment}`); }} className="text-slate-600 hover:text-white transition-colors">
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                    <h3 className="text-base font-black text-white">{rule.title}</h3>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{rule.description}</p>
                    <div className="mt-3 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
                      <span className="text-red-400 font-black text-[10px] uppercase">Покарання: {rule.punishment}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-600 text-xs py-10 italic">Нічого не знайдено за вашим запитом...</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="flex flex-col h-[65vh] glass-card rounded-[2.5rem] overflow-hidden animate-fadeIn">
            <div className="bg-slate-900/50 p-4 border-b border-white/5 flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black uppercase text-slate-400">ШІ-Помічник</span></div></div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && <div className="h-full flex flex-col items-center justify-center text-center opacity-10"><i className="fas fa-microchip text-4xl mb-3"></i><p className="text-[10px] font-bold uppercase tracking-widest">Готовий до запитів</p></div>}
              {chatMessages.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-4 rounded-2xl text-[11px] shadow-lg ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>{msg.content}</div></div>))}
              {isAiLoading && <div className="flex gap-1.5 p-3 opacity-50"><span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150"></span></div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-black/40 flex gap-2"><input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Ваше запитання..." className="flex-grow bg-slate-800 rounded-2xl px-5 py-3.5 text-xs outline-none text-white" /><button type="submit" disabled={!inputMessage.trim() || isAiLoading} className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white"><i className="fas fa-paper-plane"></i></button></form>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card p-6 rounded-[2rem] space-y-4 border-t-4 border-t-purple-600"><h3 className="font-black text-xs uppercase text-purple-400">Швидкі Команди</h3><div className="grid grid-cols-2 gap-3">{ADMIN_COMMANDS.map(c => (<button key={c.cmd} onClick={() => { const id = prompt('ID гравця:'); if(id) { const reason = prompt('Причина:'); navigator.clipboard.writeText(`${c.cmd} ${id} ${reason}`); alert('Скопійовано!'); } }} className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 hover:bg-white/10 transition-all"><span className="block font-black text-sm text-white">{c.label}</span><span className="text-[10px] text-slate-500">{c.cmd}</span></button>))}</div></div>
            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-amber-500"><h3 className="font-black text-xs uppercase text-amber-400 mb-3">Нотатки</h3><textarea className="w-full h-48 bg-slate-900/50 rounded-2xl p-4 text-xs outline-none border border-white/5 resize-none text-white" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ваші записи..." /></div>
            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-rose-600"><h3 className="font-black text-xs uppercase text-rose-400 mb-3">Шаблони</h3><div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">{REPORT_TEMPLATES.map((t, i) => (<button key={i} onClick={() => { navigator.clipboard.writeText(t); }} className="w-full text-left p-3.5 rounded-xl bg-white/5 text-[11px] border border-white/5 hover:bg-white/10 text-white">{t}</button>))}</div></div>
          </div>
        )}

        {activeTab === 'dates' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="glass-card p-6 rounded-[2.5rem] border border-white/5"><h3 className="text-sm font-black mb-6 uppercase text-center text-amber-400">Календар</h3>
              <form onSubmit={addDate} className="space-y-3 mb-8 bg-black/20 p-5 rounded-3xl"><div className="grid grid-cols-2 gap-2"><input type="text" placeholder="Дата" className="bg-slate-900 border border-white/5 rounded-xl p-3.5 text-xs outline-none text-white" value={newDate.date} onChange={e => setNewDate({...newDate, date: e.target.value})} /><select className="bg-slate-900 border border-white/5 rounded-xl p-3.5 text-xs outline-none text-slate-400" value={newDate.type} onChange={e => setNewDate({...newDate, type: e.target.value})}><option value="work">Робота</option><option value="meeting">Збори</option><option value="deadline">Дедлайн</option></select></div><input type="text" placeholder="Опис" className="w-full bg-slate-900 border border-white/5 rounded-xl p-3.5 text-xs outline-none text-white" value={newDate.event} onChange={e => setNewDate({...newDate, event: e.target.value})} /><button type="submit" className="w-full py-4 bg-amber-600 rounded-xl text-white text-xs font-black uppercase shadow-lg shadow-amber-600/20 active:scale-95 transition-all">Додати</button></form>
              <div className="space-y-2.5">{customDates.map((d, i) => (<div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group transition-all hover:bg-white/10"><div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${d.type === 'meeting' ? 'bg-blue-600/20 text-blue-400' : d.type === 'deadline' ? 'bg-red-600/20 text-red-400' : 'bg-slate-700/20 text-slate-400'}`}><i className={`fas ${d.type === 'meeting' ? 'fa-users' : d.type === 'deadline' ? 'fa-clock' : 'fa-briefcase'}`}></i></div><div className="flex-grow"><h4 className="font-black text-xs text-white">{d.event}</h4><p className="text-[9px] text-slate-500 uppercase">{d.date}</p></div><button onClick={() => deleteDate(i)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500/40"><i className="fas fa-trash-can"></i></button></div>))}</div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto text-center opacity-10 no-select py-8 border-t border-white/5"><p className="text-[8px] font-black uppercase tracking-[0.5em]">UA ONLINE ADMIN SUITE V5.6 STABLE</p></footer>
    </div>
  );
};

export default App;
