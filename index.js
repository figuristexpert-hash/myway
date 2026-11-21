// Приём заявок с сайта. Яндекс Облако -> Cloud Functions (Node.js 18+), HTTP-вызов.
// Секреты НЕ хранятся в коде, их задают в переменных окружения функции:
//   TG_TOKEN     - токен бота от @BotFather
//   TG_CHAT      - ваш chat_id (число)
//   ALLOW_ORIGIN - адрес вашего сайта, например https://логин.github.io (по умолчанию *)
exports.handler = async (event) => {
  const h = {
    'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: h, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: '{"ok":false}' };
  let data;
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    data = JSON.parse(raw);
  } catch (e) { return { statusCode: 400, headers: h, body: '{"ok":false}' }; }
  const text = String(data.message || '').slice(0, 3500);
  if (text.length < 5) return { statusCode: 400, headers: h, body: '{"ok":false}' };
  try {
    const r = await fetch('https://api.telegram.org/bot' + process.env.TG_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TG_CHAT, text: text })
    });
    return { statusCode: r.ok ? 200 : 502, headers: h, body: JSON.stringify({ ok: r.ok }) };
  } catch (e) { return { statusCode: 502, headers: h, body: '{"ok":false}' }; }
};
