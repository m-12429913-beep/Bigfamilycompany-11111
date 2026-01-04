
import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize, Monitor, Smartphone, Trash2 } from 'lucide-react';
import { VideoClip, TextOverlay } from '../types';

interface VideoCanvasProps {
  activeClip: VideoClip | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  aspectRatio: '16:9' | '9:16';
  onUpdateText: (textId: string, updates: Partial<TextOverlay>) => void;
  onRemoveText: (textId: string) => void;
}

const VideoCanvas: React.FC<VideoCanvasProps> = ({ 
  activeClip, isPlaying, setIsPlaying, aspectRatio, onUpdateText, onRemoveText 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#F3F4F6] p-12 overflow-hidden relative">
      <div 
        className={`bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-700 ease-in-out relative border-4 border-white ${
          aspectRatio === '16:9' ? 'aspect-video w-full max-w-5xl' : 'aspect-[9/16] h-full max-h-[75vh]'
        }`}
      >
        <div className="absolute inset-0 bg-[#0e1318]">
          {activeClip ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={activeClip.url}
                className="w-full h-full object-contain"
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Render Overlays */}
              {activeClip.textOverlays.map((text) => (
                <div 
                  key={text.id}
                  style={{
                    position: 'absolute',
                    top: `${text.y}%`,
                    left: `${text.x}%`,
                    transform: 'translate(-50%, -50%)',
                    color: text.color,
                    fontSize: `${text.fontSize}px`,
                    fontFamily: text.fontFamily,
                  }}
                  className="group cursor-move select-none"
                >
                  <div className="relative p-2 border-2 border-transparent group-hover:border-[#7d2ae8] rounded-md transition-colors">
                    <input
                      value={text.content}
                      onChange={(e) => onUpdateText(text.id, { content: e.target.value })}
                      className="bg-transparent border-none outline-none text-center min-w-[50px]"
                      style={{ width: `${Math.max(50, text.content.length * 20)}px` }}
                    />
                    <button 
                      onClick={() => onRemoveText(text.id)}
                      className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/20">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Play size={48} className="ml-1 opacity-40" />
              </div>
              <p className="font-semibold text-lg">Select or Generate a clip</p>
            </div>
          )}
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-5 bg-black/40 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/20 shadow-2xl opacity-0 hover:opacity-100 transition-opacity z-10">
          <button className="text-white hover:scale-110 transition-transform"><SkipBack size={24} /></button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
          </button>
          <button className="text-white hover:scale-110 transition-transform"><SkipForward size={24} /></button>
          <div className="w-px h-8 bg-white/20 mx-2" />
          <button className="text-white hover:scale-110 transition-transform"><Maximize size={20} /></button>
        </div>
      </div>
      
      <div className="absolute bottom-6 right-8 flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
         <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            {aspectRatio === '16:9' ? <Monitor size={14} /> : <Smartphone size={14} />}
            <span>{aspectRatio === '16:9' ? 'Landscape' : 'Portrait'}</span>
         </div>
      </div>
    </div>
  );
};

export default VideoCanvas;
