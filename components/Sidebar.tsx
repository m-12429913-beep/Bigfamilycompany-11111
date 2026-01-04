
import React from 'react';
import { 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  Layout, 
  Type, 
  Music, 
  Upload, 
  Settings,
  Plus
} from 'lucide-react';

interface SidebarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

const tools = [
  { id: 'templates', icon: Layout, label: 'Design' },
  { id: 'ai-magic', icon: Sparkles, label: 'Magic' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'audio', icon: Music, label: 'Audio' },
  { id: 'uploads', icon: Upload, label: 'Uploads' },
  { id: 'settings', icon: Settings, label: 'Apps' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool }) => {
  return (
    <div className="w-[72px] canva-sidebar flex flex-col items-center py-4 gap-4 z-30 shadow-xl">
      <div className="mb-2 p-2">
         <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">
           V
         </div>
      </div>
      
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className={`w-full group flex flex-col items-center gap-1 py-3 transition-all ${
            activeTool === tool.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <tool.icon size={22} strokeWidth={activeTool === tool.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium leading-tight">{tool.label}</span>
        </button>
      ))}

      <div className="mt-auto mb-4 w-full px-2">
         <button className="w-full aspect-square bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700 transition-colors">
            <Plus size={20} />
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
