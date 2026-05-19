const API_URL = 'https://antigolpe-api-production.up.railway.app';

export async function verificarGolpe(texto) {
  try {
    const response = await fetch(`${API_URL}/api/verificar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texto,
        api_key: 'ag_d221603c842605a2514d3d837e732d06'
      }),
    });

    const data = await response.json();

    return data;

  } catch (error) {
    console.log('ERRO API:', error);

    return {
      status: 'ERRO',
      score: 0,
      mensagem: 'Erro ao conectar com servidor'
    };
  }
}