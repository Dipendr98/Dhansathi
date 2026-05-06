const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com';

export default async function handler(req, res) {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'NVIDIA_API_KEY is not configured on the server.' });
    return;
  }

  const rawPath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path || '';
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value != null) {
      query.set(key, value);
    }
  }

  const targetUrl = `${NVIDIA_BASE_URL}/${rawPath}${query.size ? `?${query.toString()}` : ''}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'content-type': req.headers['content-type'] || 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : JSON.stringify(req.body || {}),
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    res.status(upstream.status);
    res.setHeader('content-type', contentType);
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'NVIDIA proxy failed';
    res.status(502).json({ error: message });
  }
}
