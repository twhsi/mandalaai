'use client';

import { useState, useRef } from 'react';
import { MandalaCell, ViewMode, MAIN_INDICES } from '../types/mandala';
import { motion, AnimatePresence } from 'framer-motion';
import { EightyOneGrid } from './EightyOneGrid';
import { GridContainer } from './GridContainer';
import html2canvas from 'html2canvas';
import { SubGrid } from './SubGrid';
import { MandalaCard } from './MandalaCard';

interface MandalaProps {
  data: MandalaCell[];
  onDataChange?: (newData: MandalaCell[]) => void;
}

// 定义九宫格位置映射
const GRID_POSITIONS = [
  { gridArea: '2 / 2 / 3 / 3' }, // 中心 0
  { gridArea: '3 / 2 / 4 / 3' }, // 中下 1
  { gridArea: '2 / 1 / 3 / 2' }, // 中左 2
  { gridArea: '1 / 2 / 2 / 3' }, // 中上 3
  { gridArea: '2 / 3 / 3 / 4' }, // 中右 4
  { gridArea: '3 / 1 / 4 / 2' }, // 左下 5
  { gridArea: '1 / 1 / 2 / 2' }, // 左上 6
  { gridArea: '1 / 3 / 2 / 4' }, // 右上 7
  { gridArea: '3 / 3 / 4 / 4' }, // 右下 8
];

