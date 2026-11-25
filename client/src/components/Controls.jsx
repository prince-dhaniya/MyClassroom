import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Globe,
  Download,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Volume2,
  VolumeX,
  MonitorUp
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/translator';
import { getUIText } from '../services/uiTranslations';

export default function Controls({
  isListening,
  onToggleMic,
  isCameraOn,
  onToggleCamera,
  isScreenSharing = false,
  onToggleScreenShare,
  selectedLanguage,
  onChangeLanguage,
  autoSpeak = false,
  onToggleAutoSpeak,
  onExport,
  onSimulateSpeech,
  isSpeechRecognitionSupported,
  onOpenTroubleshoot
}) {
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const demoPhrases = [
    {
      lang: 'en',
      text: 'Good morning class, today we will study binary search and time complexity.',
      confidence: 0.98,
      speaker: 'Prof. Sharma (Teacher)'
    },
    {
      lang: 'hi',
      text: 'नमस्ते छात्रों, आज हम डेटा स्ट्रक्चर्स और एल्गोरिदम का अध्ययन करेंगे।',
      confidence: 0.96,
      speaker: 'Prof. Sharma (Teacher)'
    },
    {
      lang: 'mr',
      text: 'नमस्कार, आज आपण बायनरी सर्च अल्गोरिदम शिकणार आहोत.',
      confidence: 0.94,
      speaker: 'Prof. Sharma (Teacher)'
    },
    {
      lang: 'es',
      text: 'Buenos días estudiantes, bienvenidos a la clase de estructuras de datos.',
      confidence: 0.95,
      speaker: 'Prof. Sharma (Teacher)'
    },
    {
      lang: 'en',
      text: 'Sir, what is the worst-case time complexity of this algorithm?',
      confidence: 0.92,
      speaker: 'Aman Patel (Student)'
    },
    {
      lang: 'hi',
      text: 'सर, क्या बाइनरी सर्च केवल सॉर्टेड एरे पर काम करता है?',
      confidence: 0.78, // Low confidence to demo amber uncertainty highlight!
      speaker: 'Priya Singh (Student)'
    }
  ];

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="bg-[#161b22] border-t border-[#2d333b] p-3 sm:p-4 shadow-lg relative z-40 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Main Audio & Video Toggles (Always prominent and visible!) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Prominent Microphone Button: When Mic is OFF shows "MIC ON", when Mic is ON shows "MIC OFF" */}
          <button
            onClick={onToggleMic}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 cursor-pointer ${
              isListening
                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/30'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            title={isListening ? 'Click to Turn Off Microphone' : 'Click to Turn On Microphone'}
          >
            {isListening ? (
              <>
                <div className="relative">
                  <MicOff className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                </div>
                <span>{getUIText('micOff', selectedLanguage)}</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-white" />
                <span>{getUIText('micOn', selectedLanguage)}</span>
              </>
            )}
          </button>

          {/* Camera On / Off Button */}
          <button
            onClick={onToggleCamera}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer border ${
              isCameraOn
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow'
                : 'bg-[#1a2233] hover:bg-[#242d3d] text-slate-200 border-[#2d333b] hover:text-white'
            }`}
            title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
          >
            {isCameraOn ? (
              <>
                <Camera className="w-5 h-5 text-blue-200" />
                <span>{getUIText('camOff', selectedLanguage)}</span>
              </>
            ) : (
              <>
                <CameraOff className="w-5 h-5 text-slate-400" />
                <span>{getUIText('camOn', selectedLanguage)}</span>
              </>
            )}
          </button>

          {/* Screen Share Button */}
          {onToggleScreenShare && (
            <button
              onClick={onToggleScreenShare}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer border ${
                isScreenSharing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-400 shadow'
                  : 'bg-[#1a2233] hover:bg-[#242d3d] text-slate-200 border-[#2d333b] hover:text-white'
              }`}
              title={isScreenSharing ? 'Stop sharing screen' : 'Share your screen with class'}
            >
              <MonitorUp className={`w-5 h-5 ${isScreenSharing ? 'text-white' : 'text-blue-400'}`} />
              <span>{isScreenSharing ? getUIText('stopShare', selectedLanguage) : getUIText('shareScreen', selectedLanguage)}</span>
            </button>
          )}

          {/* Speaking Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#1a2233] hover:bg-[#242d3d] text-white border border-[#2d333b] rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
              title="Change speech recognition & translation language"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>{currentLangObj.flag} {currentLangObj.label} ({currentLangObj.code.toUpperCase()})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Language Selection Menu */}
            {showLangMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-[#161b22] border border-[#2d333b] rounded-xl shadow-2xl p-2 z-50 max-h-64 overflow-y-auto space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 border-b border-[#2d333b]">
                  {getUIText('selectLang', selectedLanguage)}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onChangeLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                      selectedLanguage === lang.code
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-[#1a2233] hover:text-white'
                    }`}
                  >
                    <span>{lang.flag} {lang.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">{lang.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Free Browser Text-to-Speech (TTS) Auto-Readout Toggle */}
          <button
            onClick={onToggleAutoSpeak}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer shadow-sm ${
              autoSpeak
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow'
                : 'bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 hover:text-white border-[#2d333b]'
            }`}
            title="Read translated lecture aloud using browser Speech Synthesis"
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{getUIText('autoTts', selectedLanguage)}:</span>
            <span>{autoSpeak ? getUIText('audioOn', selectedLanguage) : getUIText('audioOff', selectedLanguage)}</span>
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenTroubleshoot}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1a2233] hover:bg-[#242d3d] text-slate-300 hover:text-white rounded-xl text-xs border border-[#2d333b] cursor-pointer transition"
            title="Permission Troubleshooting Guide"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">{getUIText('help', selectedLanguage)}</span>
          </button>

        </div>

        {/* Right: Quick Speech Simulator & Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Quick Speech Simulator (Bilingual Demo) */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#1a2233] hover:bg-[#242d3d] text-blue-400 border border-[#2d333b] rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{getUIText('simulateSpeech', selectedLanguage)}</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">{getUIText('demoBadge', selectedLanguage)}</span>
            </button>

            {showDemoMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-80 sm:w-96 bg-[#161b22] border border-[#2d333b] rounded-xl shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#2d333b]">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Quick Speech Simulator (No Mic Needed)</span>
                  </span>
                  <button onClick={() => setShowDemoMenu(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {demoPhrases.map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSimulateSpeech(phrase);
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-[#1a2233] hover:bg-blue-600/20 border border-[#2d333b] hover:border-blue-500 transition cursor-pointer text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-semibold text-slate-300">{phrase.speaker}</span>
                        <span className="uppercase font-mono text-[9px] bg-[#0d1117] px-1 rounded text-slate-300">{phrase.lang}</span>
                      </div>
                      <p className="text-white font-medium truncate">{phrase.text}</p>
                      <p className="text-blue-300 text-[11px] truncate mt-0.5">{phrase.trans}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-1 bg-[#1a2233] border border-[#2d333b] rounded-xl p-1">
            <button
              onClick={() => onExport('txt')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1117] hover:bg-[#242d3d] text-slate-200 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer"
              title="Download TXT Transcript"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>{getUIText('exportTxt', selectedLanguage)}</span>
            </button>
            <button
              onClick={() => onExport('csv')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0d1117] hover:bg-[#242d3d] text-slate-200 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer"
              title="Download CSV Spreadsheet"
            >
              <span>{getUIText('exportCsv', selectedLanguage)}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
