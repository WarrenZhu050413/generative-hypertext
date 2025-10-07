# Hypertext Navigator - ChatGPT MCP Connector

Transform ChatGPT into an interactive hypertext learning environment with educational and exploratory output modes.

## What This Does

This MCP connector enables three powerful output modes in ChatGPT:

- **🎓 Educational Mode**: Adds 3-5 interactive hypertext links to responses for guided learning
- **🔬 Exploratory Mode**: Creates 5-10 research branches for deep knowledge discovery
- **📝 Standard Mode**: Regular ChatGPT without modifications

Each hypertext link opens an inline tooltip where users can continue exploring without leaving the conversation—creating a fractal learning experience.

## Architecture

```
┌─────────────┐
│   ChatGPT   │ ← User enables educational/exploratory mode
└──────┬──────┘
       │ calls set_output_mode()
       ↓
┌──────────────────────┐
│   MCP Server         │ ← Returns instructions that reshape ChatGPT's behavior
│   (FastMCP)          │
└──────┬───────────────┘
       │ create_hypertext() for each key concept
       ↓
┌──────────────────────┐
│  Tooltip Component   │ ← Interactive iframe with inline chat
│  (HTML + window.     │
│   openai API)        │
└──────┬───────────────┘
       │ explore_concept() when user continues conversation
       ↓
┌──────────────────────┐
│  Your Backend        │ ← Existing /api/stream endpoint
│  (localhost:3100 or  │
│   deployed)          │
└──────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
cd hypertext-mcp-connector
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```bash
# Point to your deployed hypertext backend
HYPERTEXT_BACKEND_URL=http://localhost:3100

# Point to where tooltip component is hosted
COMPONENT_CDN_URL=http://localhost:8080/hypertext-tooltip.html
```

### 3. Start the MCP Server

```bash
python server.py
```

Server will start on `http://localhost:8000`

### 4. Test Locally with MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Point to: `http://localhost:8000/mcp`

Test tools:
- `set_output_mode("educational")`
- `create_hypertext("test concept", "test context")`
- `explore_concept("test", "overview")`

### 5. Serve Component Locally

```bash
# In another terminal
cd components
python -m http.server 8080
```

Component available at: `http://localhost:8080/hypertext-tooltip.html`

### 6. Test with ChatGPT via Tunnel

```bash
# In another terminal
ngrok http 8000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

In ChatGPT:
1. Settings → Connectors → Advanced
2. Enable Developer Mode
3. Add connector: `https://abc123.ngrok.io/mcp`
4. Name: "Hypertext Navigator"

### 7. Try It Out!

In ChatGPT:
```
User: Enable educational mode

ChatGPT: ✓ Educational mode activated...

User: Explain quantum computing

ChatGPT: [Provides explanation with 3-5 interactive hypertext links]
```

Hover any underlined concept to open inline tooltip and continue exploring!

## Deployment

### Deploy Backend (if not already deployed)

```bash
# Your existing hypertext backend needs to be accessible via HTTPS

# Option 1: Fly.io
cd ../  # Go to your hypertext backend directory
fly launch
fly deploy

# Get URL: https://your-hypertext.fly.dev
```

Update `.env`:
```bash
HYPERTEXT_BACKEND_URL=https://your-hypertext.fly.dev
```

### Deploy MCP Server

#### Option 1: Fly.io (Recommended)

```bash
# In hypertext-mcp-connector directory
fly launch --name hypertext-mcp

# Set environment variables
fly secrets set HYPERTEXT_BACKEND_URL=https://your-hypertext.fly.dev
fly secrets set COMPONENT_CDN_URL=https://cdn.your-domain.com/hypertext-tooltip.html

# Deploy
fly deploy

# Get URL: https://hypertext-mcp.fly.dev
```

#### Option 2: Render

1. Connect GitHub repo
2. Create new Web Service
3. Set start command: `python server.py`
4. Add environment variables in dashboard
5. Deploy

#### Option 3: Google Cloud Run

```bash
gcloud run deploy hypertext-mcp \
  --source . \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars HYPERTEXT_BACKEND_URL=https://your-hypertext.fly.dev
```

### Deploy Component to CDN

#### Option 1: Vercel

```bash
cd components
vercel deploy
```

Get URL: `https://your-project.vercel.app/hypertext-tooltip.html`

#### Option 2: Netlify

```bash
cd components
netlify deploy --prod
```

