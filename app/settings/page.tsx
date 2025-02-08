'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '../components/Modal';

interface Settings {
  aiEnabled: boolean;
  apiKey: string;
  apiEndpoint: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
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

const DEFAULT_SETTINGS: Settings = {
  aiEnabled: false,
  apiKey: '',
  apiEndpoint: 'https://api.openai.com',
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
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [customModels, setCustomModels] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState('');
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
      setSettings(JSON.parse(savedSettings));
    }
    if (savedCustomModels) {
      setCustomModels(JSON.parse(savedCustomModels));
    }
  }, []);

  // 保存设置和自定义模型到localStorage
  const saveSettings = () => {
    localStorage.setItem('mandalaSettings', JSON.stringify(settings));
    localStorage.setItem('customModels', JSON.stringify(customModels));
    router.push('/');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">设置</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            返回
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* AI开关 */}
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

          {/* API设置 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">API 设置</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">API Key</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="输入 OpenAI API Key"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">API 端点</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={settings.apiEndpoint}
                onChange={(e) => setSettings({ ...settings, apiEndpoint: e.target.value })}
                placeholder="https://api.openai.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">选择模型</label>
              <div className="flex flex-col gap-2">
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md custom-scrollbar">
                  <div className="text-xs text-gray-500 px-3 py-1 border-b border-gray-200">预设模型</div>
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
                  {customModels.length > 0 && (
                    <>
                      <div className="text-xs text-gray-500 px-3 py-1 border-t border-b border-gray-200">自定义模型</div>
                      {customModels.map((model) => (
                        <div
                          key={model}
                          className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            settings.model === model ? 'bg-blue-50' : ''
                          }`}
                        >
                          <button
                            className={`flex-1 text-left ${settings.model === model ? 'text-blue-600' : 'text-gray-700'}`}
                            onClick={() => setSettings({ ...settings, model })}
                          >
                            {model}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCustomModel(model);
                            }}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    placeholder="输入自定义模型名称"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && modelInput) {
                        addCustomModel();
                      }
                    }}
                  />
                  <button
                    onClick={addCustomModel}
                    disabled={!modelInput}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 提示词设置 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">提示词设置</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">系统提示词</label>
              <textarea
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none custom-scrollbar"
                value={settings.systemPrompt}
                onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">用户提示词</label>
              <textarea
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none custom-scrollbar"
                value={settings.userPrompt}
                onChange={(e) => setSettings({ ...settings, userPrompt: e.target.value })}
              />
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end gap-4">
            <button
              onClick={restoreDefaults}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              还原默认设置
            </button>
            <button
              onClick={saveSettings}
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