# Chatbot Widget

Embeddable AI chatbot widget for any website.

## Features

- ✅ **Universal** - Works on any website/framework (React, Angular, WordPress, etc.)
- ✅ **Isolated** - Shadow DOM prevents CSS/JS conflicts
- ✅ **Secure** - API key authentication, XSS protection, rate limiting
- ✅ **Customizable** - Colors, position, branding
- ✅ **Responsive** - Mobile-friendly design
- ✅ **Lightweight** - ~50KB gzipped

## Quick Start

### 1. Get Your API Key

Contact us to get your unique API key.

### 2. Add to Your Website

Add this single line to your HTML (before `</body>`):

```html
<script src="https://widget.yourdomain.com/chatbot.js" 
        data-api-key="YOUR_API_KEY"></script>
```

That's it! The chatbot will appear on your website.

## Customization

### Basic Configuration

```html
<script src="https://widget.yourdomain.com/chatbot.js" 
        data-api-key="YOUR_API_KEY"
        data-position="bottom-right"
        data-primary-color="#0066cc"
        data-greeting="Hi! How can I help?"
        data-title="Support Chat"></script>
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `data-api-key` | Your API key (required) | - |
| `data-api-url` | Backend API URL | Auto-configured |
| `data-position` | Widget position | `bottom-right` |
| `data-primary-color` | Primary color (hex) | `#3b82f6` |
| `data-greeting` | Welcome message | `Hi! How can I help you?` |
| `data-title` | Widget title | `AI Assistant` |
| `data-avatar` | Avatar image URL | Default emoji |

### Position Options

- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`

### Advanced Usage (JavaScript API)

```javascript
// Initialize programmatically
window.ChatbotWidget.init({
  apiKey: 'YOUR_API_KEY',
  position: 'bottom-right',
  primaryColor: '#0066cc',
  onReady: () => console.log('Widget ready'),
  onMessage: (msg) => console.log('Message:', msg)
});

// Control methods
window.ChatbotWidget.open();
window.ChatbotWidget.close();
window.ChatbotWidget.toggle();
```

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

Output: `dist/chatbot.js`

### Development Mode

```bash
npm run dev
```

### Test Locally

```bash
npm run serve
```

Then open `http://localhost:3000/test.html`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

## Security

- API key authentication
- Rate limiting (100 requests/hour)
- XSS protection (DOMPurify)
- HTTPS only
- Shadow DOM isolation

## License

MIT
