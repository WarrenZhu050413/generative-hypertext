import { spawn } from 'node:child_process';
import readline from 'node:readline';

const DEFAULT_ARGS = ['exec', '--json', '-'];

function buildArgs(options = {}) {
  const args = [...DEFAULT_ARGS];

  if (options.model) {
    args.splice(1, 0, '--model', String(options.model));
  }

  if (options.profile) {
    args.splice(1, 0, '--profile', String(options.profile));
  }

  if (Array.isArray(options.configOverrides)) {
    for (const override of options.configOverrides) {
      args.splice(1, 0, '--config', String(override));
    }
  }

  if (Array.isArray(options.extraArgs)) {
    args.push(...options.extraArgs.map(String));
  }

  return args;
}

function parseCodexOptions(options = {}) {
  const { providerOptions = {} } = options;
  return {
    model: options.model,
    profile: providerOptions.profile,
    configOverrides: providerOptions.configOverrides,
    extraArgs: providerOptions.extraArgs,
  };
}

function createJsonLineIterator(stream, onLine) {
  const rl = readline.createInterface({ input: stream });
  rl.on('line', line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      const event = JSON.parse(trimmed);
      onLine(event);
    } catch (error) {
      onLine({ type: 'parse_error', raw: trimmed, error });
    }
  });

  return rl;
}

function handleCodexEvent(event, handlers) {
  const { onToken, onDone, onError } = handlers;

  if (event.type === 'parse_error') {
    onError(new Error(`Failed to parse Codex event: ${event.raw}`));
    return;
  }

  if (event.type === 'item.delta') {
    const text = event.delta?.text;
    if (typeof text === 'string' && text.length > 0) {
      onToken(text);
    }
    return;
  }

  if (event.type === 'item.completed') {
    const text = event.item?.text;
    if (typeof text === 'string' && text.length > 0) {
      onToken(text);
    }
    return;
  }

  if (event.type === 'turn.completed' || event.type === 'thread.completed') {
    onDone();
    return;
  }

  if (event.type === 'error' || event.type === 'exception') {
    onError(new Error(event.message || 'Codex CLI reported an error'));
  }
}

function spawnCodexProcess(prompt, options, handlers) {
  return new Promise((resolve, reject) => {
    const args = buildArgs(parseCodexOptions(options));
    const child = spawn('codex', args, { stdio: ['pipe', 'pipe', 'pipe'] });

    let settled = false;
    const stderrChunks = [];

    const safeReject = error => {
      if (settled) return;
      settled = true;
      try {
        child.kill('SIGKILL');
      } catch {
        // ignore
      }
      reject(error);
    };

    const safeResolve = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const rl = createJsonLineIterator(child.stdout, event => {
      handleCodexEvent(event, {
        onToken: handlers.onToken,
        onDone: () => safeResolve(),
        onError: error => safeReject(error),
      });
    });

    child.stderr.on('data', chunk => {
      stderrChunks.push(chunk.toString());
    });

    child.on('error', error => {
      rl.close();
      safeReject(error);
    });

    child.on('close', code => {
      rl.close();
      if (code !== 0 && !settled) {
        const stderr = stderrChunks.join('').trim();
        safeReject(new Error(stderr || `Codex process exited with code ${code}`));
      } else {
        safeResolve();
      }
    });

    child.stdin.write(prompt);
    if (!prompt.endsWith('\n')) {
      child.stdin.write('\n');
    }
    child.stdin.end();
  });
}

export const codexProvider = {
  name: 'codex-cli',

  async send({ prompt, options = {} }) {
    let buffer = '';

    await spawnCodexProcess(prompt, options, {
      onToken: token => {
        buffer += token;
      },
    });

    return {
      content: buffer,
      metadata: {
        provider: this.name,
        timestamp: Date.now(),
      }
    };
  },

  async stream({ prompt, options = {}, onToken, onDone, onError }) {
    try {
      await spawnCodexProcess(prompt, options, { onToken });
      onDone();
    } catch (error) {
      onError(error);
    }
  }
};
