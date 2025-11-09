import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-square rounded-xl bg-gray-200" />
      <div className="h-3 bg-gray-200 rounded w-5/6 mt-3" />
      <div className="h-3 bg-gray-200 rounded w-2/5 mt-2" />
    </div>
  );
};

export default SkeletonCard;


