import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- MOCK DATA (Щоб код працював без зовнішніх файлів) ---
const RULES_DATA = [
  { id: '1.1', title: 'DM (Death Match)', description: 'Вбивство без причини.', punishment: 'Деморган 60 хв', abbreviations: ['DM'] },
  { id: '1.2', title: 'DB (Drive By)', description: 'Вбивство машиною.', punishment: 'Деморган 30 хв', abbreviations: ['DB'] },
  { id: '1.3', title: 'TK (Team Kill)', description: 'Вбивство своїх.', punishment: 'Варн', abbreviations: ['TK'] },
];

const ADMIN_COMMANDS = [
  { label: 'Телепорт', cmd: '/tp' },
  { label: 'Вилікувати', cmd: '/heal' },
  { label: 'Видати зброю', cmd: '/givegun' },
  { label: 'Інвіз', cmd: '/vanish' },
];

const REPORT_TEMPLATES = [
  'Вітаю. Працюю по вашій скарзі.',
  'Порушень не виявлено. Приємної гри.',
  'Гравець буде покараний згідно п. 1.1.',
];

const IMPORTANT_DATES = [
  { date: '31.12', event: 'Новий Рік', type: 'meeting' },
];

// Імітація сервісу AI
const getGeminiResponse = async (msg: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(`Це тестова відповідь AI на: "${msg}". (Підключи реальний API)`);
    }, 1500);
  });
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// --- КОМПОНЕНТИ ---

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
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30 overflow-hidden">
      {flakes.map(f => (
        <div key={f.id} className="absolute top-[-10px] text-white animate-[fall_linear_infinite]" 
             style={{ left: f.left, animationDelay: f.delay, animationDuration: f.duration, fontSize: f.size }}>
          <i className="fas fa-snowflake"></i> ❄
        </div>
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(105vh) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [canStart, setCanStart] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ПОСИЛАННЯ (Заміни на свої, якщо треба)
  const VIDEO_SRC = "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-circuit-board-98-large.mp4"; 
  const AUDIO_SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Тестове аудіо

  const startIntro = () => {
    setCanStart(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(err => console.error("Video failed:", err));
      }
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.error("Audio failed:", err);
          // Якщо аудіо не пішло - пускаємо далі через 3 сек
          setTimeout(onFinish, 3000);
        });
      } else {
         setTimeout(onFinish, 3000);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden font-sans">
      {!canStart ? (
        <div className="text-center space-y-6 animate-fadeIn p-6">
          <div className="w-24 h-24 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 animate-pulse">
            <i className="fas fa-shield-halved text-4xl text-emerald-500">🛡️</i>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Авторизація Системи</h2>
          <button 
            onClick={startIntro}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-600/20 cursor-pointer"
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
            muted // Важливо для автоплею відео фону
            loop
            playsInline
            src={VIDEO_SRC}
          />
          
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
          </div>

          {/* Аудіо супровід */}
          <audio 
            ref={audioRef}
            src={AUDIO_SRC}
            onEnded={() => {
              // Коли звук закінчиться - переходимо
              onFinish();
            }}
            onError={() => {
                // Якщо помилка аудіо - пропускаємо
                console.log("Audio error, skipping");
                onFinish();
            }}
          />
          
          <button 
            className="absolute bottom-10 opacity-50 hover:opacity-100 transition-opacity text-[10px] text-white font-bold uppercase tracking-widest z-20 cursor-pointer"
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
  
  // Змінив логіку: за замовчуванням показуємо сплеш (true), щоб ти побачив ефект
  const [showSplash, setShowSplash] = useState(true);
  
  // Radio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<any>(null);
  const [volume, setVolume] = useState(0.5);
  const [radioError, setRadioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const radioStations = [
    { title: "Hit FM", url: "https://online.hitfm.ua/HitFM", genre: "Популярна" },
    { title: "Radio ROKS", url: "https://online.radioroks.ua/RadioROKS", genre: "Рок" },
    { title: "Kiss FM", url: "https://online.kissfm.ua/KissFM", genre: "Dance" },
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

  // Логіка перевірки відвідування (розкоментуй для продакшену)
  /*
  useEffect(() => {
    const hasVisited = localStorage.getItem('ua_admin_v5_splash_done');
    if (!hasVisited) setShowSplash(true);
  }, []);
  */

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
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    <div className="relative z-10 min-h-screen flex flex-col bg-[#020617] text-white font-sans transition-all duration-500 mx-auto px-4 pt-4 pb-24 max-w-lg md:max-w-5xl md:py-8 overflow-x-hidden">
      <SnowflakeBackground />
      {/* Приховане аудіо для радіо */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} onError={() => setRadioError("Помилка завантаження потоку")} />
      
      {showSplash && (
        <SplashScreen onFinish={() => {
          localStorage.setItem('ua_admin_v5_splash_done', 'true');
          setShowSplash(false);
        }} />
      )}

      <header className="flex flex-col items-center mb-6 space-y-4 select-none">
        <div className="w-full flex justify-center mb-2">
          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border transition-all cursor-pointer shadow-lg active:scale-95 ${dutyState.isActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`} onClick={toggleDuty} onDoubleClick={resetDuty}>
            <div className={`w-2.5 h-2.5 rounded-full ${dutyState.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${dutyState.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
              {dutyState.isActive ? 'В роботі: ' : 'Відпочинок: '} {formatTime(displayTime)}
            </span>
          </div>
        </div>

        <div className="relative">
            {/* Логотип за замовчуванням якщо картинки немає */}
           <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
               <i className="fas fa-user-secret text-6xl text-emerald-500"></i>
           </div>
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
        <div className="backdrop-blur-xl bg-slate-900/80 p-1 rounded-2xl md:rounded-3xl flex justify-between gap-1 shadow-2xl border border-white/10">
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

      <main className="flex-grow pb-12 overflow-y-auto select-none">
        {/* Вміст вкладок */}
        {activeTab === 'peace' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="backdrop-blur-md bg-white/5 p-6 rounded-[2.5rem] border border-white/5 text-center">
              <h3 className="text-sm font-black mb-6 uppercase text-indigo-400 tracking-widest">UA Радіо Вузлик</h3>
              
              {currentStation && (
                <div className="mb-8 p-6 bg-slate-900/50 rounded-3xl border border-white/5 animate-pulse">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl text-white">
                      <i className={`fas ${isPlaying ? 'fa-compact-disc fa-spin' : 'fa-volume-mute'}`}>💿</i>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-indigo-400 uppercase">Зараз грає:</p>
                      <h4 className="text-base font-black text-white truncate max-w-[180px]">{currentStation.title}</h4>
                      <p className="text-[9px] text-slate-500 uppercase">{currentStation.genre}</p>
                    </div>
                  </div>
                  
                  {radioError && (
                    <div className="mb-4 text-[10px] text-red-400 font-bold bg-red-500/10 py-2 rounded-xl border border-red-500/20">
                       ⚠️ {radioError}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 px-4">
                    <span className="text-xs">🔈</span>
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-grow accent-indigo-500 h-1 rounded-full cursor-pointer" />
                    <span className="text-xs">🔊</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {radioStations.map((station) => (
                  <button key={station.url} onClick={() => playStation(station)} className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${currentStation?.url === station.url ? 'bg-indigo-600/20 border-indigo-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <div>
                      <h5 className={`font-black text-xs ${currentStation?.url === station.url ? 'text-white' : 'text-slate-300'}`}>{station.title}</h5>
                      <p className="text-[9px] text-slate-500 uppercase mt-0.5">{station.genre}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentStation?.url === station.url && isPlaying ? 'bg-white text-indigo-600' : 'bg-white/5 text-slate-500'}`}>
                       {currentStation?.url === station.url && isPlaying ? '⏸️' : '▶️'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4 animate-fadeIn">
            <input type="text" placeholder="Пошук (DM, DB...)" className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 px-6 focus:outline-none focus:border-emerald-500 transition-all text-sm text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            
            <div className="flex flex-wrap gap-2">
              {['DM', 'DB', 'TK'].map(tag => (
                <button key={tag} onClick={() => setSearchTerm(tag)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${searchTerm === tag ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}>{tag}</button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredRules.length > 0 ? (
                filteredRules.map(rule => (
                  <div key={rule.id} className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border-l-4 border-l-emerald-500 relative hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded">#{rule.id}</span>
                      <button onClick={() => { navigator.clipboard.writeText(`Пункт ${rule.id}. ${rule.title}`); }} className="text-slate-600 hover:text-white transition-colors">
                        📋
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
                <p className="text-center text-slate-600 text-xs py-10">Введіть запит для пошуку...</p>
              )}
            </div>
          </div>
        )}

        {/* Інші вкладки (спрощено) */}
        {activeTab === 'ai' && (
             <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 h-[60vh] flex flex-col justify-between">
                 <div className="overflow-y-auto mb-4 space-y-2">
                     {chatMessages.map((m, i) => (
                         <div key={i} className={`p-3 rounded-xl text-xs max-w-[80%] ${m.role === 'user' ? 'bg-emerald-600 ml-auto text-white' : 'bg-slate-700 mr-auto text-slate-200'}`}>
                             {m.content}
                         </div>
                     ))}
                     {isAiLoading && <div className="text-xs text-slate-500 animate-pulse">Друкую...</div>}
                 </div>
                 <form onSubmit={handleSendMessage} className="flex gap-2">
                     <input className="flex-grow bg-black/30 rounded-xl px-4 py-3 text-xs text-white outline-none" value={inputMessage} onChange={e=>setInputMessage(e.target.value)} placeholder="Повідомлення..." />
                     <button type="submit" className="bg-emerald-600 px-4 rounded-xl text-white">➤</button>
                 </form>
             </div>
        )}
        
        {activeTab === 'tools' && (
             <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6">
                 <h3 className="text-white font-bold mb-4">Швидкі команди</h3>
                 <div className="grid grid-cols-2 gap-2">
                     {ADMIN_COMMANDS.map(c => (
                         <button key={c.cmd} onClick={() => navigator.clipboard.writeText(c.cmd)} className="bg-slate-800 p-3 rounded-xl text-xs text-slate-300 hover:bg-slate-700">{c.label} ({c.cmd})</button>
                     ))}
                 </div>
             </div>
        )}
        
        {activeTab === 'dates' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6">
                <h3 className="text-amber-400 font-bold mb-4 uppercase text-xs tracking-widest">Важливі дати</h3>
                <div className="space-y-2">
                    {customDates.map((d, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                            <div>
                                <div className="text-white text-xs font-bold">{d.event}</div>
                                <div className="text-slate-500 text-[10px]">{d.date}</div>
                            </div>
                            <button onClick={() => deleteDate(i)} className="text-red-500">🗑️</button>
                        </div>
                    ))}
                </div>
                {/* Форма додавання спрощена для прикладу */}
                 <form onSubmit={addDate} className="mt-4 flex gap-2">
                     <input placeholder="31.12" value={newDate.date} onChange={e=>setNewDate({...newDate, date: e.target.value})} className="w-16 bg-black/30 rounded-lg px-2 text-xs text-white" />
                     <input placeholder="Подія" value={newDate.event} onChange={e=>setNewDate({...newDate, event: e.target.value})} className="flex-grow bg-black/30 rounded-lg px-2 text-xs text-white" />
                     <button type="submit" className="bg-amber-600 text-white px-3 rounded-lg">+</button>
                 </form>
            </div>
        )}

      </main>

      <footer className="mt-auto text-center opacity-10 select-none py-8 border-t border-white/5">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">UA ONLINE ADMIN SUITE V5.6 STABLE</p>
      </footer>
    </div>
  );
};

// Рендер додатку
const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
