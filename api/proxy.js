const { URL } = require('url');

function isPrivateIp(host) {
  // quick checks for obvious private hosts / ranges
  if (!host) return true;
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
  // IPv4 address simple match
  const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) {
    const a = Number(ipv4[1]), b = Number(ipv4[2]);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

module.exports = async (req, res) => {
  try {
    const target = req.query && req.query.url;
    if (!target) return res.status(400).send('Missing url query parameter');

    let url;
    try {
      url = new URL(target);
    } catch (err) {
      return res.status(400).send('Invalid URL');
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
      return res.status(400).send('Only http(s) URLs are allowed');
    }

    if (isPrivateIp(url.hostname) || url.hostname.endsWith('.local')) {
      return res.status(400).send('Access to private or local addresses is blocked');
    }

    // fetch target
    const fetchRes = await fetch(url.toString(), {
      headers: {
        // forward user agent to reduce bot-blocking, but do not forward cookies
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (compatible)',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });

    // If non-OK status, forward status and text
    if (!fetchRes.ok && fetchRes.status >= 400 && fetchRes.status < 600) {
      const errText = await fetchRes.text().catch(() => '');
      return res.status(fetchRes.status).send(errText || `Upstream returned ${fetchRes.status}`);
    }

    const contentType = fetchRes.headers.get('content-type') || '';

    // For HTML, tweak body: inject <base> and strip meta CSP tags
    if (contentType.includes('text/html')) {
      let text = await fetchRes.text();

      // remove meta Content-Security-Policy tags that may block framing or resource loads
      text = text.replace(/<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
      text = text.replace(/<meta[^>]+name=["']?content-security-policy["']?[^>]*>/gi, '');

      // insert base tag so relative URLs resolve to the target origin
      const baseTag = `<base href="${url.origin}">`;
      if (/<head[^>]*>/i.test(text)) {
        text = text.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
      } else {
        text = baseTag + text;
      }

      // respond with cleaned HTML and no framing/CSP headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      // intentionally do not forward CSP/X-Frame-Options headers
      return res.status(200).send(text);
    }

    // For other types (images/pdf, etc.) stream raw bytes back
    const buffer = Buffer.from(await fetchRes.arrayBuffer());
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).send('Proxy error');
  }
};