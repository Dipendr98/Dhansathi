# DhanMitra AI Worker

The DhanMitra AI simulation worker connects DhanSathi to LLM-powered stock analysis.

## Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Copy `.env.example` to `.env` and fill in API keys
3. Run: `python dhanmitra_worker.py`

## Required API Keys

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key (NOT anon key)
- `LLM_API_KEY` - OpenAI or compatible API key
- `LLM_BASE_URL` - API endpoint (default: https://api.openai.com/v1)
- `LLM_MODEL` - Model name (default: gpt-4o-mini)

## How It Works

1. Worker polls Supabase for pending simulations
2. Fetches real stock data via yfinance
3. Builds Indian market context (NSE/BSE, FII/DII, RBI, sectors)
4. Sends to LLM with multi-agent analysis prompt
5. Parses structured prediction from response
6. Updates simulation record with results
