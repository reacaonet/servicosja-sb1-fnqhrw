import React from 'react';
import { LucideIcon, Briefcase } from 'lucide-react';

interface CategoryButtonProps {
  category: {
    id: string;
    name: string;
    icon?: LucideIcon;
  };
  isSelected: boolean;
  onClick: () => void;
}

export const CategoryButton: React.FC<CategoryButtonProps> = ({ category, isSelected, onClick }) => {
  const Icon = category.icon || Briefcase;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
        isSelected
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <Icon size={20} />
      <span>{category.name}</span>
    </button>
  );
};

export default CategoryButton;