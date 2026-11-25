/**
 * MyClassRoom - Content Script Companion
 * Injects a sleek, draggable floating subtitle pill on active tabs
 * (e.g. YouTube lectures, Google Meet, Zoom web)
 */

(function () {
  // Prevent duplicate injection
  if (document.getElementById('myclassroom-floating-subtitle-root')) return;

  const root = document.createElement('div');
  root.id = 'myclassroom-floating-subtitle-root';
  root.className = 'myclassroom-overlay-hidden';

  root.innerHTML = `
    <div id="myclassroom-subtitle-container" class="myclassroom-card">
      <div class="myclassroom-header">
        <div class="myclassroom-title">
          <span class="myclassroom-dot"></span>
          <span>MyClassRoom Subtitle</span>
        </div>
        <div class="myclassroom-controls">
          <button id="myclassroom-btn-open-panel" class="myclassroom-btn" title="Open Right Side Panel">⊞</button>
          <button id="myclassroom-btn-close" class="myclassroom-btn" title="Hide Subtitles">✕</button>
        </div>
      </div>
      <div id="myclassroom-live-text" class="myclassroom-text">
        Waiting for speech translation...
      </div>
    </div>
  `;

  document.body.appendChild(root);

  // Close button
  const btnClose = root.querySelector('#myclassroom-btn-close');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      root.classList.add('myclassroom-overlay-hidden');
    });
  }

  // Open Side Panel button
  const btnOpenPanel = root.querySelector('#myclassroom-btn-open-panel');
  if (btnOpenPanel) {
    btnOpenPanel.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
      }
    });
  }

  // Listen for broadcast speech messages from extension
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'LIVE_SPEECH_UPDATE') {
        const textEl = document.getElementById('myclassroom-live-text');
        if (textEl && message.text) {
          root.classList.remove('myclassroom-overlay-hidden');
          textEl.textContent = message.translation || message.text;
        }
      }
    });
  }
})();
