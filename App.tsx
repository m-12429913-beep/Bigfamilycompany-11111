
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  RotateCw, 
  ChevronRight,
  Code,
  ArrowRight,
  Sparkles,
  X,
  Loader2,
  Wand2,
  Clock,
  LogIn,
  CreditCard,
  Download,
  Share2,
  History,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const APP_NAME = "大家庭公司代码修改器";
const STORAGE_KEY = 'big_family_autosave_draft';
const RECENT_KEY = 'big_family_recent_snippets';

const EXAMPLES = [
  {
    id: 'clock',
    title: "电子时钟",
    description: "带有毛玻璃特效的实时霓虹数字时钟。",
    icon: <Clock className="text-blue-500" />,
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    background: #0f172a;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    font-family: 'Courier New', Courier, monospace;
  }
  .clock {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 40px 60px;
    border-radius: 20px;
    color: #00ffcc;
    font-size: 80px;
    font-weight: bold;
    text-shadow: 0 0 20px #00ffcc;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
</style>
</head>
<body>
  <div class="clock" id="clock">00:00:00</div>
  <script>
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      document.getElementById('clock').textContent = h + ":" + m + ":" + s;
    }
    setInterval(updateClock, 1000);
    updateClock();
  </script>
</body>
</html>`
  },
  {
    id: 'login',
    title: "极简登录",
    description: "现代、带有动画效果的交互式登录表单。",
    icon: <LogIn className="text-purple-500" />,
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Segoe UI', sans-serif;
  }
  .form-container {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    padding: 40px;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 320px;
    text-align: center;
    color: white;
  }
  input {
    width: 100%;
    padding: 12px;
    margin: 10px 0;
    border-radius: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    outline: none;
    box-sizing: border-box;
  }
  input::placeholder { color: rgba(255,255,255,0.6); }
  button {
    width: 100%;
    padding: 12px;
    margin-top: 20px;
    border-radius: 8px;
    border: none;
    background: #fff;
    color: #764ba2;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
  }
  button:hover { transform: scale(1.02); background: #eee; }
</style>
</head>
<body>
  <div class="form-container">
    <h2>欢迎回来</h2>
    <input type="text" placeholder="用户名">
    <input type="password" placeholder="密码">
    <button>立即登录</button>
  </div>
</body>
</html>`
  }
];

interface RecentSnippet {
  id: string;
  title: string;
  code: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'editor'>('home');
  const [code, setCode] = useState('');
  const [srcDoc, setSrcDoc] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [recentSnippets, setRecentSnippets] = useState<RecentSnippet[]>([]);
  const [showToast, setShowToast] = useState<string | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const examplesRef = useRef<HTMLElement>(null);

