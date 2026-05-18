export function analisarLink(link: string) {
  const lower = link.toLowerCase();

  let risco: 'seguro' | 'suspeito' | 'alto' = 'seguro';
  let motivos: string[] = [];

  // 🔗 DOMÍNIO
  const dominio = lower
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')
    .split('/')[0];

  // 🚨 EXTENSÕES PERIGOSAS
  const extensoesPerigosas = [
    '.xyz',
    '.top',
    '.vip',
    '.click',
    '.online',
  ];

  extensoesPerigosas.forEach((ext) => {
    if (dominio.includes(ext)) {
      risco = 'alto';
      motivos.push(`Extensão suspeita: ${ext}`);
    }
  });

  // 🚨 HÍFENS (muito comum em golpe)
  if (dominio.includes('-')) {
    risco = 'suspeito';
    motivos.push('Uso de hífen suspeito no domínio');
  }

  // 🚨 DOMÍNIO MUITO GRANDE
  if (dominio.length > 30) {
    risco = 'suspeito';
    motivos.push('Domínio muito longo');
  }

  // 🚨 LETRAS REPETIDAS (yoooutube)
  if (/(.)\1{2,}/.test(dominio)) {
    risco = 'alto';
    motivos.push('Padrão de letras repetidas detectado');
  }

  // 🚨 PALAVRAS COMUNS DE GOLPE
  const palavrasGolpe = [
    'login',
    'seguranca',
    'verificacao',
    'premio',
    'bonus',
    'pix',
    'promo',
  ];

  palavrasGolpe.forEach((p) => {
    if (dominio.includes(p)) {
      risco = 'suspeito';
      motivos.push(`Palavra suspeita: ${p}`);
    }
  });

  // 🚨 CLONAGEM DE MARCAS (genérico, não hardcode pesado)
  const marcas = [
    'google',
    'youtube',
    'nubank',
    'mercadolivre',
    'facebook',
    'instagram',
    'whatsapp',
  ];

  marcas.forEach((marca) => {
    if (
      dominio.includes(marca) &&
      dominio !== `${marca}.com` &&
      dominio !== `${marca}.com.br`
    ) {
      risco = 'alto';
      motivos.push(`Possível clonagem de ${marca}`);
    }
  });

  return {
    risco,
    motivos,
  };
}