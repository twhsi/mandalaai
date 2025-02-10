'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '../components/Modal';

interface Settings {
  aiEnabled: boolean;
  activeApi: 'openai' | 'deepseek';  // 当前激活的 API
  apiType: 'openai' | 'deepseek';    // 选项卡切换
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

const DEFAULT_MODELS = [
  'gpt-4o',
  'gpt-4',
  'gpt-4o-mini',
  'o1-mini',
  'o1-preview',
  'o1',
  'o3-mini',
  'gpt-3.5',
];

const DEEPSEEK_MODELS = [
  'deepseek-chat',
  'deepseek-reasoner',
];

const DEFAULT_SETTINGS: Settings = {
  aiEnabled: false,
  activeApi: 'openai',
  apiType: 'openai',
  apiKey: '',
  apiEndpoint: 'https://api.openai.com',
  deepseekApiKey: '',
  deepseekApiEndpoint: 'https://api.deepseek.com',
  model: 'gpt-4o',
  systemPrompt: `你是一个文本优化助手，帮助用户优化文本结构和内容。请保持文本的原有结构和格式，仅优化内容的表达和逻辑性。

格式要求：
1. 使用 # 开头表示中心主题
2. 使用 ## 开头表示主要主题（甲、乙、丙...）
3. 使用 ### 开头表示子主题（A、B、C...）
4. 每个主题标题后面可以跟随内容

示例：
# 中心主题
中心主题的内容

## 甲 主题1
主题1的内容

### A 子主题1
子主题1的内容`,
  userPrompt: '请优化以下文本，使其表达更加清晰、逻辑更加连贯，同时保持原有的结构和格式：',
  deepseekSystemPrompt: `你是一个文本优化助手，帮助用户优化文本结构和内容。请保持文本的原有结构和格式，仅优化内容的表达和逻辑性。

格式要求：
1. 使用 # 开头表示中心主题
2. 使用 ## 开头表示主要主题（甲、乙、丙...）
3. 使用 ### 开头表示子主题（A、B、C...）
4. 每个主题标题后面可以跟随内容

示例：
# 中心主题
中心主题的内容

## 甲 主题1
主题1的内容

### A 子主题1
子主题1的内容`,
  deepseekUserPrompt: '请优化以下文本，使其表达更加清晰、逻辑更加连贯，同时保持原有的结构和格式：',
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [customModels, setCustomModels] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState('');
  const [initialSettings, setInitialSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [initialCustomModels, setInitialCustomModels] = useState<string[]>([]);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    onConfirm: () => {},
  });

