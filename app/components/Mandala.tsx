'use client';

import { useState } from 'react';
import { MandalaCell, ViewMode } from '../types/mandala';
import { motion, AnimatePresence } from 'framer-motion';
import { EightyOneGrid } from './EightyOneGrid';

interface MandalaProps {
  data: MandalaCell[];
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

export const Mandala = ({ data }: MandalaProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('nine');
  const [expandedCell, setExpandedCell] = useState<MandalaCell | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);

  const handleCellClick = (cell: MandalaCell, index: number) => {
    // 中心格子（index === 0）不可点击展开
    if (index === 0) return;

    if (expandedCell?.id === cell.id) {
      setExpandedCell(null);
    } else if (cell.children && cell.children.length > 0) {
      setExpandedCell(cell);
    }
  };

  // 获取当前应该显示的数据
  const getCurrentGridData = () => {
    if (!expandedCell) {
      return data;
    }
    // 展开状态：被点击的主题在中心，其子主题围绕
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
          const canExpand = !isCenter && cell.children && cell.children.length > 0;

          return (
            <motion.div
              key={cell.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`bg-white rounded-lg shadow-lg p-4 ${canExpand ? 'cursor-pointer hover:shadow-xl' : ''} ${
                isCenter ? 'bg-blue-50' : ''
              }`}
              style={GRID_POSITIONS[index]}
              onClick={() => handleCellClick(cell, index)}
            >
              <div className="flex items-center gap-4 mb-2">
                {cell.index && (
                  <div 
                    className="relative flex items-center"
                    onMouseEnter={() => canExpand && setHoveredIndex(cell.id)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <span className="text-lg font-bold text-blue-600 min-w-[24px]">{cell.index}</span>
                    {hoveredIndex === cell.id && canExpand && (
                      <span className="text-blue-500 absolute -right-4">
                        {expandedCell?.id === cell.id ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                )}
                <h3 className="text-xl font-semibold text-center flex-1">{cell.title}</h3>
              </div>
              <p className="text-gray-600">{cell.content}</p>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex gap-4 mb-4">
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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 