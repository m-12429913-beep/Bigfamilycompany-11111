
import React from 'react';
import { Plus, Trash2, ExternalLink, Clock, Layers } from 'lucide-react';
import { VideoClip } from '../types';

interface TimelineProps {
  clips: VideoClip[];
  activeClipId: string | null;
  setActiveClipId: (id: string) => void;
  onDeleteClip: (id: string) => void;
  onExtendClip: (id: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ clips, activeClipId, setActiveClipId, onDeleteClip, onExtendClip }) => {
  return (
    <div className="h-56 bg-white border-t border-gray-200 flex flex-col z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Layers size={14} />
            Timeline
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-[11px] font-bold text-[#7d2ae8]">
            <Clock size={12} />
            <span>00:{clips.length * 5 < 10 ? '0' : ''}{clips.length * 5}:00</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex bg-gray-100 rounded-md p-1">
              <button className="px-3 py-1 text-[10px] font-bold bg-white shadow-sm rounded-sm text-gray-900">Editor</button>
              <button className="px-3 py-1 text-[10px] font-bold text-gray-400">Notes</button>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto flex items-center gap-4 px-6 py-4 bg-gray-50/50">
        <button className="flex-shrink-0 w-12 h-28 bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 hover:border-gray-400 hover:text-gray-400 transition-all group">
           <Plus size={20} className="group-hover:scale-125 transition-transform" />
        </button>

        {clips.length === 0 ? (
          <div className="flex-1 h-full flex items-center justify-center text-gray-400 italic">
            <p className="text-xs font-medium">Add clips from Magic Media to build your story</p>
          </div>
        ) : (
          clips.map((clip, index) => (
            <div
              key={clip.id}
              onClick={() => setActiveClipId(clip.id)}
              className={`group flex-shrink-0 relative transition-all duration-300 ${
                activeClipId === clip.id ? 'z-10' : ''
              }`}
            >
              <div className={`w-52 h-28 bg-white rounded-xl overflow-hidden relative shadow-sm border-2 transition-all ${
                activeClipId === clip.id ? 'border-[#7d2ae8] ring-4 ring-[#7d2ae8]/10' : 'border-white hover:border-gray-200'
              }`}>
                <video src={clip.url} className="w-full h-full object-cover" />
                
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                   <div className="bg-black/50 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {index + 1}
                   </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-200/50">
                   <div className="h-full bg-[#7d2ae8] w-full"></div>
                </div>
                
                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onExtendClip(clip.id); }}
                    className="p-1.5 bg-white text-gray-700 hover:text-[#7d2ae8] rounded-lg shadow-xl border border-gray-100"
                    title="Extend AI Generation"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteClip(clip.id); }}
                    className="p-1.5 bg-white text-gray-700 hover:text-red-500 rounded-lg shadow-xl border border-gray-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Timeline;
