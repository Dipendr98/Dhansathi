import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { loadSavedUserProfile, useAuthStore } from '@/stores/authStore';
import { usePlanStore } from '@/stores/planStore';
import { useLanguageStore } from '@/stores/languageStore';
import { calculateSchemeMatches, calculateUnclaimedBenefits } from '@/lib/schemeService';
import { fetchStockBySymbol, searchAndFetchStocks } from '@/lib/stockApi';
import { MOCK_STOCKS } from '@/data/mockStocks';
import type { StockData, UserProfile } from '@/types';

// NVIDIA AI Configuration
const DEV_NVIDIA_KEY = import.meta.env.DEV ? import.meta.env.VITE_NVIDIA_API_KEY || '' : '';
const NVIDIA_BASE_URL =
  import.meta.env.DEV
    ? import.meta.env.VITE_NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1'
    : typeof window !== 'undefined'
      ? `${window.location.origin}/api/nvidia/v1`
    : import.meta.env.VITE_NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const DHANSATHI_CHAT_MODEL = 'z-ai/glm-5.1';


/* ── Animation helpers ─────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ── Types ─────────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  reasoning?: string;
  timestamp: string;
  schemes?: SchemeCard[];
}

interface SchemeCard {
  name: string;
  benefit: string;
  eligibility: string;
  icon: string;
}

type ChatRequestMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

interface NvidiaChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
      reasoning_content?: string | null;
    };
  }>;
}

const STOCK_ALIASES: Record<string, string> = {
  reliance: 'RELIANCE',
  realiance: 'RELIANCE',
  rel: 'RELIANCE',
  tcs: 'TCS',
  infosys: 'INFY',
  infy: 'INFY',
  hdfc: 'HDFCBANK',
  hdfcbank: 'HDFCBANK',
  icici: 'ICICIBANK',
  icicibank: 'ICICIBANK',
  sbi: 'SBIN',
  tatamotors: 'TATAMOTORS',
  tata: 'TATAMOTORS',
  airtel: 'BHARTIARTL',
  bharti: 'BHARTIARTL',
  itc: 'ITC',
  adani: 'ADANIENT',
  axis: 'AXISBANK',
  kotak: 'KOTAKBANK',
  larsen: 'LT',
  lt: 'LT',
};

function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function getAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function humanize(value?: string): string {
  return value ? value.replace(/_/g, ' ') : '';
}

function formatStockPrice(stock: StockData): string {
  const currency = stock.currency || 'INR';
  const amount = stock.price.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: stock.price < 100 ? 2 : 0,
  });
  return currency === 'INR' ? `₹${amount}` : `${currency} ${amount}`;
}

function formatVolume(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return 'N/A';
  if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000) return `${(value / 100_000).toFixed(2)} L`;
  return Math.round(value).toLocaleString('en-IN');
}

function formatSignal(signal: StockData['signal']): string {
  return signal.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function hasStockIntent(input: string): boolean {
  const lower = input.toLowerCase();
  return [
    'stock', 'share', 'cmp', 'rsi', 'signal', 'buy', 'sell', 'trade',
    'target', 'stoploss', 'stop-loss', 'volume', 'delivery', 'explain',
  ].some((word) => lower.includes(word)) || Object.keys(STOCK_ALIASES).some((alias) => lower.includes(alias));
}

function extractStockQuery(input: string): string | null {
  const lower = input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const compact = lower.replace(/\s+/g, '');

  for (const [alias, symbol] of Object.entries(STOCK_ALIASES)) {
    if (compact.includes(alias)) return symbol;
  }

  const upperTokens = input
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2 && token.length <= 12);

  const ignored = new Set(['STOCK', 'SHARE', 'EXPLAIN', 'ANALYSIS', 'BUY', 'SELL', 'RSI', 'CMP']);
  return upperTokens.find((token) => !ignored.has(token)) || null;
}

async function resolveAskedStock(input: string): Promise<StockData | null> {
  if (!hasStockIntent(input)) return null;

  const query = extractStockQuery(input);
  if (!query) return null;

  const direct = await fetchStockBySymbol(query);
  if (direct) return direct;

  const results = await searchAndFetchStocks(query);
  return results[0] || null;
}

function buildLiveStockContext(stock: StockData): string {
  const delivery = stock.delivery_source === 'exchange' && stock.delivery_pct > 0
    ? `${stock.delivery_pct.toFixed(1)}%`
    : 'N/A from current provider';
  const signalSource = stock.signal_source === 'live_history'
    ? 'live 1Y chart history'
    : stock.signal_source === 'partial_history'
      ? 'partial chart history'
      : 'estimated';

  return [
    'DhanSathi live stock context:',
    `Symbol: ${stock.symbol}`,
    `Company: ${stock.name}`,
    `Exchange: ${stock.exchange || 'NSE/Yahoo'}`,
    `CMP: ${formatStockPrice(stock)}`,
    `Change: ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${stock.change_pct >= 0 ? '+' : ''}${stock.change_pct.toFixed(2)}%)`,
    `Volume: ${formatVolume(stock.volume)}; average volume: ${formatVolume(stock.avg_volume)}`,
    `Delivery percentage: ${delivery}`,
    `RSI 14: ${stock.rsi_14}`,
    `SMA 20/50/200: ${stock.sma_20.toFixed(2)} / ${stock.sma_50.toFixed(2)} / ${stock.sma_200.toFixed(2)}`,
    `52-week range: ${formatStockPrice({ ...stock, price: stock.week_52_low })} - ${formatStockPrice({ ...stock, price: stock.week_52_high })}`,
    `DhanSathi signal: ${formatSignal(stock.signal)} (${signalSource})`,
    `Data quality: ${stock.data_quality || 'partial'}; source: ${stock.data_source || 'market API'}`,
    stock.warning ? `Provider note: ${stock.warning}` : '',
  ].filter(Boolean).join('\n');
}

function buildStockMasterResponse(stock: StockData, user: UserProfile | null): string {
  const isAbove20 = stock.price >= stock.sma_20;
  const isAbove50 = stock.price >= stock.sma_50;
  const rsiView =
    stock.rsi_14 >= 70 ? 'RSI is overbought, so fresh entry needs patience.'
      : stock.rsi_14 <= 30 ? 'RSI is oversold, so watch for reversal confirmation.'
        : stock.rsi_14 >= 55 ? 'RSI shows positive momentum but is not extreme.'
          : stock.rsi_14 >= 45 ? 'RSI is neutral, so price confirmation matters.'
            : 'RSI is weak, so avoid aggressive buying until momentum improves.';
  const trendView = isAbove20 && isAbove50
    ? 'Price is above short and medium moving averages, which supports an uptrend bias.'
    : isAbove20
      ? 'Price is above SMA20 but not fully above SMA50, so trend is improving but not clean yet.'
      : 'Price is below SMA20, so wait for strength before considering entry.';
  const delivery = stock.delivery_source === 'exchange' && stock.delivery_pct > 0
    ? `${stock.delivery_pct.toFixed(1)}%`
    : 'N/A';

  return [
    `${stock.name} (${stock.symbol}) stock view`,
    '',
    `- CMP: ${formatStockPrice(stock)}`,
    `- Change: ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${stock.change_pct >= 0 ? '+' : ''}${stock.change_pct.toFixed(2)}%)`,
    `- Volume: ${formatVolume(stock.volume)}; avg volume: ${formatVolume(stock.avg_volume)}`,
    `- Delivery %: ${delivery}`,
    `- RSI 14: ${stock.rsi_14}`,
    `- SMA 20/50/200: ${stock.sma_20.toFixed(2)} / ${stock.sma_50.toFixed(2)} / ${stock.sma_200.toFixed(2)}`,
    `- DhanSathi signal: ${formatSignal(stock.signal)}`,
    '',
    'Interpretation:',
    `- ${trendView}`,
    `- ${rsiView}`,
    `- Signal quality is ${stock.signal_source === 'live_history' ? 'stronger because it uses live chart history' : 'limited because some indicators are partial/estimated'}.`,
    '',
    'Trading discipline:',
    `- Bullish only if price sustains above ${formatStockPrice({ ...stock, price: Math.max(stock.sma_20, stock.sma_50) })}.`,
    `- Weak below ${formatStockPrice({ ...stock, price: stock.sma_20 })}; avoid averaging down blindly.`,
    `- For your profile${user?.annual_income ? ` with income ${formatINR(user.annual_income)}` : ''}, keep position size small and do not risk more than you can afford to lose.`,
    '',
    'This is educational analysis, not guaranteed profit or financial advice.',
  ].join('\n');
}

function getPersonalizedStockIdeas(user: UserProfile | null): StockData[] {
  const income = user?.annual_income ?? 0;
  const occupation = (user?.occupation || '').toLowerCase();
  const beginnerOrConservative =
    income > 0 && income < 600000 ||
    ['student', 'homemaker', 'retired', 'daily_wage_worker'].includes(occupation);

  const pool = beginnerOrConservative
    ? MOCK_STOCKS.filter((stock) =>
      stock.pe_ratio > 0 &&
      stock.pe_ratio <= 30 &&
      stock.rsi_14 >= 35 &&
      stock.rsi_14 <= 65 &&
      ['buy', 'hold', 'strong_buy'].includes(stock.signal),
    )
    : MOCK_STOCKS.filter((stock) => ['buy', 'strong_buy'].includes(stock.signal));

  return [...pool]
    .sort((a, b) => {
      const signalScore = (stock: StockData) => stock.signal === 'strong_buy' ? 2 : stock.signal === 'buy' ? 1 : 0;
      return signalScore(b) - signalScore(a) || b.change_pct - a.change_pct;
    })
    .slice(0, 5);
}

function buildPersonalizationContext(user: UserProfile | null): string {
  if (!user) {
    return [
      'No saved user profile is available yet.',
      'Ask the user to complete Settings for more accurate scheme and stock guidance.',
    ].join('\n');
  }

  const age = getAge(user.date_of_birth);
  const profileLines = [
    `Name: ${user.full_name || 'Not provided'}`,
    `Age: ${age ?? 'Not provided'}`,
    `Gender: ${user.gender || 'Not provided'}`,
    `State: ${user.state || 'Not provided'}`,
    `District: ${user.district || 'Not provided'}`,
    `Category: ${user.category?.toUpperCase() || 'Not provided'}`,
    `Occupation: ${humanize(user.occupation) || 'Not provided'}`,
    `Annual income: ${user.annual_income != null ? formatINR(user.annual_income) : 'Not provided'}`,
    `BPL: ${user.is_bpl ? 'Yes' : 'No'}`,
    `Plan: ${user.plan}`,
  ];

  const matches = calculateSchemeMatches(user).slice(0, 5);
  const benefits = calculateUnclaimedBenefits(user);
  const schemeLines = matches.map((match, index) => {
    const reasons = match.reasons.slice(0, 3).join('; ') || 'Partial profile match';
    const gaps = match.missingCriteria.slice(0, 2).join('; ');
    return `${index + 1}. ${match.scheme.name} (${match.score}% match): ${match.scheme.benefits}. Why: ${reasons}${gaps ? `. Gaps: ${gaps}` : ''}`;
  });

  const stockLines = getPersonalizedStockIdeas(user).map((stock, index) =>
    `${index + 1}. ${stock.symbol} (${stock.name}) - ${stock.signal.replace(/_/g, ' ')}, price ${formatINR(stock.price)}, RSI ${stock.rsi_14}, PE ${stock.pe_ratio}. Confirm live CMP and risk in Stocks/DhanMitra before trading.`,
  );

  return [
    'Saved User Profile:',
    ...profileLines,
    '',
    `Estimated eligible schemes: ${benefits.schemeCount}; estimated potential benefits: ${formatINR(benefits.totalAmount)}.`,
    'Top scheme matches from DhanSathi engine:',
    ...(schemeLines.length ? schemeLines : ['No strong scheme matches yet. Ask for missing profile details.']),
    '',
    'Stock/trade context from DhanSathi screener:',
    ...(stockLines.length ? stockLines : ['No stock ideas matched the saved profile risk filters.']),
  ].join('\n');
}

/* ── Sample data ───────────────────────────────── */

