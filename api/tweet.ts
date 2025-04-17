import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    
    // Obtener la respuesta como texto para depuración
    const text = await response.text();
    console.log("Response Text:", text);  // Log para inspeccionar la respuesta

    let data;
    try {
      // Intentar convertir la respuesta en JSON
      data = JSON.parse(text);
    } catch (error) {
      // Si el texto no es JSON válido, mostrar un error y la respuesta cruda
      console.error("Error al parsear JSON:", error);
      return res.status(500).json({ error: "No se pudo parsear la respuesta como JSON", details: text });
    }

    if (!response.ok) {
      console.error("Twitter API Error:", response.status, data);
      return res.status(500).json({ error: "Error al consultar la API de Twitter", status: response.status, body: data });
    }

    // Extraer el texto del tweet y devolverlo
    const tweetText = data.data.text;
    return res.status(200).json({ text: tweetText });
  } catch (error) {
    console.error("Error interno:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
