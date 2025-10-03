'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: 'Romioneth',
    password: '••••••••',
    email: 'romioneth9544@gmail.com',
    country: 'Thailand',
    timezone: 'Thailand (GMT+7)',
    language: 'English'
  });

  const [originalData, setOriginalData] = useState({
    username: 'Romioneth',
    password: '••••••••',
    email: 'romioneth9544@gmail.com',
    country: 'Thailand',
    timezone: 'Thailand (GMT+7)',
    language: 'English'
  });

  const handleEdit = (field: string) => {
    setIsEditing(field);
  };

  const handleSave = () => {
    const currentField = isEditing;
    if (!currentField) return;

    // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่
    const hasChanges = formData[currentField as keyof typeof formData] !== originalData[currentField as keyof typeof originalData];
    
    if (!hasChanges) {
      toast.error('No changes detected. Please make some changes before saving.');
      return;
    }

    // บันทึกข้อมูล
    setOriginalData({...originalData, [currentField]: formData[currentField as keyof typeof formData]});
    setIsEditing(null);
    toast.success('Changes saved successfully!');
    
    // TODO: Save to backend
  };


  const renderInputField = (field: string, label: string, type: string = 'text', extraContent?: React.ReactNode) => {
    const isPassword = type === 'password';
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <div className="relative">
            <input
              type={type}
              value={formData[field as keyof typeof formData]}
              onChange={(e) => setFormData({...formData, [field]: e.target.value})}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-[#0F172A] ${
                isEditing === field ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
              }`}
              disabled={isPassword || isEditing !== field}
              readOnly={isPassword}
            />
            {!isPassword && (
              <button
                onClick={() => handleEdit(field)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#7B61FF] transition-colors"
              >
                <Image src="/icons/pen-edit-icon.svg" alt="Edit" width={16} height={16} />
              </button>
            )}
          </div>
          {extraContent}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-[32px] p-8 w-full max-w-4xl" 
        style={{
          boxShadow: '0 0 50px rgba(123, 97, 255, 0.1), 0 0 100px rgba(123, 97, 255, 0.05), 0 0 150px rgba(123, 97, 255, 0.03), 0 0 200px rgba(123, 97, 255, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Section - Avatar Upload */}
          <div className="flex flex-col items-center lg:col-span-1">
            <div className="w-48 h-48 bg-gradient-to-br from-[#7B61FF] to-[#6B51EF] rounded-full flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-white text-4xl font-bold mb-2">+</div>
                <div className="text-white text-xs">Add your picture!</div>
              </div>
            </div>
          </div>

          {/* Right Section - Account Details */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Username */}
            {renderInputField('username', 'Username')}

            {/* Password */}
            {renderInputField('password', 'Password', 'password', 
              <button className="text-[#7B61FF] text-sm hover:underline mt-1">Reset Password?</button>
            )}

            {/* Email */}
            {renderInputField('email', 'Email', 'email')}

            {/* Country */}
            {renderInputField('country', 'Country')}

            {/* Timezone */}
            {renderInputField('timezone', 'Timezone')}

            {/* Language */}
            {renderInputField('language', 'Language')}

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                className="bg-[#7B61FF] hover:bg-[#6B51EF] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Image src="/icons/save-icon.svg" alt="Save" width={16} height={16} className="filter brightness-0 invert" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}