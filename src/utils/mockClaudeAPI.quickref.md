# Mock Claude API - Quick Reference

## Import

```typescript
import { mockClaudeAPI, MockClaudeAPI } from './utils/mockClaudeAPI';
```

## Basic Usage

```typescript
// Simple message
const response = await mockClaudeAPI.sendMessage('What is this?');

// With context
const response = await mockClaudeAPI.sendMessage('Explain this', context);
```

## Streaming

```typescript
for await (const chunk of mockClaudeAPI.createStreamingResponse('Details')) {
  if (chunk.type === 'content_block_delta' && chunk.delta) {
    console.log(chunk.delta.text);
  }
}
```

## Custom Instance

```typescript
const api = new MockClaudeAPI({
  minDelay: 100,    // Min delay in ms
  maxDelay: 500,    // Max delay in ms
  seed: 42,         // For deterministic responses
});
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `minDelay` | 500 | Minimum response delay (ms) |
| `maxDelay` | 2000 | Maximum response delay (ms) |
| `chunkDelay` | 50 | Delay between stream chunks (ms) |
| `enableThinking` | true | Show thinking indicators |
| `seed` | Date.now() | Random seed for determinism |

## Methods

| Method | Purpose |
|--------|---------|
| `sendMessage(msg, ctx?)` | Send message, get response |
| `createStreamingResponse(msg, ctx?)` | Get streaming generator |
| `sendRequest(req)` | Use API request format |
| `clearHistory(cardId?)` | Clear conversation history |
| `getHistory(cardId)` | Get conversation history |
| `updateConfig(config)` | Update configuration |
| `setSeed(seed)` | Reset random seed |

## Query Types

| Keywords | Response Type |
|----------|--------------|
| what, is, this | Element identification |
| summarize, brief | Summary |
| explain, detail | Detailed explanation |
| style, design, css | Style analysis |
| interact, click | Interaction patterns |
| code, html | Implementation details |
| compare, similar | Comparison |
| a11y, accessible | Accessibility info |
| optimize, speed | Performance tips |
| improve, enhance | Improvement suggestions |

## Testing

```typescript
// Deterministic tests
const api = new MockClaudeAPI({ seed: 42 });
const r1 = await api.sendMessage('test');
const r2 = await api.sendMessage('test'); // r1 === r2

// Fast tests
const fast = new MockClaudeAPI({
  minDelay: 10,
  maxDelay: 50,
  enableThinking: false,
});
```

## Common Patterns

### React Component

```typescript
const [response, setResponse] = useState('');

useEffect(() => {
  mockClaudeAPI.sendMessage('What is this?', context)
    .then(setResponse);
}, []);
```

### Error Handling

```typescript
try {
  const response = await mockClaudeAPI.sendMessage('query');
} catch (error) {
  console.error('Mock API error:', error);
}
```

### Conversation Flow

```typescript
const context: ChatContext = {
  cardId: 'card-123',
  messages: [],
  isStreaming: false,
  currentInput: '',
};

// Message 1
await mockClaudeAPI.sendMessage('First question', context);

// Message 2 (with history)
await mockClaudeAPI.sendMessage('Follow-up', context);

// Get history
const history = mockClaudeAPI.getHistory('card-123');
```

## Files

- `mockClaudeAPI.ts` - Main implementation
- `mockClaudeAPI.example.ts` - 10 usage examples
- `mockClaudeAPI.README.md` - Full documentation
- `mockClaudeAPI.SUMMARY.md` - Implementation details
- `mockClaudeAPI.quickref.md` - This file