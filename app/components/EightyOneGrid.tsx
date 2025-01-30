'use client';

import { MandalaCell } from '../types/mandala';
import { motion } from 'framer-motion';

interface EightyOneGridProps {
  data: MandalaCell[];
  onNavigateToParent: () => void;
  onCellSelect: (cell: MandalaCell) => void;
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

export const EightyOneGrid = ({ data, onNavigateToParent, onCellSelect }: EightyOneGridProps) => {
  // 将数据组织成九宫格布局
  const organizeData = () => {
    const mainCells = data.map((cell, index) => ({
      ...cell,
      position: GRID_POSITIONS[index],
    }));

    return mainCells;
  };

  const organizedData = organizeData();
  const centerCell = data[0]; // 中心主题
  const mainThemes = data.slice(1); // 甲乙丙丁...主题

  const handleIndexClick = (cell: MandalaCell, event: React.MouseEvent) => {
    event.stopPropagation();
    onCellSelect(cell);
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-4 aspect-square" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 中心大格子 */}
      <div
        className="grid grid-cols-3 grid-rows-3 gap-2"
        style={GRID_POSITIONS[0]}
      >
        {/* 中心主题 */}
        <motion.div
          key={centerCell.id}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-50 shadow-md p-2 rounded-lg"
          style={GRID_POSITIONS[0]}
        >
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold truncate flex-1">{centerCell.title}</h4>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">{centerCell.content}</p>
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-blue-600">{mainCell.index}</span>
              <h4 className="text-sm font-semibold truncate flex-1">{mainCell.title}</h4>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{mainCell.content}</p>
          </motion.div>
        ))}
      </div>

      {/* 周围的大格子（甲乙丙丁的展开） */}
      {mainThemes.slice(0, 8).map((mainCell, mainIndex) => (
        <div
          key={mainCell.id}
          className="grid grid-cols-3 grid-rows-3 gap-2"
          style={GRID_POSITIONS[mainIndex + 1]}
        >
          {/* 子主题中心（甲/乙/丙/丁...） */}
          <motion.div
            key={`${mainCell.id}-center`}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-md p-2 rounded-lg"
            style={GRID_POSITIONS[0]}
          >
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="text-sm font-bold text-blue-600 cursor-pointer hover:text-blue-800"
                onClick={(e) => handleIndexClick(mainCell, e)}
              >
                {mainCell.index}
              </span>
              <h4 className="text-sm font-semibold truncate flex-1">{mainCell.title}</h4>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{mainCell.content}</p>
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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-blue-600">{subCell.index}</span>
                <h4 className="text-sm font-semibold truncate flex-1">{subCell.title}</h4>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{subCell.content}</p>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

// 计算子单元格在数组中的索引
function getSubCellIndex(row: number, col: number): number {
  const centerRow = 4;
  const centerCol = 4;
  
  // 如果是中心格子，返回-1
  if (row === centerRow && col === centerCol) return -1;
  
  // 计算相对于中心的位置
  const relRow = row - centerRow;
  const relCol = col - centerCol;
  
  // 如果不在3x3的范围内，返回-1
  if (Math.abs(relRow) > 1 || Math.abs(relCol) > 1) return -1;
  
  // 计算在8个方向中的位置（顺时针方向）
  if (relRow === -1 && relCol === 0) return 0; // 上
  if (relRow === -1 && relCol === 1) return 1; // 右上
  if (relRow === 0 && relCol === 1) return 2; // 右
  if (relRow === 1 && relCol === 1) return 3; // 右下
  if (relRow === 1 && relCol === 0) return 4; // 下
  if (relRow === 1 && relCol === -1) return 5; // 左下
  if (relRow === 0 && relCol === -1) return 6; // 左
  if (relRow === -1 && relCol === -1) return 7; // 左上
  
  return -1;
} 