const WELCOME_EN =
  'Namaste! I\'m your DhanSathi AI assistant. I can help you discover unclaimed government benefits, analyze stocks, calculate SIP returns, and provide personalized financial guidance. How can I help you today?';

const WELCOME_HI =
  'नमस्ते! मैं आपका DhanSathi AI सहायक हूँ। मैं सरकारी योजनाओं, स्टॉक विश्लेषण, SIP रिटर्न, और वित्तीय सलाह में आपकी मदद कर सकता हूँ।';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'ai',
    content: WELCOME_EN,
    timestamp: '10:00 AM',
  },
  {
    id: '2',
    role: 'user',
    content: 'Which schemes am I eligible for?',
    timestamp: '10:01 AM',
  },
  {
    id: '3',
    role: 'ai',
    content:
      'Based on your profile, I found 3 government schemes you may be eligible for. Here are the top matches:',
    timestamp: '10:01 AM',
    schemes: [
      {
        name: 'PM Kisan Samman Nidhi',
        benefit: '₹6,000/year direct transfer',
        eligibility: 'All land-holding farmer families',
        icon: 'agriculture',
      },
      {
        name: 'Atal Pension Yojana',
        benefit: '₹1,000-₹5,000/month pension',
        eligibility: 'Age 18-40, unorganized sector',
        icon: 'elderly',
      },
      {
        name: 'PM Jeevan Jyoti Bima Yojana',
        benefit: '₹2,00,000 life insurance',
        eligibility: 'Age 18-55, savings bank account',
        icon: 'shield',
      },
    ],
  },
];

