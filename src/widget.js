/**
 * Main Widget Entry Point
 * Creates an embeddable chatbot widget using Shadow DOM for isolation
 */

import DOMPurify from 'dompurify';

class ChatbotWidget extends HTMLElement {
  constructor() {
    super();
    
    // Create Shadow DOM for complete isolation
    this.attachShadow({ mode: 'open' });
    
    // State
    this.isOpen = false;
    this.messages = [];
    this.sessionId = null;
  }
  
  connectedCallback() {
    // Configuration - read attributes here when element is in DOM
    this.config = {
      apiKey: this.getAttribute('data-api-key') || '',
      apiUrl: this.getAttribute('data-api-url') || 'https://ai-chatbot-backend-rds6.onrender.com/api/v1',
      position: this.getAttribute('data-position') || 'bottom-right',
      primaryColor: this.getAttribute('data-primary-color') || '#3b82f6',
      bgColor: this.getAttribute('data-bg-color') || '#f9fafb',
      textColor: this.getAttribute('data-text-color') || '#1f2937',
      greeting: this.getAttribute('data-greeting') || 'Hi! How can I help you?',
      title: this.getAttribute('data-title') || 'AI Assistant',
      avatar: this.getAttribute('data-avatar') || null,
      buttonIcon: this.getAttribute('data-button-icon') || null
    };
    
    // Validate API key
    if (!this.config.apiKey) {
      console.error('[Chatbot Widget] API key is required. Add data-api-key attribute.');
      return;
    }
    
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    const styles = this.getStyles();
    const html = this.getHTML();
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${html}
    `;
  }
  
  getStyles() {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      :host {
        --primary-color: ${this.config.primaryColor};
        --primary-hover: ${this.adjustColor(this.config.primaryColor, -20)};
        --bg-color: ${this.config.bgColor};
        --text-color: ${this.config.textColor};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .chatbot-container {
        position: fixed;
        ${this.config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        ${this.config.position.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
        z-index: 999999;
      }
      
      .chatbot-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--primary-color);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      
      .chatbot-button:hover {
        background: var(--primary-hover);
        transform: scale(1.05);
      }
      
      .chatbot-button svg {
        width: 28px;
        height: 28px;
        fill: white;
      }
      
      .chatbot-window {
        position: absolute;
        ${this.config.position.includes('right') ? 'right: 0;' : 'left: 0;'}
        ${this.config.position.includes('top') ? 'top: 70px;' : 'bottom: 70px;'}
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 100px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease;
      }
      
      .chatbot-window.open {
        display: flex;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .chatbot-header {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
        color: white;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .chatbot-header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .chatbot-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      
      .chatbot-title {
        font-weight: 600;
        font-size: 16px;
      }
      
      .chatbot-status {
        font-size: 12px;
        opacity: 0.9;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .chatbot-status::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: #10b981;
        border-radius: 50%;
      }
      
      .chatbot-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        opacity: 0.9;
        transition: opacity 0.2s;
      }
      
      .chatbot-close:hover {
        opacity: 1;
      }
      
      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: var(--bg-color);
        -webkit-overflow-scrolling: touch;
      }
      
      .chatbot-message {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      
      .chatbot-message.user {
        align-items: flex-end;
      }
      
      .chatbot-message-bubble {
        max-width: 75%;
        padding: 12px 16px;
        border-radius: 16px;
        word-wrap: break-word;
      }
      
      .chatbot-message.user .chatbot-message-bubble {
        background: var(--primary-color);
        color: white;
        border-bottom-right-radius: 4px;
      }
      
      .chatbot-message.bot .chatbot-message-bubble {
        background: var(--bg-color);
        color: var(--text-color);
        border-bottom-left-radius: 4px;
        border: 1px solid rgba(128, 128, 128, 0.2);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      /* Markdown formatting */
      .chatbot-message-bubble strong {
        font-weight: 700;
        color: inherit;
      }
      
      .chatbot-message-bubble em {
        font-style: italic;
      }
      
      .chatbot-message-bubble code {
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
      }
      
      .chatbot-message.user .chatbot-message-bubble code {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .chatbot-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }
      
      .chatbot-typing span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-color);
        opacity: 0.5;
        animation: typing 1.4s infinite;
      }
      
      .chatbot-typing span:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .chatbot-typing span:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-10px);
        }
      }
      
      .chatbot-input-container {
        padding: 16px;
        background: var(--bg-color);
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }
      
      .chatbot-input-wrapper {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      
      .chatbot-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 24px;
        outline: none;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s;
        background: var(--bg-color);
        color: var(--text-color);
      }
      
      .chatbot-input::placeholder {
        color: var(--text-color);
        opacity: 0.5;
      }
      
      .chatbot-input:focus {
        border-color: var(--primary-color);
      }
      
      .chatbot-send {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-color);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      
      .chatbot-send:hover {
        background: var(--primary-hover);
      }
      
      .chatbot-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .chatbot-send svg {
        width: 20px;
        height: 20px;
        fill: white;
      }
      
      .chatbot-welcome {
        text-align: center;
        padding: 40px 20px;
        color: #6b7280;
      }
      
      .chatbot-welcome-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      
      .chatbot-welcome-text {
        font-size: 16px;
        color: #374151;
        margin-bottom: 8px;
      }
      
      .chatbot-welcome-subtext {
        font-size: 14px;
      }
      
      /* Sources */
      .chatbot-sources {
        margin-top: 8px;
        padding-top: 8px;
        max-width: 75%;
      }
      
      .chatbot-sources-title {
        font-size: 11px;
        color: #6b7280;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .chatbot-source-card {
        display: block;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 6px;
        text-decoration: none;
        transition: all 0.2s;
      }
      
      .chatbot-source-card:hover {
        background: #f3f4f6;
        border-color: #d1d5db;
      }
      
      .chatbot-source-content {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      
      .chatbot-source-index {
        font-size: 11px;
        font-weight: 700;
        color: var(--primary-color);
        flex-shrink: 0;
      }
      
      .chatbot-source-info {
        flex: 1;
        min-width: 0;
      }
      
      .chatbot-source-title {
        font-size: 12px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .chatbot-source-url {
        font-size: 10px;
        color: #6b7280;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .chatbot-source-icon {
        width: 14px;
        height: 14px;
        color: #9ca3af;
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      /* Suggested Actions */
      .chatbot-suggestions {
        padding: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .chatbot-suggestion-btn {
        padding: 8px 16px;
        background: white;
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      
      .chatbot-suggestion-btn:hover {
        background: var(--primary-color);
        color: white;
      }
      
      @media (max-width: 480px) {
        .chatbot-window {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          height: 100dvh;
          max-height: none;
          border-radius: 0;
        }
        
        .chatbot-input-container {
          padding-bottom: max(16px, env(safe-area-inset-bottom));
        }
      }

      .chatbot-watermark {
        text-align: center;
        font-size: 10px;
        color: #9ca3af;
        margin-top: 8px;
        font-family: inherit;
      }
      
      .chatbot-watermark strong {
        color: var(--primary-color);
        font-weight: 600;
      }
    `;
  }
  
