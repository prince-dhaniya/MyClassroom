import React, { useState } from 'react';
import {
  Edit3,
  Check,
  X,
  Languages,
  AlertTriangle,
  Sparkles,
  User,
  Volume2,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import tts from '../services/tts';

export default function TranscriptItem({
  event,
  onSaveEdit,
  onSaveTranslation,
  isSelected = false,
  onToggleSelect,
  onDeleteSingle,
  isSelf
}) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(event.text || '');
  
  const [isEditingTranslation, setIsEditingTranslation] = useState(false);
  const [editTranslationText, setEditTranslationText] = useState(event.translation || '');

  const isLowConfidence = event.confidence !== undefined && event.confidence !== null && event.confidence < 0.85;
  const isPartial = event.status === 'partial';
  const isCorrected = event.status === 'corrected';

  const timeFormatted = new Date(event.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Dedicated Card for User Join and Language Selection Events in History
  if (event.type === 'system_join' || event.type === 'system_lang_change') {
    const isJoin = event.type === 'system_join';
    return (
      <div className={`rounded-xl p-2.5 px-3.5 my-1.5 flex items-center justify-between gap-3 text-xs border shadow-sm transition ${
        isSelected
          ? 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/50'
          : isJoin
          ? 'bg-gradient-to-r from-blue-950/80 via-[#131920] to-[#0d1117] border-blue-500/40 text-blue-200'
          : 'bg-gradient-to-r from-blue-950/80 via-[#131920] to-[#0d1117] border-blue-500/40 text-blue-300'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleSelect && (
            <button
              onClick={onToggleSelect}
              className="text-slate-400 hover:text-white cursor-pointer shrink-0"
              title={isSelected ? 'Deselect' : 'Select'}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
            </button>
          )}
          <span className="text-base shrink-0">{isJoin ? '👋' : '🌐'}</span>
          <div className="min-w-0">
            <div className="font-bold text-white text-xs truncate">
              {event.text}
            </div>
            {event.translation && (
              <p className="text-[11px] text-slate-300 font-sans mt-0.5 truncate">
                {event.translation}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-400 font-mono bg-[#0d1117] px-2 py-0.5 rounded border border-[#2d333b]">
            {timeFormatted}
          </span>
          {onDeleteSingle && (
            <button
              onClick={onDeleteSingle}
              className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-[#1a2233] transition cursor-pointer"
              title="Delete this event"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (editText.trim() && editText.trim() !== event.text) {
      onSaveEdit(event.eventId, editText.trim());
    }
    setIsEditingText(false);
  };

  const handleTranslationSubmit = (e) => {
    e.preventDefault();
    onSaveTranslation(event.eventId, editTranslationText.trim());
    setIsEditingTranslation(false);
  };

  return (
    <div
      className={`group relative rounded-2xl p-4 transition border ${
        isSelected
          ? 'border-blue-500 ring-1 ring-blue-500/50 bg-[#161f2e] shadow-md'
          : isPartial
          ? 'bg-[#161f2e]/80 border-blue-400/40 shadow-sm'
          : isCorrected
          ? 'bg-[#131920]/90 border-blue-500/30 hover:border-blue-500/50'
          : 'bg-[#111820] border-[#2d333b] hover:border-[#384252]'
      }`}
    >
      {/* Top Meta Header: Select Checkbox, Speaker, Time, Badges, Delete */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          
          {/* User-Requested: One-by-One Select Checkbox */}
          {onToggleSelect && (
            <button
              onClick={onToggleSelect}
              className="text-slate-400 hover:text-white cursor-pointer shrink-0 -ml-1 mr-0.5 transition"
              title={isSelected ? 'Deselect this item' : 'Select this item'}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
              )}
            </button>
          )}

          {/* Avatar Icon */}
          <div className="w-6 h-6 rounded-full bg-[#1a2233] border border-[#2d333b] flex items-center justify-center text-[11px] font-bold text-blue-400">
            {event.participantName ? event.participantName.charAt(0).toUpperCase() : 'U'}
          </div>

          {/* Speaker Name */}
          <span className="text-xs font-bold text-slate-100">
            {event.participantName}
          </span>

          {isSelf && (
            <span className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.2 rounded font-medium">
              You
            </span>
          )}

          {/* Language Flag Badge */}
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#1a2233] text-slate-300 border border-[#2d333b]">
            {event.language === 'hi' ? 'HI' : 'EN'}
          </span>

          {/* Status Badges */}
          {isPartial && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.2 rounded-full font-medium animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Interim Speech...
            </span>
          )}

          {isCorrected && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-blue-950/80 text-blue-400 border border-blue-500/40 px-2 py-0.2 rounded-full font-medium">
              <Check className="w-3 h-3" />
              Corrected
            </span>
          )}

          {/* Confidence Indicator */}
          {isLowConfidence && !isCorrected && (
            <span
              className="inline-flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-0.2 rounded-full font-medium cursor-help"
              title={`Speech engine confidence: ${Math.round((event.confidence || 0) * 100)}% (Uncertain prediction)`}
            >
              <AlertTriangle className="w-3 h-3" />
              Uncertain ({Math.round((event.confidence || 0) * 100)}%)
            </span>
          )}
        </div>

        {/* Right Timestamp & Action buttons (Edit & Delete One-by-One) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">
            {timeFormatted}
          </span>

          {/* Inline Edit Trigger */}
          {!isEditingText && (
            <button
              onClick={() => {
                setEditText(event.text || '');
                setIsEditingText(true);
              }}
              className="opacity-60 group-hover:opacity-100 hover:text-blue-400 p-1 rounded-md text-slate-400 hover:bg-[#1a2233] transition cursor-pointer text-xs flex items-center gap-1"
              title="Edit caption text"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Edit</span>
            </button>
          )}

          {/* User-Requested: One-by-One Single Delete Button */}
          {onDeleteSingle && (
            <button
              onClick={onDeleteSingle}
              className="opacity-50 group-hover:opacity-100 hover:text-blue-400 p-1 rounded-md text-slate-400 hover:bg-[#1a2233] transition cursor-pointer"
              title="Delete this caption from history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Original Speech Caption */}
      <div className="mb-2">
        {isEditingText ? (
          <form onSubmit={handleTextSubmit} className="space-y-2 mt-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full bg-[#0d1117] border border-blue-500/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-xl p-2.5 text-sm transition outline-none font-sans"
              autoFocus
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditingText(false)}
                className="px-2.5 py-1 text-xs bg-[#1a2233] text-slate-300 hover:bg-[#242d3d] rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Save & Broadcast
              </button>
            </div>
          </form>
        ) : (
          <p
            onClick={() => {
              setEditText(event.text || '');
              setIsEditingText(true);
            }}
            className={`text-sm sm:text-base leading-relaxed tracking-wide cursor-pointer transition rounded px-1 -mx-1 ${
              isLowConfidence
                ? 'bg-blue-500/15 text-blue-200 border-l-2 border-blue-500 pl-2'
                : 'text-slate-100 hover:bg-slate-800/40'
            }`}
            title="Click to edit transcript"
          >
            {event.text || <span className="text-slate-500 italic">Listening for speech...</span>}
          </p>
        )}
      </div>

      {/* Multilingual Translation Line (Offline/Manual) */}
      <div className="pt-2 border-t border-[#2d333b] flex items-start justify-between gap-3 text-xs">
        <div className="flex-1">
          {isEditingTranslation ? (
            <form onSubmit={handleTranslationSubmit} className="space-y-1.5 mt-1">
              <input
                type="text"
                value={editTranslationText}
                onChange={(e) => setEditTranslationText(e.target.value)}
                placeholder="Enter translation (e.g. Hindi or English meaning)..."
                className="w-full bg-[#0d1117] border border-[#2d333b] focus:border-blue-500 text-white rounded-lg px-2.5 py-1.5 text-xs transition outline-none"
                autoFocus
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingTranslation(false)}
                  className="px-2 py-0.5 text-[11px] bg-[#1a2233] text-slate-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 text-[11px] bg-blue-600 text-white font-bold rounded cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-start gap-2 bg-[#0d1117] p-2 rounded-xl border border-[#2d333b]">
              <span className="text-xs shrink-0 mt-0.5">🇮🇳</span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wide">
                  Hindi Translation:
                </span>
                {event.translation ? (
                  <div>
                    <span className="text-sm text-blue-100 font-medium block mt-0.5 leading-snug">
                      {event.translation}
                    </span>
                    <button
                      onClick={() => tts.speak(event.translation, 'hi')}
                      className="mt-1.5 flex items-center gap-1 text-[10px] bg-[#161b22] hover:bg-blue-600 text-blue-400 hover:text-white px-2 py-0.5 rounded border border-[#2d333b] transition cursor-pointer font-semibold shadow-sm"
                      title="Listen aloud in Hindi (Browser Web Speech Synthesis)"
                    >
                      <Volume2 className="w-2.5 h-2.5" />
                      <span>Speak Translation</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-500 italic text-xs">Translating...</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Translation edit trigger */}
        {!isEditingTranslation && (
          <button
            onClick={() => {
              setEditTranslationText(event.translation || '');
              setIsEditingTranslation(true);
            }}
            className="text-[10px] text-slate-400 hover:text-blue-400 underline transition cursor-pointer shrink-0"
          >
            {event.translation ? 'Edit Translation' : '+ Add Translation'}
          </button>
        )}
      </div>

    </div>
  );
}
