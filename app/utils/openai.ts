interface OpenAISettings {
  apiKey: string;
  apiEndpoint: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}

export async function optimizeWithAI(text: string): Promise<string> {
  const settings = localStorage.getItem('mandalaSettings');
  if (!settings) {
    throw new Error('未找到 API 设置');
  }

  const {
    apiKey,
    apiEndpoint,
    model,
    systemPrompt,
    userPrompt
  } = JSON.parse(settings) as OpenAISettings;

  if (!apiKey) {
    throw new Error('未设置 API Key');
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