'use client';

import { useState } from 'react';
import { MandalaCell } from '../types/mandala';
import { motion } from 'framer-motion';

interface EightyOneGridProps {
  data: MandalaCell[];
  onNavigateToParent: () => void;
  onCellSelect: (cell: MandalaCell) => void;
  zoomLevel: number;
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

// 定义大宫格的背景色
const GRID_COLORS = [
  'bg-blue-50/30',    // 中心大宫格
  'bg-pink-50/30',    // 中下大宫格
  'bg-purple-50/30',  // 中左大宫格
  'bg-green-50/30',   // 中上大宫格
  'bg-yellow-50/30',  // 中右大宫格
  'bg-red-50/30',     // 左下大宫格
  'bg-indigo-50/30',  // 左上大宫格
  'bg-orange-50/30',  // 右上大宫格
  'bg-teal-50/30',    // 右下大宫格
];

// 定义中心卡片的背景色
const CENTER_COLORS = [
  'bg-blue-100',    // 中心大宫格的中心
  'bg-pink-100',    // 中下大宫格的中心
  'bg-purple-100',  // 中左大宫格的中心
  'bg-green-100',   // 中上大宫格的中心
  'bg-yellow-100',  // 中右大宫格的中心
  'bg-red-100',     // 左下大宫格的中心
  'bg-indigo-100',  // 左上大宫格的中心
  'bg-orange-100',  // 右上大宫格的中心
  'bg-teal-100',    // 右下大宫格的中心
];

export const EightyOneGrid = ({ 
  data, 
  onNavigateToParent, 
  onCellSelect,
  zoomLevel = 1
}: EightyOneGridProps) => {
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'title' | 'content' } | null>(null);
  const centerCell = data[0];
  const mainThemes = data.slice(1);

  const handleIndexClick = (cell: MandalaCell, event: React.MouseEvent) => {
    event.stopPropagation();
    if (cell.id === centerCell.id) {
      onNavigateToParent();
    } else {
      onCellSelect(cell);
    }
  };

  const handleEdit = (cell: MandalaCell, field: 'title' | 'content') => {
    setEditingCell({ id: cell.id, field });
  };

  const handleEditComplete = (cell: MandalaCell, field: 'title' | 'content', value: string) => {
    // 更新所有相同 ID 的单元格
    const updateCellContent = (cells: MandalaCell[]) => {
      cells.forEach(c => {
        if (c.id === cell.id) {
          c[field] = value;
        }
      });
    };

    // 更新主题数组
    updateCellContent(data);
    setEditingCell(null);
  };

  const renderCell = (cell: MandalaCell, isMainCell: boolean = false) => {
    const isEditing = editingCell?.id === cell.id;

    return (
      <div className="relative flex flex-col h-full">
        {/* 序号部分 */}
        {cell.index && (
          <div className="absolute">
            <span 
              className={`text-lg font-bold text-blue-600 min-w-[24px] block ${isMainCell ? 'cursor-pointer hover:text-blue-800' : ''}`}
              onClick={isMainCell ? (e) => handleIndexClick(cell, e) : undefined}
            >
              {cell.index}
            </span>
          </div>
        )}

        {/* 标题部分 */}
        <div className="text-center mb-1 mt-1 mx-4 flex items-center justify-center" style={{ minHeight: '24px' }}>
          {isEditing && editingCell.field === 'title' ? (
            <input
              type="text"
              className="w-full text-center text-sm font-semibold border-b border-blue-500 focus:outline-none bg-transparent"
              defaultValue={cell.title}
              autoFocus
              onBlur={(e) => handleEditComplete(cell, 'title', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEditComplete(cell, 'title', e.currentTarget.value)}
            />
          ) : (
            <div 
              className="text-sm font-semibold cursor-pointer hover:text-blue-600 px-1 py-0.5 truncate"
              onClick={() => handleEdit(cell, 'title')}
              style={{ lineHeight: '1.4', wordBreak: 'break-word' }}
              title={cell.title}
            >
              {cell.title}
            </div>
          )}
        </div>

        {/* 内容部分 - 占据剩余空间，添加滚动条 */}
        <div 
          className="flex-1 cursor-pointer overflow-hidden"
          onClick={() => handleEdit(cell, 'content')}
        >
          {isEditing && editingCell.field === 'content' ? (
            <textarea
              className="w-full h-full min-h-[40px] text-xs text-gray-600 border border-blue-500 rounded p-1 focus:outline-none bg-transparent resize-none"
              defaultValue={cell.content}
              autoFocus
              onBlur={(e) => handleEditComplete(cell, 'content', e.target.value)}
              style={{ height: 'calc(100% - 4px)' }}
            />
          ) : (
            <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
              <div className="text-xs text-gray-600 text-center whitespace-pre-wrap">
                {cell.content}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="grid grid-cols-3 grid-rows-3 gap-4 aspect-square" 
      style={{ 
        width: `${1200 * zoomLevel}px`, 
        margin: '0 auto',
        transition: 'width 0.3s ease'
      }}
    >
      {/* 中心大格子 */}
      <div
        className={`grid grid-cols-3 grid-rows-3 gap-2 rounded-lg p-2 ${GRID_COLORS[0]}`}
        style={GRID_POSITIONS[0]}
      >
        {/* 中心主题 */}
        <motion.div
          key={centerCell.id}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`shadow-md p-2 rounded-lg ${CENTER_COLORS[0]}`}
          style={GRID_POSITIONS[0]}
        >
          {renderCell(centerCell)}
        </motion.div>

        {/* 甲乙丙丁... */}
        {mainThemes.slice(0, 8).map((mainCell, index) => (
          <motion.div
            key={mainCell.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white shadow-md p-2 rounded-lg"
            style={GRID_POSITIONS[index + 1]}
          >
            {renderCell(mainCell)}
          </motion.div>
        ))}
      </div>

      {/* 周围的大格子（甲乙丙丁的展开） */}
      {mainThemes.slice(0, 8).map((mainCell, mainIndex) => (
        <div
          key={mainCell.id}
          className={`grid grid-cols-3 grid-rows-3 gap-2 rounded-lg p-2 ${GRID_COLORS[mainIndex + 1]}`}
          style={GRID_POSITIONS[mainIndex + 1]}
        >
          {/* 子主题中心（甲/乙/丙/丁...） */}
          <motion.div
            key={`${mainCell.id}-center`}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`shadow-md p-2 rounded-lg ${CENTER_COLORS[mainIndex + 1]}`}
            style={GRID_POSITIONS[0]}
          >
            {renderCell(mainCell, true)}
          </motion.div>

          {/* A-H 子主题 */}
          {mainCell.children?.map((subCell, subIndex) => (
            <motion.div
              key={subCell.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: subIndex * 0.05 }}
              className="bg-white shadow-md p-2 rounded-lg"
              style={GRID_POSITIONS[subIndex + 1]}
            >
              {renderCell(subCell)}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}; 