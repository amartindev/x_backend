import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Lista de orígenes permitidos
  const allowedOrigins = ['https://tweet-truth-seeker.netlify.app', 'http://localhost:5173'];
  const origin = req.headers.origin || '';

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejo de solicitud preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const tweetId = req.query.id as string;

  if (!tweetId) {
    return res.status(400).json({ error: "Falta el ID del tweet" });
  }

  const token = process.env.TWITTER_BEARER_TOKEN;

  try {
    const response = await fetch(`https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=text`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Response Text:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error("Error al parsear JSON:", error);
      return res.status(500).json({ error: "No se pudo parsear la respuesta como JSON", details: text });
    }

    if (!response.ok) {
      console.error("Twitter API Error:", response.status, data);
      return res.status(500).json({ error: "Error al consultar la API de Twitter", status: response.status, body: data });
    }

    const tweetText = data.data.text;
    return res.status(200).json({ text: tweetText });
  } catch (error) {
    console.error("Error interno:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
