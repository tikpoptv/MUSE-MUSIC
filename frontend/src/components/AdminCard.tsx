"use client";

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
  userID: string;
  name: string;
  role: string;
  initials: string;
  onRoleChange: (userID: string, newRole: 'customer' | 'admin' | 'super_admin') => Promise<void>;
}

const AdminCard: React.FC<AdminCardProps> = ({ userID, name, role, initials, onRoleChange }) => {
  const roles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'customer', label: 'User' }
  ];

  const handleRoleSelect = async (newRole: 'customer' | 'admin' | 'super_admin') => {
    if (newRole === role.toLowerCase()) {
      return;
    }
    await onRoleChange(userID, newRole);
  };

  const getRoleLabel = (roleValue: string) => {
    const roleMap: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'customer': 'User'
    };
    return roleMap[roleValue.toLowerCase()] || roleValue;
  };

  return (
    <div className="flex items-center justify-between w-full max-w-sm border rounded-xl px-4 py-3 bg-white shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700">
          {initials}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{name}</span>
          <span className="text-sm text-gray-500">{getRoleLabel(role)}</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 px-3 text-sm text-gray-500">
            {getRoleLabel(role)}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {roles.map((r) => (
            <DropdownMenuItem 
              key={r.value}
              onClick={() => handleRoleSelect(r.value as 'customer' | 'admin' | 'super_admin')}
            >
              {r.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AdminCard;