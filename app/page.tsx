'use client';

import { useState, useEffect } from 'react';
import { Mandala } from './components/Mandala';
import { MandalaCell, MAIN_INDICES } from './types/mandala';

// 子主题的序号顺序：中下、中左、中上、中右、左下、左上、右上、右下
const SUB_INDICES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const generateMockData = (): MandalaCell[] => {
  // 先创建中心主题
  const centerTheme: MandalaCell = {
    id: 'main-center',
    index: '',
    title: '中心主题',
    content: '这是中心主题的内容描述',
    children: SUB_INDICES.map((subIndex, j) => ({
      id: `sub-center-${j}`,
      index: subIndex,
      title: `中心主题的子主题${j + 1}`,
      content: `这是中心主题的子主题${j + 1}的内容描述`
    }))
  };

  // 创建周围的主题（甲乙丙丁...）
  const surroundingThemes = MAIN_INDICES.slice(0, 8).map((index, i) => ({
    id: `main-${i + 1}`,
    index,
    title: `主题${i + 1}`,
    content: `这是主题${i + 1}的内容描述`,
    children: SUB_INDICES.map((subIndex, j) => ({
      id: `sub-${i + 1}-${j}`,
      index: subIndex,
      title: `${index}的子主题${j + 1}`,
      content: `这是${index}主题的子主题${j + 1}的内容描述`
    }))
  }));

  // 返回中心主题和周围主题的组合
  return [centerTheme, ...surroundingThemes];
};

export default function Home() {
  const [data, setData] = useState<MandalaCell[]>(() => generateMockData());

  const handleDataChange = (newData: MandalaCell[]) => {
    setData([...newData]);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">永锡曼陀罗思维导图</h1>
        <Mandala data={data} onDataChange={handleDataChange} />
      </div>
    </main>
  );
}