// 添加放大图标组件
const MagnifyIcon = ({ className = "", onClick }: { className?: string, onClick?: () => void }) => (
  <svg 
    className={className} 
    onClick={onClick}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

const ResetIcon = ({ className = "", onClick }: { className?: string, onClick?: () => void }) => (
  <svg 
    className={className} 
    onClick={onClick}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
    <path d="M3 3v5h5"></path>
  </svg>
);

export const Mandala = ({ data, onDataChange }: MandalaProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('nine');
  const [expandedCell, setExpandedCell] = useState<MandalaCell | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'title' | 'content' } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const mandalaRef = useRef<HTMLDivElement>(null);

  const handleIndexClick = (cell: MandalaCell, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (expandedCell && index === 0) {
      setExpandedCell(null);
      return;
    }
    
    if (!expandedCell && index !== 0 && cell.children && cell.children.length > 0) {
      setExpandedCell(cell);
      return;
    }
  };

  const handleEdit = (cell: MandalaCell, field: 'title' | 'content') => {
    setEditingCell({ id: cell.id, field });
  };

  const handleEditComplete = (cell: MandalaCell, field: 'title' | 'content', value: string) => {
    cell[field] = value;
    setEditingCell(null);
    onDataChange?.(data);
  };

  const getCurrentGridData = () => {
    if (!expandedCell) {
      const centerTheme = data[0];
      const surroundingThemes = data.slice(1);
      return [centerTheme, ...surroundingThemes];
    }
    return [expandedCell, ...(expandedCell.children || [])];
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => prev + 0.2);
  };

  const handleReset = () => {
    setZoomLevel(1);
  };

  const renderNineGrid = () => {
    const currentData = getCurrentGridData();
    const isSubGrid = !!expandedCell;

    return (
      <GridContainer zoomLevel={zoomLevel}>
        {currentData.map((cell, index) => (
          <MandalaCard
            key={cell.id}
            cell={cell}
            position={GRID_POSITIONS[index]}
            isCenter={index === 0}
            isMainCell={!isSubGrid && index !== 0}
            backgroundColor={index === 0 ? 'bg-blue-50' : undefined}
            onIndexClick={(cell, event) => handleIndexClick(cell, index, event)}
            onEdit={handleEdit}
            onEditComplete={handleEditComplete}
            isEditing={editingCell?.id === cell.id}
            editingField={editingCell?.field}
          />
        ))}
      </GridContainer>
    );
  };

  const exportToImage = async () => {
    if (!mandalaRef.current) return;
    
    try {
      // 获取实际内容的尺寸
      const gridElement = mandalaRef.current.querySelector('.grid') as HTMLElement;
      if (!gridElement) return;

      const { width, height } = gridElement.getBoundingClientRect();
      
      const canvas = await html2canvas(gridElement, {
        width: Math.ceil(width),
        height: Math.ceil(height),
        scale: 2, // 提高清晰度
        useCORS: true,
        backgroundColor: '#f9fafb', // bg-gray-50 的颜色值
        onclone: (clonedDoc, element) => {
          // 移除所有动画相关的样式
          element.style.transform = 'none';
          element.style.transition = 'none';
          
          // 确保所有子元素也移除动画
          element.querySelectorAll('*').forEach((el: Element) => {
            if (el instanceof HTMLElement) {
              el.style.transform = 'none';
              el.style.transition = 'none';
            }
          });
        }
      });

      const link = document.createElement('a');
      link.download = `mandala-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('导出图片失败:', error);
    }
  };

  const exportToMarkdown = () => {
    let markdown = '';
    
    // 处理中心主题
    const centerCell = data[0];
    markdown += `# ${centerCell.title}\n\n`;
    if (centerCell.content) {
      markdown += `${centerCell.content}\n\n`;
    }

    // 处理八个主要方向（甲乙丙丁...）
    data.slice(1).forEach(mainCell => {
      markdown += `## ${mainCell.index} ${mainCell.title}\n\n`;
      if (mainCell.content) {
        markdown += `${mainCell.content}\n\n`;
      }
      
      // 处理每个主要方向的子主题（A-H）
      if (mainCell.children?.length) {
        mainCell.children.forEach(subCell => {
          markdown += `### ${subCell.index} ${subCell.title}\n\n`;
          if (subCell.content) {
            markdown += `${subCell.content}\n\n`;
          }
        });
      }
    });
    
    const blob = new Blob([markdown], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mandala-${new Date().toISOString().slice(0, 10)}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importMarkdown = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n');
      
      let currentCell: MandalaCell | null = null;
      let currentMainCell: MandalaCell | null = null;
      let currentSubCell: MandalaCell | null = null;
      let newData: MandalaCell[] = [];
      let mainIndex = 0;
      let subIndex = 0;
      let contentBuffer = '';

      const flushContent = () => {
        if (contentBuffer && currentCell) {
          if (currentCell.content) {
            currentCell.content += '\n' + contentBuffer.trim();
          } else {
            currentCell.content = contentBuffer.trim();
          }
          contentBuffer = '';
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 处理一级标题（中心主题）
        if (line.startsWith('# ') && !line.startsWith('## ')) {
          flushContent();
          const title = line.substring(2).trim();
          currentCell = {
            id: 'main-center',
            index: '',
            title,
            content: '',
            children: []
          };
          newData = [currentCell];
          currentMainCell = null;
          currentSubCell = null;
          continue;
        }

        // 处理二级标题（甲乙丙丁...）
        if (line.startsWith('## ')) {
          flushContent();
          const title = line.substring(3).trim();
          const index = MAIN_INDICES[mainIndex];
          currentMainCell = {
            id: `main-${mainIndex + 1}`,
            index,
            title: title.replace(`${index} `, '').replace(index, '').trim(),
            content: '',
            children: []
          };
          newData.push(currentMainCell);
          currentCell = currentMainCell;
          currentSubCell = null;
          mainIndex++;
          subIndex = 0;
          continue;
        }

        // 处理三级标题（A-H）
        if (line.startsWith('### ')) {
          flushContent();
          if (!currentMainCell) continue;
          const title = line.substring(4).trim();
          const subIndex_char = String.fromCharCode(65 + subIndex);
          currentSubCell = {
            id: `sub-${mainIndex}-${subIndex}`,
            index: subIndex_char,
            title: title.replace(`${subIndex_char} `, '').replace(subIndex_char, '').trim(),
            content: ''
          };
          currentMainCell.children = currentMainCell.children || [];
          currentMainCell.children.push(currentSubCell);
          currentCell = currentSubCell;
          subIndex++;
          continue;
        }

        // 累积内容
        contentBuffer += (contentBuffer ? '\n' : '') + line;
      }

      // 处理最后一个内容块
      flushContent();

      // 确保数据结构完整性
      if (newData.length > 0) {
        // 如果主题不足8个，用空主题填充
        while (newData.length < 9) {
          const index = MAIN_INDICES[newData.length - 1];
          newData.push({
            id: `main-${newData.length}`,
            index,
            title: '',
            content: '',
            children: []
          });
        }

        // 确保每个主题都有8个子主题
        newData.slice(1).forEach((mainCell, mainIdx) => {
          const children = mainCell.children || [];
          while (children.length < 8) {
            children.push({
              id: `sub-${mainIdx + 1}-${children.length}`,
              index: String.fromCharCode(65 + children.length),
              title: '',
              content: ''
            });
          }
          mainCell.children = children;
        });

        onDataChange?.(newData);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearContent = () => {
    const clearCell = (cell: MandalaCell) => {
      cell.title = '';
      cell.content = '';
      if (cell.children?.length) {
        cell.children.forEach(clearCell);
      }
    };

    const newData = [...data];
    newData.forEach(clearCell);
    onDataChange?.(newData);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex gap-4 p-4 flex-wrap justify-center items-center sticky top-0 z-50">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setViewMode('nine');
              setExpandedCell(null);
            }}
            className={`px-4 py-2 rounded transition-colors ${
              viewMode === 'nine' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            九宫格
          </button>
          <button
            onClick={() => setViewMode('eightyone')}
            className={`px-4 py-2 rounded transition-colors ${
              viewMode === 'eightyone' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            八十一宫格
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={exportToImage}
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            导出图片
          </button>
          <button
            onClick={exportToMarkdown}
            className="px-4 py-2 rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            导出文本
          </button>
          <label className="px-4 py-2 rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors cursor-pointer">
            导入文本
            <input
              type="file"
              accept=".md,.txt"
              className="hidden"
              onChange={importMarkdown}
            />
          </label>
          <button
            onClick={() => {
              if (window.confirm('确定要清空所有内容吗？此操作不可撤销。')) {
                clearContent();
              }
            }}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            清空内容
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
            title="放大"
          >
            <MagnifyIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
            title="还原大小"
          >
            <ResetIcon className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      <div className="flex-1 py-4">
        <div 
          className="min-h-full flex items-center justify-center"
          ref={mandalaRef}
          data-mandala-container
        >
          <AnimatePresence mode="wait">
            {viewMode === 'nine' ? (
              <div style={{ opacity: 1 }}>
                {renderNineGrid()}
              </div>
            ) : (
              <motion.div
                key="eightyone-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EightyOneGrid
                  data={data}
                  onNavigateToParent={() => {
                    setViewMode('nine');
                    setExpandedCell(null);
                  }}
                  onCellSelect={(cell) => {
                    setViewMode('nine');
                    setExpandedCell(cell);
                  }}
                  zoomLevel={zoomLevel}
                  onDataChange={onDataChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}; 