  // 从localStorage加载设置和自定义模型
  useEffect(() => {
    const savedSettings = localStorage.getItem('mandalaSettings');
    const savedCustomModels = localStorage.getItem('customModels');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // 确保所有必需的字段都有值
        const mergedSettings = {
          ...DEFAULT_SETTINGS,  // 首先使用默认值
          ...parsedSettings,    // 然后用保存的设置覆盖
          // 确保关键字段有默认值
          apiKey: parsedSettings.apiKey || '',
          apiEndpoint: parsedSettings.apiEndpoint || 'https://api.openai.com',
          deepseekApiKey: parsedSettings.deepseekApiKey || '',
          deepseekApiEndpoint: parsedSettings.deepseekApiEndpoint || 'https://api.deepseek.com',
          model: parsedSettings.model || DEFAULT_SETTINGS.model,
          systemPrompt: parsedSettings.systemPrompt || DEFAULT_SETTINGS.systemPrompt,
          userPrompt: parsedSettings.userPrompt || DEFAULT_SETTINGS.userPrompt,
          deepseekSystemPrompt: parsedSettings.deepseekSystemPrompt || DEFAULT_SETTINGS.deepseekSystemPrompt,
          deepseekUserPrompt: parsedSettings.deepseekUserPrompt || DEFAULT_SETTINGS.deepseekUserPrompt,
        };
        setSettings(mergedSettings);
        setInitialSettings(mergedSettings);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
        setSettings(DEFAULT_SETTINGS);
        setInitialSettings(DEFAULT_SETTINGS);
      }
    }
    if (savedCustomModels) {
      try {
        const parsedCustomModels = JSON.parse(savedCustomModels);
        setCustomModels(parsedCustomModels);
        setInitialCustomModels(parsedCustomModels);
      } catch (error) {
        console.error('Failed to parse saved custom models:', error);
        setCustomModels([]);
        setInitialCustomModels([]);
      }
    }
  }, []);

  // 检查设置是否有变化
  const hasUnsavedChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(initialSettings) ||
           JSON.stringify(customModels) !== JSON.stringify(initialCustomModels);
  };

  // 验证设置
  const validateSettings = () => {
    if (settings.aiEnabled) {
      if (settings.activeApi === 'openai') {
        if (!settings.apiKey?.trim()) {
          showAlert('验证失败', '启用 AI 自动优化时，OpenAI API Key 不能为空');
          return false;
        }
        if (!settings.apiEndpoint?.trim()) {
          showAlert('验证失败', '启用 AI 自动优化时，OpenAI API 端点不能为空');
          return false;
        }
        // 验证 OpenAI 模型
        if (!DEFAULT_MODELS.includes(settings.model)) {
          setSettings(prev => ({ ...prev, model: DEFAULT_MODELS[0] }));
        }
      } else {
        if (!settings.deepseekApiKey?.trim()) {
          showAlert('验证失败', '启用 AI 自动优化时，DeepSeek API Key 不能为空');
          return false;
        }
        if (!settings.deepseekApiEndpoint?.trim()) {
          showAlert('验证失败', '启用 AI 自动优化时，DeepSeek API 端点不能为空');
          return false;
        }
        // 验证 DeepSeek 模型
        if (!DEEPSEEK_MODELS.includes(settings.model)) {
          setSettings(prev => ({ ...prev, model: DEEPSEEK_MODELS[0] }));
        }
      }
    }
    return true;
  };

  // 保存设置和自定义模型到localStorage
  const saveSettings = (shouldReturn: boolean = false) => {
    if (!validateSettings()) {
      return false;
    }
    localStorage.setItem('mandalaSettings', JSON.stringify(settings));
    localStorage.setItem('customModels', JSON.stringify(customModels));
    setInitialSettings(settings);
    setInitialCustomModels(customModels);
    if (shouldReturn) {
      router.push('/');
    }
    return true;
  };

  // 处理返回操作
  const handleReturn = () => {
    if (hasUnsavedChanges()) {
      if (!validateSettings()) {
        return;
      }
      showConfirm(
        '未保存的更改',
        '您有未保存的更改，是否要保存？',
        () => {
          if (saveSettings(false)) {
            router.push('/');
          }
        }
      );
    } else {
      router.push('/');
    }
  };

  // 显示确认对话框
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm: () => {
        onConfirm();
        setModal(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setModal(prev => ({ ...prev, isOpen: false })),
    });
  };

  // 显示提示对话框
  const showAlert = (title: string, message: string) => {
    setModal({
      isOpen: true,
      title,
      message,
      type: 'alert',
      onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
    });
  };

  // 还原默认设置
  const restoreDefaults = () => {
    showConfirm(
      '还原默认设置',
      '确定要还原为默认设置吗？此操作不可撤销。',
      () => {
        setSettings(DEFAULT_SETTINGS);
        setCustomModels([]);
        localStorage.removeItem('customModels');
        localStorage.removeItem('mandalaSettings');
      }
    );
  };

  // 添加自定义模型
  const addCustomModel = () => {
    if (modelInput && !DEFAULT_MODELS.includes(modelInput) && !customModels.includes(modelInput)) {
      const newCustomModels = [...customModels, modelInput];
      setCustomModels(newCustomModels);
      setSettings({ ...settings, model: modelInput });
      setModelInput('');
      localStorage.setItem('customModels', JSON.stringify(newCustomModels));
    } else if (DEFAULT_MODELS.includes(modelInput)) {
      showAlert('添加失败', '该模型已在预设模型列表中。');
    } else if (customModels.includes(modelInput)) {
      showAlert('添加失败', '该模型已在自定义模型列表中。');
    }
  };

  // 删除自定义模型
  const removeCustomModel = (model: string) => {
    showConfirm(
      '删除模型',
      `确定要删除模型 "${model}" 吗？`,
      () => {
        const newCustomModels = customModels.filter(m => m !== model);
        setCustomModels(newCustomModels);
        if (settings.model === model) {
          setSettings({ ...settings, model: DEFAULT_MODELS[0] });
        }
        localStorage.setItem('customModels', JSON.stringify(newCustomModels));
      }
    );
  };

  // 切换 API 类型时同时更新模型
  const handleApiTypeChange = (type: 'openai' | 'deepseek') => {
    const defaultModel = type === 'openai' ? DEFAULT_MODELS[0] : DEEPSEEK_MODELS[0];
    setSettings(prev => ({
      ...prev,
      apiType: type,
      model: defaultModel,
      // 确保切换时使用正确的 API 配置
      activeApi: type
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">设置</h1>
          <button
            onClick={handleReturn}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            返回
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* AI开关和API选择 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700 font-medium">AI 自动优化</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.aiEnabled}
                  onChange={(e) => setSettings({ ...settings, aiEnabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* API 配置选项卡 */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 -mb-px text-sm font-medium ${
                settings.apiType === 'openai'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleApiTypeChange('openai')}
            >
              OpenAI 配置
            </button>
            <button
              className={`px-4 py-2 -mb-px text-sm font-medium ${
                settings.apiType === 'deepseek'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleApiTypeChange('deepseek')}
            >
              DeepSeek 配置
            </button>
          </div>

          {/* 配置内容 */}
          {settings.apiType === 'openai' ? (
            <div className="space-y-6">
              {/* OpenAI API设置 */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">OpenAI API 设置</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">API Key</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    placeholder="输入 OpenAI API Key"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">API 端点</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    value={settings.apiEndpoint}
                    onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
                    placeholder="https://api.openai.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">选择模型</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md custom-scrollbar">
                    <div className="text-xs text-gray-500 px-3 py-1 border-b border-gray-200">可用模型</div>
                    {DEFAULT_MODELS.map((model) => (
                      <button
                        key={model}
                        className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          settings.model === model ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                        onClick={() => setSettings({ ...settings, model })}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* OpenAI 提示词设置 */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">OpenAI 提示词设置</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">系统提示词</label>
                  <textarea
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none custom-scrollbar bg-white text-gray-900"
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">用户提示词</label>
                  <textarea
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none custom-scrollbar bg-white text-gray-900"
                    value={settings.userPrompt}
                    onChange={(e) => setSettings({ ...settings, userPrompt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* DeepSeek API设置 */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">DeepSeek API 设置</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">API Key</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    value={settings.deepseekApiKey}
                    onChange={(e) => setSettings({ ...settings, deepseekApiKey: e.target.value })}
                    placeholder="输入 DeepSeek API Key"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">API 端点</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    value={settings.deepseekApiEndpoint}
                    onChange={(e) => setSettings({ ...settings, deepseekApiEndpoint: e.target.value })}
                    placeholder="https://api.deepseek.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">选择模型</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md custom-scrollbar">
                    <div className="text-xs text-gray-500 px-3 py-1 border-b border-gray-200">可用模型</div>
                    {DEEPSEEK_MODELS.map((model) => (
                      <button
                        key={model}
                        className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          settings.model === model ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                        onClick={() => setSettings({ ...settings, model })}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DeepSeek 提示词设置 */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">DeepSeek 提示词设置</h2>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">系统提示词</label>
                  <textarea
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none custom-scrollbar bg-white text-gray-900"
                    value={settings.deepseekSystemPrompt}
                    onChange={(e) => setSettings({ ...settings, deepseekSystemPrompt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">用户提示词</label>
                  <textarea
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none custom-scrollbar bg-white text-gray-900"
                    value={settings.deepseekUserPrompt}
                    onChange={(e) => setSettings({ ...settings, deepseekUserPrompt: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 保存按钮 */}
          <div className="flex justify-end gap-4">
            <button
              onClick={restoreDefaults}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              还原默认设置
            </button>
            <button
              onClick={() => saveSettings(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />
    </div>
  );
} 