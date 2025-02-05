import { MandalaCell } from '../types/mandala';
import { MandalaCard } from './MandalaCard';

interface SubGridProps {
  cells: MandalaCell[];
  position: { gridArea: string };
  backgroundColor: string;
  centerColor: string;
  onIndexClick?: (cell: MandalaCell, event: React.MouseEvent) => void;
  onEdit: (cell: MandalaCell, field: 'title' | 'content') => void;
  onEditComplete: (cell: MandalaCell, field: 'title' | 'content', value: string) => void;
  editingCell: { id: string; field: 'title' | 'content' } | null;
  gridPositions: { gridArea: string }[];
}

export const SubGrid = ({
  cells,
  position,
  backgroundColor,
  centerColor,
  onIndexClick,
  onEdit,
  onEditComplete,
  editingCell,
  gridPositions
}: SubGridProps) => {
  const centerCell = cells[0];
  const subCells = cells.slice(1);

  return (
    <div
      className={`grid grid-cols-3 grid-rows-3 gap-2 rounded-lg p-2 ${backgroundColor}`}
      style={position}
    >
      {/* 中心主题 */}
      <MandalaCard
        cell={centerCell}
        position={gridPositions[0]}
        backgroundColor={centerColor}
        isCenter
        isMainCell
        onIndexClick={onIndexClick}
        onEdit={onEdit}
        onEditComplete={onEditComplete}
        isEditing={editingCell?.id === centerCell.id}
        editingField={editingCell?.field}
      />

      {/* 子主题 */}
      {subCells.map((subCell, index) => (
        <MandalaCard
          key={subCell.id}
          cell={subCell}
          position={gridPositions[index + 1]}
          onEdit={onEdit}
          onEditComplete={onEditComplete}
          isEditing={editingCell?.id === subCell.id}
          editingField={editingCell?.field}
        />
      ))}
    </div>
  );
}; 