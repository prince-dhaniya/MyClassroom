/**
 * Full Application Multilingual Localization (i18n)
 * Translates the entire screen text into the user's selected language.
 * Core identity like "My classRoom" logo and Room ID are kept intact as requested.
 */

export const UI_TRANSLATIONS = {
  en: {
    // Header
    liveClass: 'Live Class',
    room: 'Room',
    connected: 'Connected',
    reconnecting: 'Reconnecting',
    disconnected: 'Disconnected',
    peer: 'Peer',
    peers: 'Peers',
    leave: 'Leave',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    switchTheme: 'Switch Theme',

    // Controls
    micOn: 'MIC ON',
    micOff: 'MIC OFF',
    camOn: 'CAMERA ON',
    camOff: 'CAMERA OFF',
    shareScreen: 'SHARE SCREEN',
    stopShare: 'STOP SHARING',
    selectLang: 'Select Speaking Language',
    autoTts: 'Auto-TTS',
    audioOn: 'Audio ON',
    audioOff: 'Audio OFF',
    simulateSpeech: 'Simulate Speech',
    demoBadge: 'Demo',
    help: 'Help',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: 'CLASSROOM',
    faces: 'Faces',
    inviteGuide: 'Invite / Guide',
    you: 'You',
    host: 'HOST',
    screen: 'Screen',
    professorRole: 'Professor / Host',
    studentRole: 'Student',

    // Floating Subtitles
    liveSpeaking: 'Live speaking...',
    finalSubtitle: 'Final Subtitle',
    dragAnywhere: 'Drag Anywhere on Screen',
    top: 'Top',
    bottom: 'Bottom',
    translationBadge: 'Translation',
    subtitlesPlaceholder: 'Subtitles will stream here live (Drag anywhere on screen)',

    // Lecture Notes
    lectureNotes: 'Lecture Notes',
    notesSuffix: 'Notes',
    paragraphView: 'Paragraph',
    cardsView: 'Cards',
    selectAll: 'Select All',
    clearAllNotes: 'Clear All Notes',
    deleteSelected: 'Delete Selected',
    listenNotes: 'Listen Notes',
    stopAudio: 'Stop Audio',
    copyNotes: 'Copy Notes',
    copied: 'Copied!',
    timeOrderLatest: 'Latest Spoken (Top)',
    timeOrderOldest: 'Time Order (Oldest First)',
    originalLabel: 'Original',
    translatedLabel: 'Translated',
    emptyNotesTip: 'Speak into microphone — cohesive lecture notes will appear here live!',

    // History Drawer
    classVoiceHistory: 'Class Voice History',
    storedSpeeches: 'Stored Speeches',
    clickToSlide: 'Click to Slide Open History',
    clickToMinimize: 'Click to Minimize',
    searchHistoryPlaceholder: 'Search history by speaker or words...',
    uncertainFilter: 'Uncertain (<85%)',
    clearAllHistory: 'Clear All History',
    deselect: 'Deselect',
    deleteSingleTip: 'Delete this history item?',

    // Leave Confirmation Modal
    leaveConfirmTitle: 'Are you sure you want to exit?',
    leaveConfirmDesc: 'You will be disconnected from the live classroom and returned to the home screen.',
    leaveConfirmYes: 'Yes, Exit Class',
    leaveConfirmCancel: 'Stay in Class'
  },

  hi: {
    // Header
    liveClass: 'लाइव कक्षा',
    room: 'कक्ष',
    connected: 'जुड़ा हुआ',
    reconnecting: 'पुनः जुड़ रहा है',
    disconnected: 'संपर्क टूटा',
    peer: 'सहभागी',
    peers: 'सहभागी',
    leave: 'छोड़ें',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    switchTheme: 'थीम बदलें',

    // Controls
    micOn: 'MIC ON (माइक चालू)',
    micOff: 'MIC OFF (माइक बंद)',
    camOn: 'कैमरा चालू',
    camOff: 'कैमरा बंद',
    shareScreen: 'स्क्रीन शेयर',
    stopShare: 'शेयरिंग रोकें',
    selectLang: 'बोलने की भाषा चुनें',
    autoTts: 'ऑटो-बोलें',
    audioOn: 'ऑडियो चालू',
    audioOff: 'ऑडियो बंद',
    simulateSpeech: 'भाषण सिम्युलेट',
    demoBadge: 'डेमो',
    help: 'मदद',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: 'कक्षा',
    faces: 'चेहरे',
    inviteGuide: 'आमंत्रित करें',
    you: 'आप',
    host: 'शिक्षक (होस्ट)',
    screen: 'स्क्रीन',
    professorRole: 'प्रोफेसर / शिक्षक',
    studentRole: 'विद्यार्थी',

    // Floating Subtitles
    liveSpeaking: 'बोल रहे हैं...',
    finalSubtitle: 'पूर्ण उपशीर्षक',
    dragAnywhere: 'स्क्रीन पर कहीं भी ले जाएँ',
    top: 'ऊपर',
    bottom: 'नीचे',
    translationBadge: 'अनुवाद',
    subtitlesPlaceholder: 'उपशीर्षक यहाँ लाइव दिखाई देंगे (कहीं भी खींचें)',

    // Lecture Notes
    lectureNotes: 'व्याख्यान नोट्स',
    notesSuffix: 'नोट्स',
    paragraphView: 'अनुच्छेद',
    cardsView: 'कार्ड्स',
    selectAll: 'सभी चुनें',
    clearAllNotes: 'सभी नोट्स हटाएं',
    deleteSelected: 'चुने हुए हटाएं',
    listenNotes: 'नोट्स सुनें',
    stopAudio: 'ऑडियो रोकें',
    copyNotes: 'कॉपी करें',
    copied: 'कॉपी हो गया!',
    timeOrderLatest: '🕒 नवीनतम सबसे ऊपर',
    timeOrderOldest: '⏱️ समय क्रम (पुराना पहले)',
    originalLabel: 'मूल',
    translatedLabel: 'अनुवादित',
    emptyNotesTip: 'माइक में बोलें — पूरे व्याख्यान नोट्स यहाँ लाइव तैयार होंगे!',

    // History Drawer
    classVoiceHistory: 'कक्षा आवाज़ इतिहास',
    storedSpeeches: 'सहेजे गए भाषण',
    clickToSlide: 'इतिहास देखने के लिए क्लिक करें',
    clickToMinimize: 'छोटा करने के लिए क्लिक करें',
    searchHistoryPlaceholder: 'वक्ता या शब्दों द्वारा इतिहास खोजें...',
    uncertainFilter: 'अस्पष्ट (<85%)',
    clearAllHistory: 'पूरा इतिहास हटाएं',
    deselect: 'चयन हटाएं',
    deleteSingleTip: 'क्या आप इस इतिहास को हटाना चाहते हैं?',

    // Leave Confirmation Modal
    leaveConfirmTitle: 'क्या आप वाकई बाहर निकलना चाहते हैं?',
    leaveConfirmDesc: 'आप इस लाइव कक्षा से अलग हो जाएंगे और होम स्क्रीन पर वापस चले जाएंगे।',
    leaveConfirmYes: 'हाँ, कक्षा छोड़ें',
    leaveConfirmCancel: 'कक्षा में रहें'
  },

  mr: {
    // Header
    liveClass: 'थेट वर्ग',
    room: 'कक्ष',
    connected: 'जोडले गेले',
    reconnecting: 'पुन्हा जोडत आहे',
    disconnected: 'संपर्क तुटला',
    peer: 'सहभागी',
    peers: 'सहभागी',
    leave: 'बाहेर पडा',

    // Controls
    micOn: 'MIC ON (माइक चालू)',
    micOff: 'MIC OFF (माइक बंद)',
    camOn: 'कॅमेरा चालू',
    camOff: 'कॅमेरा बंद',
    shareScreen: 'स्क्रीन शेअर',
    stopShare: 'शेअरिंग थांबवा',
    selectLang: 'बोलण्याची भाषा निवडा',
    autoTts: 'ऑटो-वाचन',
    audioOn: 'ऑडिओ चालू',
    audioOff: 'ऑडिओ बंद',
    simulateSpeech: 'भाषण चाचणी',
    demoBadge: 'डेमो',
    help: 'मदत',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: 'वर्ग',
    faces: 'चेहरे',
    inviteGuide: 'आमंत्रण',
    you: 'तुम्ही',
    host: 'होस्ट (शिक्षक)',
    screen: 'स्क्रीन',
    professorRole: 'प्राध्यापक / शिक्षक',
    studentRole: 'विद्यार्थी',

    // Floating Subtitles
    liveSpeaking: 'बोलत आहेत...',
    finalSubtitle: 'अंतिम उपशीर्षक',
    dragAnywhere: 'स्क्रीनवर कुठेही ड्रॅग करा',
    top: 'वर',
    bottom: 'खाली',
    translationBadge: 'भाषांतर',
    subtitlesPlaceholder: 'उपशीर्षके येथे थेट दिसतील (कुठेही ड्रॅग करा)',

    // Lecture Notes
    lectureNotes: 'व्याख्यान नोट्स',
    notesSuffix: 'नोट्स',
    paragraphView: 'परिच्छेद',
    cardsView: 'कार्ड्स',
    selectAll: 'सर्व निवडा',
    clearAllNotes: 'सर्व नोट्स हटवा',
    deleteSelected: 'निवडलेले हटवा',
    listenNotes: 'नोट्स ऐका',
    stopAudio: 'ऑडिओ थांबवा',
    copyNotes: 'कॉपी करा',
    copied: 'कॉपी झाले!',
    timeOrderLatest: '🕒 नवीनतम सर्वात वर',
    timeOrderOldest: '⏱️ वेळेनुसार (प्रथम आधी)',
    originalLabel: 'मूळ',
    translatedLabel: 'भाषांतरित',
    emptyNotesTip: 'माइकवर बोला — व्याख्यान नोट्स येथे थेट तयार होतील!',

    // History Drawer
    classVoiceHistory: 'वर्ग आवाज इतिहास',
    storedSpeeches: 'जतन केलेले भाषण',
    clickToSlide: 'इतिहास उघडण्यासाठी क्लिक करा',
    clickToMinimize: 'लहान करण्यासाठी क्लिक करा',
    searchHistoryPlaceholder: 'वक्ता किंवा शब्दांद्वारे इतिहास शोधा...',
    uncertainFilter: 'अस्पष्ट (<85%)',
    clearAllHistory: 'सर्व इतिहास हटवा',
    deselect: 'निवड रद्द करा',
    deleteSingleTip: 'हा इतिहास हटवायचा आहे का?',

    // Leave Confirmation Modal
    leaveConfirmTitle: 'तुम्हाला नक्की बाहेर पडायचे आहे का?',
    leaveConfirmDesc: 'तुम्ही या थेट वर्गातून डिस्कनेक्ट व्हाल आणि मुख्य स्क्रीनवर परत जाल.',
    leaveConfirmYes: 'होय, वर्ग सोडा',
    leaveConfirmCancel: 'वर्गातच रहा'
  },

  bn: {
    // Header
    liveClass: 'লাইভ ক্লাস',
    room: 'রুম',
    connected: 'সংযুক্ত',
    reconnecting: 'পুনঃসংযোগ হচ্ছে',
    disconnected: 'সংযোগ বিচ্ছিন্ন',
    peer: 'সহভাগী',
    peers: 'সহভাগী',
    leave: 'প্রস্থান',

    // Controls
    micOn: 'MIC ON (মাইক চালু)',
    micOff: 'MIC OFF (মাইক বন্ধ)',
    camOn: 'ক্যামেরা চালু',
    camOff: 'ক্যামেরা বন্ধ',
    shareScreen: 'স্ক্রিন শেয়ার',
    stopShare: 'শেয়ারিং বন্ধ',
    selectLang: 'কথা বলার ভাষা নির্বাচন করুন',
    autoTts: 'স্বয়ংক্রিয় পাঠ',
    audioOn: 'অডিও চালু',
    audioOff: 'অডিও বন্ধ',
    simulateSpeech: 'বক্তৃতা সিমুলেট',
    demoBadge: 'ডেমো',
    help: 'সাহায্য',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: 'শ্রেণিকক্ষ',
    faces: 'মুখ',
    inviteGuide: 'আমন্ত্রণ',
    you: 'আপনি',
    host: 'হোস্ট (শিক্ষক)',
    screen: 'স্ক্রিন',
    professorRole: 'অধ্যাপক / শিক্ষক',
    studentRole: 'শিক্ষার্থী',

    // Floating Subtitles
    liveSpeaking: 'কথা বলছেন...',
    finalSubtitle: 'চূড়ান্ত সাবটাইটেল',
    dragAnywhere: 'স্ক্রিনের যেকোনো জায়গায় ড্র্যাগ করুন',
    top: 'উপরে',
    bottom: 'নিচে',
    translationBadge: 'অনুবাদ',
    subtitlesPlaceholder: 'সাবটাইটেল এখানে লাইভ প্রদর্শিত হবে (যেকোনো জায়গায় ড্র্যাগ করুন)',

    // Lecture Notes
    lectureNotes: 'বক্তৃতা নোট',
    notesSuffix: 'নোট',
    paragraphView: 'অনুচ্ছেদ',
    cardsView: 'কার্ড',
    selectAll: 'সব নির্বাচন করুন',
    clearAllNotes: 'সব নোট মুছুন',
    deleteSelected: 'নির্বাচিত মুছুন',
    listenNotes: 'নোট শুনুন',
    stopAudio: 'অডিও থামান',
    copyNotes: 'কপি করুন',
    copied: 'কপি সম্পন্ন!',
    timeOrderLatest: '🕒 সবচেয়ে নতুন উপরে',
    timeOrderOldest: '⏱️ সময় অনুযায়ী (পুরনো আগে)',
    originalLabel: 'মূল',
    translatedLabel: 'অনূদিত',
    emptyNotesTip: 'মাইকে কথা বলুন — বক্তৃতা নোট এখানে লাইভ প্রদর্শিত হবে!',

    // History Drawer
    classVoiceHistory: 'ক্লাস ভয়েস ইতিহাস',
    storedSpeeches: 'সংরক্ষিত বক্তৃতা',
    clickToSlide: 'ইতিহাস দেখতে ক্লিক করুন',
    clickToMinimize: 'ছোট করতে ক্লিক করুন',
    searchHistoryPlaceholder: 'বক্তা বা শব্দ দিয়ে অনুসন্ধান করুন...',
    uncertainFilter: 'অনিশ্চিত (<85%)',
    clearAllHistory: 'সব ইতিহাস মুছুন',
    deselect: 'নির্বাচন বাতিল',
    deleteSingleTip: 'এই ইতিহাস কি মুছতে চান?',

    // Leave Confirmation Modal
    leaveConfirmTitle: 'আপনি কি নিশ্চিত যে আপনি বের হতে চান?',
    leaveConfirmDesc: 'আপনি লাইভ ক্লাস থেকে সংযোগ বিচ্ছিন্ন হবেন এবং হোম স্ক্রিনে ফিরে যাবেন।',
    leaveConfirmYes: 'হ্যাঁ, ক্লাস ত্যাগ করুন',
    leaveConfirmCancel: 'ক্লাসে থাকুন'
  },

  gu: {
    // Header
    liveClass: 'લાઇવ ક્લાસ',
    room: 'રૂમ',
    connected: 'જોડાયેલ છે',
    reconnecting: 'ફરી જોડાઈ રહ્યું છે',
    disconnected: 'સંપર્ક તૂટ્યો',
    peer: 'સહભાગી',
    peers: 'સહભાગી',
    leave: 'છોડો',

    // Controls
    micOn: 'MIC ON (માઇક ચાલુ)',
    micOff: 'MIC OFF (માઇક બંધ)',
    camOn: 'કેમેરા ચાલુ',
    camOff: 'કેમેરા બંધ',
    shareScreen: 'સ્ક્રીન શેર',
    stopShare: 'શેરિંગ બંધ',
    selectLang: 'બોલવાની ભાષા પસંદ કરો',
    autoTts: 'ઓટો-વાચન',
    audioOn: 'ઑડિયો ચાલુ',
    audioOff: 'ઑડિયો બંધ',
    simulateSpeech: 'વાણી સિમ્યુલેટ',
    demoBadge: 'ડેમો',
    help: 'મદદ',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: 'વર્ગખંડ',
    faces: 'ચહેરાઓ',
    inviteGuide: 'આમંત્રણ',
    you: 'તમે',
    host: 'યજમાન (શિક્ષક)',
    screen: 'સ્ક્રીન',
    professorRole: 'પ્રોફેસર / શિક્ષક',
    studentRole: 'વિદ્યાર્થી',

    // Floating Subtitles
    liveSpeaking: 'બોલી રહ્યા છે...',
    finalSubtitle: 'અંતિમ સબટાઈટલ',
    dragAnywhere: 'સ્ક્રીન પર ગમે ત્યાં ડ્રેગ કરો',
    top: 'ઉપર',
    bottom: 'નીચે',
    translationBadge: 'અનુવાદ',
    subtitlesPlaceholder: 'સબટાઈટલ અહીં લાઈવ જોવા મળશે (ગમે ત્યાં ડ્રેગ કરો)',

    // Lecture Notes
    lectureNotes: 'વ્યાખ્યાન નોંધો',
    notesSuffix: 'નોંધો',
    paragraphView: 'ફકરો',
    cardsView: 'કાર્ડ્સ',
    selectAll: 'બધા પસંદ કરો',
    clearAllNotes: 'બધી નોંધો કાઢી નાખો',
    deleteSelected: 'પસંદ કરેલ કાઢી નાખો',
    listenNotes: 'નોંધો સાંભળો',
    stopAudio: 'ઑડિયો રોકો',
    copyNotes: 'કૉપિ કરો',
    copied: 'કૉપિ થઈ ગયું!',
    timeOrderLatest: '🕒 સૌથી નવું સૌથી ઉપર',
    timeOrderOldest: '⏱️ સમય અનુસાર (જૂનું પહેલાં)',
    originalLabel: 'મૂળ',
    translatedLabel: 'અનુવાદિત',
    emptyNotesTip: 'માઈકમાં બોલો — નોંધો અહીં લાઈવ જોવા મળશે!',

    // History Drawer
    classVoiceHistory: 'વર્ગ વોઇસ ઇતિહાસ',
    storedSpeeches: 'સાચવેલા ભાષણો',
    clickToSlide: 'ઇતિહાસ ખોલવા ક્લિક કરો',
    clickToMinimize: 'નાનું કરવા ક્લિક કરો',
    searchHistoryPlaceholder: 'વક્તા અથવા શબ્દો દ્વારા ઇતિહાસ શોધો...',
    uncertainFilter: 'અનિશ્ચિત (<85%)',
    clearAllHistory: 'બધો ઇતિહાસ કાઢી નાખો',
    deselect: 'પસંદગી રદ કરો',
    deleteSingleTip: 'આ ઇતિહાસ કાઢી નાખવો છે?',

    // Leave Confirmation Modal
    leaveConfirmTitle: 'શું તમે ખરેખર બહાર નીકળવા માંગો છો?',
    leaveConfirmDesc: 'તમે લાઇવ ક્લાસમાંથી ડિસ્કનેક્ટ થઈ જશો અને હોમ સ્ક્રીન પર પાછા જશો.',
    leaveConfirmYes: 'હા, ક્લાસ છોડો',
    leaveConfirmCancel: 'ક્લાસમાં રહો'
  },

  ta: {
    // Header
    liveClass: 'நேரலை வகுப்பு',
    room: 'அறை',
    connected: 'இணைக்கப்பட்டது',
    reconnecting: 'மீண்டும் இணைகிறது',
    disconnected: 'இணைப்பு துண்டிக்கப்பட்டது',
    peer: 'பங்கேற்பாளர்',
    peers: 'பங்கேற்பாளர்கள்',
    leave: 'வெளியேறு',

    // Controls
    micOn: 'MIC ON (மைக் ஆன்)',
    micOff: 'MIC OFF (மைக் ஆஃப்)',
    camOn: 'கேமரா ஆன்',
    camOff: 'கேமரா ஆஃப்',
    shareScreen: 'திரையைப் பகிர்',
    stopShare: 'பகிர்வதை நிறுத்து',
    selectLang: 'பேசும் மொழியைத் தேர்ந்தெடுக்கவும்',
    autoTts: 'தானியங்கி குரல்',
    audioOn: 'ஆடியோ ஆன்',
    audioOff: 'ஆடியோ ஆஃப்',
    simulateSpeech: 'பேச்சை சோதிக்க',
    demoBadge: 'டெமோ',
    help: 'உதவி',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: 'வகுப்பறை',
    faces: 'முகங்கள்',
    inviteGuide: 'அழைப்பு',
    you: 'நீங்கள்',
    host: 'தொகுப்பாளர் (ஆசிரியர்)',
    screen: 'திரை',
    professorRole: 'பேராசிரியர் / ஆசிரியர்',
    studentRole: 'மாணவர்',

    // Floating Subtitles
    liveSpeaking: 'பேசுகிறார்...',
    finalSubtitle: 'முழு வசனம்',
    dragAnywhere: 'திரையில் எங்கும் நகர்த்தவும்',
    top: 'மேலே',
    bottom: 'கீழே',
    translationBadge: 'மொழிபெயர்ப்பு',
    subtitlesPlaceholder: 'வசனங்கள் இங்கே நேரடியாகத் தோன்றும் (எங்கும் நகர்த்தவும்)',

    // Lecture Notes
    lectureNotes: 'விரிவுரை குறிப்புகள்',
    notesSuffix: 'குறிப்புகள்',
    paragraphView: 'பத்தி',
    cardsView: 'கார்டுகள்',
    selectAll: 'அனைத்தையும் தேர்ந்தெடு',
    clearAllNotes: 'அனைத்து குறிப்புகளையும் அழி',
    deleteSelected: 'தேர்ந்தெடுத்ததை அழி',
    listenNotes: 'குறிப்புகளைக் கேளுங்கள்',
    stopAudio: 'ஆடியோவை நிறுத்து',
    copyNotes: 'நகலெடு',
    copied: 'நகலெடுக்கப்பட்டது!',
    timeOrderLatest: '🕒 புதியவை மேலே',
    timeOrderOldest: '⏱️ நேர வரிசை (பழையது முதலில்)',
    originalLabel: 'அசல்',
    translatedLabel: 'மொழிபெயர்க்கப்பட்டது',
    emptyNotesTip: 'மைக்கில் பேசுங்கள் — குறிப்புகள் இங்கே நேரடியாகத் தோன்றும்!',

    // History Drawer
    classVoiceHistory: 'வகுப்பு குரல் வரலாறு',
    storedSpeeches: 'சேமிக்கப்பட்ட உரைகள்',
    clickToSlide: 'வரலாற்றைக் காண கிளிக் செய்யவும்',
    clickToMinimize: 'சுருக்க கிளிக் செய்யவும்',
    searchHistoryPlaceholder: 'பேச்சாளர் அல்லது சொற்கள் மூலம் தேடுங்கள்...',
    uncertainFilter: 'தெளிவற்றவை (<85%)',
    clearAllHistory: 'முழு வரலாற்றையும் அழி',
    deselect: 'தேர்வை நீக்கு',
    deleteSingleTip: 'இந்த வரலாற்றை நீக்கவா?',

    // Leave Confirmation Modal
    leaveConfirmTitle: 'நீங்கள் நிச்சயம் வெளியேற விரும்புகிறீர்களா?',
    leaveConfirmDesc: 'நீங்கள் நேரலை வகுப்பிலிருந்து துண்டிக்கப்பட்டு முகப்புத் திரைக்குத் திரும்புவீர்கள்.',
    leaveConfirmYes: 'ஆம், வகுப்பிலிருந்து வெளியேறு',
    leaveConfirmCancel: 'வகுப்பில் இருங்கள்'
  },

  te: {
    // Header
    liveClass: 'లైవ్ క్లాస్',
    room: 'గది',
    connected: 'కనెక్ట్ అయింది',
    reconnecting: 'తిరిగి కనెక్ట్ అవుతోంది',
    disconnected: 'కనెక్షన్ తెగిపోయింది',
    peer: 'సభ్యుడు',
    peers: 'సభ్యులు',
    leave: 'నిష్క్రమించు',

    // Controls
    micOn: 'MIC ON (మైక్ ఆన్)',
    micOff: 'MIC OFF (మైక్ ఆఫ్)',
    camOn: 'కెమెరా ఆన్',
    camOff: 'కెమెరా ఆఫ్',
    shareScreen: 'స్క్రీన్ షేర్',
    stopShare: 'షేరింగ్ ఆపు',
    selectLang: 'మాట్లాడే భాషను ఎంచుకోండి',
    autoTts: 'ఆటో-స్పీచ్',
    audioOn: 'ఆడియో ఆన్',
    audioOff: 'ఆడియో ఆఫ్',
    simulateSpeech: 'వాయిస్ టెస్ట్',
    demoBadge: 'డెమో',
    help: 'సహాయం',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: 'తరగతి గది',
    faces: 'ముఖాలు',
    inviteGuide: 'ఆహ్వానించు',
    you: 'మీరు',
    host: 'హోస్ట్ (గురువు)',
    screen: 'స్క్రీన్',
    professorRole: 'ప్రొఫెసర్ / ఉపాధ్యాయుడు',
    studentRole: 'విద్యార్థి',

    // Floating Subtitles
    liveSpeaking: 'మాట్లాడుతున్నారు...',
    finalSubtitle: 'చివరి ఉపశీర్షిక',
    dragAnywhere: 'స్క్రీన్‌పై ఎక్కడైనా లాగండి',
    top: 'పైన',
    bottom: 'క్రింద',
    translationBadge: 'అనువాదం',
    subtitlesPlaceholder: 'ఉపశీర్షికలు ఇక్కడ ప్రత్యక్షంగా కనిపిస్తాయి (ఎక్కడైనా లాగండి)',

    // Lecture Notes
    lectureNotes: 'లెక్చర్ నోట్స్',
    notesSuffix: 'నోట్స్',
    paragraphView: 'పేరా',
    cardsView: 'కార్డులు',
    selectAll: 'అన్నీ ఎంచుకోండి',
    clearAllNotes: 'అన్ని నోట్స్ తొలగించు',
    deleteSelected: 'ఎంచుకున్నవి తొలగించు',
    listenNotes: 'నోట్స్ వినండి',
    stopAudio: 'ఆడియో ఆపు',
    copyNotes: 'కాపీ చేయండి',
    copied: 'కాపీ అయింది!',
    timeOrderLatest: '🕒 తాజావి పైన',
    timeOrderOldest: '⏱️ సమయ క్రమం (పాతవి మొదట)',
    originalLabel: 'అసలు',
    translatedLabel: 'అనువాదం',
    emptyNotesTip: 'మైక్‌లో మాట్లాడండి — నోట్స్ ఇక్కడ ప్రత్యక్షంగా కనిపిస్తాయి!',

    // History Drawer
    classVoiceHistory: 'తరగతి వాయిస్ చరిత్ర',
    storedSpeeches: 'సేవ్ చేసిన ప్రసంగాలు',
    clickToSlide: 'చరిత్రను చూడటానికి క్లిక్ చేయండి',
    clickToMinimize: 'చిన్నది చేయడానికి క్లిక్ చేయండి',
    searchHistoryPlaceholder: 'స్పీకర్ లేదా పదాల ద్వారా చరిత్రను శోధించండి...',
    uncertainFilter: 'అస్పష్టమైనవి (<85%)',
    clearAllHistory: 'మొత్తం చరిత్రను తొలగించు',
    deselect: 'ఎంపికను తొలగించు',
    deleteSingleTip: 'ఈ చరిత్రను తొలగించాలా?',

    // Leave Confirmation Modal
    leaveConfirmTitle: 'మీరు ఖచ్చితంగా నిష్క్రమించాలనుకుంటున్నారా?',
    leaveConfirmDesc: 'మీరు లైవ్ క్లాస్ నుండి డిస్‌కనెక్ట్ చేయబడతారు మరియు హోమ్ స్క్రీన్‌కు తిరిగి వస్తారు.',
    leaveConfirmYes: 'అవును, క్లాస్ వదిలివెళ్లు',
    leaveConfirmCancel: 'క్లాస్‌లోనే ఉండండి'
  },

  es: {
    // Header
    liveClass: 'Clase en Vivo',
    room: 'Sala',
    connected: 'Conectado',
    reconnecting: 'Reconectando',
    disconnected: 'Desconectado',
    peer: 'Participante',
    peers: 'Participantes',
    leave: 'Salir',

    // Controls
    micOn: 'MIC ON (Activar)',
    micOff: 'MIC OFF (Silenciar)',
    camOn: 'CÁMARA ON',
    camOff: 'CÁMARA OFF',
    shareScreen: 'COMPARTIR PANTALLA',
    stopShare: 'DETENER COMPARTIR',
    selectLang: 'Seleccionar idioma',
    autoTts: 'Lectura Auto',
    audioOn: 'Audio ON',
    audioOff: 'Audio OFF',
    simulateSpeech: 'Simular voz',
    demoBadge: 'Demo',
    help: 'Ayuda',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: 'AULA',
    faces: 'Rostros',
    inviteGuide: 'Invitar / Guía',
    you: 'Tú',
    host: 'ANFITRIÓN',
    screen: 'Pantalla',
    professorRole: 'Profesor / Anfitrión',
    studentRole: 'Estudiante',

    // Floating Subtitles
    liveSpeaking: 'Hablando en vivo...',
    finalSubtitle: 'Subtítulo final',
    dragAnywhere: 'Arrastrar por la pantalla',
    top: 'Arriba',
    bottom: 'Abajo',
    translationBadge: 'Traducción',
    subtitlesPlaceholder: 'Los subtítulos aparecerán aquí en vivo (Arrastrable)',

    // Lecture Notes
    lectureNotes: 'Notas de Clase',
    notesSuffix: 'Notas',
    paragraphView: 'Párrafo',
    cardsView: 'Tarjetas',
    selectAll: 'Seleccionar todo',
    clearAllNotes: 'Borrar todas las notas',
    deleteSelected: 'Eliminar seleccionados',
    listenNotes: 'Escuchar notas',
    stopAudio: 'Detener audio',
    copyNotes: 'Copiar notas',
    copied: '¡Copiado!',
    timeOrderLatest: '🕒 Más reciente arriba',
    timeOrderOldest: '⏱️ Orden cronológico',
    originalLabel: 'Original',
    translatedLabel: 'Traducido',
    emptyNotesTip: 'Hable por el micrófono: las notas aparecerán aquí en vivo.',

    // History Drawer
    classVoiceHistory: 'Historial de Voz de la Clase',
    storedSpeeches: 'Mensajes guardados',
    clickToSlide: 'Clic para abrir historial',
    clickToMinimize: 'Clic para minimizar',
    searchHistoryPlaceholder: 'Buscar por orador o palabras...',
    uncertainFilter: 'Incierto (<85%)',
    clearAllHistory: 'Borrar todo el historial',
    deselect: 'Deseleccionar',
    deleteSingleTip: '¿Eliminar este registro?',

    // Leave Confirmation Modal
    leaveConfirmTitle: '¿Estás seguro de que quieres salir?',
    leaveConfirmDesc: 'Te desconectarás de la clase en vivo y volverás a la pantalla de inicio.',
    leaveConfirmYes: 'Sí, salir de la clase',
    leaveConfirmCancel: 'Permanecer en clase'
  },

  fr: {
    // Header
    liveClass: 'Classe en Direct',
    room: 'Salle',
    connected: 'Connecté',
    reconnecting: 'Reconnexion',
    disconnected: 'Déconnecté',
    peer: 'Pair',
    peers: 'Pairs',
    leave: 'Quitter',

    // Controls
    micOn: 'MIC ON (Activer)',
    micOff: 'MIC OFF (Couper)',
    camOn: 'CAMÉRA ON',
    camOff: 'CAMÉRA OFF',
    shareScreen: 'PARTAGER ÉCRAN',
    stopShare: 'ARRÊTER PARTAGE',
    selectLang: 'Choisir la langue',
    autoTts: 'Lecture Auto',
    audioOn: 'Audio ON',
    audioOff: 'Audio OFF',
    simulateSpeech: 'Simuler voix',
    demoBadge: 'Démo',
    help: 'Aide',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: 'CLASSE',
    faces: 'Visages',
    inviteGuide: 'Inviter / Guide',
    you: 'Vous',
    host: 'HÔTE',
    screen: 'Écran',
    professorRole: 'Professeur / Hôte',
    studentRole: 'Étudiant',

    // Floating Subtitles
    liveSpeaking: 'En train de parler...',
    finalSubtitle: 'Sous-titre final',
    dragAnywhere: 'Glisser n\'importe où',
    top: 'Haut',
    bottom: 'Bas',
    translationBadge: 'Traduction',
    subtitlesPlaceholder: 'Les sous-titres apparaîtront ici en direct (Déplaçable)',

    // Lecture Notes
    lectureNotes: 'Notes de Cours',
    notesSuffix: 'Notes',
    paragraphView: 'Paragraphe',
    cardsView: 'Cartes',
    selectAll: 'Tout sélectionner',
    clearAllNotes: 'Effacer toutes les notes',
    deleteSelected: 'Supprimer la sélection',
    listenNotes: 'Écouter les notes',
    stopAudio: 'Arrêter l\'audio',
    copyNotes: 'Copier les notes',
    copied: 'Copié !',
    timeOrderLatest: '🕒 Plus récent en haut',
    timeOrderOldest: '⏱️ Ordre chronologique',
    originalLabel: 'Original',
    translatedLabel: 'Traduit',
    emptyNotesTip: 'Parlez dans le micro — les notes apparaîtront ici en direct.',

    // History Drawer
    classVoiceHistory: 'Historique Vocal de la Classe',
    storedSpeeches: 'Discours enregistrés',
    clickToSlide: 'Cliquer pour ouvrir l\'historique',
    clickToMinimize: 'Cliquer pour réduire',
    searchHistoryPlaceholder: 'Rechercher par locuteur ou mots...',
    uncertainFilter: 'Incertain (<85%)',
    clearAllHistory: 'Effacer tout l\'historique',
    deselect: 'Désélectionner',
    deleteSingleTip: 'Supprimer cet enregistrement ?',

    // Leave Confirmation Modal
    leaveConfirmTitle: 'Êtes-vous sûr de vouloir quitter ?',
    leaveConfirmDesc: 'Vous serez déconnecté de la classe en direct et retournerez à l\'écran d\'accueil.',
    leaveConfirmYes: 'Oui, quitter la classe',
    leaveConfirmCancel: 'Rester en classe'
  },

  de: {
    // Header
    liveClass: 'Live-Klasse',
    room: 'Raum',
    connected: 'Verbunden',
    reconnecting: 'Verbindung wird wiederhergestellt',
    disconnected: 'Getrennt',
    peer: 'Teilnehmer',
    peers: 'Teilnehmer',
    leave: 'Verlassen',

    // Controls
    micOn: 'MIC ON (Einschalten)',
    micOff: 'MIC OFF (Stummschalten)',
    camOn: 'KAMERA AN',
    camOff: 'KAMERA AUS',
    shareScreen: 'BILDSCHIRM TEILEN',
    stopShare: 'TEILEN BEENDEN',
    selectLang: 'Sprache wählen',
    autoTts: 'Auto-Vorlesen',
    audioOn: 'Audio AN',
    audioOff: 'Audio AUS',
    simulateSpeech: 'Sprache testen',
    demoBadge: 'Demo',
    help: 'Hilfe',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: 'KLASSENZIMMER',
    faces: 'Gesichter',
    inviteGuide: 'Einladen / Anleitung',
    you: 'Du',
    host: 'MODERATOR',
    screen: 'Bildschirm',
    professorRole: 'Professor / Dozent',
    studentRole: 'Student',

    // Floating Subtitles
    liveSpeaking: 'Sprachausgabe live...',
    finalSubtitle: 'Finaler Untertitel',
    dragAnywhere: 'Überall hinziehen',
    top: 'Oben',
    bottom: 'Unten',
    translationBadge: 'Übersetzung',
    subtitlesPlaceholder: 'Untertitel erscheinen hier live (Ziehbar)',

    // Lecture Notes
    lectureNotes: 'Vorlesungsnotizen',
    notesSuffix: 'Notizen',
    paragraphView: 'Absatz',
    cardsView: 'Karten',
    selectAll: 'Alle auswählen',
    clearAllNotes: 'Alle Notizen löschen',
    deleteSelected: 'Ausgewählte löschen',
    listenNotes: 'Notizen anhören',
    stopAudio: 'Audio stoppen',
    copyNotes: 'Notizen kopieren',
    copied: 'Kopiert!',
    timeOrderLatest: '🕒 Neueste oben',
    timeOrderOldest: '⏱️ Chronologische Reihenfolge',
    originalLabel: 'Original',
    translatedLabel: 'Übersetzt',
    emptyNotesTip: 'Sprechen Sie ins Mikrofon — Notizen erscheinen hier live.',

    // History Drawer
    classVoiceHistory: 'Klassen-Sprachverlauf',
    storedSpeeches: 'Gespeicherte Aufnahmen',
    clickToSlide: 'Klicken zum Öffnen des Verlaufs',
    clickToMinimize: 'Klicken zum Minimieren',
    searchHistoryPlaceholder: 'Nach Sprecher oder Wörtern suchen...',
    uncertainFilter: 'Unsicher (<85%)',
    clearAllHistory: 'Gesamten Verlauf löschen',
    deselect: 'Auswahl aufheben',
    deleteSingleTip: 'Diesen Eintrag löschen?',

    // Leave Confirmation Modal
    leaveConfirmTitle: 'Möchten Sie den Unterricht wirklich verlassen?',
    leaveConfirmDesc: 'Sie werden aus dem Live-Klassenzimmer abgemeldet und kehren zum Startbildschirm zurück.',
    leaveConfirmYes: 'Ja, Klasse verlassen',
    leaveConfirmCancel: 'Im Unterricht bleiben'
  },

  ja: {
    // Header
    liveClass: 'ライブ授業',
    room: 'ルーム',
    connected: '接続済み',
    reconnecting: '再接続中',
    disconnected: '切断',
    peer: '参加者',
    peers: '参加者',
    leave: '退出',

    // Controls
    micOn: 'MIC ON (オン)',
    micOff: 'MIC OFF (ミュート)',
    camOn: 'カメラ ON',
    camOff: 'カメラ OFF',
    shareScreen: '画面共有',
    stopShare: '共有停止',
    selectLang: '音声言語を選択',
    autoTts: '自動読み上げ',
    audioOn: '音声 ON',
    audioOff: '音声 OFF',
    simulateSpeech: '音声シミュレート',
    demoBadge: 'デモ',
    help: 'ヘルプ',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: '教室',
    faces: 'メンバー',
    inviteGuide: '招待 / ガイド',
    you: 'あなた',
    host: 'ホスト',
    screen: '画面',
    professorRole: '教授 / ホスト',
    studentRole: '生徒',

    // Floating Subtitles
    liveSpeaking: '発言中...',
    finalSubtitle: '確定字幕',
    dragAnywhere: '画面上のどこへでもドラッグ',
    top: '上へ',
    bottom: '下へ',
    translationBadge: '翻訳',
    subtitlesPlaceholder: 'リアルタイム字幕がここにストリーミングされます',

    // Lecture Notes
    lectureNotes: '講義ノート',
    notesSuffix: 'ノート',
    paragraphView: '段落',
    cardsView: 'カード',
    selectAll: 'すべて選択',
    clearAllNotes: 'すべてのノートを消去',
    deleteSelected: '選択項目を削除',
    listenNotes: 'ノートを聴く',
    stopAudio: '音声を停止',
    copyNotes: 'ノートをコピー',
    copied: 'コピー完了!',
    timeOrderLatest: '🕒 最新を上に表示',
    timeOrderOldest: '⏱️ 時系列順 (古い順)',
    originalLabel: '原文',
    translatedLabel: '翻訳',
    emptyNotesTip: 'マイクで話してください — 講義ノートがここに表示されます。',

    // History Drawer
    classVoiceHistory: 'クラス音声履歴',
    storedSpeeches: '保存された発言',
    clickToSlide: '履歴を表示するにはクリック',
    clickToMinimize: '最小化するにはクリック',
    searchHistoryPlaceholder: '話者やキーワードで履歴を検索...',
    uncertainFilter: '要確認 (<85%)',
    clearAllHistory: 'すべての履歴を消去',
    deselect: '選択解除',
    deleteSingleTip: 'この履歴を削除しますか？',

    // Leave Confirmation Modal
    leaveConfirmTitle: '本当に退出しますか？',
    leaveConfirmDesc: 'ライブ授業から切断され、ホーム画面に戻ります。',
    leaveConfirmYes: 'はい、退出します',
    leaveConfirmCancel: '授業にとどまる'
  },

  zh: {
    // Header
    liveClass: '直播课堂',
    room: '房间',
    connected: '已连接',
    reconnecting: '正在重连',
    disconnected: '已断开',
    peer: '成员',
    peers: '成员',
    leave: '离开',

    // Controls
    micOn: 'MIC ON (开麦)',
    micOff: 'MIC OFF (闭麦)',
    camOn: '开启摄像头',
    camOff: '关闭摄像头',
    shareScreen: '共享屏幕',
    stopShare: '停止共享',
    selectLang: '选择发言语言',
    autoTts: '自动朗读',
    audioOn: '音频开',
    audioOff: '音频关',
    simulateSpeech: '模拟发言',
    demoBadge: '演示',
    help: '帮助',
    exportTxt: 'TXT',
    exportCsv: 'CSV',

    // Zoom Grid & Tiles
    classroom: '课堂',
    faces: '画面',
    inviteGuide: '邀请 / 指南',
    you: '你',
    host: '主持人',
    screen: '屏幕',
    professorRole: '讲师 / 主持人',
    studentRole: '学生',

    // Floating Subtitles
    liveSpeaking: '正在发言...',
    finalSubtitle: '完整字幕',
    dragAnywhere: '可拖拽至全屏任意位置',
    top: '置顶',
    bottom: '还原底部',
    translationBadge: '翻译',
    subtitlesPlaceholder: '实时字幕将在此处显示 (可拖拽)',

    // Lecture Notes
    lectureNotes: '课堂笔记',
    notesSuffix: '笔记',
    paragraphView: '段落',
    cardsView: '卡片',
    selectAll: '全选',
    clearAllNotes: '清空所有笔记',
    deleteSelected: '删除所选',
    listenNotes: '朗读笔记',
    stopAudio: '停止播放',
    copyNotes: '复制笔记',
    copied: '已复制!',
    timeOrderLatest: '🕒 最新发言置顶',
    timeOrderOldest: '⏱️ 按时间先后',
    originalLabel: '原文',
    translatedLabel: '译文',
    emptyNotesTip: '对着麦克风说话 — 连贯的课堂笔记将在此处实时生成。',

    // History Drawer
    classVoiceHistory: '课堂语音历史',
    storedSpeeches: '条已存记录',
    clickToSlide: '点击展开历史记录',
    clickToMinimize: '点击收起',
    searchHistoryPlaceholder: '按发言人或关键词搜索历史...',
    uncertainFilter: '低置信度 (<85%)',
    clearAllHistory: '清空所有历史',
    deselect: '取消选择',
    deleteSingleTip: '确定删除这条历史记录吗？',

    // Leave Confirmation Modal
    leaveConfirmTitle: '确定要退出课堂吗？',
    leaveConfirmDesc: '您将断开与直播课堂的连接并返回主界面。',
    leaveConfirmYes: '确定退出',
    leaveConfirmCancel: '留在课堂'
  }
};

/**
 * Get localized string for a given key and language code.
 * Falls back to English if key or language is not found.
 */
export function getUIText(key, langCode = 'en') {
  const langObj = UI_TRANSLATIONS[langCode] || UI_TRANSLATIONS['en'];
  if (langObj && langObj[key] !== undefined) {
    return langObj[key];
  }
  return UI_TRANSLATIONS['en'][key] || key;
}
