// app/api/assistant.js

import client from './client';

const GEMINI_API_BASES = [
  'https://generativelanguage.googleapis.com/v1beta',
  'https://generativelanguage.googleapis.com/v1',
];

const PREFERRED_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-pro',
];

let resolvedTarget = null;
let resolveTargetPromise = null;

const getApiKey = () => {
  return (
    process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''  ).trim();
};

const buildPrompt = (messages, userContext) => {
  const history = (messages || [])
    .slice(-10)
    .map((msg) => `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}`)
    .join('\n');

  return [
    'You are Jibobi Assistant, an AI assistant for a mobile marketplace app.',
    '',
    `USER CONTEXT: ${userContext ? JSON.stringify(userContext) : 'New user'}`,
    '',
    'CONVERSATION:',
    history,
    '',
    'RULES:',
    '- Keep responses under 150 words',
    '- Be friendly and helpful',
    '- Suggest specific actions about orders, listings, or payments',
    '- Never ask for sensitive information',
    '',
    'Respond naturally.',
  ].join('\n');
};

const extractGeminiText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';

  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('')
    .trim();
};

const getModelId = (modelName) => {
  if (!modelName || typeof modelName !== 'string') return '';
  return modelName.replace(/^models\//, '').trim();
};

const pickBestModel = (models) => {
  const generatable = (models || []).filter((model) =>
    (model?.supportedGenerationMethods || []).includes('generateContent')
  );

  if (generatable.length === 0) return null;

  for (const preferredId of PREFERRED_GEMINI_MODELS) {
    const match = generatable.find((model) => getModelId(model?.name) === preferredId);
    if (match) return match;
  }

  const flash = generatable.find((model) => getModelId(model?.name).includes('flash'));
  return flash || generatable[0];
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const discoverGeminiTarget = async (apiKey) => {
  let lastError = null;

  for (const apiBase of GEMINI_API_BASES) {
    try {
      const listResponse = await fetch(
        `${apiBase}/models?key=${encodeURIComponent(apiKey)}`
      );

      const listData = await parseJsonSafe(listResponse);

      if (!listResponse.ok) {
        const message =
          listData?.error?.message ||
          listData?.message ||
          `Gemini ListModels failed with status ${listResponse.status}`;
        lastError = new Error(message);
        continue;
      }

      const bestModel = pickBestModel(listData?.models || []);
      if (!bestModel?.name) {
        lastError = new Error('No Gemini models support generateContent for this API key');
        continue;
      }

      return {
        apiBase,
        modelPath: bestModel.name,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to discover a compatible Gemini model');
};

const resolveGeminiTarget = async (apiKey) => {
  if (resolvedTarget) return resolvedTarget;

  if (!resolveTargetPromise) {
    resolveTargetPromise = discoverGeminiTarget(apiKey)
      .then((target) => {
        resolvedTarget = target;
        return target;
      })
      .finally(() => {
        resolveTargetPromise = null;
      });
  }

  return resolveTargetPromise;
};

const sendGeminiRequest = async ({ apiBase, modelPath, apiKey, prompt }) => {
  const response = await fetch(
    `${apiBase}/${modelPath}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 350,
        },
      }),
    }
  );

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `Gemini request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};

const isModelMismatchError = (error) => {
  const message = (error?.message || '').toLowerCase();
  return (
    message.includes('not found') ||
    message.includes('not supported for generatecontent') ||
    message.includes('unsupported model')
  );
};

export const chat = async (messages, userContext = null) => {
  const backendResponse = await client.post('/assistant/chat', {
    messages,
    userContext,
  });

  if (backendResponse.ok && backendResponse.data?.data?.reply) {
    return {
      data: backendResponse.data.data,
      success: true,
      source: 'backend',
    };
  }

  const backendStatus = backendResponse.error?.response?.status;
  if (backendStatus && backendStatus !== 503) {
    const backendMessage =
      backendResponse.error?.response?.data?.error ||
      backendResponse.error?.message ||
      'Failed to generate assistant response';
    throw new Error(backendMessage);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    const backendMessage =
      backendResponse.error?.response?.data?.error ||
      'Assistant is unavailable because the backend AI key is missing and EXPO_PUBLIC_GEMINI_API_KEY is not configured.';
    throw new Error(backendMessage);
  }

  const prompt = buildPrompt(messages, userContext);

  try {
    let target = await resolveGeminiTarget(apiKey);
    let data;

    try {
      data = await sendGeminiRequest({
        apiBase: target.apiBase,
        modelPath: target.modelPath,
        apiKey,
        prompt,
      });
    } catch (firstError) {
      if (!isModelMismatchError(firstError)) {
        throw firstError;
      }

      // Refresh cached model in case model availability changed.
      resolvedTarget = null;
      target = await resolveGeminiTarget(apiKey);
      data = await sendGeminiRequest({
        apiBase: target.apiBase,
        modelPath: target.modelPath,
        apiKey,
        prompt,
      });
    }

    const reply = extractGeminiText(data);
    if (!reply) {
      throw new Error('Gemini response did not contain a reply');
    }

    return {
      data: { reply },
      success: true,
      source: 'gemini-direct',
    };
  } catch (error) {
    console.error('Gemini API error:', error?.message || error);
    throw error;
  }
};

export const getContext = async (params = {}) => {
  const response = await client.get('/assistant/context', { params });

  if (!response.ok || !response.data?.data?.context) {
    const message = response.error?.response?.data?.error || 'Failed to load assistant context';
    throw new Error(message);
  }

  return {
    data: response.data.data,
    success: true,
  };
};

export const resetConversation = async () => {
  // No local memory is stored in this adapter.
};

export default { chat, getContext, resetConversation };