import React, { useState } from 'react';
import { X, Copy, Check, Users, Monitor, Smartphone, Video, Sparkles, HelpCircle } from 'lucide-react';

export default function InviteModal({ isOpen, onClose, roomId }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const roomLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${roomId}`
    : `http://localhost:3000/?room=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#001f3f] border border-[#39CCCC]/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#001f3f] to-[#39CCCC] flex items-center justify-center text-white border border-[#39CCCC]/40 shadow">
              <Users className="w-4 h-4 text-[#39CCCC]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                How to Join Multiple People with Faces (Zoom Mode)
              </h3>
              <p className="text-xs text-[#39CCCC]">Room ID: {roomId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Link Share */}
        <div className="bg-[#001226] border border-[#39CCCC]/30 rounded-xl p-3.5 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Classroom Join Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={roomLink}
              className="flex-1 bg-[#001f3f] border border-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none font-mono"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#39CCCC] hover:bg-[#2ba8a8] text-[#001f3f] font-bold text-xs transition cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Multi-User Guide */}
        <div className="space-y-3 text-xs text-slate-300">
          
          {/* Method 1: Same Laptop / Desktop */}
          <div className="p-3.5 rounded-xl bg-[#001226] border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Monitor className="w-4 h-4 text-[#39CCCC]" />
              <span>Option 1: Test with Multiple Tabs on Same Computer</span>
            </div>
            <ol className="list-decimal pl-6 space-y-1 text-slate-400">
              <li>Open a <strong>New Tab</strong> or <strong>Incognito Window</strong> in Chrome/Edge.</li>
              <li>Go to <code className="text-[#39CCCC] font-mono">http://localhost:3000</code>.</li>
              <li>Enter the same Room ID: <strong className="text-white">{roomId}</strong>.</li>
              <li>Enter a student name (e.g. <em>Aman Patel</em>, <em>Priya Sharma</em>).</li>
              <li>Click <strong>Join</strong> and click <strong>Camera ON</strong>! Both faces will now appear side-by-side in the Zoom grid!</li>
            </ol>
          </div>

          {/* Method 2: Another Laptop or Mobile Phone on Same Wi-Fi */}
          <div className="p-3.5 rounded-xl bg-[#001226] border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Option 2: Join from Mobile Phone or Other Laptops on Wi-Fi</span>
            </div>
            <p className="text-slate-400">
              Since Vite runs on <code className="text-blue-400">--host 0.0.0.0</code>, any device on your local Wi-Fi can join:
            </p>
            <ol className="list-decimal pl-6 space-y-1 text-slate-400">
              <li>Find your laptop's Wi-Fi IP address (run <code className="text-slate-300">ipconfig</code> in Windows, e.g. <code>192.168.1.15</code>).</li>
              <li>Open your phone's browser and visit <code className="text-blue-400 font-mono">http://&lt;your-ip&gt;:3000</code>.</li>
              <li>Join room <strong className="text-white">{roomId}</strong> and turn on Camera!</li>
            </ol>
          </div>

          {/* Video Grid Features */}
          <div className="p-3.5 rounded-xl bg-[#001226] border border-slate-800 flex items-start gap-3">
            <Video className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Zoom Video Grid Features</span>
              <p className="text-slate-400 mt-0.5">
                • <strong>Auto-Layout:</strong> The screen splits automatically into 2, 4, or 6 tiles as more people join.<br />
                • <strong>Active Speaker Glow:</strong> The person speaking gets a glowing teal border and volume wave.<br />
                • <strong>Professor Subtitles:</strong> What the teacher speaks is displayed directly across the video grid!
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-blue-500/20"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
