const { URL } = require('url');

module.exports = (req, res) => {
  const target = req.query && req.query.url;
  if (!target) return res.status(400).send('Missing url query parameter');

  let urlObj;
  try {
    urlObj = new URL(target);
  } catch (err) {
    return res.status(400).send('Invalid URL');
  }

  // simple page wrapping an iframe that loads the proxy
  const iframeSrc = `/api/proxy?url=${encodeURIComponent(urlObj.toString())}`;
  const title = urlObj.hostname;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>html,body{height:100%;margin:0}iframe{border:0;width:100%;height:100vh}</style>
</head>
<body>
  <iframe src="${iframeSrc}" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};