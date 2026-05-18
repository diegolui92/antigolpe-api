export type TipoEntrada =
  | 'link'
  | 'telefone'
  | 'pix'
  | 'email'
  | 'texto';

export function classificarEntrada(input: string): TipoEntrada {
  const texto = input.toLowerCase().trim();

  // 🔗 DETECTAR LINK
  const regexLink =
    /(https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/;

  if (regexLink.test(texto)) {
    return 'link';
  }

  // 📧 EMAIL (pode ser PIX também)
  const regexEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (regexEmail.test(texto)) {
    return 'email';
  }

  // 🔢 SOMENTE NÚMEROS
  const numeros =
    texto.replace(/\D/g, '');

  // 📱 TELEFONE (Brasil padrão)
  if (
    numeros.length >= 10 &&
    numeros.length <= 11
  ) {
    return 'telefone';
  }

  // 💳 POSSÍVEL PIX (CPF/CNPJ/aleatório)
  if (
    numeros.length === 11 || // CPF
    numeros.length === 14 || // CNPJ
    texto.length >= 20 // chave aleatória
  ) {
    return 'pix';
  }

  // 🧠 TEXTO GENÉRICO
  return 'texto';
}