'use client';

import React from 'react';
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-2xl p-8 mx-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl mt-8">
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
          <p className="mb-4">
            By creating an account or using MUSE MUSIC, you agree to our Terms of Service and Privacy Policy. 
            Please take a moment to review them.
          </p>
          
          <div className="bg-purple-50 rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📚 Educational Project</h3>
              <p>MUSE MUSIC is developed for CPE 334 Software Engineering at KMUTT. This is an educational demonstration project.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🎵 Content & Copyright</h3>
              <p>All music content is for educational purposes. We respect copyright and will remove content upon request.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🤖 AI-Powered Analysis</h3>
              <p>Our service uses AI/LLM for lyrics translation and mood analysis. Results are predictions and may not be 100% accurate.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔒 Privacy & Data</h3>
              <p>We collect and use data as described in our Privacy Policy. Your data is protected and used for educational purposes only.</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-center text-gray-600">
              For complete details, please read our{' '}
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#7B61FF] hover:underline font-semibold"
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a 
                href="/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#7B61FF] hover:underline font-semibold"
              >
                Privacy Policy
              </a>
              .
            </p>
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
