"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/fillin";
import { Button } from "@/components/ui/button";


const ADD_admin: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleInvite = () => {
    if (!email.trim()) {
      alert("Please enter an email address.");
      return;
    }
    console.log("Inviting:", email);
    setEmail("");
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-10 w-full max-w-[1129px] px-4 py-3  mx-auto">
      {/* Input Container */}
      <div className="flex items-center w-full sm:flex-1  border-[rgba(187,180,221,0.7)] rounded-[8px] bg-white shadow-sm  min-h-[38px]">
        
        <div className="relative">
          
          <Input
            type="email"
            placeholder="Add new admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="justify-center pl-4 w-full text-gray-600 border-none focus-visible:ring-0 focus-visible:outline-none"
          />
        </div>
      </div>

      {/* Button Container */}
      <div className="w-full sm:w-auto">
        <Button
          onClick={handleInvite}
          className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white text-sm px-5 py-1 rounded-md min-w-[155px] min-h-[38px]"
        >
          Invite
        </Button>
      </div>
    </div>
  );
};

export default ADD_admin;
