export async function searchWeb(query: string) {
  try {
    const apiKey =
      process.env.EXPO_PUBLIC_GOOGLE_SAFE_BROWSING_API_KEY;

    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          client: {
            clientId: 'antigolpebr',
            clientVersion: '1.0.0',
          },

          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],

            platformTypes: ['ANY_PLATFORM'],

            threatEntryTypes: ['URL'],

            threatEntries: [
              {
                url: query,
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();

    if (data.matches) {
      return [
        {
          titulo: '🚨 SITE PERIGOSO DETECTADO',
          url: query,
          descricao:
            'O Google Safe Browsing identificou risco neste link.',
        },
      ];
    }

    return [];

  } catch (error) {
    console.log('Erro Safe Browsing:', error);

    return [];
  }
}