  getHTML() {
    return `
      <div class="chatbot-container">
        <button class="chatbot-button" id="chatbot-toggle">
          ${this.config.buttonIcon ? 
            `<img src="${this.config.buttonIcon}" alt="Chat" style="width:100%;height:100%;border-radius:50%;object-fit:contain;">` : 
            `<svg viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>`
          }
        </button>
        
        <div class="chatbot-window" id="chatbot-window">
          <div class="chatbot-header">
            <div class="chatbot-header-content">
              <div class="chatbot-avatar">
                ${this.config.avatar ? `<img src="${this.config.avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:contain;">` : '🤖'}
              </div>
              <div>
                <div class="chatbot-title">${this.config.title}</div>
                <div class="chatbot-status">Online</div>
              </div>
            </div>
            <button class="chatbot-close" id="chatbot-close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          
          <div class="chatbot-messages" id="chatbot-messages">
            <div class="chatbot-welcome">
              <div class="chatbot-welcome-icon">👋</div>
              <div class="chatbot-welcome-text">${this.config.greeting}</div>
              <div class="chatbot-welcome-subtext">Ask me anything!</div>
            </div>

          </div>
          
          <div class="chatbot-input-container">
            <div class="chatbot-input-wrapper">
              <input 
                type="text" 
                class="chatbot-input" 
                id="chatbot-input" 
                placeholder="Type your message..."
                autocomplete="off"
              />
              <button class="chatbot-send" id="chatbot-send">
                <svg viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            <div class="chatbot-watermark">
              Powered by <strong>Saltbox</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    const toggle = this.shadowRoot.getElementById('chatbot-toggle');
    const close = this.shadowRoot.getElementById('chatbot-close');
    const send = this.shadowRoot.getElementById('chatbot-send');
    const input = this.shadowRoot.getElementById('chatbot-input');
    
    toggle.addEventListener('click', () => this.toggleWindow());
    close.addEventListener('click', () => this.closeWindow());
    send.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    
    // Add click handlers for suggestion buttons
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.classList.contains('chatbot-suggestion-btn')) {
        const suggestion = e.target.getAttribute('data-suggestion');
        if (suggestion) {
          input.value = suggestion;
          this.sendMessage();
        }
      }
    });
  }
  
  toggleWindow() {
    this.isOpen = !this.isOpen;
    const window = this.shadowRoot.getElementById('chatbot-window');
    window.classList.toggle('open', this.isOpen);
    
    if (this.isOpen) {
      this.shadowRoot.getElementById('chatbot-input').focus();
    }
  }
  
  closeWindow() {
    this.isOpen = false;
    this.shadowRoot.getElementById('chatbot-window').classList.remove('open');
  }
  
  async sendMessage() {
    const input = this.shadowRoot.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    this.addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    this.showTyping();
    
    try {
      // Call API
      const response = await this.callAPI(message);
      
      // Remove typing indicator
      this.hideTyping();
      
      // Add bot response with sources
      this.addMessage(response.response, 'bot', response.sources || []);
      
      // Store session ID
      if (response.session_id) {
        this.sessionId = response.session_id;
      }
    } catch (error) {
      this.hideTyping();
      this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
      console.error('[Chatbot Widget] API Error:', error);
    }
  }
  
  async callAPI(message) {
    const response = await fetch(`${this.config.apiUrl}/widget/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey
      },
      body: JSON.stringify({
        message: message,
        session_id: this.sessionId,
        chat_history: this.messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })
    });
    
    if (!response.ok) {
      // Get error details
      let errorMessage = `API request failed (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (e2) {
          // Ignore
        }
      }
      
      console.error('[Chatbot Widget] API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        endpoint: `${this.config.apiUrl}/widget/chat`
      });
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your data-api-key attribute.');
      } else if (response.status === 404) {
        throw new Error('Endpoint not found. Backend may not be deployed yet.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  }
  
  formatMarkdown(text) {
    // Convert markdown-style formatting to HTML
    let formatted = text;
    
    // Bold: **text** or __text__
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Code: `text`
    formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }
  
  addMessage(content, role, sources = []) {
    // Sanitize content to prevent XSS
    const sanitized = DOMPurify.sanitize(content);
    
    // Format markdown
    const formatted = this.formatMarkdown(sanitized);
    
    this.messages.push({ role, content: sanitized, sources });
    
    const messagesContainer = this.shadowRoot.getElementById('chatbot-messages');
    
    // Remove welcome message if exists
    const welcome = messagesContainer.querySelector('.chatbot-welcome');
    if (welcome) welcome.remove();
    
    // Remove suggested actions if exists
    const suggestions = messagesContainer.querySelector('.chatbot-suggestions');
    if (suggestions) suggestions.remove();
    
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${role}`;
    
    // Build message HTML (sources hidden)
    let messageHTML = `<div class="chatbot-message-bubble">${formatted}</div>`;
    
    messageEl.innerHTML = messageHTML;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  showTyping() {
    const messagesContainer = this.shadowRoot.getElementById('chatbot-messages');
    const typing = document.createElement('div');
    typing.className = 'chatbot-message bot';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="chatbot-message-bubble chatbot-typing">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  hideTyping() {
    const typing = this.shadowRoot.getElementById('typing-indicator');
    if (typing) typing.remove();
  }
  
  adjustColor(color, amount) {
    // Simple color adjustment for hover states
    return color;
  }
}

// Register custom element
customElements.define('chatbot-widget', ChatbotWidget);

// Auto-initialize from script tag
(function() {
  const script = document.currentScript;
  if (script) {
    const widget = document.createElement('chatbot-widget');
    
    // Copy data attributes
    ['api-key', 'api-url', 'position', 'primary-color', 'bg-color', 'text-color', 'greeting', 'title', 'avatar', 'button-icon'].forEach(attr => {
      const value = script.getAttribute(`data-${attr}`);
      if (value) widget.setAttribute(`data-${attr}`, value);
    });
    
    document.body.appendChild(widget);
  }
})();

// Export for programmatic use
export default ChatbotWidget;
