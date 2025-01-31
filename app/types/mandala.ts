export interface MandalaCell {
  id: string;
  index: string; // 序号（甲乙丙丁/ABCD）
  title: string;
  content: string;
  children?: MandalaCell[]; // 子主题的九宫格
}

export interface MandalaData {
  mainGrid: MandalaCell[]; // 主九宫格
}

export type ViewMode = 'nine' | 'eightyone';

// 序号常量
export const MAIN_INDICES = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '玉'];
export const SUB_INDICES = Array(9).fill(
  Array.from({ length: 8 }, (_, j) => String.fromCharCode(65 + j)).join('')
); 