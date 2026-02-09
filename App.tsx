
import React, { useState, useMemo, useEffect } from 'react';
import { RULES_DATA } from './data/rules';
import { REPORT_TEMPLATES, IMPORTANT_DATES, ADMIN_COMMANDS } from './data/admin_data';
import { ChatMessage, Rule, CalendarEvent, UserLog } from './types';
import { getGeminiResponse } from './services/geminiService';

const AutumnLeavesBackground = () => {
  const [leaves, setLeaves] = useState<any[]>([]);
  useEffect(() => {
    const count = window.innerWidth < 768 ? 10 : 20;
    const icons = ['fa-leaf', 'fa-canadian-maple-leaf'];
    const colors = ['text-orange-400', 'text-amber-500', 'text-red-500', 'text-yellow-600'];
    setLeaves(Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${Math.random() * 10 + 10}s`,
      size: `${Math.random() * 0.7 + 0.5}rem`,
      rotate: `${Math.random() * 360}deg`,
      icon: icons[Math.floor(Math.random() * icons.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    })));
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      {leaves.map(l => (
        <div key={l.id} className="leaf-anim" style={{ left: l.left, animationDelay: l.delay, animationDuration: l.duration, fontSize: l.size }}>
          <i className={`fas ${l.icon} ${l.color}`} style={{ transform: `rotate(${l.rotate})` }}></i>
        </div>
      ))}
      <style>{`.leaf-anim { position: absolute; top: -20px; animation: fall linear infinite; } @keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(105vh) rotate(360deg); opacity: 0; } }`}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('v6_user_name'));
  const [rules, setRules] = useState<Rule[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'ai' | 'tools' | 'calendar' | 'logs'>('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);

  useEffect(() => {
    if (user) {
      const savedRules = localStorage.getItem(`v6_rules_${user}`);
      setRules(savedRules ? JSON.parse(savedRules) : RULES_DATA);
      
      const savedEvents = localStorage.getItem(`v6_calendar_${user}`);
      if (savedEvents) {
        setCalendarEvents(JSON.parse(savedEvents));
      } else {
        setCalendarEvents(IMPORTANT_DATES.map((d, i) => ({ id: `ev-${i}`, date: d.date, time: "18:00", event: d.event, type: d.type as any })));
      }

      // Логування
      const logs = JSON.parse(localStorage.getItem('v6_users_log') || '[]');
      const now = new Date().toLocaleString('uk-UA');
      const updatedLogs = [...logs.filter((l: any) => l.nickname !== user), { nickname: user, lastVisit: now }];
      localStorage.setItem('v6_users_log', JSON.stringify(updatedLogs));
      setUserLogs(updatedLogs);
    }
  }, [user]);

  const saveRules = (newRules: Rule[]) => {
    setRules(newRules);
    localStorage.setItem(`v6_rules_${user}`, JSON.stringify(newRules));
  };

  const saveCalendar = (newEvents: CalendarEvent[]) => {
    setCalendarEvents(newEvents);
    localStorage.setItem(`v6_calendar_${user}`, JSON.stringify(newEvents));
  };

  const handleLogin = (name: string) => {
    if (!name.trim()) return;
    localStorage.setItem('v6_user_name', name.trim());
    setUser(name.trim());
  };

  const filteredRules = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return rules;
    return rules.filter(r => 
      r.id.toLowerCase().includes(term) || 
      r.title.toLowerCase().includes(term) || 
      r.abbreviations.some(a => a.toLowerCase().includes(term))
    );
  }, [searchTerm, rules]);

  const handleRuleUpdate = (updated: Rule) => {
    const isNew = !rules.find(r => r.id === updated.id);
    if (isNew) {
      saveRules([updated, ...rules]);
    } else {
      saveRules(rules.map(r => r.id === updated.id ? updated : r));
    }
    setEditingRule(null);
  };

  const handleEventUpdate = (updated: CalendarEvent) => {
    const exists = calendarEvents.find(e => e.id === updated.id);
    if (exists) {
      saveCalendar(calendarEvents.map(e => e.id === updated.id ? updated : e));
    } else {
      saveCalendar([updated, ...calendarEvents]);
    }
    setEditingEvent(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiLoading) return;
    const msg: ChatMessage = { role: 'user', content: inputMessage, timestamp: Date.now() };
    setChatMessages(prev => [...prev, msg]);
    setInputMessage('');
    setIsAiLoading(true);
    const resp = await getGeminiResponse(inputMessage);
    setChatMessages(prev => [...prev, { role: 'assistant', content: resp, timestamp: Date.now() }]);
    setIsAiLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
        <AutumnLeavesBackground />
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg rotate-3">
            <i className="fas fa-shield-halved text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Вхід в UA Suite</h1>
          <input 
            id="nick" type="text" placeholder="Ваш NickName" 
            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-orange-500 text-center font-bold"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin((e.target as HTMLInputElement).value)}
          />
          <button onClick={() => handleLogin((document.getElementById('nick') as HTMLInputElement).value)} className="w-full py-4 bg-orange-600 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-orange-100 active:scale-95 transition-all">Авторизуватись</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcf5] text-slate-800 pb-24 md:pb-8">
      <AutumnLeavesBackground />
      
      <header className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black uppercase">UA Online Suite</h1>
            <p className="text-[9px] font-bold text-orange-500 uppercase">{user}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditingRule({ id: `custom-${Date.now()}`, title: '', category: 'Власне', description: '', punishment: '', abbreviations: [] })} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase shadow-md active:scale-95 transition-all">+ Додати пункт</button>
          <button onClick={() => { localStorage.removeItem('v6_user_name'); setUser(null); }} className="w-10 h-10 bg-white border border-red-100 rounded-xl text-red-500 flex items-center justify-center shadow-sm"><i className="fas fa-power-off"></i></button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        <aside className="hidden md:block col-span-3 space-y-2">
          {[
            { id: 'rules', label: 'База Правил', icon: 'fa-book' },
            { id: 'calendar', label: 'Розклад', icon: 'fa-calendar' },
            { id: 'ai', label: 'Асистент', icon: 'fa-robot' },
            { id: 'tools', label: 'Команди', icon: 'fa-terminal' },
            { id: 'logs', label: 'Логи Входу', icon: 'fa-list-ul' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-orange-50'}`}>
              <i className={`fas ${tab.icon} w-4`}></i> {tab.label}
            </button>
          ))}
        </aside>

        <section className="col-span-1 md:col-span-9 space-y-4">
          {activeTab === 'rules' && (
            <>
              <div className="relative">
                <input type="text" placeholder="Пошук (дм, ск, rk, 3.1)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-4 md:p-5 bg-white rounded-2xl shadow-lg border-2 border-orange-50 focus:border-orange-400 outline-none text-sm font-medium transition-all" />
                <i className="fas fa-search absolute right-6 top-1/2 -translate-y-1/2 text-orange-200"></i>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredRules.map(rule => (
                  <div key={rule.id} className="bg-white p-5 rounded-[2rem] border border-orange-50 shadow-sm hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[8px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">#{rule.id}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingRule(rule)} className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-[10px]"><i className="fas fa-pen"></i></button>
                        <button onClick={() => saveRules(rules.filter(r => r.id !== rule.id))} className="w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-[10px]"><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                    <h3 className="text-sm font-black text-slate-800 mb-2">{rule.title}</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed mb-4">{rule.description}</p>
                    <div onClick={() => { navigator.clipboard.writeText(rule.punishment); alert('Скопійовано!'); }} className="bg-orange-600 text-white p-3 rounded-xl flex items-center justify-between cursor-pointer active:scale-95 transition-all">
                      <span className="text-[8px] font-black uppercase opacity-70">Покарання</span>
                      <span className="text-[10px] font-bold">{rule.punishment}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black uppercase">Мій Календар</h2>
                <button onClick={() => setEditingEvent({ id: `${Date.now()}`, date: 'Сьогодні', time: '18:00', event: 'Нова подія', type: 'meeting' })} className="text-[9px] font-black text-orange-600 uppercase">+ Додати</button>
              </div>
              <div className="space-y-3">
                {calendarEvents.map(ev => (
                  <div key={ev.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white font-black ${ev.type === 'meeting' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                      <span className="text-[6px]">{ev.time}</span>
                      <i className="fas fa-clock text-[10px]"></i>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xs font-black">{ev.event}</h4>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">{ev.date}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingEvent(ev)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-orange-500 shadow-sm"><i className="fas fa-edit text-[10px]"></i></button>
                      <button onClick={() => saveCalendar(calendarEvents.filter(e => e.id !== ev.id))} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm"><i className="fas fa-trash text-[10px]"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl space-y-6 animate-fadeIn">
              <h2 className="text-lg font-black uppercase flex items-center gap-3"><i className="fas fa-history text-orange-500"></i> Історія Входу</h2>
              <div className="space-y-2">
                {userLogs.slice().reverse().map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-xs text-slate-800">{log.nickname}</span>
                    <span className="text-[9px] font-bold text-slate-400">{log.lastVisit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="flex flex-col h-[60vh] bg-white rounded-[2.5rem] shadow-xl border border-orange-50 overflow-hidden">
               <div className="bg-orange-50 px-6 py-4 text-[10px] font-black uppercase text-orange-800">AI Помічник</div>
               <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-slate-100 rounded-tl-none border border-orange-100'}`}>{msg.content}</div>
                    </div>
                  ))}
                  {isAiLoading && <div className="p-4 bg-slate-50 rounded-xl w-fit animate-pulse text-[10px]">ШІ думає...</div>}
               </div>
               <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 flex gap-2 border-t border-orange-100">
                  <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Запитай про DM, RK..." className="flex-grow p-3 rounded-xl bg-white border border-orange-100 text-xs outline-none focus:border-orange-400" />
                  <button type="submit" className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-md"><i className="fas fa-paper-plane"></i></button>
               </form>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-orange-50 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-orange-600 pb-2 border-b border-orange-50">Команди</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ADMIN_COMMANDS.map(c => (
                      <button key={c.cmd} onClick={() => { navigator.clipboard.writeText(`${c.cmd} `); alert('Скопійовано!'); }} className="bg-slate-50 p-3 rounded-xl text-left border border-slate-100 hover:bg-orange-50 transition-all group">
                        <span className="block font-black text-[9px] group-hover:text-orange-600">{c.label}</span>
                        <span className="text-[8px] text-slate-400 font-mono">{c.cmd}</span>
                      </button>
                    ))}
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-orange-50 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-orange-600 pb-2 border-b border-orange-50">Шаблони</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {REPORT_TEMPLATES.map((t, i) => (
                      <button key={i} onClick={() => { navigator.clipboard.writeText(t); alert('Скопійовано!'); }} className="w-full text-left p-3 bg-slate-50 rounded-xl text-[9px] border border-slate-100 hover:bg-orange-50 transition-all">{t}</button>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-xl border-t border-orange-50 px-6 py-3 flex justify-between items-center rounded-t-[2rem] shadow-2xl">
        {[
          { id: 'rules', icon: 'fa-book' },
          { id: 'calendar', icon: 'fa-calendar' },
          { id: 'ai', icon: 'fa-robot' },
          { id: 'tools', icon: 'fa-terminal' },
          { id: 'logs', icon: 'fa-history' }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all ${activeTab === item.id ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-300'}`}><i className={`fas ${item.icon}`}></i></button>
        ))}
      </nav>

      {/* Rule Editor Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border-4 border-orange-50">
            <h2 className="text-base font-black uppercase mb-5 flex items-center gap-2 text-slate-800"><i className="fas fa-pen-nib text-orange-600"></i> Параметри правила</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[8px] font-black uppercase ml-2 text-slate-400">ID Пункту</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold border border-transparent focus:border-orange-200 outline-none" value={editingRule.id} onChange={e => setEditingRule({...editingRule, id: e.target.value})} placeholder="4.1" /></div>
                <div><label className="text-[8px] font-black uppercase ml-2 text-slate-400">Назва</label><input type="text" className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold border border-transparent focus:border-orange-200 outline-none" value={editingRule.title} onChange={e => setEditingRule({...editingRule, title: e.target.value})} placeholder="DM" /></div>
              </div>
              <div><label className="text-[8px] font-black uppercase ml-2 text-slate-400">Покарання</label><input type="text" className="w-full p-3 bg-orange-600 text-white rounded-xl text-xs font-bold outline-none placeholder:text-white/50 shadow-md" value={editingRule.punishment} onChange={e => setEditingRule({...editingRule, punishment: e.target.value})} placeholder="Jail 20 хв" /></div>
              <div><label className="text-[8px] font-black uppercase ml-2 text-slate-400">Опис</label><textarea className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-orange-200 h-24 resize-none" value={editingRule.description} onChange={e => setEditingRule({...editingRule, description: e.target.value})} placeholder="Вбивство без причини..." /></div>
              <div className="flex gap-2 pt-3">
                <button onClick={() => setEditingRule(null)} className="flex-1 py-3 bg-slate-100 rounded-xl font-black uppercase text-[9px] text-slate-500">Скасувати</button>
                <button onClick={() => handleRuleUpdate(editingRule)} className="flex-[2] py-3 bg-orange-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg active:scale-95 transition-all">Зберегти</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Editor Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border-2 border-orange-50">
            <h2 className="text-sm font-black uppercase mb-5 flex items-center gap-2"><i className="fas fa-calendar-plus text-orange-600"></i> Подія</h2>
            <div className="space-y-3">
               <div className="grid grid-cols-2 gap-2">
                 <input type="text" className="w-full p-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none" value={editingEvent.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} placeholder="Дата" />
                 <input type="text" className="w-full p-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none" value={editingEvent.time} onChange={e => setEditingEvent({...editingEvent, time: e.target.value})} placeholder="Час" />
               </div>
               <input type="text" className="w-full p-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none" value={editingEvent.event} onChange={e => setEditingEvent({...editingEvent, event: e.target.value})} placeholder="Назва" />
               <select className="w-full p-3 bg-orange-600 text-white rounded-xl text-[10px] font-black outline-none appearance-none cursor-pointer" value={editingEvent.type} onChange={e => setEditingEvent({...editingEvent, type: e.target.value as any})}>
                  <option value="meeting">Збори</option>
                  <option value="deadline">Дедлайн</option>
                  <option value="update">Оновлення</option>
                  <option value="work">Робота</option>
                  <option value="other">Інше</option>
               </select>
               <div className="flex gap-2 pt-3">
                <button onClick={() => setEditingEvent(null)} className="flex-1 py-3 bg-slate-100 rounded-xl font-black uppercase text-[9px]">Скасувати</button>
                <button onClick={() => handleEventUpdate(editingEvent)} className="flex-[2] py-3 bg-orange-600 text-white rounded-xl font-black uppercase text-[9px]">Зберегти</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
