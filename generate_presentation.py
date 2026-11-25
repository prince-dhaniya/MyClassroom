import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette - Modern Monochrome Dark with Tech Accents
    BG_DARK = RGBColor(10, 10, 12)        # Deep Obsidian Black
    CARD_BG = RGBColor(22, 22, 28)        # Charcoal Card
    CARD_BORDER = RGBColor(45, 45, 55)    # Subtle Border
    TEXT_WHITE = RGBColor(255, 255, 255)  # Pure White
    TEXT_MUTED = RGBColor(160, 160, 175)  # Muted Gray
    ACCENT_BLUE = RGBColor(59, 130, 246)  # Electric Royal Blue
    ACCENT_EMERALD = RGBColor(16, 185, 129) # Emerald Green
    ACCENT_AMBER = RGBColor(245, 158, 11) # Amber for Uncertainty
    CARD_BG_LIGHT = RGBColor(30, 30, 38)

    def set_slide_background(slide, color):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = color

    def add_header(slide, category, title, slide_num):
        # Category Tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = ACCENT_BLUE

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(10.5), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

        # Slide Number
        num_box = slide.shapes.add_textbox(Inches(11.8), Inches(0.4), Inches(0.8), Inches(0.4))
        tf_num = num_box.text_frame
        p_num = tf_num.paragraphs[0]
        p_num.text = f"{slide_num:02d} / 12"
        p_num.alignment = PP_ALIGN.RIGHT
        p_num.font.size = Pt(11)
        p_num.font.bold = True
        p_num.font.color.rgb = TEXT_MUTED

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.2)
        return shape

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, BG_DARK)

    # Decorative Card Banner
    add_card(s1, Inches(1.5), Inches(1.2), Inches(10.333), Inches(5.1), CARD_BG, CARD_BORDER)

    # Badge
    b_box = s1.shapes.add_textbox(Inches(2.0), Inches(1.8), Inches(9.3), Inches(0.4))
    p_b = b_box.text_frame.paragraphs[0]
    p_b.text = "PROJECT SHOWCASE  |  HYBRID AI & REAL-TIME AUDIO ASSISTIVE TECH"
    p_b.font.size = Pt(12)
    p_b.font.bold = True
    p_b.font.color.rgb = ACCENT_BLUE

    # Main Project Title
    t_box = s1.shapes.add_textbox(Inches(2.0), Inches(2.3), Inches(9.3), Inches(1.2))
    p_t = t_box.text_frame.paragraphs[0]
    p_t.text = "MyClassRoom"
    p_t.font.size = Pt(48)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_WHITE

    # Subtitle
    sub_box = s1.shapes.add_textbox(Inches(2.0), Inches(3.5), Inches(9.3), Inches(1.0))
    p_sub = sub_box.text_frame.paragraphs[0]
    p_sub.text = "Real-Time Multilingual Voice Translator, Smart Lecture Notes & Classroom Companion\nComplete Web Platform & Native Manifest V3 Chrome Extension"
    p_sub.font.size = Pt(16)
    p_sub.font.color.rgb = TEXT_MUTED

    # Highlights row
    h_box = s1.shapes.add_textbox(Inches(2.0), Inches(4.7), Inches(9.3), Inches(0.8))
    tf_h = h_box.text_frame
    p_h = tf_h.paragraphs[0]
    p_h.text = "• 25+ Global & Regional Languages   • Manifest V3 Chrome Extension   • Zero-Login Zoom/Speaker Translation   • Monochrome B&W Mode"
    p_h.font.size = Pt(12)
    p_h.font.bold = True
    p_h.font.color.rgb = ACCENT_EMERALD

    # Author
    a_box = s1.shapes.add_textbox(Inches(2.0), Inches(5.4), Inches(9.3), Inches(0.4))
    p_a = a_box.text_frame.paragraphs[0]
    p_a.text = "Developed by: Prince Dhaniya  |  GitHub: prince-dhaniya/MyClassroom"
    p_a.font.size = Pt(12)
    p_a.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: PROBLEM STATEMENT & MOTIVATION
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, BG_DARK)
    add_header(s2, "Context & Challenges", "The Language Barrier in Digital & Higher Education", 2)

    problems = [
        ("Language Divide in Virtual Classrooms", "Over 65% of non-native students struggle to keep pace with rapid lectures in English or foreign tongues on Zoom, Google Meet, and MS Teams.", "Challenge 01"),
        ("Cognitive Overload & Context Loss", "Students spend excessive mental energy translating spoken jargon in real-time rather than absorbing core concepts and problem-solving steps.", "Challenge 02"),
        ("Fragmented Study Tools", "Captions (if available) vanish immediately without auto-save. Note-taking apps remain disconnected from the live lecture transcript stream.", "Challenge 03"),
        ("High Friction & Room Dependency", "Most classroom tools force instructors and attendees to register, share special invite codes, or change meeting platforms, hindering instant adoption.", "Challenge 04")
    ]

    for i, (p_title, p_desc, p_tag) in enumerate(problems):
        x = Inches(0.8 + (i % 2) * 5.9)
        y = Inches(1.8 + (i // 2) * 2.5)
        add_card(s2, x, y, Inches(5.7), Inches(2.2))
        
        tb = s2.shapes.add_textbox(x + Inches(0.3), y + Inches(0.2), Inches(5.1), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p0 = tf.paragraphs[0]
        p0.text = p_tag
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = ACCENT_BLUE
        
        p1 = tf.add_paragraph()
        p1.text = p_title
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p1.space_before = Pt(4)
        
        p2 = tf.add_paragraph()
        p2.text = p_desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = TEXT_MUTED
        p2.space_before = Pt(6)

    # =========================================================================
    # SLIDE 3: THE SOLUTION - MYCLASSROOM ECOSYSTEM
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, BG_DARK)
    add_header(s3, "Product Vision", "MyClassRoom: Dual-Engine Real-Time Assistive Platform", 3)

    # Card 1: Web Application
    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tb1 = s3.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.1), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    
    p = tf1.paragraphs[0]
    p.text = "PILLAR 1: INTERACTIVE CLASSROOM"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    p = tf1.add_paragraph()
    p.text = "Full-Featured Web Platform"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(4)

    p = tf1.add_paragraph()
    p.text = "A complete virtual classroom environment with socket-broadcast audio transcription, video feeds, and classroom analytics."
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(8)

    points1 = [
        "Interactive Video Grid with Participant Tile Management",
        "Floating Real-Time Subtitle Bar with Multilingual Output",
        "Right-Side Translation & History Drawer",
        "Teacher-Student Broadcast Architecture via Socket.io",
        "Lecture Analytics Modal & Engagement Metrics"
    ]
    for pt in points1:
        p = tf1.add_paragraph()
        p.text = "✓  " + pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

    # Card 2: Chrome Extension
    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tb2 = s3.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(4.5))
    tf2 = tb2.text_frame
    tf2.word_wrap = True

    p = tf2.paragraphs[0]
    p.text = "PILLAR 2: UNIVERSAL COMPANION"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD

    p = tf2.add_paragraph()
    p.text = "Manifest V3 Chrome Extension"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(4)

    p = tf2.add_paragraph()
    p.text = "A dedicated, zero-login extension that docks directly alongside Zoom, Google Meet, or YouTube lectures."
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(8)

    points2 = [
        "Native Chrome Side Panel Integration (Zero Overlay Blocking)",
        "Zero Login / Zero Room Setup Required (Direct Speaker Audio Capture)",
        "25+ Global & Regional Indian Language Support",
        "Built-in Smart Notes with 1-Click Transcription Import",
        "Persistent Lecture History with Instant Substring Search"
    ]
    for pt in points2:
        p = tf2.add_paragraph()
        p.text = "✓  " + pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

    # =========================================================================
    # SLIDE 4: CORE CAPABILITIES & HIGHLIGHTS
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, BG_DARK)
    add_header(s4, "Feature Matrix", "Key Technological Capabilities of the Platform", 4)

    features = [
        ("🎙️ Multilingual Speech Recognition", "Leverages Web Speech API with dynamic BCP-47 locale matching for accurate phonetic parsing across 25+ languages.", ACCENT_BLUE),
        ("🔄 1-Click Bidirectional Language Swap", "Instant toggle (⇄) switches Speaker Language and Target Language in real time with auto-reconfigured speech engines.", ACCENT_EMERALD),
        ("🔊 Natural Text-To-Speech (TTS)", "Integrated speech synthesis automatically selects native gender-accurate voices for translated sentence pronunciation.", ACCENT_BLUE),
        ("⚠️ Uncertainty Confidence Tracking", "Speech recognition confidence scored dynamically. Utterances below 85% confidence receive amber highlights to warn students of potential ambiguity.", ACCENT_AMBER),
        ("💾 Local-First Privacy Storage", "All notes and historical session transcripts persist securely in Chrome Local Storage. No private audio streams uploaded to third-party databases.", ACCENT_EMERALD),
        ("🌓 Minimalist Monochrome Mode", "Distraction-free Black & White design system with instant 1-click toggle between Black Mode (Dark) and White Mode (Light).", ACCENT_BLUE)
    ]

    for i, (f_title, f_desc, f_col) in enumerate(features):
        x = Inches(0.8 + (i % 3) * 3.9)
        y = Inches(1.8 + (i // 3) * 2.5)
        add_card(s4, x, y, Inches(3.7), Inches(2.3))

        tb = s4.shapes.add_textbox(x + Inches(0.2), y + Inches(0.2), Inches(3.3), Inches(1.9))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = f_title
        p0.font.size = Pt(14)
        p0.font.bold = True
        p0.font.color.rgb = f_col

        p1 = tf.add_paragraph()
        p1.text = f_desc
        p1.font.size = Pt(11)
        p1.font.color.rgb = TEXT_MUTED
        p1.space_before = Pt(6)

    # =========================================================================
    # SLIDE 5: CHROME EXTENSION DEEP DIVE (MANIFEST V3)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, BG_DARK)
    add_header(s5, "Extension Architecture", "Manifest V3 Chrome Extension: Purpose-Built for Zoom Classes", 5)

    tabs = [
        ("1. Live Voice Translator", "• Captures speaker microphone or Zoom system audio directly\n• Displays live interim subtitles in real-time\n• Outputs high-contrast translated cards with confidence tags\n• Natural TTS pronunciation on demand", "TAB 01"),
        ("2. Smart Notes Section", "• Integrated rich note-taking pad alongside live class\n• 1-Click 'Import from Translator' dumps key lecture points\n• Instant bullet-point formatting shortcut (•)\n• Word counter & auto-save to Chrome Local Storage\n• 1-Click Export to text file for offline study", "TAB 02"),
        ("3. Lecture History Archive", "• Save entire lecture sessions with single click\n• Comprehensive card archive with timestamps & language tags\n• Real-time full-text search across translated & original speech\n• Never lose an important classroom lecture again", "TAB 03")
    ]

    for i, (t_title, t_desc, t_tag) in enumerate(tabs):
        x = Inches(0.8 + i * 3.9)
        y = Inches(1.8)
        add_card(s5, x, y, Inches(3.7), Inches(5.0))

        tb = s5.shapes.add_textbox(x + Inches(0.25), y + Inches(0.25), Inches(3.2), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = t_tag
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE

        p = tf.add_paragraph()
        p.text = t_title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(4)

        for line in t_desc.split('\n'):
            p = tf.add_paragraph()
            p.text = line
            p.font.size = Pt(12)
            p.font.color.rgb = TEXT_MUTED if not line.startswith('•') else TEXT_WHITE
            p.space_before = Pt(6)

    # =========================================================================
    # SLIDE 6: MONOCHROME DESIGN SYSTEM (BLACK & WHITE MODES)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, BG_DARK)
    add_header(s6, "UI & Ergonomics", "Zero-Distraction Monochrome Design System", 6)

    # Left: Dark Mode Card
    add_card(s6, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.2), RGBColor(12, 12, 14), RGBColor(40, 40, 48))
    tb_dark = s6.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.1), Inches(3.8))
    tf_d = tb_dark.text_frame
    tf_d.word_wrap = True

    p = tf_d.paragraphs[0]
    p.text = "MODE 01: BLACK MODE (DARK THEME)"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    p = tf_d.add_paragraph()
    p.text = "High-Contrast Matte Black (#0a0a0a)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(4)

    p = tf_d.add_paragraph()
    p.text = "Designed specifically for dim classroom lighting and long online study sessions to eliminate eye fatigue."
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(6)

    specs_dark = [
        "Zero Neon Glows: Eliminates distracting vivid halos and visual clutter",
        "Card Surface: Deep charcoal (#141414) with subtle slate borders (#27272a)",
        "Inverted Action Buttons: Solid pure white background with black text",
        "Typography: Apple/Inter system sans-serif with crisp contrast"
    ]
    for s in specs_dark:
        p = tf_d.add_paragraph()
        p.text = "• " + s
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(5)

    # Right: Light Mode Card
    add_card(s6, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.2), RGBColor(245, 245, 247), RGBColor(215, 215, 225))
    tb_light = s6.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(3.8))
    tf_l = tb_light.text_frame
    tf_l.word_wrap = True

    p = tf_l.paragraphs[0]
    p.text = "MODE 02: WHITE MODE (LIGHT THEME)"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = RGBColor(30, 64, 175)

    p = tf_l.add_paragraph()
    p.text = "Clean Document White (#ffffff)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = RGBColor(15, 23, 42)
    p.space_before = Pt(4)

    p = tf_l.add_paragraph()
    p.text = "Tailored for bright study environments, library reading, and clean printable note-taking experiences."
    p.font.size = Pt(12)
    p.font.color.rgb = RGBColor(71, 85, 105)
    p.space_before = Pt(6)

    specs_light = [
        "High-Legibility Text: Deep charcoal (#111827) for superior reading comprehension",
        "Soft Card Surfacing: Minimalist light gray (#f8f9fa) containers",
        "Solid Monochrome Buttons: High-impact solid black primary action triggers",
        "Seamless Toggle: Instant header button (☀️ / 🌙) with local storage sync"
    ]
    for s in specs_light:
        p = tf_l.add_paragraph()
        p.text = "• " + s
        p.font.size = Pt(11)
        p.font.color.rgb = RGBColor(15, 23, 42)
        p.space_before = Pt(5)

    # Bottom Pill
    add_card(s6, Inches(0.8), Inches(6.2), Inches(11.7), Inches(0.7), CARD_BG, CARD_BORDER)
    tb_b = s6.shapes.add_textbox(Inches(1.0), Inches(6.25), Inches(11.3), Inches(0.5))
    p_b = tb_b.text_frame.paragraphs[0]
    p_b.text = "💡 User Choice Guaranteed: Toggle state is automatically cached in Chrome Local Storage across browser restarts."
    p_b.font.size = Pt(12)
    p_b.font.bold = True
    p_b.font.color.rgb = ACCENT_EMERALD

    # =========================================================================
    # SLIDE 7: TECHNICAL ARCHITECTURE & FLOW
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, BG_DARK)
    add_header(s7, "System Architecture", "End-to-End Multilingual Speech Pipeline", 7)

    steps = [
        ("1. Audio Capture", "Speaker Microphone or Zoom System Audio Tab Capture", "Web Speech API (webkitSpeechRecognition) configured to speaker BCP-47 locale."),
        ("2. Real-Time Stream", "Interim Subtitle Streaming", "Continuous interim parsing with speech confidence scoring and noise tolerance."),
        ("3. Translation Engine", "Hybrid Educational Pipeline", "Exact educational domain dictionary lookup + high-speed Google GTX fallback engine."),
        ("4. Visual Display", "Synchronized Subtitle Cards", "High-contrast card display with uncertainty confidence indicators (< 85% amber tag)."),
        ("5. Audio Synthesis", "Text-To-Speech Playback", "Native speech synthesis with dynamic voice detection for target language pronunciation.")
    ]

    for i, (st_num, st_name, st_desc) in enumerate(steps):
        x = Inches(0.8 + i * 2.38)
        y = Inches(1.8)
        add_card(s7, x, y, Inches(2.25), Inches(4.8))

        tb = s7.shapes.add_textbox(x + Inches(0.15), y + Inches(0.2), Inches(1.95), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = st_num
        p0.font.size = Pt(11)
        p0.font.bold = True
        p0.font.color.rgb = ACCENT_BLUE

        p1 = tf.add_paragraph()
        p1.text = st_name
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p1.space_before = Pt(6)

        p2 = tf.add_paragraph()
        p2.text = st_desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED
        p2.space_before = Pt(8)

    # =========================================================================
    # SLIDE 8: SMART NOTES & HISTORY DATA SYSTEM
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, BG_DARK)
    add_header(s8, "Productivity Workflow", "Integrated In-Lecture Notes & Session History", 8)

    add_card(s8, Inches(0.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tb_notes = s8.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.1), Inches(4.5))
    tf_n = tb_notes.text_frame
    tf_n.word_wrap = True

    p = tf_n.paragraphs[0]
    p.text = "SMART IN-LECTURE NOTES"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    p = tf_n.add_paragraph()
    p.text = "Eliminate Context Switching"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(4)

    note_points = [
        "Students never need to toggle between Zoom and a separate notepad app.",
        "1-Click Import from Live Translator: Dumps translated concepts directly into study notes formatted with bullets.",
        "Auto-Save Engine: Every keystroke is saved immediately to Chrome storage.",
        "Quick formatting toolbar with bullet point shortcuts (•) and live word counter.",
        "1-Click Copy and Export to .txt file for offline archiving and exam revision."
    ]
    for pt in note_points:
        p = tf_n.add_paragraph()
        p.text = "• " + pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    add_card(s8, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tb_hist = s8.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(4.5))
    tf_h = tb_hist.text_frame
    tf_h.word_wrap = True

    p = tf_h.paragraphs[0]
    p.text = "HISTORICAL ARCHIVE & SEARCH"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD

    p = tf_h.add_paragraph()
    p.text = "Searchable Knowledge Repository"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(4)

    hist_points = [
        "1-Click 'Save Session' snapshot packages entire lecture transcript with language metadata.",
        "Full-Text Search Engine: Instantly finds past lectures by searching translated words, original teacher phrases, or lecture title.",
        "Zero False Positives: Instant substring filter matches precise terminology across complex technical transcripts.",
        "Confidence Retention: Preserves uncertainty flags so students know where the audio was ambiguous during study reviews.",
        "Safe Data Retention: All session archives stay stored locally on the student's browser."
    ]
    for pt in hist_points:
        p = tf_h.add_paragraph()
        p.text = "• " + pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 9: AUTOMATED TESTING & QUALITY ASSURANCE
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, BG_DARK)
    add_header(s9, "Verification & Reliability", "Exhaustive Automated Test Suite (63/63 Passing - 100%)", 9)

    test_suites = [
        ("1. Manifest V3 & Integrity", "12 Checks Passed", "Validates schema, sidePanel permissions, storage, background service worker, and icon assets.", ACCENT_EMERALD),
        ("2. DOM & UI Bindings", "3 Checks Passed", "Verifies 100% of IDs match across sidepanel.html, popup.html, and controller scripts.", ACCENT_BLUE),
        ("3. Translation Engine", "11 Checks Passed", "Offline dictionary, domain phrase map, language passthrough, and async Google GTX pipeline.", ACCENT_EMERALD),
        ("4. TTS Speech Audio", "6 Checks Passed", "Voice detection, BCP-47 locale assignment, synthesis utterance generation, and stop triggers.", ACCENT_BLUE),
        ("5. Notes Business Logic", "5 Checks Passed", "Transcription append, formatting preservation, word count algorithm, and export integrity.", ACCENT_EMERALD),
        ("6. History Search Logic", "6 Checks Passed", "Session packaging, Hindi/English multi-keyword search accuracy, and false positive prevention.", ACCENT_BLUE),
        ("7. Uncertainty Highlighting", "4 Checks Passed", "Confidence threshold (< 0.85 Amber alert) accurate triggering and confident passthrough.", ACCENT_AMBER),
        ("8. Multilingual Swap Logic", "9 Checks Passed", "Directional swap (⇄) across 25+ language pairs and BCP-47 speech recognition locales.", ACCENT_BLUE),
        ("9. Monochrome Theme System", "7 Checks Passed", "Validates CSS variables, pure black/white definitions, zero neon colors, and 1-click toggle.", ACCENT_EMERALD)
    ]

    for i, (ts_title, ts_badge, ts_desc, ts_col) in enumerate(test_suites):
        x = Inches(0.8 + (i % 3) * 3.9)
        y = Inches(1.8 + (i // 3) * 1.7)
        add_card(s9, x, y, Inches(3.7), Inches(1.5))

        tb = s9.shapes.add_textbox(x + Inches(0.2), y + Inches(0.15), Inches(3.3), Inches(1.2))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = ts_title
        p0.font.size = Pt(13)
        p0.font.bold = True
        p0.font.color.rgb = TEXT_WHITE

        p1 = tf.add_paragraph()
        p1.text = "✓ " + ts_badge
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = ts_col
        p1.space_before = Pt(3)

        p2 = tf.add_paragraph()
        p2.text = ts_desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = TEXT_MUTED
        p2.space_before = Pt(3)

    # =========================================================================
    # SLIDE 10: PRIVACY, PERFORMANCE & SECURITY
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, BG_DARK)
    add_header(s10, "Non-Functional Requirements", "Privacy-First Architecture & High-Performance Design", 10)

    pillars = [
        ("🔒 Zero-Login Frictionless Access", "Requires no user account creation or credentials to use the Chrome Extension companion. Eliminates sign-in delays for urgent Zoom classes.", ACCENT_BLUE),
        ("🛡️ Client-Side Local Storage", "All transcribed speech, personal study notes, and lecture history records remain securely on the user's local machine via Chrome Storage API.", ACCENT_EMERALD),
        ("⚡ Ultra-Low Sub-300ms Latency", "Optimized streaming recognition and instant dictionary lookup provide fluid subtitle cards in sync with natural teacher speech cadence.", ACCENT_BLUE),
        ("🪶 Ultra-Lightweight Bundle", "Pure client-side code without bulky framework dependencies inside the extension. Total bundle size under 150KB for instant loading.", ACCENT_EMERALD)
    ]

    for i, (p_title, p_desc, p_col) in enumerate(pillars):
        x = Inches(0.8 + (i % 2) * 5.9)
        y = Inches(1.8 + (i // 2) * 2.5)
        add_card(s10, x, y, Inches(5.7), Inches(2.2))

        tb = s10.shapes.add_textbox(x + Inches(0.3), y + Inches(0.2), Inches(5.1), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = p_title
        p0.font.size = Pt(16)
        p0.font.bold = True
        p0.font.color.rgb = p_col

        p1 = tf.add_paragraph()
        p1.text = p_desc
        p1.font.size = Pt(12)
        p1.font.color.rgb = TEXT_MUTED
        p1.space_before = Pt(8)

    # =========================================================================
    # SLIDE 11: TARGET USERS & REAL-WORLD IMPACT
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11, BG_DARK)
    add_header(s11, "Value Proposition", "Real-World Impact Across Educational Sectors", 11)

    use_cases = [
        ("International & Exchange Students", "Enables students studying abroad to effortlessly comprehend professors speaking foreign languages on Zoom with instant native subtitle translation."),
        ("Regional Language Learners in STEM", "Helps Indian students bridge the gap between English technical terminology and vernacular Hindi/regional conceptual understanding."),
        ("Hearing-Impaired Accessibility", "Provides crystal-clear, high-contrast synchronized captions for students with hearing difficulties, creating truly inclusive classrooms."),
        ("Cross-Border Corporate Webinars", "Empowers global remote teams to follow technical presentations and training seminars without language friction.")
    ]

    for i, (uc_title, uc_desc) in enumerate(use_cases):
        x = Inches(0.8 + (i % 2) * 5.9)
        y = Inches(1.8 + (i // 2) * 2.5)
        add_card(s11, x, y, Inches(5.7), Inches(2.2))

        tb = s11.shapes.add_textbox(x + Inches(0.3), y + Inches(0.2), Inches(5.1), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = f"USER SEGMENT {i+1:02d}"
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = ACCENT_BLUE

        p1 = tf.add_paragraph()
        p1.text = uc_title
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p1.space_before = Pt(4)

        p2 = tf.add_paragraph()
        p2.text = uc_desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = TEXT_MUTED
        p2.space_before = Pt(6)

    # =========================================================================
    # SLIDE 12: ROADMAP & CONCLUSION
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12, BG_DARK)
    add_header(s12, "Summary & Future Scope", "Project Summary, Roadmap & Repository Link", 12)

    # Left: Roadmap
    add_card(s12, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8))
    tb_road = s12.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.1), Inches(4.3))
    tf_r = tb_road.text_frame
    tf_r.word_wrap = True

    p = tf_r.paragraphs[0]
    p.text = "FUTURE DEVELOPMENT ROADMAP"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE

    p = tf_r.add_paragraph()
    p.text = "Next Planned Iterations"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(4)

    roadmap = [
        "AI Lecture Summarization: Gemini API integration for auto-generating bulleted revision summaries.",
        "Multi-Speaker Diarization: Distinguish between professor questions and student answers automatically.",
        "Interactive PDF Study Guides: Export complete lecture transcripts and notes as structured PDFs.",
        "Quiz & Flashcard Generator: AI automatically turns lecture notes into practice exam questions."
    ]
    for r in roadmap:
        p = tf_r.add_paragraph()
        p.text = "• " + r
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # Right: Summary & Links
    add_card(s12, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.8))
    tb_sum = s12.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(4.3))
    tf_s = tb_sum.text_frame
    tf_s.word_wrap = True

    p = tf_s.paragraphs[0]
    p.text = "PROJECT CONCLUSION"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_EMERALD

    p = tf_s.add_paragraph()
    p.text = "Thank You!"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(4)

    p = tf_s.add_paragraph()
    p.text = "MyClassRoom successfully demonstrates how native web extensions and real-time speech AI can democratize education across all languages."
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(8)

    p = tf_s.add_paragraph()
    p.text = "🔗 Project Repository:"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(14)

    p = tf_s.add_paragraph()
    p.text = "https://github.com/prince-dhaniya/MyClassroom"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p.space_before = Pt(2)

    p = tf_s.add_paragraph()
    p.text = "👤 Author: Prince Dhaniya\n📧 Email: princedevsariya016@gmail.com\n✅ Automated Tests: 63 / 63 Passed (100%)"
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(12)

    # Save Presentation
    output_path = os.path.join(os.getcwd(), "MyClassRoom_Project_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation generated successfully at: {output_path}")

if __name__ == "__main__":
    create_deck()
