import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RULES_DATA } from './data/rules';
import { REPORT_TEMPLATES, IMPORTANT_DATES, ADMIN_COMMANDS } from './data/admin_data';
import { ChatMessage } from './types';
import { getGeminiResponse } from './services/geminiService';

// Компонент для красивого відображення повідомлень з анімацією друку та блоками коду
const TypewriterMessage = ({ content, role, onComplete }: { content: string, role: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(role === 'assistant');

  useEffect(() => {
    if (role === 'user') {
      setDisplayedText(content);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(content.slice(0, index));
      index++;
      if (index > content.length) {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, 15); // Швидкість друку

    return () => clearInterval(interval);
  }, [content, role]);

  // Функція для парсингу коду та тексту
  const renderContent = (text: string) => {
    const parts = text.split(/```/);
    return parts.map((part, i) => {
      if (i % 2 === 1) { // Це блок коду
        const codeLines = part.split('\n');
        const lang = codeLines[0].trim();
        const code = codeLines.slice(1).join('\n');
        return (
          <div key={i} className="my-4 border border-emerald-500/30 rounded-xl overflow-hidden bg-black/60 shadow-2xl">
            <div className="bg-emerald-500/10 px-4 py-2 flex justify-between items-center border-b border-emerald-500/20">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{lang || 'CODE'}</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(code); alert('CODE COPIED'); }}
                className="hover:text-white text-emerald-500 transition-colors"
              >
                <i className="fas fa-copy text-xs"></i>
              </button>
            </div>
            <pre className="p-4 text-[10px] font-mono text-emerald-400 overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return <p key={i} className="whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`max-w-[92%] p-4 rounded-2xl text-[11px] shadow-2xl relative border ${
        role === 'user' 
        ? 'bg-emerald-600 text-white rounded-tr-none border-emerald-400/30' 
        : 'bg-slate-900/90 text-slate-200 rounded-tl-none border-white/10'
      }`}>
        {renderContent(displayedText)}
        {isTyping && <span className="inline-block w-1 h-3 bg-emerald-500 ml-1 animate-pulse">|</span>}
      </div>
    </div>
  );
};

const SnowflakeBackground = () => {
  const [flakes, setFlakes] = useState<any[]>([]);
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setFlakes(Array.from({ length: isMobile ? 12 : 30 }).map((_, i) => ({
      id: i, left: `${Math.random() * 100}%`, delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 5 + 5}s`, size: `${Math.random() * 0.3 + 0.2}rem`
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startIntro = () => {
    setCanStart(true);
    setTimeout(() => { audioRef.current?.play().catch(() => {}); }, 150);
  };
  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
      {!canStart ? (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 animate-pulse">
            <i className="fas fa-shield-halved text-3xl text-emerald-500"></i>
          </div>
          <button onClick={startIntro} className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 uppercase tracking-widest text-xs">Увійти в термінал</button>
        </div>
      ) : (
        <div className="text-center animate-fadeIn">
          <h1 className="text-4xl font-black text-white uppercase mb-4 tracking-tighter">Система готова</h1>
          <p className="text-emerald-400 animate-pulse text-[10px] tracking-widest">ВСТАНОВЛЕННЯ ЗВ'ЯЗКУ...</p>
          <audio ref={audioRef} src="assets/intro_audio.mp3" onEnded={onFinish} />
          <button onClick={onFinish} className="mt-8 text-[10px] text-white/20 uppercase font-bold">[ Пропустити ]</button>
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
  const [isAgreed, setIsAgreed] = useState(() => localStorage.getItem('admin_agreed_v5') === 'true');
  const [dutyState, setDutyState] = useState(() => {
    const saved = localStorage.getItem('duty_state_v5');
    return saved ? JSON.parse(saved) : { isActive: false, startTime: 0, accumulatedSeconds: 0 };
  });
  const [displayTime, setDisplayTime] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem('ua_admin_v5_splash_done');
    if (!hasVisited) setShowSplash(true);
  }, []);

  useEffect(() => {
    let interval: any;
    if (dutyState.isActive) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - dutyState.startTime) / 1000);
        setDisplayTime(dutyState.accumulatedSeconds + elapsed);
      }, 1000);
    } else {
      setDisplayTime(dutyState.accumulatedSeconds);
    }
    return () => clearInterval(interval);
  }, [dutyState]);

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

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col mx-auto px-4 pt-4 pb-24 max-w-lg md:max-w-5xl">
      <SnowflakeBackground />
      {showSplash && <SplashScreen onFinish={() => { localStorage.setItem('ua_admin_v5_splash_done', 'true'); setShowSplash(false); }} />}

      <header className="flex flex-col items-center mb-6 no-select">
        <div className={`mb-4 px-6 py-2 rounded-full border transition-all cursor-pointer ${dutyState.isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          <span className="text-[10px] font-black uppercase tracking-widest">{dutyState.isActive ? 'Duty: ' : 'Off: '} {formatTime(displayTime)}</span>
        </div>
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 uppercase tracking-tighter">UA Admin Suite</h1>
        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.4em]">Artem_Furrry Terminal</p>
      </header>

      <nav className="fixed bottom-4 left-4 right-4 z-50 md:relative md:bottom-auto md:mb-8">
        <div className="glass-card p-1 rounded-2xl flex justify-around border-white/5 shadow-2xl">
          {(['rules', 'ai', 'tools', 'dates', 'peace'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'text-slate-500'}`}>
              <i className={`fas fa-${tab === 'ai' ? 'robot' : tab === 'rules' ? 'book' : tab === 'tools' ? 'hammer' : tab === 'dates' ? 'calendar' : 'mug-hot'} mb-1 block text-xs`}></i>
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-grow">
        {activeTab === 'ai' ? (
          <div className="flex flex-col h-[65vh] glass-card rounded-[2.5rem] overflow-hidden border-white/5 relative">
            <div className="bg-white/5 p-4 border-b border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black uppercase text-slate-400">Gemini Neural Interface</span>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-6">
              {chatMessages.map((msg, i) => (
                <TypewriterMessage key={i} {...msg} onComplete={() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })} />
              ))}
              {isAiLoading && (
                <div className="flex gap-2 p-4 bg-slate-800/50 w-20 rounded-2xl animate-pulse">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                </div>
              )}
              
              {/* AGREEMENT BUTTON */}
              {chatMessages.some(m => m.content.includes("УГОДА")) && !isAgreed && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl animate-bounce">
                  <button onClick={() => { setIsAgreed(true); localStorage.setItem('admin_agreed_v5', 'true'); }} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest">Прийняти угоду та відкрити протокол</button>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-black/40 flex gap-2 border-t border-white/5">
              <input 
                type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isAgreed ? "Введіть запит для ШІ..." : "Потрібно підписати угоду"}
                className="flex-grow bg-slate-800/50 rounded-2xl px-5 py-4 text-xs text-white outline-none border border-transparent focus:border-emerald-500/50 transition-all"
                disabled={!isAgreed && chatMessages.length > 0}
              />
              <button type="submit" className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center text-slate-500 mt-20 font-black uppercase text-[10px] tracking-[0.5em]">Оберіть вкладку в терміналі</div>
        )}
      </main>
    </div>
  );
};

export default App;
