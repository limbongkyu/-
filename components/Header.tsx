import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex items-center justify-center">
        <i className="fa-solid fa-utensils text-3xl text-orange-600 mr-3"></i>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          오늘 뭐 먹지?
          <span className="text-orange-500 text-lg ml-2 font-semibold align-middle">by Gemini</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;