const SUGGESTED_PROMPTS_EN = [
  { label: 'Check my eligibility', icon: 'person_search' },
  { label: 'Stock analysis', icon: 'monitoring' },
  { label: 'SIP calculator', icon: 'calculate' },
  { label: 'Market update', icon: 'newspaper' },
];

const SUGGESTED_PROMPTS_HI = [
  { label: 'मेरी पात्रता जांचें', icon: 'person_search' },
  { label: 'स्टॉक विश्लेषण', icon: 'monitoring' },
  { label: 'SIP कैलकुलेटर', icon: 'calculate' },
  { label: 'बाजार अपडेट', icon: 'newspaper' },
];

/* ── Typing Indicator ──────────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-on-surface-variant/40 rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ── Component ─────────────────────────────────── */

function buildSystemPrompt(user: UserProfile | null, isHindi: boolean = false, liveStockContext = ''): string {
  let prompt = `You are DhanSathi, a helpful financial assistant for users in India. You help with government scheme eligibility, stock analysis, SIP calculations, and personalized financial guidance.

Use the saved profile and DhanSathi app context below whenever answering. If the user asks about schemes, recommend the strongest matches first, explain why they match, mention missing profile details if any, and suggest the next action. If the user asks about stocks or trades, use the live stock context first when available. Include CMP, change %, volume, delivery %, RSI, trend, signal, entry discipline, stop-loss thinking, position sizing, and avoid guaranteed-profit language. Always include a short reminder that stock ideas are educational and not financial advice.

${buildPersonalizationContext(user)}

${liveStockContext}`;

  prompt += `\n\nYou are bilingual in Hindi and English. If the user writes in Hindi (Devanagari script or Hinglish), respond in Hindi. If they write in English, respond in English. Use simple, friendly language that a common Indian citizen can understand. Use ₹ for Indian currency.`;

  if (isHindi) {
    prompt = `Please respond in Hindi (Devanagari script).\n\n` + prompt;
  }

  return prompt;
}

