# Chatbot Widget - Complete Deployment Guide

## Overview

This guide covers deploying the embeddable chatbot widget system with API key authentication.

**Components:**
1. **Widget** (JavaScript) - Hosted on Vercel CDN
2. **Backend API** (Python) - Already deployed on Render
3. **API Key System** - Authentication and rate limiting

---

## Part 1: Update Backend with API Authentication

### Step 1: Verify Files Created

Check that these files exist:
- `chatbot-api/app/auth.py` ✅
- Updated `chatbot-api/app/api/routes.py` ✅

### Step 2: Deploy Backend Changes

```bash
cd C:\Users\Pravish\Downloads\ChatBotClient\chatbot-api
git add .
git commit -m "Add API key authentication for widget"
git push origin main
```

Render will auto-deploy in 2-3 minutes.

### Step 3: Test API Key Authentication

After deployment, test with curl:

```bash
# Without API key (should fail)
curl -X POST https://ai-chatbot-backend-rds6.onrender.com/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# With API key (should work)
curl -X POST https://ai-chatbot-backend-rds6.onrender.com/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: demo-key-123" \
  -d '{"message": "test"}'
```

---

## Part 2: Build and Deploy Widget

### Step 1: Install Dependencies

```bash
cd C:\Users\Pravish\Downloads\ChatBotClient\chatbot-widget
npm install
```

### Step 2: Build Widget

```bash
npm run build
```

This creates `dist/chatbot.js` (~50KB gzipped).

### Step 3: Test Locally

```bash
npm run serve
```

Open `http://localhost:3000/test.html` and test the widget.

### Step 4: Deploy to Vercel

#### Create Vercel Project

1. Go to https://vercel.com
2. Click **Add New...** → **Project**
3. Import `chatbot-widget` from GitHub

**Or push to GitHub first:**

```bash
cd C:\Users\Pravish\Downloads\ChatBotClient\chatbot-widget
git init
git add .
git commit -m "Initial widget commit"
git remote add origin https://github.com/YOUR_USERNAME/chatbot-widget.git
git push -u origin main
```

#### Configure Vercel

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Deploy!**

Your widget will be available at:
```
https://your-project.vercel.app/chatbot.js
```

---

## Part 3: Client Integration

### For Clients to Use

Provide clients with this embed code:

```html
<!-- Add before </body> -->
<script src="https://your-project.vercel.app/chatbot.js" 
        data-api-key="CLIENT_API_KEY"></script>
```

### Customization Options

```html
<script src="https://your-project.vercel.app/chatbot.js" 
        data-api-key="CLIENT_API_KEY"
        data-position="bottom-right"
        data-primary-color="#0066cc"
        data-greeting="Hi! How can I help?"
        data-title="Support Chat"></script>
```

---

## Part 4: API Key Management

### Generate New API Key for Client

**Option A: Python Script**

Create `generate_key.py`:

```python
from app.auth import generate_api_key

# Generate key
key = generate_api_key("Client Name")
print(f"API Key: {key}")
```

Run:
```bash
python generate_key.py
```

**Option B: Manual (Temporary)**

Add to `app/auth.py`:

```python
API_KEYS["client-abc-123"] = {
    "name": "Client ABC",
    "created_at": datetime.now().isoformat(),
    "requests_today": 0,
    "last_request": None,
    "active": True
}
```

### Rate Limits

Default: 100 requests/day per API key

To change, edit `app/auth.py`:
```python
def check_rate_limit(api_key: str, limit: int = 100):  # Change 100 to your limit
```

---

## Part 5: Testing

### Test Widget on Different Sites

**Plain HTML:**
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Test Page</h1>
  <script src="https://your-project.vercel.app/chatbot.js" 
          data-api-key="demo-key-123"></script>
</body>
</html>
```

**React:**
```jsx
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://your-project.vercel.app/chatbot.js';
  script.setAttribute('data-api-key', 'demo-key-123');
  document.body.appendChild(script);
}, []);
```

**WordPress:**
Add to theme footer or use plugin to inject script.

---

## Part 6: Client Onboarding

### 1. Generate API Key
```bash
python generate_key.py
```

### 2. Send Integration Instructions

**Email Template:**

```
Subject: Your AI Chatbot Widget - Integration Guide

Hi [Client Name],

Your AI chatbot widget is ready! Here's how to add it to your website:

1. Copy this code:

<script src="https://your-project.vercel.app/chatbot.js" 
        data-api-key="[THEIR_KEY]"></script>

2. Paste it before the </body> tag on your website

3. That's it! The chatbot will appear on your site.

Customization options:
- Change position: data-position="bottom-left"
- Change color: data-primary-color="#your-color"
- Change greeting: data-greeting="Your message"

Need help? Reply to this email.

Best regards,
[Your Name]
```

---

## Security Best Practices

### 1. HTTPS Only

Ensure both widget and API use HTTPS.

### 2. CORS Configuration

Backend should allow widget domain:

```python
# app/main.py
allow_origins=[
    "https://your-project.vercel.app",  # Widget domain
    "*"  # Or specific client domains
]
```

### 3. Rate Limiting

Monitor usage and adjust limits as needed.

### 4. API Key Rotation

Provide clients ability to regenerate keys if compromised.

---

## Monitoring

### Track Usage

Add logging to `app/auth.py`:

```python
import logging

logger = logging.getLogger(__name__)

def check_rate_limit(api_key: str, limit: int = 100):
    # ... existing code ...
    logger.info(f"API Key {api_key[:10]}... - Requests today: {key_info['requests_today']}")
```

### Render Logs

Monitor in Render dashboard → Logs tab.

---

## Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Verify API key is correct
3. Check CORS settings
4. Ensure script URL is correct

### 401 Unauthorized

- API key invalid or missing
- Check `X-API-Key` header

### 429 Rate Limit

- Client exceeded 100 requests/day
- Increase limit or wait for reset

### Widget Conflicts with Site

- Shadow DOM should prevent this
- Check for CSP (Content Security Policy) blocking

---

## Next Steps

1. ✅ Deploy backend with auth
2. ✅ Build and deploy widget
3. ✅ Test integration
4. 🎯 Generate client API keys
5. 🎯 Onboard first client
6. 📊 Monitor usage

---

## Summary

**Widget URL:** `https://your-project.vercel.app/chatbot.js`

**Backend API:** `https://ai-chatbot-backend-rds6.onrender.com/api/v1`

**Demo API Key:** `demo-key-123`

**Client Integration:**
```html
<script src="https://your-project.vercel.app/chatbot.js" 
        data-api-key="CLIENT_KEY"></script>
```

**Your chatbot widget is ready for clients!** 🚀