#### Option 3: CloudFlare Pages

1. Create new Pages project
2. Connect components directory
3. Deploy
4. Get CDN URL

Update MCP server's `.env`:
```bash
COMPONENT_CDN_URL=https://your-cdn-url.com/hypertext-tooltip.html
```

### Final Configuration

Update your deployed MCP server's environment variable:
```bash
fly secrets set COMPONENT_CDN_URL=https://your-cdn-url.com/hypertext-tooltip.html
```

## Usage Examples

### Example 1: Learning Session

```
User: Switch to educational mode

ChatGPT: [calls set_output_mode("educational")]
✓ Educational mode activated

User: Teach me about neural networks

ChatGPT: [Explains with 3-5 hypertext links]
Neural networks are computational models inspired by biological brains...

Explore deeper:
• activation functions ← hover to learn more
• backpropagation ← how networks learn
• gradient descent ← optimization algorithm
```

### Example 2: Research Session

```
User: Enable exploratory mode

ChatGPT: [calls set_output_mode("exploratory")]
✓ Exploratory mode enabled

User: Overview of quantum error correction

ChatGPT: [Creates 5-10 research branches]

Theoretical Foundations: stabilizer codes, Shor code, surface codes
Physical Implementations: superconducting architectures, ion trap systems
Research Frontiers: topological codes, LDPC codes for QEC
```

### Example 3: Inline Exploration

```
[User hovers "activation functions" hypertext link]
→ Tooltip appears with initial explanation

[In tooltip: User types "What are the most common ones?"]
→ MCP calls explore_concept()
→ Tooltip shows detailed response with examples

[User continues chatting in tooltip]
→ Full conversation thread within the tooltip
→ Never leaves main ChatGPT conversation
```

## Available Tools

### `set_output_mode(mode)`
Control ChatGPT's response style.

**Parameters:**
- `mode`: "standard", "educational", or "exploratory"

**Returns:**
- Instructions that ChatGPT incorporates into its reasoning

### `create_hypertext(term, context, display_text?)`
Create interactive hypertext link.

**Parameters:**
- `term`: Concept to make interactive
- `context`: Surrounding context from main conversation
- `display_text`: Optional custom display text

**Returns:**
- Component metadata for rendering tooltip

### `explore_concept(concept, depth?, previous_messages?)`
Deep dive into a concept (called by tooltip component).

**Parameters:**
- `concept`: Concept to explore
- `depth`: "overview", "intermediate", or "advanced"
- `previous_messages`: JSON string of conversation history

**Returns:**
- Detailed explanation with suggested follow-ups

### `get_current_mode()`
Get currently active output mode.

**Returns:**
- Current mode and description

## Testing

```bash
# Unit tests (coming soon)
pytest tests/

# Manual testing checklist
1. Start server: python server.py
2. Test with Inspector: npx @modelcontextprotocol/inspector
3. Test all tools work
4. Start component server
5. Test with ngrok + ChatGPT
6. Try educational mode
7. Try exploratory mode
8. Hover hypertext links
9. Chat in tooltips
10. Verify persistence
```

## Troubleshooting

### Tool not appearing in ChatGPT
- Enable Developer Mode in Settings → Connectors → Advanced
- Refresh connector in ChatGPT
- Check server logs for errors

### Component not rendering
- Verify COMPONENT_CDN_URL is correct and accessible
- Check browser console for errors
- Ensure CSP headers allow iframe

### Backend connection failing
- Verify HYPERTEXT_BACKEND_URL is correct
- Test backend directly: `curl $HYPERTEXT_BACKEND_URL/api/stream`
- Check CORS configuration

### Tooltip doesn't update
- Check browser console for window.openai errors
- Verify tool responses in MCP Inspector
- Test explore_concept() separately

## Project Structure

```
hypertext-mcp-connector/
├── server.py                  # FastMCP server with tools
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
├── Procfile                  # Deployment config
├── README.md                 # This file
├── components/
│   └── hypertext-tooltip.html # Adapted tooltip component
└── tests/
    └── test_server.py        # Unit tests (coming soon)
```

## License

MIT

## Contributing

Issues and PRs welcome!

## Credits

Built with:
- [FastMCP](https://github.com/jlowin/fastmcp) - MCP server framework
- [ChatGPT Apps SDK](https://developers.openai.com/apps-sdk) - Component system
- Original hypertext-experience.js - Tooltip UI design
