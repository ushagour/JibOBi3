// No backend needed - call DeepSeek directly!

export const chat = async (messages) => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('EXPO_PUBLIC_DEEPSEEK_API_KEY is not configured');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are Jibobi3 Assistant for a mobile marketplace app. 
            Help users with orders, listings, payments, and account issues.
            Keep answers short (under 100 words) and suggest specific actions.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || data?.message || `DeepSeek request failed with status ${response.status}`;
      throw new Error(message);
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('DeepSeek response did not contain a reply');
    }

    return { data: { reply } };
  } catch (error) {
    console.error('DeepSeek error:', error?.message || error);
    throw error;
  }
};

export default { chat };