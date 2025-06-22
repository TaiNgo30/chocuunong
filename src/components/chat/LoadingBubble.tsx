import React from "react";

const LoadingBubble: React.FC = () => {
  return (
    <div className="w-full flex justify-start mb-2">
      <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg rounded-bl-none max-w-[75%]">
        <div className="flex items-center space-x-1 h-6">
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]">
          </span>
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]">
          </span>
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce">
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingBubble;
