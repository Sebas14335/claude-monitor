// api/usage.js - Función serverless para Vercel (v2 con debugging)

export default async function handler(req, res) {
    // Permitir CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // Solo permitir GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verificar API key
    const API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            error: 'API key no configurada en variables de entorno' 
        });
    }

    // Log para debugging (solo primeros caracteres por seguridad)
    console.log('API Key presente:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NO');

    try {
        // Hacer la petición a la API de Anthropic
        console.log('Haciendo petición a Anthropic API...');
        
        const response = await fetch('https://api.anthropic.com/v1/organization/usage', {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01'
            }
        });

        console.log('Respuesta recibida:', response.status, response.statusText);

        // Leer el body de la respuesta
        const responseText = await response.text();
        console.log('Response body:', responseText);

        // Si la respuesta no es OK, devolver el error detallado
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `Anthropic API error: ${response.status} ${response.statusText}`,
                details: responseText,
                apiKeyPrefix: API_KEY.substring(0, 15) + '...'
            });
        }

        // Parsear el JSON
        const data = JSON.parse(responseText);

        // Habilitar CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Content-Type', 'application/json');

        // Devolver los datos
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error capturado:', error);
        
        // Habilitar CORS incluso en errores
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        
        return res.status(500).json({ 
            error: 'Error en función serverless',
            message: error.message,
            stack: error.stack,
            apiKeyConfigured: !!API_KEY
        });
    }
}