async function requestDhanSathiAI(messages: ChatRequestMessage[]): Promise<{ content: string; reasoning: string }> {
  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(DEV_NVIDIA_KEY ? { Authorization: `Bearer ${DEV_NVIDIA_KEY}` } : {}),
    },
    body: JSON.stringify({
      model: DHANSATHI_CHAT_MODEL,
      messages,
      max_tokens: 700,
      temperature: 0.4,
      stream: false,
      extra_body: {
        chat_template_kwargs: {
          enable_thinking: true,
          clear_thinking: false,
        },
      },
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    if (body.includes('image') && body.includes('does not support')) {
      console.warn('[ChatPage] NVIDIA model rejected the request:', body.slice(0, 180));
    }
    throw new Error(`NVIDIA chat failed with HTTP ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json() as NvidiaChatResponse;
  const message = data.choices?.[0]?.message;
  return {
    content: (message?.content || '').trim(),
    reasoning: (message?.reasoning_content || '').trim(),
  };
}

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const effectiveUser = user ?? loadSavedUserProfile();
  const planUseCredit = usePlanStore((s) => s.useCredit);
  const planRemaining = usePlanStore((s) => s.getRemainingCredits);
  const planUpgrade = usePlanStore((s) => s.upgradeToPro);
  const userPlan = user?.plan || 'free';
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { lang, toggleLang } = useLanguageStore();
  const isHindi = lang === 'hi';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdRef = useRef(0);

  const nextMessageId = () => {
    messageIdRef.current += 1;
    return `chat-${messageIdRef.current}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Check credits before sending
    if (!planUseCredit('ai_chat')) {
      const noCreditsMsg: ChatMessage = {
        id: nextMessageId(),
        role: 'ai',
        content: userPlan === 'free'
          ? 'You have used all your free AI credits for today. Upgrade to Pro (₹199/month) for unlimited credits!'
          : 'You have used all your AI credits for today. Credits reset tomorrow.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
      setMessages((prev) => [...prev, noCreditsMsg]);
      setInputValue('');
      return;
    }

    const userMessage: ChatMessage = {
      id: nextMessageId(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    let askedStock: StockData | null = null;
    let liveStockContext = '';
    try {
      askedStock = await resolveAskedStock(messageText);
      liveStockContext = askedStock ? buildLiveStockContext(askedStock) : '';
    } catch (error) {
      console.warn('[ChatPage] Stock context lookup failed:', error);
    }

    const addFallbackResponse = (includeNotice = false) => {
      const aiResponse: ChatMessage = {
        id: nextMessageId(),
        role: 'ai',
        content: `${includeNotice ? 'Live AI is unavailable right now, so I am using DhanSathi smart mode.\n\n' : ''}${getAIResponse(messageText, effectiveUser, askedStock)}`,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);
    };

    try {
      const chatHistory: ChatRequestMessage[] = messages
        .filter(m => !['1', '2', '3'].includes(m.id)) // Skip all initial mock messages to ensure strict role alternation
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }));

      const aiResult = await requestDhanSathiAI([
          { role: "system", content: buildSystemPrompt(effectiveUser, isHindi, liveStockContext) },
          ...chatHistory,
          { role: "user", content: liveStockContext ? `${messageText}\n\n${liveStockContext}` : messageText }
        ]);

      const responseId = nextMessageId();

      setMessages((prev) => [
        ...prev,
        {
          id: responseId,
          role: 'ai',
          content: aiResult.content || getAIResponse(messageText, effectiveUser, askedStock),
          reasoning: aiResult.reasoning,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
        },
      ]);
      setIsTyping(false);
    } catch (error) {
      console.error('[ChatPage] AI request failed, using fallback response:', error);
      addFallbackResponse(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]"
    >
      {/* ── Header ── */}
      <motion.div variants={fadeUp} custom={0} className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[22px]">psychology</span>
            </div>
            <div>
              <h1 className="font-headline text-xl md:text-2xl font-extrabold text-on-surface">
                Ask DhanSathi
              </h1>
              <p className="text-xs text-on-surface-variant">AI-powered financial assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLang}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                isHindi
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-primary/40',
              )}
              title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
            >
              {isHindi ? 'हिं' : 'EN'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Chat Messages ── */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="flex-1 overflow-y-auto rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-4 md:p-6 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            <div
              className={cn(
                'max-w-[85%] md:max-w-[70%]',
                message.role === 'user' ? 'order-1' : 'order-1',
              )}
            >
              {/* Avatar + Bubble */}
              <div
                className={cn(
                  'flex items-start space-x-3',
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : '',
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
                    message.role === 'ai'
                      ? 'bg-gradient-to-br from-primary to-primary-container'
                      : 'bg-gradient-to-br from-saffron to-secondary-container',
                  )}
                >
                  {message.role === 'ai' ? (
                    <span className="material-symbols-outlined text-white text-[16px]">
                      psychology
                    </span>
                  ) : (
                    <span className="text-white font-bold text-xs">R</span>
                  )}
                </div>

                {/* Message Bubble */}
                <div>
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3',
                      message.role === 'ai'
                        ? 'bg-surface-container-low text-on-surface rounded-tl-sm'
                        : 'bg-primary text-white rounded-tr-sm',
                    )}
                  >
                    {message.reasoning && (
                      <div className="mb-2 p-2 bg-on-surface-variant/5 rounded-lg border-l-2 border-primary/30 text-[11px] italic text-on-surface-variant/70 font-mono leading-tight">
                        <div className="flex items-center space-x-1 mb-1 opacity-50">
                          <span className="material-symbols-outlined text-[12px]">psychology</span>
                          <span className="font-bold uppercase tracking-wider">Thinking Process</span>
                        </div>
                        {message.reasoning}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.id === '1' ? (isHindi ? WELCOME_HI : WELCOME_EN) : message.content}
                    </p>
                  </div>

                  {/* Scheme Cards */}
                  {message.schemes && (
                    <div className="mt-3 space-y-2">
                      {message.schemes.map((scheme) => (
                        <div
                          key={scheme.name}
                          className="bg-white rounded-xl border border-outline-variant/20 p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-primary text-[18px]">
                                {scheme.icon}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-on-surface text-sm">
                                {scheme.name}
                              </p>
                              <p className="font-mono text-xs font-semibold text-tertiary mt-0.5">
                                {scheme.benefit}
                              </p>
                              <p className="text-xs text-on-surface-variant mt-1">
                                {scheme.eligibility}
                              </p>
                            </div>
                            <button className="text-primary hover:text-primary-container transition-colors flex-shrink-0">
                              <span className="material-symbols-outlined text-[18px]">
                                arrow_forward
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p
                    className={cn(
                      'text-[10px] mt-1 px-1',
                      message.role === 'ai'
                        ? 'text-on-surface-variant/60'
                        : 'text-on-surface-variant/60 text-right',
                    )}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start space-x-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-[16px]">psychology</span>
              </div>
              <div className="bg-surface-container-low rounded-2xl rounded-tl-sm">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </motion.div>

      {/* ── Suggested Prompts ── */}
      <motion.div variants={fadeUp} custom={2} className="mt-3">
        <div className="flex flex-wrap gap-2">
          {(isHindi ? SUGGESTED_PROMPTS_HI : SUGGESTED_PROMPTS_EN).map((prompt) => (
            <button
              key={prompt.label}
              onClick={() => handleSend(prompt.label)}
              disabled={isTyping}
              className={cn(
                'flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border border-outline-variant/20',
                isTyping
                  ? 'bg-surface-container-low text-on-surface-variant/50 cursor-not-allowed'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-primary-fixed hover:text-primary hover:border-primary/20',
              )}
            >
              <span className="material-symbols-outlined text-[14px]">{prompt.icon}</span>
              <span>{prompt.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Input Area ── */}
      <motion.div
        variants={fadeUp}
        custom={3}
        className="mt-3 space-y-2"
      >
        {/* Credit indicator */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-saffron">token</span>
            <span>
              {userPlan === 'pro' ? <span className="font-mono font-semibold">Unlimited</span> : <><span className="font-mono font-semibold">{planRemaining('ai_chat')}</span>/20</>} credits today
            </span>
            {userPlan === 'free' && (
              <span className="text-[10px] font-bold text-primary bg-primary-fixed/40 px-1.5 py-0.5 rounded">FREE</span>
            )}
            {userPlan === 'pro' && (
              <span className="text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded">PRO</span>
            )}
          </div>
          {userPlan === 'free' && planRemaining('ai_chat') === 0 && (
            <button
              onClick={planUpgrade}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Upgrade to Pro — ₹199/mo
            </button>
          )}
        </div>
      </motion.div>
      <motion.div
        variants={fadeUp}
        custom={3}
        className="flex items-center space-x-3"
      >
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything about finance, schemes, stocks..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl pl-5 pr-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              inputValue.trim() && !isTyping
                ? 'bg-primary text-white hover:bg-primary-container shadow-md'
                : 'bg-surface-container-high text-on-surface-variant/40',
            )}
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Mock AI Responses ─────────────────────────── */

function getAIResponse(userInput: string, user: UserProfile | null, askedStock: StockData | null = null): string {
  const input = userInput.toLowerCase();
  const matches = user ? calculateSchemeMatches(user).slice(0, 3) : [];
  const stockIdeas = getPersonalizedStockIdeas(user).slice(0, 3);
  const profileIntro = user
    ? `Using your saved profile (${user.state || 'state not set'}, ${humanize(user.occupation) || 'occupation not set'}, income ${user.annual_income != null ? formatINR(user.annual_income) : 'not set'}), `
    : '';

  if (input.includes('salary') || input.includes('income') || input.includes('वेतन') || input.includes('आय')) {
    if (!user?.annual_income) {
      return 'I still cannot see your saved annual income. Please save Annual Income in Settings once, then ask again.';
    }

    const monthlyIncome = user.annual_income / 12;
    return `I can see your saved income now.\n\n- Annual income: ${formatINR(user.annual_income)}\n- Approx monthly income: ${formatINR(monthlyIncome)}\n- Occupation: ${humanize(user.occupation) || 'Not set'}\n- Location: ${user.district || 'District not set'}, ${user.state || 'State not set'}\n\nI will use this income for scheme eligibility, benefit matching, SIP planning, and risk-aware stock suggestions.`;
  }

  if (askedStock) {
    return buildStockMasterResponse(askedStock, user);
  }

  if (hasStockIntent(input) || input.includes('analysis')) {
    const ideas = stockIdeas.map((stock) =>
      `- ${stock.symbol}: ${formatSignal(stock.signal)} signal, CMP ${formatStockPrice(stock)}, RSI ${stock.rsi_14}, PE ${stock.pe_ratio}`,
    ).join('\n');
    return `${profileIntro}here are stock ideas from the DhanSathi screener:\n\n${ideas || '- I could not identify the stock name/symbol. Try asking "explain RELIANCE stock" or "TCS RSI signal".'}\n\nFor a master stock view, ask with a company name or NSE symbol. I will fetch CMP, change %, volume, RSI, SMA trend and signal. Use this for education only. Keep position size small, define a stop-loss before entry, and do not trade without your own confirmation.`;
  }

  if (input.includes('sip') || input.includes('calculator')) {
    return 'Let me help you with SIP calculations!\n\nFor a monthly SIP of ₹5,000 at 12% returns:\n- 5 years: ₹4,12,432\n- 10 years: ₹11,61,695\n- 20 years: ₹49,95,740\n\nYou can try different amounts in the Crossover Engine for interactive projections. Want me to calculate for a specific amount?';
  }

  if (input.includes('market') || input.includes('update')) {
    return 'Here\'s today\'s market snapshot:\n\n- Nifty 50: 22,456.80 (+0.72%)\n- Sensex: 73,891.25 (+0.68%)\n- India VIX: 13.42 (-2.1%)\n\nTop Gainers: BHARTIARTL (+3.2%), TATAMOTORS (+2.8%)\nTop Losers: WIPRO (-1.4%), INFY (-0.9%)\n\nFII activity: Net buyers ₹1,245 Cr today. Overall sentiment is cautiously bullish.';
  }

  if (input.includes('eligib') || input.includes('scheme') || input.includes('yojana')) {
    const schemeSummary = matches.map((match) =>
      `- ${match.scheme.name} (${match.score}% match): ${match.scheme.benefits}. Why: ${match.reasons.slice(0, 2).join(', ') || 'profile match'}`,
    ).join('\n');
    return `${profileIntro}these schemes look most relevant:\n\n${schemeSummary || '- I need your state, income, age, category, and occupation in Settings to match schemes accurately.'}\n\nOpen each scheme page, confirm documents, and check the official application link before applying.`;
  }

  return 'That\'s a great question! I\'m analyzing the relevant financial data to give you the most accurate response. For personalized advice, please make sure your profile is updated. Is there anything specific about government schemes, stocks, or financial planning I can help with?';
}
