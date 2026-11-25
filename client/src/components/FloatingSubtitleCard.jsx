import React, { useState, useRef, useEffect } from 'react';
import {
  GripHorizontal,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Volume2,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { getUIText } from '../services/uiTranslations';

export default function FloatingSubtitleCard({ latestEvent, isListening, selectedLanguage = 'en' }) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState(null); // { x: number, y: number } in px relative to window
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, cardWidth: 0, cardHeight: 0 });

  // Handle window resize to keep subtitle within visible screen
  useEffect(() => {
    const handleResize = () => {
      if (!position || !cardRef.current) return;
      const cardRect = cardRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - cardRect.width - 12;
      const maxY = window.innerHeight - cardRect.height - 12;
      setPosition((prev) => {
        if (!prev) return null;
        return {
          x: Math.max(12, Math.min(prev.x, Math.max(12, maxX))),
          y: Math.max(12, Math.min(prev.y, Math.max(12, maxY)))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  // Pointer-down handler on the drag handle or card header
  const handlePointerDown = (e) => {
    // Only drag with left mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.stopPropagation();

    const card = cardRef.current;
    if (!card) return;

    const cardRect = card.getBoundingClientRect();

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position ? position.x : cardRect.left,
      initialY: position ? position.y : cardRect.top,
      cardWidth: cardRect.width,
      cardHeight: cardRect.height
    };

    setIsDragging(true);

    const onPointerMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - dragStartRef.current.startX;
      const deltaY = moveEvt.clientY - dragStartRef.current.startY;

      let newX = dragStartRef.current.initialX + deltaX;
      let newY = dragStartRef.current.initialY + deltaY;

      // Restrict anywhere across the entire browser window
      const maxX = window.innerWidth - dragStartRef.current.cardWidth - 8;
      const maxY = window.innerHeight - dragStartRef.current.cardHeight - 8;

      newX = Math.max(8, Math.min(newX, Math.max(8, maxX)));
      newY = Math.max(8, Math.min(newY, Math.max(8, maxY)));

      setPosition({ x: newX, y: newY });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleSnapTop = () => {
    if (!cardRef.current) {
      setPosition({ x: 20, y: 16 });
      return;
    }
    const cardWidth = cardRef.current.offsetWidth || 560;
    setPosition({
      x: Math.max(12, Math.round((window.innerWidth - cardWidth) / 2)),
      y: 16
    });
  };

  const handleResetBottom = () => {
    setPosition(null);
  };

  const hasContent =
    latestEvent &&
    latestEvent.text &&
    latestEvent.type !== 'system_join' &&
    latestEvent.type !== 'system_lang_change';

  return (
    <aside
      ref={cardRef}
      aria-label="Live Subtitles"
      style={
        position
          ? {
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 9999,
              margin: 0,
              transform: 'none',
              width: 'min(92vw, 640px)'
            }
          : {
              position: 'fixed',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              width: 'min(92vw, 640px)'
            }
      }
      className="pointer-events-none transition-shadow select-none"
    >
      <div className="w-full pointer-events-auto">
        {hasContent ? (
          <div
            className={`bg-[#161b22]/98 backdrop-blur-md border ${
              isDragging
                ? 'border-blue-400 ring-1 ring-blue-500/50 shadow-xl'
                : 'border-[#2d333b] shadow-xl'
            } rounded-2xl p-3 text-center transition-all duration-150`}
          >
            {/* Header: Speaker identity + Drag handle + Quick alignment buttons */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d333b] text-xs">
              
              {/* Speaker Tag */}
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="bg-[#1a2233] px-2 py-0.5 rounded-full border border-[#2d333b] text-white font-semibold text-[11px]">
                  🎙️ {latestEvent.participantName || 'Speaker'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  [{latestEvent.language?.toUpperCase() || 'EN'}]
                </span>
              </div>

              {/* Main Drag Handle (Click & Drag ANYWHERE across whole screen) */}
              <div
                onPointerDown={handlePointerDown}
                className="touch-none flex items-center gap-1.5 text-slate-300 hover:text-blue-400 bg-[#1a2233] hover:bg-[#242d3d] px-3 py-1 rounded-lg cursor-grab active:cursor-grabbing border border-[#2d333b] transition shadow-sm select-none"
                title="Puri screen par kahin bhi drag karke le jayein"
              >
                <GripHorizontal className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-semibold text-slate-200 hidden sm:inline">
                  {getUIText('dragAnywhere', selectedLanguage)}
                </span>
              </div>

              {/* Action Buttons: Snap Top / Reset / Minimize */}
              <div className="flex items-center gap-1">
                {position && (
                  <button
                    onClick={handleResetBottom}
                    className="text-[10px] bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 hover:text-white px-2 py-1 rounded border border-[#2d333b] flex items-center gap-1 cursor-pointer transition"
                    title="Reset to default bottom center"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">{getUIText('bottom', selectedLanguage)}</span>
                  </button>
                )}
                <button
                  onClick={handleSnapTop}
                  className="text-[10px] bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 hover:text-white px-2 py-1 rounded border border-[#2d333b] flex items-center gap-1 cursor-pointer transition"
                  title="Snap to top of screen"
                >
                  <ArrowUp className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">{getUIText('top', selectedLanguage)}</span>
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-[10px] bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 hover:text-white p-1 rounded border border-[#2d333b] cursor-pointer transition"
                  title={isMinimized ? 'Expand Subtitles' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </button>
              </div>

            </div>

            {/* Subtitle Content (collapsible when minimized) */}
            {!isMinimized && (
              <div className="space-y-1.5">
                {/* Original Speech Line */}
                <p className="text-sm sm:text-base font-medium text-slate-100 tracking-wide leading-relaxed font-sans">
                  "{latestEvent.text}"
                </p>

                {/* Highlighted Target Translation Line */}
                {latestEvent.translation && (
                  <div className="pt-1.5 border-t border-[#2d333b] flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30 shrink-0">
                      {getUIText('translationBadge', selectedLanguage)}
                    </span>
                    <p className="text-sm sm:text-base font-bold text-blue-300 tracking-wide leading-relaxed">
                      {latestEvent.translation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Subtle Initial Draggable Pill */
          <div
            onPointerDown={handlePointerDown}
            className={`touch-none bg-[#161b22]/95 backdrop-blur-md border ${
              isDragging ? 'border-blue-400 ring-1 ring-blue-500/40' : 'border-[#2d333b]'
            } text-slate-300 text-xs py-2 px-4 rounded-full text-center max-w-md mx-auto shadow-xl flex items-center justify-center gap-2 cursor-grab active:cursor-grabbing select-none transition`}
            title="Puri screen par kahin bhi drag karke position set karein"
          >
            <GripHorizontal className="w-4 h-4 text-blue-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>{getUIText('subtitlesPlaceholder', selectedLanguage)}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
