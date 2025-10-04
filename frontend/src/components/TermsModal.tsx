'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const handleAcceptTerms = () => {
    onAccept();
    onClose();
    toast.success('Terms and conditions accepted');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 mx-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Educational Project</h3>
            <p>MUSE Music is an educational project developed for CPE 334 Software Engineering course. This is a demonstration application for learning purposes only.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">2. Music Content Disclaimer</h3>
            <p>All music content used in this application is for educational demonstration purposes only. We do not claim ownership of any music tracks and acknowledge that all rights belong to their respective copyright holders.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Non-Commercial Use</h3>
            <p>This application is strictly for educational and demonstration purposes. No commercial use is intended or permitted. All music content is used under fair use for educational purposes.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">4. Copyright Notice</h3>
            <p>We respect all copyright holders and their intellectual property rights. If you are a copyright holder and believe your content has been used inappropriately, please contact us for immediate removal.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">5. Educational Purpose</h3>
            <p>This project demonstrates software engineering principles including user authentication, database design, API development, and frontend-backend integration for academic evaluation.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">6. Data Privacy</h3>
            <p>User data collected is used solely for educational demonstration purposes. No personal information will be shared or used for commercial purposes.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">7. Project Scope</h3>
            <p>This is a capstone project for CPE 334 Software Engineering course, demonstrating full-stack development skills and software engineering best practices.</p>
          </div>
        </div>
        
        <div className="flex space-x-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAcceptTerms}
            className="flex-1 px-4 py-2 bg-[#7B61FF] text-white rounded-lg hover:bg-[#6B51EF] transition-colors"
          >
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
}
