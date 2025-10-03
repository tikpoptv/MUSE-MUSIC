import Image from 'next/image';

interface NavMenuItemProps {
  icon: string;
  label: string;
  count: number;
  onClick?: () => void;
}

export default function NavMenuItem({ icon, label, count, onClick }: NavMenuItemProps) {
  return (
    <div 
      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <Image src={icon} alt={label} width={24} height={24} />
        <span className="text-gray-500 text-sm">{count}</span>
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
    </div>
  );
}
