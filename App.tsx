
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RULES_DATA } from './data/rules';
import { Rule, ChatMessage } from './types';
import { getGeminiResponse } from './services/geminiService';

const SnowflakeBackground = () => {
  const [snowflakes, setSnowflakes] = useState<{ id: number; left: string; delay: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    const flakes = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 5 + 5}s`,
      size: `${Math.random() * 0.5 + 0.5}rem`
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snow-container">
      {snowflakes.map(f => (
        <div 
          key={f.id} 
          className="snowflake" 
          style={{ 
            left: f.left, 
            animationDelay: f.delay, 
            animationDuration: f.duration,
            fontSize: f.size,
            opacity: Math.random()
          }}
        >
          <i className="fas fa-snowflake"></i>
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'ai'>('search');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // Модальне вікно та підказки
  const [showWelcome, setShowWelcome] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('ua_admin_helper_v2');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const finishWelcome = () => {
    localStorage.setItem('ua_admin_helper_v2', 'true');
    setShowWelcome(false);
    // Автоматична спроба увімкнути музику після взаємодії
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
      audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    }
  };

  const filteredRules = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];
    return RULES_DATA.filter(rule => 
      rule.title.toLowerCase().includes(term) ||
      rule.id.includes(term) ||
      rule.abbreviations.some(abbr => abbr.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Music error:", e));
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: inputMessage, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAiLoading(true);

    const response = await getGeminiResponse(inputMessage);
    const aiMsg: ChatMessage = { role: 'assistant', content: response, timestamp: Date.now() };
    setChatMessages(prev => [...prev, aiMsg]);
    setIsAiLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const quickChips = ['DM', 'DB', 'SK', 'TK', 'RK', 'PG', 'MG', 'CAPS', 'Flood', 'Оск', 'Чити', 'Багоюз', 'NRD', 'Зловживання'];

  const guideSteps = [
    {
      title: "Важливе повідомлення!",
      text: "Цей сайт створено для полегшення роботи адміністрації. Творець сайту не несе відповідальності у разі не вірної інформації. Правила можуть змінюватись в любий момент, тому завжди слідкуйте за офіційними джерелами!",
      icon: "fa-triangle-exclamation",
      color: "text-red-500"
    },
    {
      title: "Тільки для Адміністрації",
      text: "Цей хелпер призначений виключно для рук адміністрації! Його СУВОРО ЗАБОРОНЕНО передавати стороннім особам, гравцям тощо. Це зроблено в цілях безпеки, щоб гравці не використовували сайт на обдзвонах чи іспитах.",
      icon: "fa-user-shield",
      color: "text-blue-500"
    },
    {
      title: "Швидкий пошук",
      text: "Під рядком пошуку ми додали кнопки швидкого доступу (DM, DB, SK...). Просто натисніть на потрібну абревіатуру, щоб миттєво побачити покарання.",
      icon: "fa-bolt",
      color: "text-yellow-500"
    },
    {
      title: "ШІ-Ельф Помічник",
      text: "Вкладка 'ШІ-Ельф' дозволяє спілкуватися з нейромережею, яка знає всі правила. Ви можете запитувати складні ситуації простою мовою.",
      icon: "fa-hat-wizard",
      color: "text-emerald-500"
    }
  ];

  return (
    <div className="relative z-10 min-h-screen flex flex-col max-w-5xl mx-auto px-4 py-8 overflow-x-hidden">
      <SnowflakeBackground />
      
      {/* Welcome & Guide Modal with 3D effect */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="glass-card max-w-lg w-full p-8 rounded-[2rem] border-2 border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)] text-center space-y-8 transform transition-all entrance-3d">
            <div className={`w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-5xl shadow-inner ${guideSteps[guideStep].color}`}>
              <i className={`fas ${guideSteps[guideStep].icon} animate-pulse`}></i>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white tracking-tight">{guideSteps[guideStep].title}</h2>
              <div className="h-32 flex items-center justify-center">
                <p className="text-slate-300 text-base leading-relaxed">
                  {guideSteps[guideStep].text}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-center py-2">
              {guideSteps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === guideStep ? 'w-10 bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'w-2 bg-slate-700'}`}></div>
              ))}
            </div>

            <div className="flex gap-4">
              {guideStep > 0 && (
                <button 
                  onClick={() => setGuideStep(s => s - 1)}
                  className="flex-1 py-4 px-6 rounded-2xl border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold"
                >
                  Назад
                </button>
              )}
              <button 
                onClick={() => guideStep < guideSteps.length - 1 ? setGuideStep(s => s + 1) : finishWelcome()}
                className="flex-[2] py-4 px-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                {guideStep < guideSteps.length - 1 ? "Продовжити" : "Зрозумів, увійти"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Audio Logic */}
      <audio 
        ref={audioRef} 
        loop 
        src="./assets/background.mp3" 
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
      />

      {/* Header */}
      <header className="entrance-3d flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
             <i className="fas fa-snowflake text-blue-400 text-2xl animate-spin-slow"></i>
             <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-white to-red-400 tracking-tighter">
              UA ONLINE ADMIN
            </h1>
          </div>
          <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-2">
            Творець: <span className="text-emerald-400 font-bold">Artem_Furrry</span>
            <span className="h-1 w-1 bg-slate-600 rounded-full"></span>
            <span className="new-year-font text-blue-300">New Year Helper 2025</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl glass-card gold-glow border border-white/5">
              <button onClick={() => setActiveTab('search')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'search' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <i className="fas fa-book-open mr-2"></i> Правила
              </button>
              <button onClick={() => setActiveTab('ai')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'ai' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <i className="fas fa-hat-wizard mr-2"></i> ШІ-Ельф
              </button>
            </div>
            
            <button 
              onClick={toggleMusic}
              className={`text-xs flex items-center justify-center gap-2 py-2 px-4 rounded-full border transition-all hover:scale-105 active:scale-95 ${isMusicPlaying ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-500'}`}
            >
              <i className={`fas ${isMusicPlaying ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
              {isMusicPlaying ? 'Музика: Грає' : 'Музика: Вимкнена'}
            </button>
        </div>
      </header>

      {/* Main content */}
      <main className="entrance-3d flex-grow flex flex-col gap-8" style={{ animationDelay: '0.2s' }}>
        
        {activeTab === 'search' ? (
          <div className="space-y-8">
             <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/30 to-blue-600/30 rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-500"></div>
              <input 
                type="text" 
                placeholder="Швидкий пошук (напр. DM, СК, Поля...)"
                className="relative w-full bg-slate-900/80 border border-white/10 rounded-2xl py-6 px-8 focus:outline-none focus:border-emerald-500/50 transition-all text-xl glass-card placeholder:text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4 text-emerald-500/50">
                <kbd className="hidden md:inline-block px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono">SHIFT</kbd>
                <i className="fas fa-magnifying-glass text-xl"></i>
              </div>
            </div>

            {/* QUICK SEARCH PANEL */}
            <div className="glass-card p-6 rounded-[2rem] border border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-emerald-400 text-xs font-black uppercase tracking-widest px-2">
                <i className="fas fa-bolt"></i>
                <span>Швидкі теги</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {quickChips.map(chip => (
                  <button 
                    key={chip}
                    onClick={() => setSearchTerm(chip)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      searchTerm.toLowerCase() === chip.toLowerCase() 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.4)]' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-emerald-500/30 hover:text-emerald-400 hover:translate-y-[-2px]'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                  >
                    <i className="fas fa-xmark mr-2"></i> Очистити
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {searchTerm === '' ? (
                 <div className="col-span-full py-32 text-center glass-card rounded-[3rem] border-dashed border-2 border-white/5">
                    <div className="relative inline-block mb-8">
                       <i className="fas fa-gift text-7xl text-white/5"></i>
                       <i className="fas fa-search absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500/40 text-2xl"></i>
                    </div>
                    <p className="text-slate-500 font-medium text-lg">Виберіть швидкий тег зверху або введіть назву порушення</p>
                 </div>
              ) : filteredRules.length > 0 ? (
                filteredRules.map(rule => (
                  <div key={rule.id} className="glass-card p-8 rounded-[2rem] border-t-2 border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02] group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[11px] font-black tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full uppercase">Пункт {rule.id}</span>
                      <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{rule.category}</span>
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-white group-hover:text-emerald-400 transition-colors">{rule.title}</h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{rule.description}</p>
                    <div className="bg-gradient-to-br from-red-600/10 to-red-900/20 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 mt-auto">
                      <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center text-red-500">
                        <i className="fas fa-gavel"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-red-500/60 font-black uppercase">Покарання</span>
                        <span className="text-red-400 font-black text-base">{rule.punishment}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-slate-500 glass-card rounded-[2rem] border border-white/5">
                  <i className="fas fa-circle-question mb-4 block text-4xl text-slate-700"></i>
                  <p>Порушення не знайдено. Спробуйте інше слово або запитайте у ШІ-Ельфа.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[70vh] glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative">
             <div className="bg-gradient-to-r from-red-900/40 via-slate-900 to-emerald-900/40 p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-red-600/30 transform rotate-3">
                    <i className="fas fa-candy-cane"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight">Адмін-Ельф ШІ</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Онлайн &bull; Знає всі правила</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-slate-500">
                  <i className="fas fa-tree text-emerald-600/50 text-2xl"></i>
                </div>
             </div>

             <div className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl text-slate-700 border border-white/5">
                      <i className="fas fa-comments"></i>
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-400 font-bold">Очікую на ваше запитання...</p>
                      <p className="text-xs text-slate-600 max-w-xs mx-auto">Я можу пояснити будь-яке правило, розрахувати термін покарання або допомогти з РП ситуацією.</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}>
                      <div className={`max-w-[85%] p-5 rounded-3xl shadow-xl ${
                        msg.role === 'user' 
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 p-5 rounded-3xl rounded-tl-none border border-white/5">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
             </div>

             <form onSubmit={handleSendMessage} className="p-6 bg-black/40 border-t border-white/5 flex gap-3">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Запитати у ельфа..."
                  className="flex-grow bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-red-500/50 transition-all text-sm placeholder:text-slate-600"
                />
                <button 
                  type="submit"
                  disabled={!inputMessage.trim() || isAiLoading}
                  className="w-14 h-14 bg-red-600 hover:bg-red-500 disabled:opacity-20 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90"
                >
                  <i className="fas fa-paper-plane text-xl"></i>
                </button>
             </form>
          </div>
        )}
      </main>

      <footer className="mt-16 py-10 border-t border-white/5 text-center space-y-4">
          <div className="flex justify-center gap-6 text-slate-600 text-xl">
            <i className="fab fa-discord hover:text-indigo-400 cursor-pointer transition-colors"></i>
            <i className="fab fa-telegram hover:text-blue-400 cursor-pointer transition-colors"></i>
            <i className="fas fa-globe hover:text-white cursor-pointer transition-colors"></i>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">UA ONLINE ADMIN SYSTEM &bull; 2025</p>
            <p className="text-[10px] text-slate-700">Хелпер створено виключно для полегшення адміністрування. Творець: Artem_Furrry.</p>
          </div>
      </footer>

      <style>{`
        .animate-spin-slow { animation: spin 12s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-slideIn { animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        
        /* Сховати скроллбар для чату */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .entrance-3d {
          animation: entrance3d 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
