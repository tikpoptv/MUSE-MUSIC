import React from "react";

interface BigStatCardProps {
    stat_icon: React.ReactNode;
    stat_name: string;
    stat_value: number;
    stat_description: string;
}

const BigStatCard: React.FC<BigStatCardProps> = ({ stat_icon, stat_name, stat_value, stat_description }) => {

  return (
    <div className="flex items-center justify-between w-full border rounded-xl px-8 py-3 bg-white shadow-sm">
      
      <div className="flex items-center gap-8">
        <div className="w-12 h-12 rounded-sm bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
          {stat_icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{stat_name}</span>
          <span className="text-2xl font-semibold text-gray-900">{stat_value}</span>
          <span className="text-sm text-gray-500">{stat_description}</span>
        </div>
      </div>
    </div>
  );
};

export default BigStatCard;