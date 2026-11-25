import React, { useState } from 'react';
import {
  Languages,
  BookOpen,
  Search,
  Sparkles,
  Copy,
  Check,
  FileText,
  List,
  Clock,
  ArrowRight,
  ArrowLeftRight,
  Volume2,
  VolumeX,
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown
} from 'lucide-react';
import tts from '../services/tts';
import { getUIText } from '../services/uiTranslations';

export default function RightTranslatorPanel({
  events = [],
  onSaveTranslation,
  currentSocketId,
  selectedLanguage = 'en'
}) {
  const [viewMode, setViewMode] = useState('paragraph'); // 'paragraph' | 'sentence'
  const [copied, setCopied] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  
  // User Requested: Switch between English -> Hindi and Hindi -> English by clicking middle arrow
  const [langDirection, setLangDirection] = useState('en-to-hi'); // 'en-to-hi' | 'hi-to-en'

  // User Requested: One-by-one selection and Clear All Notes functionality
  const [deletedNoteIds, setDeletedNoteIds] = useState(new Set());
  const [selectedNoteIds, setSelectedNoteIds] = useState(new Set());
  // User Requested: jo abhi latest bola hai vo sab se upar dikhaye
  const [timeOrder, setTimeOrder] = useState('desc'); // 'desc' = latest spoken at the top

  // Group events into cohesive lecture paragraphs by speaker and time cluster
  const buildParagraphs = () => {
    // User Requested: System join announcement notes me sirf ek baar aaye, baar baar repeat na ho
    const seenJoinUsers = new Set();

    const validEvents = events
      .filter(e => {
        if (deletedNoteIds.has(e.eventId)) return false;
        if (!e.translation?.trim() && !e.text?.trim()) return false;
        if (e.type === 'system_lang_change') return false;

        const isJoinEvent =
          e.type === 'system_join' ||
          (e.text && (e.text.includes('joined the class') || e.text.includes('joined the room'))) ||
          (e.translation && (e.translation.includes('शामिल हुए') || e.translation.includes('कक्षा में शामिल')));

        if (isJoinEvent) {
          const userKey = (e.participantName || '').trim().toLowerCase();
          if (seenJoinUsers.has(userKey)) {
            return false; // Skip duplicate join notices: only show ONCE in notes!
          }
          seenJoinUsers.add(userKey);
          return true; // Keep only the first join notice
        }

        return true;
      })
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); // Strictly chronological (pehle bola wo pehle)
    if (!validEvents.length) return [];

    const paragraphs = [];
    let currentPara = null;

    validEvents.forEach((evt) => {
      // If en-to-hi: primary text is Hindi translation, secondary is original English
      // If hi-to-en: primary text is English original/translation, secondary is Hindi
      const primaryText = langDirection === 'en-to-hi' ? (evt.translation || evt.text) : (evt.text || evt.translation);
      const secondaryText = langDirection === 'en-to-hi' ? evt.text : (evt.translation || evt.text);
      const speaker = evt.participantName || 'Speaker';
      const timeStr = new Date(evt.timestamp || Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const isJoin =
        evt.type === 'system_join' ||
        (evt.text && (evt.text.includes('joined the class') || evt.text.includes('joined the room'))) ||
        (evt.translation && (evt.translation.includes('शामिल हुए') || evt.translation.includes('कक्षा में शामिल')));

      // System join messages should stand alone as a single clean badge, NEVER concatenated repeatedly!
      if (isJoin) {
        if (currentPara) {
          paragraphs.push(currentPara);
          currentPara = null;
        }
        paragraphs.push({
          id: evt.eventId,
          eventIds: [evt.eventId],
          speaker,
          language: evt.language,
          startTime: timeStr,
          endTime: timeStr,
          lastTimestamp: evt.timestamp,
          isSystemJoin: true,
          sentences: [primaryText],
          originalSentences: [secondaryText]
        });
        return;
      }

      // Group speech if same speaker and within 90 seconds
      if (
        currentPara &&
        !currentPara.isSystemJoin &&
        currentPara.speaker === speaker &&
        evt.timestamp - currentPara.lastTimestamp < 90000
      ) {
        currentPara.sentences.push(primaryText);
        currentPara.originalSentences.push(secondaryText);
        currentPara.eventIds.push(evt.eventId);
        currentPara.lastTimestamp = evt.timestamp;
        currentPara.endTime = timeStr;
      } else {
        if (currentPara) paragraphs.push(currentPara);
        currentPara = {
          id: evt.eventId,
          eventIds: [evt.eventId],
          speaker,
          language: evt.language,
          startTime: timeStr,
          endTime: timeStr,
          lastTimestamp: evt.timestamp,
          isSystemJoin: false,
          sentences: [primaryText],
          originalSentences: [secondaryText]
        };
      }
    });

    if (currentPara) paragraphs.push(currentPara);
    return timeOrder === 'desc' ? [...paragraphs].reverse() : paragraphs;
  };

  const paragraphs = buildParagraphs();

  // Combine full lecture notes text for 1-click copy
  const fullLectureNotes = paragraphs
    .map(p => `[${p.startTime}] ${p.speaker}:\n${p.sentences.join(' ')}\n`)
    .join('\n');

  const handleCopyNotes = () => {
    if (!fullLectureNotes.trim()) return;
    navigator.clipboard.writeText(fullLectureNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Toggle Selection of an individual paragraph note
  const toggleSelectNote = (id) => {
    setSelectedNoteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllNotesSelected = paragraphs.length > 0 && paragraphs.every(p => selectedNoteIds.has(p.id));

  const handleToggleSelectAllNotes = () => {
    if (isAllNotesSelected) {
      setSelectedNoteIds(new Set());
    } else {
      setSelectedNoteIds(new Set(paragraphs.map(p => p.id)));
    }
  };

  // Delete single paragraph note
  const handleDeleteSingleNote = (p) => {
    if (window.confirm('Delete this lecture note paragraph?')) {
      setDeletedNoteIds(prev => {
        const next = new Set(prev);
        p.eventIds.forEach(id => next.add(id));
        return next;
      });
      setSelectedNoteIds(prev => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
    }
  };

  // Delete selected notes in bulk
  const handleDeleteSelectedNotes = () => {
    if (!selectedNoteIds.size) return;
    if (window.confirm(`Delete ${selectedNoteIds.size} selected note(s)?`)) {
      setDeletedNoteIds(prev => {
        const next = new Set(prev);
        paragraphs
          .filter(p => selectedNoteIds.has(p.id))
          .forEach(p => p.eventIds.forEach(id => next.add(id)));
        return next;
      });
      setSelectedNoteIds(new Set());
    }
  };

  // User Requested: Clear All Notes
  const handleClearAllNotes = () => {
    if (!paragraphs.length) return;
    if (window.confirm('Are you sure you want to CLEAR ALL lecture notes?')) {
      const allIds = new Set(deletedNoteIds);
      paragraphs.forEach(p => p.eventIds.forEach(id => allIds.add(id)));
      setDeletedNoteIds(allIds);
      setSelectedNoteIds(new Set());
    }
  };

  return (
    <div className="bg-[#141d2b] border border-[#2d333b] rounded-2xl flex flex-col h-full shadow-xl overflow-hidden select-none">
      
      {/* 1. Header with View Toggle & Interactive Middle Arrow Swap Button */}
      <div className="p-3 bg-[#141d2b] border-b border-[#2d333b] flex items-center justify-between gap-2 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              {getUIText('lectureNotes', selectedLanguage)}
            </h2>
            <p className="text-[10px] text-slate-400">
              {langDirection === 'en-to-hi' ? `English ➔ ${getUIText('notesSuffix', selectedLanguage)}` : `${getUIText('notesSuffix', selectedLanguage)} ➔ English`}
            </p>
          </div>
        </div>

        {/* User-Requested: Interactive Language Switcher via Middle Arrow Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1a2538] border border-[#2d333b] rounded-xl shadow-sm">
            <span className={`text-xs font-extrabold tracking-wide ${
              langDirection === 'en-to-hi' ? 'text-white' : 'text-blue-300'
            }`}>
              {langDirection === 'en-to-hi' ? 'English' : 'Hindi'}
            </span>

            {/* Clickable Middle Arrow Button */}
            <button
              onClick={() => setLangDirection(prev => prev === 'en-to-hi' ? 'hi-to-en' : 'en-to-hi')}
              className="p-1 rounded-lg hover:bg-[#242d3d] text-blue-400 hover:text-white transition cursor-pointer hover:scale-110 active:scale-95"
              title="Click this middle arrow to switch between English ➔ Hindi and Hindi ➔ English!"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
            </button>

            <span className={`text-xs font-extrabold tracking-wide ${
              langDirection === 'en-to-hi' ? 'text-blue-300' : 'text-white'
            }`}>
              {langDirection === 'en-to-hi' ? 'Hindi' : 'English'}
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#1a2538] border border-[#2d333b] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('paragraph')}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                viewMode === 'paragraph'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Paragraph View"
            >
              {getUIText('paragraphView', selectedLanguage)}
            </button>
            <button
              onClick={() => setViewMode('sentence')}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition cursor-pointer ${
                viewMode === 'sentence'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cards View"
            >
              {getUIText('cardsView', selectedLanguage)}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Toolbar: Copy, TTS, Clear All Notes & Selection Actions */}
      <div className="px-3 py-2 bg-[#111827] border-b border-[#2d333b] flex items-center justify-between shrink-0 text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {paragraphs.length > 0 && (
            <button
              onClick={handleToggleSelectAllNotes}
              className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none"
              title="Select all notes"
            >
              {isAllNotesSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{getUIText('selectAll', selectedLanguage)}</span>
            </button>
          )}

          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{paragraphs.length}</span>
          </span>

          {/* Time Order Toggle Button (User requested: latest spoken on top by default) */}
          <button
            onClick={() => setTimeOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer border ${
              timeOrder === 'desc'
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-[#1a2538] text-slate-400 border-[#2d333b] hover:text-white'
            }`}
            title={timeOrder === 'desc' ? 'Latest speech sab se upar dikh rahi hai' : 'Purani speech pehle'}
          >
            <ArrowUpDown className="w-3 h-3 text-blue-400" />
            <span>{timeOrder === 'desc' ? getUIText('timeOrderLatest', selectedLanguage) : getUIText('timeOrderOldest', selectedLanguage)}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Delete Selected Notes */}
          {selectedNoteIds.size > 0 && (
            <button
              onClick={handleDeleteSelectedNotes}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow"
            >
              <Trash2 className="w-3 h-3" />
              <span>{getUIText('deleteSelected', selectedLanguage)} ({selectedNoteIds.size})</span>
            </button>
          )}

          {/* User-Requested: Clear All Notes Button */}
          <button
            onClick={handleClearAllNotes}
            disabled={!paragraphs.length}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer border ${
              paragraphs.length
                ? 'bg-blue-950/80 hover:bg-blue-900 text-blue-300 border-blue-500/40 shadow-sm'
                : 'bg-[#141d2b] text-slate-600 border-[#2d333b] cursor-not-allowed opacity-50'
            }`}
            title="Clear all lecture notes from this panel"
          >
            <Trash2 className="w-3 h-3 text-blue-400" />
            <span>{getUIText('clearAllNotes', selectedLanguage)}</span>
          </button>

          {/* Audio TTS Listen All Button */}
          <button
            onClick={() => {
              if (playingId === 'all') {
                tts.stop();
                setPlayingId(null);
              } else {
                const allNotesText = paragraphs.map(p => p.sentences.join(' ')).join('. ');
                const ttsLang = langDirection === 'en-to-hi' ? 'hi' : 'en';
                tts.speak(allNotesText, ttsLang, 1.0, () => setPlayingId(null));
                setPlayingId('all');
              }
            }}
            disabled={!paragraphs.length}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer border ${
              playingId === 'all'
                ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
                : 'bg-[#1a2538] hover:bg-[#242d3d] text-blue-300 border-[#2d333b]'
            }`}
            title="Listen to full lecture notes via browser Web Speech Synthesis API"
          >
            {playingId === 'all' ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-blue-400" />}
            <span>{playingId === 'all' ? getUIText('stopAudio', selectedLanguage) : getUIText('listenNotes', selectedLanguage)}</span>
          </button>

          {/* Copy Notes Button */}
          <button
            onClick={handleCopyNotes}
            disabled={!paragraphs.length}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer border ${
              copied
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-[#1a2538] hover:bg-[#242d3d] text-blue-400 border-[#2d333b]'
            }`}
            title="Copy entire lecture paragraph notes"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? getUIText('copied', selectedLanguage) : getUIText('copyNotes', selectedLanguage)}</span>
          </button>
        </div>
      </div>

      {/* 3. Main Translated Content Container */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {paragraphs.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <Languages className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
            <p className="text-xs font-bold text-slate-200">
              {getUIText('lectureNotes', selectedLanguage)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
              {getUIText('emptyNotesTip', selectedLanguage)}
            </p>
          </div>
        ) : viewMode === 'paragraph' ? (
          /* ──────── CONTINUOUS PARAGRAPH FORM ──────── */
          paragraphs.map((p, pIdx) => {
            const isSelected = selectedNoteIds.has(p.id);
            return (
              <div
                key={pIdx}
                className={`rounded-xl p-3.5 transition shadow-sm space-y-2 group border ${
                  isSelected
                    ? 'bg-[#1a2538] border-blue-500 ring-1 ring-blue-500/30'
                    : 'bg-[#1a2538]/80 border-[#2d333b] hover:border-[#384252]'
                }`}
              >
                {/* Speaker, Checkbox, Exact Timestamp & One-by-One Delete */}
                <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-[#2d333b]">
                  <div className="flex items-center gap-2">
                    {/* User-Requested: One-by-One Select Checkbox */}
                    <button
                      onClick={() => toggleSelectNote(p.id)}
                      className="text-slate-400 hover:text-white cursor-pointer shrink-0"
                      title={isSelected ? 'Deselect note' : 'Select note'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>

                    <span className="font-bold text-white bg-[#111827] px-2 py-0.5 rounded border border-[#2d333b]">
                      {p.speaker}
                    </span>
                    <span className="text-[10px] text-blue-400 font-mono bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-500/20">
                      {langDirection === 'en-to-hi' ? 'Hindi Notes' : 'English Notes'}
                    </span>
                  </div>
                  
                  {/* Time Stored Display, TTS Audio Play & One-by-One Delete Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (playingId === pIdx) {
                          tts.stop();
                          setPlayingId(null);
                        } else {
                          const textToSpeak = p.sentences.join(' ');
                          const ttsLang = langDirection === 'en-to-hi' ? 'hi' : 'en';
                          tts.speak(textToSpeak, ttsLang, 1.0, () => setPlayingId(null));
                          setPlayingId(pIdx);
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer border ${
                        playingId === pIdx
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-[#111827] hover:bg-[#1a2538] text-blue-400 border-[#2d333b]'
                      }`}
                      title="Speak this paragraph"
                    >
                      {playingId === pIdx ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                      <span>{playingId === pIdx ? 'Stop' : 'Listen'}</span>
                    </button>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{p.startTime}</span>
                      {p.endTime !== p.startTime && <span> - {p.endTime}</span>}
                    </div>

                    {/* User-Requested: One-by-One Delete Note Button */}
                    <button
                      onClick={() => handleDeleteSingleNote(p)}
                      className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-[#111827] transition cursor-pointer"
                      title="Delete this paragraph note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Running Flowing Lecture Paragraph */}
                <p className="text-xs sm:text-sm leading-relaxed text-slate-100 font-sans tracking-wide">
                  {p.sentences.map((sent, sIdx) => (
                    <span key={sIdx} className="mr-1.5 hover:text-blue-300 transition">
                      {sent}
                    </span>
                  ))}
                </p>

                {/* Secondary Language Tooltip/Line */}
                <div className="pt-1.5 border-t border-[#2d333b] text-[10px] text-slate-400 italic">
                  <span className="text-slate-500 font-semibold mr-1">
                    {langDirection === 'en-to-hi' ? 'Original English:' : 'Translated Hindi:'}
                  </span>
                  <span>"{p.originalSentences.join(' ')}"</span>
                </div>
              </div>
            );
          })
        ) : (
          /* ──────── CARD / LINE-BY-LINE VIEW ──────── */
          events
            .filter(e => !deletedNoteIds.has(e.eventId))
            .sort((a, b) => {
              const tA = a.timestamp || 0;
              const tB = b.timestamp || 0;
              return timeOrder === 'asc' ? tA - tB : tB - tA;
            })
            .map((evt) => (
              <div
                key={evt.eventId}
                className="bg-[#1a2538]/80 border border-[#2d333b] rounded-xl p-3 space-y-1.5 text-xs group relative"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="font-bold text-slate-200">{evt.participantName}</span>
                  <div className="flex items-center gap-2">
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    <button
                      onClick={() => {
                        setDeletedNoteIds(prev => new Set(prev).add(evt.eventId));
                      }}
                      className="text-slate-500 hover:text-blue-400 p-0.5 cursor-pointer"
                      title="Delete this note card"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-400 italic border-l border-[#2d333b] pl-2">
                  "{langDirection === 'en-to-hi' ? evt.text : (evt.translation || evt.text)}"
                </p>
                <p className="text-sm font-semibold text-blue-400">
                  {langDirection === 'en-to-hi' ? (evt.translation || evt.text) : (evt.text || evt.translation)}
                </p>
              </div>
            ))
        )}
      </div>

      {/* 4. Footer Note */}
      <div className="p-2.5 bg-[#141d2b] border-t border-[#2d333b] text-[10px] text-slate-400 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1 text-slate-400">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Interactive Language Switcher Active</span>
        </span>
        <span className="text-slate-500 font-mono">1-Click Swap & Delete</span>
      </div>

    </div>
  );
}
