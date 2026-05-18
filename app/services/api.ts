const API_URL = 'http://192.168.1.38:3000';

export async function verificarRiscoAPI(texto: string) {
  try {

    const response = await fetch(`${API_URL}/api/verificar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto }),
    });

    const data = await response.json();

    return data;

  } catch (error) {
    console.log('Erro:', error);
    return null;
  }
}