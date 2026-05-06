export const config = {
  maxDuration: 30,
};

const NVIDIA_CHAT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const PRIMARY_CHAT_MODEL = 'z-ai/glm-5.1';
const FAST_CHAT_FALLBACKS = ['google/gemma-4-31b-it'];

function withGlmThinking(body) {
  if (body.model !== PRIMARY_CHAT_MODEL) return body;

  return {
    ...body,
    extra_body: {
      ...(body.extra_body || {}),
      chat_template_kwargs: {
        ...(body.extra_body?.chat_template_kwargs || {}),
        enable_thinking: true,
        clear_thinking: false,
      },
    },
  };
}

function makeAttempts(requestBody) {
  const requestedModel = requestBody.model || PRIMARY_CHAT_MODEL;
  const models = [
    requestedModel,
    ...FAST_CHAT_FALLBACKS.filter((model) => model !== requestedModel),
  ];

  return models.map((model, index) => ({
    model,
    timeoutMs: index === 0 && model === PRIMARY_CHAT_MODEL ? 3500 : 4500,
  }));
}

function getLastUserMessage(messages = []) {
  const last = [...messages].reverse().find((message) => message?.role === 'user');
  return typeof last?.content === 'string' ? last.content : '';
}

function getLiveStockContext(messages = []) {
  const joined = messages
    .map((message) => typeof message?.content === 'string' ? message.content : '')
    .join('\n');
  const marker = 'DhanSathi live stock context:';
  const index = joined.lastIndexOf(marker);
  if (index === -1) return null;

  const context = joined.slice(index).split('\n').slice(0, 16);
  const fields = {};
  for (const line of context) {
    const [key, ...rest] = line.split(':');
    if (!rest.length) continue;
    fields[key.trim().toLowerCase()] = rest.join(':').trim();
  }
  return Object.keys(fields).length ? fields : null;
}

function buildStockFallbackAnswer(messages) {
  const stock = getLiveStockContext(messages);
  if (!stock) {
    return [
      'Here is a practical DhanSathi market view you can use while live AI is busy.',
      '',
      'I could not identify live stock data in this request. Ask with a clear NSE symbol or company name, for example: "explain RELIANCE stock" or "TCS RSI signal".',
      '',
      'For any stock, confirm CMP, volume, delivery percentage, trend, RSI, support/resistance, stop-loss and position size before acting. This is educational, not guaranteed profit.',
    ].join('\n');
  }

  return [
    `${stock.company || stock.symbol || 'Stock'} (${stock.symbol || 'symbol unavailable'}) stock view`,
    '',
    `- CMP: ${stock.cmp || 'N/A'}`,
    `- Change: ${stock.change || 'N/A'}`,
    `- Volume: ${stock.volume || 'N/A'}`,
    `- Delivery %: ${stock['delivery percentage'] || 'N/A'}`,
    `- RSI 14: ${stock['rsi 14'] || 'N/A'}`,
    `- SMA 20/50/200: ${stock['sma 20/50/200'] || 'N/A'}`,
    `- DhanSathi signal: ${stock['dhansathi signal'] || 'N/A'}`,
    '',
    'Interpretation:',
    '- If price is above SMA20 and SMA50 with healthy RSI, trend is constructive.',
    '- If price is below SMA20 or RSI is weak, wait for confirmation instead of chasing.',
    '- Delivery data is shown only when the provider supplies exchange delivery percentage.',
    '',
    'Trading discipline:',
    '- Decide entry, stop-loss, target and position size before placing any trade.',
    '- Avoid averaging down blindly; no signal is 100% guaranteed.',
    '',
    'This is educational stock analysis, not financial advice.',
  ].join('\n');
}

function buildServerFallbackAnswer(messages) {
  const question = getLastUserMessage(messages).toLowerCase();

  if (question.includes('salary') || question.includes('income') || question.includes('scheme')) {
    return [
      'Based on the details you shared, I can still help you with a practical DhanSathi check.',
      '',
      'For government schemes, match eligibility mainly by state, age, category, occupation, annual income, and BPL status. If your annual income is around ₹5,00,000 and you are in Uttar Pradesh, first check central schemes such as Ayushman Bharat/PM-JAY eligibility, PM Suraksha Bima Yojana, PM Jeevan Jyoti Bima Yojana, Atal Pension Yojana if applicable, and Uttar Pradesh state welfare schemes based on your category and occupation.',
      '',
      'For savings, keep an emergency fund first, then consider SIP or recurring deposits according to your risk capacity. Do not invest all surplus in stocks; keep position sizes small and use stop-loss discipline.',
    ].join('\n');
  }

  if (question.includes('stock') || question.includes('trade') || question.includes('rsi') || question.includes('signal')) {
    return buildStockFallbackAnswer(messages);
  }

  return [
    'I can help with government schemes, savings, budgeting, SIP planning, and educational stock analysis.',
    '',
    'Tell me your state, occupation, annual income, age, category, and goal, and I will narrow the answer into clear next steps.',
  ].join('\n');
}

function sendServerFallback(res, messages, failures) {
  res.status(200);
  res.setHeader('content-type', 'application/json');
  res.setHeader('x-dhansathi-model-used', 'dhansathi-server-fallback');
  res.setHeader('x-dhansathi-ai-failures', failures.slice(0, 2).join(' | ').slice(0, 500));
  res.json({
    id: `dhansathi-fallback-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'dhansathi-server-fallback',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: buildServerFallbackAnswer(messages),
          reasoning_content: '',
        },
        finish_reason: 'stop',
      },
    ],
  });
}

async function callNvidiaChat(apiKey, requestBody, attempt) {
  const body = withGlmThinking({
    ...requestBody,
    model: attempt.model,
    stream: false,
  });

  const upstream = await fetch(NVIDIA_CHAT_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(attempt.timeoutMs),
  });

  const contentType = upstream.headers.get('content-type') || 'application/json';
  const payload = Buffer.from(await upstream.arrayBuffer());

  return {
    ok: upstream.ok,
    status: upstream.status,
    contentType,
    payload,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;

  if (!apiKey) {
    sendServerFallback(res, req.body?.messages || [], ['NVIDIA_API_KEY is not configured on the server.']);
    return;
  }

  try {
    const body = { ...(req.body || {}) };
    const attempts = makeAttempts(body);
    const results = await Promise.allSettled(
      attempts.map(async (attempt) => {
        try {
          return {
            attempt,
            upstream: await callNvidiaChat(apiKey, body, attempt),
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'unknown error';
          throw new Error(`${attempt.model}: ${message}`);
        }
      }),
    );
    const failures = [];

    for (const result of results) {
      if (result.status === 'rejected') {
        const message = result.reason instanceof Error ? result.reason.message : 'unknown error';
        failures.push(message);
        continue;
      }

      const { attempt, upstream } = result.value;
      if (!upstream.ok) {
        failures.push(`${attempt.model}: HTTP ${upstream.status} ${upstream.payload.toString('utf8').slice(0, 160)}`);
        continue;
      }

      res.status(200);
      res.setHeader('content-type', upstream.contentType);
      res.setHeader('x-dhansathi-model-used', attempt.model);
      res.send(upstream.payload);
      return;
    }

    sendServerFallback(res, body.messages || [], failures);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'NVIDIA chat proxy failed';
    res.status(502).json({ error: message });
  }
}
