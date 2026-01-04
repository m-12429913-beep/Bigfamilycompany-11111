
import React from 'react';
import { Upload, Image as ImageIcon, Video, MoreHorizontal, Plus } from 'lucide-react';
import { ProjectAsset } from '../types';

interface UploadPanelProps {
  assets: ProjectAsset[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddAssetToTimeline: (asset: ProjectAsset) => void;
}

const UploadPanel: React.FC<UploadPanelProps> = ({ assets, onUpload, onAddAssetToTimeline }) => {
  return (
    <div className="w-[360px] bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Uploads</h2>
        <label className="w-full py-3 canva-purple hover:canva-purple-hover text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md">
          <Upload size={18} />
          Upload files
          <input type="file" className="hidden" onChange={onUpload} accept="image/*,video/*" multiple />
        </label>
      </div>

      <div className="p-5">
        <div className="flex gap-4 border-b border-gray-100 mb-4">
          <button className="pb-2 text-xs font-bold border-b-2 border-[#7d2ae8] text-gray-900">Images</button>
          <button className="pb-2 text-xs font-bold text-gray-400 hover:text-gray-600">Videos</button>
          <button className="pb-2 text-xs font-bold text-gray-400 hover:text-gray-600">Audio</button>
        </div>

        {assets.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Upload size={24} />
            </div>
            <p className="text-xs font-medium">No uploads yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {assets.map(asset => (
              <div 
                key={asset.id} 
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                onClick={() => onAddAssetToTimeline(asset)}
              >
                {asset.type === 'video' ? (
                  <video src={asset.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={asset.url} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                   <div className="bg-white p-1.5 rounded-full text-gray-900 shadow-xl">
                      <Plus size={16} />
                   </div>
                </div>
                {asset.type === 'video' && (
                   <div className="absolute bottom-1 right-1 bg-black/50 text-[8px] text-white px-1 rounded font-bold">
                      VIDEO
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPanel;
