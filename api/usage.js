// api/usage.js - Función serverless para Vercel

export default async function handler(req, res) {
    // Solo permitir GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // TU API KEY VA AQUÍ (se configura como variable de entorno en Vercel)
    const API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            error: 'API key no configurada. Configura ANTHROPIC_API_KEY en las variables de entorno de Vercel.' 
        });
    }

    try {
        // Hacer la petición real a la API de Anthropic
        const response = await fetch('https://api.anthropic.com/v1/organization/usage', {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ 
                error: `Anthropic API error: ${errorText}` 
            });
        }

        const data = await response.json();

        // Habilitar CORS para que el frontend pueda llamar
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Content-Type', 'application/json');

        // Devolver los datos al frontend
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error en función serverless:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor: ' + error.message 
        });
    }
}
