export function analisarTelefone(input: string) {

  const numeros = input.replace(/\D/g, '');

  let risco: 'seguro' | 'suspeito' | 'alto' = 'seguro';

  let motivos: string[] = [];

  // 📌 VERIFICA TAMANHO (Brasil)
  if (numeros.length < 10 || numeros.length > 11) {

    risco = 'alto';

    motivos.push('Número fora do padrão brasileiro');

    return { risco, motivos };
  }

  // 📌 DDD INVÁLIDO
  const ddd = numeros.substring(0, 2);

  const dddsValidos = [
    '11','12','13','14','15','16','17','18','19',
    '21','22','24','27','28',
    '31','32','33','34','35','37','38',
    '41','42','43','44','45','46',
    '47','48','49',
    '51','53','54','55',
    '61','62','63','64','65','66','67',
    '68','69',
    '71','73','74','75','77',
    '79',
    '81','82','83','84','85','86','87','88','89',
    '91','92','93','94','95','96','97','98','99'
  ];

  if (!dddsValidos.includes(ddd)) {

    risco = 'suspeito';

    motivos.push('DDD inválido ou incomum');
  }

  // 📌 NÚMEROS REPETIDOS (golpe comum)
  if (/(\d)\1{6,}/.test(numeros)) {

    risco = 'alto';

    motivos.push('Padrão de números repetidos detectado');
  }

  // 📌 NÚMERO MUITO SEQUENCIAL
  if (
    '1234567890'.includes(numeros) ||
    '0987654321'.includes(numeros)
  ) {

    risco = 'suspeito';

    motivos.push('Sequência numérica suspeita');
  }

  // 📌 TELEFONE FIXO ANTIGO / ESTRANHO
  if (numeros.length === 10) {

    risco = 'suspeito';

    motivos.push('Número sem dígito 9 (possível desatualizado)');
  }

  // 📌 NÚMEROS MUITO CURTOS OU MUITO LONGOS JÁ TRATADO ACIMA

  return {
    risco,
    motivos,
  };
}