import { assertValidMessages, hasMultimodalContent, buildPrompt } from './promptUtils.js';
import { claudeProvider } from './providers/claudeProvider.js';
import { codexProvider } from './providers/codexProvider.js';

const DEFAULT_PROVIDERS = {
  codex: codexProvider,
  claude: claudeProvider,
};

function resolveProviderKey(providers) {
  const envProvider = process.env.LLM_PROVIDER?.toLowerCase();
  if (envProvider && providers[envProvider]) {
    return envProvider;
  }

  const useClaude = process.env.USE_CLAUDE === '1' || process.env.USE_CLAUDE === 'true';
  if (useClaude) {
    return 'claude';
  }

  return 'codex';
}

export function createLLMService({ providers = DEFAULT_PROVIDERS } = {}) {
  const providerKey = resolveProviderKey(providers);
  const provider = providers[providerKey];

  if (!provider) {
    throw new Error(`Unsupported LLM provider: ${providerKey}`);
  }

  const validate = messages => {
    assertValidMessages(messages);
    if (hasMultimodalContent(messages)) {
      const error = new Error('Multimodal messages not supported by current provider');
      error.code = 'UNSUPPORTED_MULTIMODAL';
      throw error;
    }
  };

  const prepare = (messages, options = {}) => {
    const { system, ...providerOptions } = options;
    const prompt = buildPrompt(messages, system);
    return { prompt, providerOptions };
  };

  const wrapMetadata = metadata => ({
    ...metadata,
    provider: provider.name,
    providerKey,
    source: provider.name,
    timestamp: metadata?.timestamp ?? Date.now(),
  });

  return {
    providerName: provider.name,

    async sendMessage({ messages, options }) {
      validate(messages);
      const { prompt, providerOptions } = prepare(messages, options);
      const response = await provider.send({ prompt, options: providerOptions });
      return {
        content: response.content,
        metadata: wrapMetadata(response.metadata || {}),
      };
    },

    async streamMessage({ messages, options, onToken, onDone, onError }) {
      validate(messages);
      const { prompt, providerOptions } = prepare(messages, options);
      return provider.stream({
        prompt,
        options: providerOptions,
        onToken,
        onDone,
        onError,
      });
    },

    getProviderKey() {
      return providerKey;
    },

    getProviderName() {
      return provider.name;
    }
  };
}
