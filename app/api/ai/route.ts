import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_ENDPOINT = process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com';

export async function POST(request: Request) {
  try {
    const { text, settings } = await request.json();
    
    if (!settings.aiEnabled) {
      return NextResponse.json({ error: 'AI 优化功能未启用' }, { status: 400 });
    }

    const isOpenAI = settings.activeApi === 'openai';
    const useBuiltIn = isOpenAI ? settings.useBuiltInOpenAI : settings.useBuiltInDeepseek;

    // 使用内置配置或用户配置
    const apiKey = useBuiltIn
      ? (isOpenAI ? OPENAI_API_KEY : DEEPSEEK_API_KEY)
      : (isOpenAI ? settings.apiKey : settings.deepseekApiKey);

    const apiEndpoint = useBuiltIn
      ? (isOpenAI ? OPENAI_API_ENDPOINT : DEEPSEEK_API_ENDPOINT)
      : (isOpenAI ? settings.apiEndpoint : settings.deepseekApiEndpoint);

    const systemPrompt = isOpenAI ? settings.systemPrompt : settings.deepseekSystemPrompt;
    const userPrompt = isOpenAI ? settings.userPrompt : settings.deepseekUserPrompt;
    const model = settings.model;

    if (!apiKey) {
      return NextResponse.json(
        { error: `未设置 ${isOpenAI ? 'OpenAI' : 'DeepSeek'} API Key` },
        { status: 400 }
      );
    }

    if (!apiEndpoint) {
      return NextResponse.json(
        { error: `未设置 ${isOpenAI ? 'OpenAI' : 'DeepSeek'} API 端点` },
        { status: 400 }
      );
    }

    console.log(`正在请求 API: ${apiEndpoint}/v1/chat/completions`);
    
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
      let errorMessage = '';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || '';
        console.error('API 错误响应:', errorData);
      } catch (parseError) {
        console.error('无法解析错误响应:', parseError);
        if (response.status === 404) {
          errorMessage = `API 端点无法访问，请检查 ${isOpenAI ? 'OpenAI' : 'DeepSeek'} API 端点配置是否正确 (${apiEndpoint})`;
        } else if (response.status === 401) {
          errorMessage = `API 认证失败，请检查 ${isOpenAI ? 'OpenAI' : 'DeepSeek'} API Key 是否正确`;
        } else if (response.status === 429) {
          errorMessage = '请求过于频繁，请稍后再试';
        } else if (response.status === 502) {
          errorMessage = `无法连接到 API 服务器 (${apiEndpoint})，请检查网络连接或 API 端点配置`;
        } else {
          errorMessage = `请求失败 (HTTP ${response.status})`;
        }
      }
      return NextResponse.json({ error: errorMessage || '请求失败' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('AI optimization error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('详细错误信息:', errorMessage);
    return NextResponse.json(
      { error: `AI 优化失败: ${errorMessage}` },
      { status: 500 }
    );
  }
} 