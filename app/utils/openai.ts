interface Settings {
  aiEnabled: boolean;
  activeApi: 'openai' | 'deepseek';
  useBuiltInOpenAI: boolean;
  useBuiltInDeepseek: boolean;
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

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        settings: parsedSettings
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }

    return data.content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI 优化失败: ${error.message}`);
    }
    throw new Error('AI 优化失败: 未知错误');
  }
} 