  // Initialize and check for shared code or local draft
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#code=')) {
      try {
        const encoded = hash.replace('#code=', '');
        const decoded = decodeURIComponent(escape(atob(encoded)));
        setCode(decoded);
        setSrcDoc(decoded);
        setView('editor');
        window.history.replaceState(null, '', window.location.pathname);
        return;
      } catch (e) {
        console.error("Failed to decode shared code", e);
      }
    }

    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      setCode(savedDraft);
    } else {
      setCode(`<!DOCTYPE html>
<html>
<head>
<style>
body {
  background-color: white;
  font-family: 'Segoe UI', sans-serif;
  padding: 20px;
}
h1 { color: #04AA6D; }
.card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
</style>
</head>
<body>
<h1>大家庭公司代码修改器</h1>
<div class="card">
  <p>欢迎使用专业级代码修改工具。您可以直接在此编写代码，或通过 AI 助手快速生成。</p>
</div>
</body>
</html>`);
    }

    const history = localStorage.getItem(RECENT_KEY);
    if (history) {
      setRecentSnippets(JSON.parse(history));
    }
  }, []);

  // AUTO-SAVE FEATURE: Save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (code) {
        localStorage.setItem(STORAGE_KEY, code);
        triggerToast("代码已自动保存");
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [code]);

  const handleRun = () => {
    setSrcDoc(code);
    saveToHistory("手动运行");
  };

  const saveToHistory = (source: string) => {
    if (!code || code.length < 20) return;
    
    setRecentSnippets(prev => {
      if (prev.length > 0 && prev[0].code === code) return prev;
      const newSnippet: RecentSnippet = {
        id: Date.now().toString(),
        title: source + " - " + new Date().toLocaleTimeString(),
        code: code,
        timestamp: Date.now()
      };
      const updated = [newSnippet, ...prev].slice(0, 15);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const loadExample = (exampleCode: string) => {
    setCode(exampleCode);
    setSrcDoc(exampleCode);
    setView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadFile = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'big-family-source.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("文件已下载");
  };

  // SHARING FEATURE
  const handleShare = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(code)));
      const shareUrl = `${window.location.origin}${window.location.pathname}#code=${encoded}`;
      navigator.clipboard.writeText(shareUrl);
      triggerToast("分享链接已复制到剪贴板");
    } catch (e) {
      alert("代码内容过多，无法通过链接分享。请考虑直接下载文件。");
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  const deleteRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSnippets.filter(s => s.id !== id);
    setRecentSnippets(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Generate a complete, single-file HTML document (including <style> and <script> if needed) based on this request: "${aiPrompt}". 
        Return ONLY the code. Do not include markdown code blocks or explanations.`,
        config: {
          systemInstruction: "You are an expert frontend developer. You generate clean, modern, and accessible HTML/CSS/JS code. Use high quality styling."
        }
      });
      
      const generatedCode = response.text || "";
      const cleanedCode = generatedCode.replace(/```html\n|```\n|```/g, '').trim();
      
      setCode(cleanedCode);
      setSrcDoc(cleanedCode); 
      setShowAIModal(false);
      setAiPrompt('');
      saveToHistory("AI 生成: " + aiPrompt.substring(0, 15));
      triggerToast("AI 代码已就绪");
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("AI 生成失败，请检查网络连接或 API Key。");
    } finally {
      setIsAiGenerating(false);
    }
  };

  useEffect(() => {
    if (view === 'editor') {
      handleRun();
      const updateSize = () => {
        if (resultRef.current) {
          setDimensions({
            width: resultRef.current.clientWidth,
            height: resultRef.current.clientHeight
          });
        }
      };
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }
  }, [view]);

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 overflow-y-auto">
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 bg-[#04AA6D] rounded flex items-center justify-center text-white">
              <Code size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">{APP_NAME}</span>
          </div>
          <nav className="flex items-center gap-6">
            <button onClick={() => examplesRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-semibold hover:text-[#04AA6D]">代码范例</button>
            <button 
              onClick={() => setView('editor')}
              className="bg-[#04AA6D] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#059862] transition-all"
            >
              开始修改
            </button>
          </nav>
        </header>

        <main>
          <section className="pt-24 pb-20 px-6 text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              高效修改，<br />
              <span className="text-[#04AA6D] inline-flex items-center gap-4">AI 辅助创作 <Sparkles size={40} className="text-yellow-400" /></span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 leading-relaxed">
              实时编码，AI 智能助手，秒级链接分享。<br/>
              您的每一行代码都将每 30 秒自动保存至本地，安全无忧。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setView('editor')}
                className="w-full sm:w-auto px-8 py-4 bg-[#04AA6D] text-white rounded-xl text-lg font-bold hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                立即进入编辑器 <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => examplesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 rounded-xl text-lg font-bold hover:bg-gray-200 transition-all"
              >
                查看代码范例
              </button>
            </div>
          </section>

          {/* RECENT HISTORY ON HOME */}
          {recentSnippets.length > 0 && (
            <section className="py-20 px-6 max-w-6xl mx-auto border-t border-gray-50">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <History size={24} className="text-[#04AA6D]" />
                    最近修改记录
                  </h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentSnippets.map(snip => (
                    <div 
                      key={snip.id}
                      onClick={() => loadExample(snip.code)}
                      className="p-5 border border-gray-100 rounded-xl bg-gray-50/30 hover:bg-white hover:shadow-lg hover:border-[#04AA6D] transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-[#04AA6D] opacity-60 uppercase tracking-wider">Session</span>
                          <button onClick={(e) => deleteRecent(snip.id, e)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <h4 className="font-bold text-gray-800 line-clamp-1">{snip.title}</h4>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-gray-400">
                         <span>{new Date(snip.timestamp).toLocaleString()}</span>
                         <span className="flex items-center gap-1 group-hover:text-[#04AA6D]">编辑 <ArrowRight size={12}/></span>
                      </div>
                    </div>
                  ))}
               </div>
            </section>
          )}

          <section ref={examplesRef} className="py-24 px-6 bg-gray-50 border-y border-gray-100">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">精选代码范例</h2>
                <p className="text-gray-500">从优秀的范例开始，快速构建您的应用。</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {EXAMPLES.map(ex => (
                  <div key={ex.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all flex flex-col">
                    <div className="p-8 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                        {ex.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{ex.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6">{ex.description}</p>
                    </div>
                    <button 
                      onClick={() => loadExample(ex.code)}
                      className="w-full py-4 bg-gray-900 text-white font-bold text-sm hover:bg-[#04AA6D] transition-colors flex items-center justify-center gap-2"
                    >
                      使用此范例 <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f1f1f1] font-sans">
      {/* Editor Header */}
      <header className="flex h-14 bg-[#f1f1f1] border-b border-gray-200 items-center justify-between px-4 z-[60]">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white rounded-md p-1 shadow-sm border border-gray-200 mr-2">
            <button onClick={() => setView('home')} className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600" title="首页">
              <Home size={18} />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            
            {/* History & Examples Dropdown */}
            <div className="relative group">
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 flex items-center gap-1" title="记录与范例">
                <History size={18} />
                <ChevronRight size={14} className="rotate-90" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-72 bg-white shadow-2xl rounded-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 overflow-hidden">
                <div className="max-h-[80vh] overflow-y-auto">
                  {recentSnippets.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase p-2 border-b border-gray-50 mb-1">最近修改</p>
                      {recentSnippets.map(snip => (
                        <button key={snip.id} onClick={() => loadExample(snip.code)} className="w-full text-left p-2.5 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-xs font-semibold group/item">
                          <Clock size={14} className="text-gray-400 group-hover/item:text-blue-500" />
                          <span className="truncate flex-1">{snip.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-gray-400 uppercase p-2 border-b border-gray-50 mb-1">精选范例</p>
                  {EXAMPLES.map(ex => (
                    <button key={ex.id} onClick={() => loadExample(ex.code)} className="w-full text-left p-2.5 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-xs font-semibold">
                      <div className="scale-75">{ex.icon}</div>
                      {ex.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleRun} className="bg-[#04AA6D] hover:bg-[#059862] text-white px-4 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
              运行代码 <ChevronRight size={14} strokeWidth={3} />
            </button>
            <button onClick={() => setShowAIModal(true)} className="bg-white hover:bg-gray-50 text-[#7d2ae8] border border-gray-200 px-3 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
              <Sparkles size={14} fill="currentColor" /> <span className="hidden sm:inline">AI 助手</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
            <button onClick={handleShare} className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 flex items-center gap-1.5 text-xs font-bold" title="分享链接">
              <Share2 size={18} /> <span className="hidden lg:inline">分享</span>
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <button onClick={handleDownloadFile} className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 flex items-center gap-1.5 text-xs font-bold" title="下载 HTML">
              <Download size={18} /> <span className="hidden lg:inline">下载</span>
            </button>
          </div>
          
          <div className="text-[12px] text-gray-500 hidden md:block border-l border-gray-300 pl-4">
            尺寸: <span className="font-bold text-black">{dimensions.width}×{dimensions.height}</span>
          </div>
        </div>
      </header>

      {/* Editor Main */}
      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 border-r border-gray-200 bg-white relative">
          <textarea 
            className="w-full h-full p-6 font-mono text-[14px] resize-none outline-none leading-relaxed selection:bg-blue-100"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[10px] font-bold text-gray-400 pointer-events-none select-none">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            自动保存已开启 (30s)
          </div>
        </div>

        <div className="flex-1 bg-white" ref={resultRef}>
          <iframe
            title="preview"
            srcDoc={srcDoc}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-modals"
          />
        </div>

        {/* AI Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="font-bold text-lg">AI 代码助手</h3>
                </div>
                <button onClick={() => setShowAIModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
              </div>
              <div className="p-6">
                <textarea
                  autoFocus
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="描述您想要生成的代码（例如：'创建一个带有导航栏、英雄展示区和动态按钮的现代咖啡馆网页'）..."
                  className="w-full h-36 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium resize-none placeholder:text-gray-400"
                />
              </div>
              <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
                <button onClick={() => setShowAIModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">取消</button>
                <button 
                  disabled={isAiGenerating || !aiPrompt.trim()}
                  onClick={handleAskAI}
                  className="px-6 py-2 bg-[#7d2ae8] hover:bg-[#6a24c5] disabled:bg-gray-300 text-white rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  {isAiGenerating ? <><Loader2 size={16} className="animate-spin" /> 正在编写...</> : <><Wand2 size={16} /> 立即生成</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[200] animate-in slide-in-from-bottom duration-300">
            <CheckCircle2 size={18} className="text-[#04AA6D]" />
            <span className="text-sm font-bold">{showToast}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
