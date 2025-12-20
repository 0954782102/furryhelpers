const TypingMessage = ({ msg }: { msg: ChatMessage }) => {
  const [text, setText] = useState('');
  const isAssistant = msg.role === 'assistant';

  useEffect(() => {
    if (!isAssistant) {
      setText(msg.content);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setText(msg.content.slice(0, i));
      i++;
      if (i > msg.content.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [msg]);

  const renderParts = (raw: string) => {
    const parts = raw.split(/```/);
    return parts.map((part, index) => {
      if (index % 2 === 1) { // Блок коду
        const lines = part.split('\n');
        const lang = lines[0].trim() || 'CODE';
        const code = lines.slice(1).join('\n').trim();
        return (
          <div key={index} className="my-3 border border-emerald-500/30 rounded-lg overflow-hidden bg-black/80">
            <div className="bg-emerald-500/10 px-3 py-1.5 flex justify-between items-center border-b border-emerald-500/20">
              <span className="text-[8px] font-bold text-emerald-500 uppercase">{lang}</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(code); alert('Копійовано!'); }}
                className="text-emerald-500 hover:text-white transition-colors"
              >
                <i className="fas fa-copy text-[10px]"></i>
              </button>
            </div>
            <pre className="p-3 text-[10px] font-mono text-emerald-400 overflow-x-auto selection:bg-emerald-500/30">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return <p key={index} className="whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[90%] p-4 rounded-2xl text-[11px] border ${
        msg.role === 'user' 
        ? 'bg-emerald-600 border-emerald-500 text-white rounded-tr-none' 
        : 'bg-slate-900 border-white/10 text-slate-200 rounded-tl-none'
      }`}>
        {renderParts(text)}
        {isAssistant && text.length < msg.content.length && (
          <span className="inline-block w-1.5 h-3 bg-emerald-500 ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
};
