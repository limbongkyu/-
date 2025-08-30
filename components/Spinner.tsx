import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-16">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent border-solid rounded-full animate-spin"></div>
      <p className="text-lg font-semibold text-stone-700">최고의 레시피를 찾고 있어요...</p>
    </div>
  );
};

export default Spinner;