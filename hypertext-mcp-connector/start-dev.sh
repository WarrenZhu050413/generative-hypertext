#!/bin/bash
# Development startup script for Hypertext Navigator MCP Connector

set -e

echo "🚀 Starting Hypertext Navigator Development Environment"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
    echo ""
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Start component server in background
echo "🌐 Starting component server on port 8080..."
cd components
python3 -m http.server 8080 &
COMPONENT_PID=$!
cd ..
echo "✅ Component server running (PID: $COMPONENT_PID)"
echo ""

# Start MCP server
echo "🎯 Starting MCP server on port 8000..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "MCP Server: http://localhost:8000/mcp"
echo "Component: http://localhost:8080/hypertext-tooltip.html"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Next steps:"
echo "   1. Test with MCP Inspector: npx @modelcontextprotocol/inspector"
echo "   2. Create tunnel: ngrok http 8000"
echo "   3. Add to ChatGPT: Settings → Connectors → [ngrok URL]/mcp"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Trap to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $COMPONENT_PID 2>/dev/null || true
    echo "✅ Cleanup complete"
    exit 0
}
trap cleanup INT TERM

# Start MCP server (foreground)
python server.py

# If server exits, cleanup
cleanup
