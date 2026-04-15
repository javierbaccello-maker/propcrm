// api/ml-token.js
// Funcion serverless de Vercel - maneja el token de ML de forma segura
// El Secret Key nunca queda expuesto en el frontend

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST")    { res.status(405).json({ error: "Method not allowed" }); return; }

  const { action, code, refresh_token, redirect_uri } = req.body;
  const CLIENT_ID     = "7320420630289855";
  const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;

  if (!CLIENT_SECRET) {
    res.status(500).json({ error: "ML_CLIENT_SECRET no configurado en Vercel" });
    return;
  }

  try {
    let body;

    if (action === "get_token") {
      // Intercambiar codigo de autorizacion por token
      body = new URLSearchParams({
        grant_type:    "authorization_code",
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code:          code,
        redirect_uri:  redirect_uri,
      });
    } else if (action === "refresh_token") {
      // Renovar token vencido
      body = new URLSearchParams({
        grant_type:    "refresh_token",
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refresh_token,
      });
    } else {
      res.status(400).json({ error: "Accion invalida" });
      return;
    }

    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
      body:    body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(400).json({ error: data.message || "Error al obtener token de ML", detail: data });
      return;
    }

    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: "Error interno", detail: err.message });
  }
}
