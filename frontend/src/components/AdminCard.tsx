import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";


interface AdminCardProps {
  name: string;
  role: string;
  initials: string;
}

const AdminCard: React.FC<AdminCardProps> = ({ name, role, initials }) => {
  const roles = ["Admin", "User"]; // Available roles

  return (
    <div className="flex items-center justify-between w-full max-w-sm border rounded-xl px-4 py-3 bg-white shadow-sm">
      {/* Left: Avatar + Info */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
          {initials}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{name}</span>
          <span className="text-sm text-gray-500">{role}</span>
        </div>
      </div>

      {/* Right: Role Selector Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 px-3 text-sm text-gray-500">
            {role}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {roles.map((r) => (
            <DropdownMenuItem key={r}>
              {r}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AdminCard;