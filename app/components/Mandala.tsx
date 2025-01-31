'use client';

import { useState, useRef } from 'react';
import { MandalaCell, ViewMode } from '../types/mandala';
import { motion, AnimatePresence } from 'framer-motion';
import { EightyOneGrid } from './EightyOneGrid';
import html2canvas from 'html2canvas';

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

export const Mandala = ({ data, onDataChange }: MandalaProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('nine');
  const [expandedCell, setExpandedCell] = useState<MandalaCell | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'title' | 'content' } | null>(null);
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

  const renderNineGrid = () => {
    const currentData = getCurrentGridData();
    const isSubGrid = !!expandedCell;

    return (
      <motion.div
        key={expandedCell?.id || 'main'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="grid grid-cols-3 grid-rows-3 gap-4 aspect-square"
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        {currentData.map((cell, index) => {
          const isCenter = index === 0;
          const canExpand = !isCenter && !isSubGrid && cell.children && cell.children.length > 0;
          const canCollapse = isSubGrid && isCenter;
          const isEditing = editingCell?.id === cell.id;

          return (
            <motion.div
              key={cell.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`bg-white rounded-lg shadow-lg p-4 ${
                isCenter ? 'bg-blue-50' : ''
              }`}
              style={GRID_POSITIONS[index]}
            >
              <div className="relative flex flex-col h-full">
                {/* 序号部分 - 绝对定位 */}
                {cell.index && (
                  <div 
                    className="absolute"
                    onMouseEnter={() => (canExpand || canCollapse) && setHoveredIndex(cell.id)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={(e) => handleIndexClick(cell, index, e)}
                  >
                    <span className="text-2xl font-bold text-blue-600 cursor-pointer min-w-[32px] block">
                      {cell.index}
                    </span>
                    {hoveredIndex === cell.id && (canExpand || canCollapse) && (
                      <span className="text-blue-500 absolute -right-4 text-xl">
                        {canCollapse ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                )}

                {/* 标题部分 - 居中显示，避开序号 */}
                <div className="text-center mb-2 mt-1 ml-12">
                  {isEditing && editingCell.field === 'title' ? (
                    <input
                      type="text"
                      className="w-full text-center text-xl font-semibold border-b border-blue-500 focus:outline-none bg-transparent"
                      defaultValue={cell.title}
                      autoFocus
                      onBlur={(e) => handleEditComplete(cell, 'title', e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEditComplete(cell, 'title', e.currentTarget.value)}
                    />
                  ) : (
                    <h3 
                      className="text-xl font-semibold cursor-pointer hover:text-blue-600"
                      onClick={() => handleEdit(cell, 'title')}
                    >
                      {cell.title}
                    </h3>
                  )}
                </div>

                {/* 内容部分 - 占据剩余空间 */}
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleEdit(cell, 'content')}
                >
                  {isEditing && editingCell.field === 'content' ? (
                    <textarea
                      className="w-full h-full min-h-[80px] text-gray-600 border border-blue-500 rounded p-2 focus:outline-none bg-transparent resize-none"
                      defaultValue={cell.content}
                      autoFocus
                      onBlur={(e) => handleEditComplete(cell, 'content', e.target.value)}
                      style={{ height: 'calc(100% - 8px)' }}
                    />
                  ) : (
                    <p className="text-gray-600 hover:text-blue-600">
                      {cell.content}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const exportToImage = async () => {
    if (!mandalaRef.current) return;
    
    try {
      const canvas = await html2canvas(mandalaRef.current);
      const link = document.createElement('a');
      link.download = `mandala-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('导出图片失败:', error);
    }
  };

  const exportToMarkdown = () => {
    let markdown = '# 曼陀罗思维导图\n\n';
    
    const processCell = (cell: MandalaCell, level: number = 1) => {
      markdown += `${'#'.repeat(level)} ${cell.index} ${cell.title}\n\n`;
      if (cell.content) {
        markdown += `${cell.content}\n\n`;
      }
      if (cell.children?.length) {
        cell.children.forEach(child => processCell(child, level + 1));
      }
    };

    data.forEach(cell => processCell(cell));
    
    const blob = new Blob([markdown], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mandala-${new Date().toISOString().slice(0, 10)}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
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
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex gap-4 mb-4 flex-wrap">
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

      <div ref={mandalaRef}>
        <AnimatePresence mode="wait">
          {viewMode === 'nine' ? (
            renderNineGrid()
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 