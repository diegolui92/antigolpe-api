export function analisarPix(input: string) {

  const texto = input.trim();
  const numeros = texto.replace(/\D/g, '');

  let risco: 'seguro' | 'suspeito' | 'alto' = 'seguro';
  let motivos: string[] = [];

  // 🔥 1️⃣ PIX COPIA E COLA (PRIORIDADE MÁXIMA)
  if (texto.startsWith('000201') && texto.includes('br.gov.bcb.pix')) {

    motivos.push('PIX copia e cola detectado');

    if (texto.length < 50) {
      risco = 'suspeito';
      motivos.push('Estrutura incompleta');
    }

    return { risco, motivos };
  }

  // 📱 2️⃣ TELEFONE
  if (numeros.length >= 10 && numeros.length <= 11) {

    motivos.push('Chave PIX telefone');

    if (/(\d)\1{6,}/.test(numeros)) {
      risco = 'alto';
      motivos.push('Número suspeito');
    }

    return { risco, motivos };
  }

  // 🪪 3️⃣ CPF
  if (numeros.length === 11) {

    if (!validarCPF(numeros)) {
      risco = 'alto';
      motivos.push('CPF inválido');
    } else {
      motivos.push('Chave PIX CPF válida');
    }

    return { risco, motivos };
  }

  // 📧 4️⃣ EMAIL
  if (texto.includes('@')) {

    if (validarEmail(texto)) {
      motivos.push('Chave PIX email válida');
    } else {
      risco = 'alto';
      motivos.push('Email inválido');
    }

    return { risco, motivos };
  }

  // 🔑 5️⃣ CHAVE ALEATÓRIA
  if (texto.length >= 20) {

    const temLetra = /[a-zA-Z]/.test(texto);
    const temNumero = /\d/.test(texto);

    if (temLetra && temNumero && !texto.includes(' ')) {

      motivos.push('Chave PIX aleatória');

      if (texto.length > 40) {
        risco = 'suspeito';
        motivos.push('Formato incomum');
      }

      return { risco, motivos };
    }
  }

  // 🚨 RESTO
  risco = 'alto';
  motivos.push('Formato inválido de chave PIX');

  return { risco, motivos };
}


// 🔧 FUNÇÕES AUXILIARES

function validarCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0, resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;

  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

function validarEmail(email: string) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}