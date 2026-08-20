// app/api/assistant.js

import client from './client';

const GEMINI_API_BASES = [
  'https://generativelanguage.googleapis.com/v1beta',
  'https://generativelanguage.googleapis.com/v1',
];

const PREFERRED_GEMINI_MODELS = [
  'gemini-2.5-flash'
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
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages format: must be a non-empty array');
  }

  // Normalize messages to standard format
  const normalizedMessages = messages.map(msg => ({
    role: msg.role || 'user',
    content: msg.content || msg.text || '',
  })).filter(msg => msg.content.trim());

  if (normalizedMessages.length === 0) {
    throw new Error('No valid messages to send');
  }

  console.log('🔄 [ASSISTANT] Attempting backend communication:', {
    messageCount: normalizedMessages.length,
    hasContext: !!userContext,
  });

  try {
    const backendResponse = await client.post('/assistant/chat', {
      messages: normalizedMessages,
      userContext,
    });

    if (backendResponse.ok && backendResponse.data?.data?.reply) {
      console.log('✅ [ASSISTANT] Backend success:', {
        source: backendResponse.data.data.source,
        replyLength: backendResponse.data.data.reply?.length,
      });

      return {
        data: backendResponse.data.data,
        success: true,
        source: 'backend',
      };
    }

    const backendStatus = backendResponse.error?.response?.status;
    const backendErrorMsg =
      backendResponse.error?.response?.data?.error ||
      backendResponse.error?.message ||
      'Backend request failed';

    // Only try fallback for 503 Service Unavailable
    if (backendStatus === 503) {
      console.warn('🔄 [ASSISTANT] Backend unavailable (503), trying direct Gemini:', backendErrorMsg);
    } else if (backendStatus >= 400) {
      // For other errors (400, 401, 404, etc), throw and don't continue
      console.error('❌ [ASSISTANT] Backend error:', {
        status: backendStatus,
        message: backendErrorMsg,
      });
      throw new Error(backendErrorMsg);
    }
  } catch (error) {
    const backendStatus = error?.response?.status;
    if (backendStatus && backendStatus !== 503) {
      throw error;
    }
  }

  // Fallback to direct Gemini if backend is unavailable
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Assistant is unavailable: Backend is down and EXPO_PUBLIC_GEMINI_API_KEY is not configured');
  }

  console.log('🌐 [ASSISTANT] Using direct Gemini fallback');
  const prompt = buildPrompt(normalizedMessages, userContext);

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
      console.warn('🔄 [ASSISTANT] Model mismatch, refreshing...');
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

    console.log('✅ [ASSISTANT] Direct Gemini success');
    return {
      data: { reply, model: target.modelPath },
      success: true,
      source: 'gemini-direct',
    };
  } catch (error) {
    console.error('❌ [ASSISTANT] Direct Gemini error:', error?.message);
    throw new Error(`Assistant unavailable: ${error?.message || 'Unknown error'}`);
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