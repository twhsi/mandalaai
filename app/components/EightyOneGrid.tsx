'use client';

import { useState } from 'react';
import { MandalaCell } from '../types/mandala';
import { GridContainer } from './GridContainer';
import { SubGrid } from './SubGrid';

interface EightyOneGridProps {
  data: MandalaCell[];
  onNavigateToParent: () => void;
  onCellSelect: (cell: MandalaCell) => void;
  zoomLevel: number;
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
  zoomLevel = 1,
  onDataChange
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
    const updateCellContent = (cells: MandalaCell[]) => {
      cells.forEach(c => {
        if (c.id === cell.id) {
          c[field] = value;
        }
        if (c.children?.length) {
          updateCellContent(c.children);
        }
      });
    };

    updateCellContent(data);
    setEditingCell(null);
    
    onDataChange?.(data);
  };

  return (
    <GridContainer zoomLevel={zoomLevel} baseWidth={1200}>
      {/* 中心大格子 */}
      <SubGrid
        cells={[centerCell, ...mainThemes.slice(0, 8)]}
        position={GRID_POSITIONS[0]}
        backgroundColor={GRID_COLORS[0]}
        centerColor={CENTER_COLORS[0]}
        onIndexClick={handleIndexClick}
        onEdit={handleEdit}
        onEditComplete={handleEditComplete}
        editingCell={editingCell}
        gridPositions={GRID_POSITIONS}
      />

      {/* 周围的大格子（甲乙丙丁的展开） */}
      {mainThemes.slice(0, 8).map((mainCell, mainIndex) => (
        <SubGrid
          key={mainCell.id}
          cells={[mainCell, ...(mainCell.children || [])]}
          position={GRID_POSITIONS[mainIndex + 1]}
          backgroundColor={GRID_COLORS[mainIndex + 1]}
          centerColor={CENTER_COLORS[mainIndex + 1]}
          onIndexClick={handleIndexClick}
          onEdit={handleEdit}
          onEditComplete={handleEditComplete}
          editingCell={editingCell}
          gridPositions={GRID_POSITIONS}
        />
      ))}
    </GridContainer>
  );
}; 