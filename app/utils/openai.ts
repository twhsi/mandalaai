interface Settings {
  aiEnabled: boolean;
  activeApi: 'openai' | 'deepseek';
  apiKey: string;
  apiEndpoint: string;
  deepseekApiKey: string;
  deepseekApiEndpoint: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  deepseekSystemPrompt: string;
  deepseekUserPrompt: string;
}

export async function optimizeWithAI(text: string): Promise<string> {
  const settings = localStorage.getItem('mandalaSettings');
  if (!settings) {
    throw new Error('未找到 API 设置');
  }

  const parsedSettings = JSON.parse(settings) as Settings;
  if (!parsedSettings.aiEnabled) {
    throw new Error('AI 优化功能未启用');
  }

  const isOpenAI = parsedSettings.activeApi === 'openai';
  const apiKey = isOpenAI ? parsedSettings.apiKey : parsedSettings.deepseekApiKey;
  const apiEndpoint = isOpenAI ? parsedSettings.apiEndpoint : parsedSettings.deepseekApiEndpoint;
  const systemPrompt = isOpenAI ? parsedSettings.systemPrompt : parsedSettings.deepseekSystemPrompt;
  const userPrompt = isOpenAI ? parsedSettings.userPrompt : parsedSettings.deepseekUserPrompt;
  const model = parsedSettings.model;

  if (!apiKey) {
    throw new Error(`未设置 ${isOpenAI ? 'OpenAI' : 'DeepSeek'} API Key`);
  }

  if (!apiEndpoint) {
    throw new Error(`未设置 ${isOpenAI ? 'OpenAI' : 'DeepSeek'} API 端点`);
  }

  try {
    const response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt || '你是一个文本优化助手，帮助用户优化文本结构和内容。'
          },
          {
            role: 'user',
            content: userPrompt ? `${userPrompt}\n\n${text}` : text
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || '请求失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI 优化失败: ${error.message}`);
    }
    throw error;
  }
} 