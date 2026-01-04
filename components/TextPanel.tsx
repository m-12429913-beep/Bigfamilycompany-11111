
import React from 'react';
import { Type, Plus } from 'lucide-react';
import { TextOverlay } from '../types';

interface TextPanelProps {
  onAddText: (type: 'heading' | 'subheading' | 'body') => void;
}

const TextPanel: React.FC<TextPanelProps> = ({ onAddText }) => {
  return (
    <div className="w-[360px] bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Text</h2>
      
      <div className="space-y-4">
        <button 
          onClick={() => onAddText('heading')}
          className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 p-6 rounded-xl text-left transition-all group"
        >
          <span className="text-3xl font-black text-gray-900 block">Add a heading</span>
        </button>
        
        <button 
          onClick={() => onAddText('subheading')}
          className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 p-4 rounded-xl text-left transition-all"
        >
          <span className="text-xl font-bold text-gray-700 block">Add a subheading</span>
        </button>
        
        <button 
          onClick={() => onAddText('body')}
          className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 p-3 rounded-xl text-left transition-all"
        >
          <span className="text-sm font-medium text-gray-500 block">Add a little bit of body text</span>
        </button>
      </div>

      <div className="mt-10">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Default text styles</h3>
        <div className="grid grid-cols-1 gap-3">
          {['Gagalin', 'League Spartan', 'Open Sans', 'Montserrat'].map(font => (
            <button key={font} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-[#7d2ae8] transition-colors">
              <span className="text-sm font-semibold" style={{ fontFamily: font }}>{font}</span>
              <Plus size={14} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextPanel;
