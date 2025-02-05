import { motion } from 'framer-motion';
import { MandalaCell } from '../types/mandala';

interface MandalaCardProps {
  cell: MandalaCell;
  isCenter?: boolean;
  isMainCell?: boolean;
  position: { gridArea: string };
  onIndexClick?: (cell: MandalaCell, event: React.MouseEvent) => void;
  onEdit: (cell: MandalaCell, field: 'title' | 'content') => void;
  onEditComplete: (cell: MandalaCell, field: 'title' | 'content', value: string) => void;
  isEditing?: boolean;
  editingField?: 'title' | 'content';
  backgroundColor?: string;
}

export const MandalaCard = ({
  cell,
  isCenter = false,
  isMainCell = false,
  position,
  onIndexClick,
  onEdit,
  onEditComplete,
  isEditing = false,
  editingField,
  backgroundColor
}: MandalaCardProps) => {
  return (
    <motion.div
      key={cell.id}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`shadow-md p-2 rounded-lg ${backgroundColor || (isCenter ? 'bg-blue-50' : 'bg-white')}`}
      style={position}
    >
      <div className="relative flex flex-col h-full">
        {/* 序号部分 */}
        {cell.index && (
          <div className="absolute">
            <span 
              className={`text-lg font-bold text-blue-600 min-w-[24px] block ${isMainCell ? 'cursor-pointer hover:text-blue-800' : ''}`}
              onClick={isMainCell ? (e) => onIndexClick?.(cell, e) : undefined}
            >
              {cell.index}
            </span>
          </div>
        )}

        {/* 标题部分 */}
        <div className="text-center mb-1 mt-1 mx-4 flex items-center justify-center" style={{ minHeight: '32px' }}>
          {isEditing && editingField === 'title' ? (
            <input
              type="text"
              className="w-full text-center text-sm font-semibold border-b border-blue-500 focus:outline-none bg-transparent"
              defaultValue={cell.title}
              autoFocus
              onBlur={(e) => onEditComplete(cell, 'title', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onEditComplete(cell, 'title', e.currentTarget.value)}
            />
          ) : (
            <div 
              className="text-sm font-semibold cursor-pointer hover:text-blue-600 px-1 py-1"
              onClick={() => onEdit(cell, 'title')}
              style={{ 
                lineHeight: '1.5', 
                minHeight: '1.5em',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={cell.title}
            >
              {cell.title}
            </div>
          )}
        </div>

        {/* 内容部分 */}
        <div 
          className="flex-1 cursor-pointer overflow-hidden"
          onClick={() => onEdit(cell, 'content')}
        >
          {isEditing && editingField === 'content' ? (
            <textarea
              className="w-full h-full min-h-[40px] text-xs text-gray-600 border border-blue-500 rounded p-1 focus:outline-none bg-transparent resize-none"
              defaultValue={cell.content}
              autoFocus
              onBlur={(e) => onEditComplete(cell, 'content', e.target.value)}
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
    </motion.div>
  );
}; 