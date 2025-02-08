interface LoadingProps {
  isOpen: boolean;
  message?: string;
}

export const Loading = ({ isOpen, message = '正在处理中...' }: LoadingProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="flex min-h-full items-center justify-center">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-8 py-6 shadow-xl transition-all sm:w-full sm:max-w-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 