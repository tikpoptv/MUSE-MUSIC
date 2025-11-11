"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/fillin";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ADD_adminProps {
  onAdminAdded: () => void;
}

const ADD_admin: React.FC<ADD_adminProps> = ({ onAdminAdded }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const { adminManageService } = await import('@/services/adminManageService');
      await adminManageService.addAdminUser(email.trim(), 'admin');
      toast.success('Admin user added successfully');
      setEmail("");
      onAdminAdded();
    } catch (error: unknown) {
      let errorMessage = 'Failed to add admin user';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as { error?: string; message?: string };
        errorMessage = apiError.error || apiError.message || errorMessage;
      }
      
      if (errorMessage.includes('not found')) {
        errorMessage = 'User not found. Please make sure the user has registered an account with this email address.';
      } else if (errorMessage.includes('already')) {
        errorMessage = 'This user is already an admin.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleInvite();
    }
  };

  return (
    <div className="w-full max-w-[1129px] px-4 py-3 mx-auto">
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          Enter the email address of an existing user to grant admin privileges. The user must have an account in the system.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 p-5">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center w-full sm:flex-1 border border-gray-300 rounded-lg bg-white shadow-sm min-h-[42px] hover:border-violet-400 transition-colors duration-200">
            <div className="relative w-full">
              <Input
                type="email"
                placeholder="Enter user email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="justify-center pl-4 pr-4 w-full text-gray-600 border-none focus-visible:ring-0 focus-visible:outline-none"
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <Button
              onClick={handleInvite}
              disabled={isLoading}
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white text-sm px-6 py-2 rounded-lg min-w-[155px] min-h-[42px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Adding...' : 'Add Admin'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ADD_admin;
