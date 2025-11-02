'use client';

import { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface CoverImageUploadProps {
  width?: number;
  height?: number;
  onImageChange?: (image: string | null) => void;
  initialImage?: string | null;
}

export default function CoverImageUpload({
  width = 304,
  height = 302,
  onImageChange,
  initialImage = null
}: CoverImageUploadProps) {
  const [coverImage, setCoverImage] = useState<string | null>(initialImage);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCoverImage(imageData);
      if (onImageChange) {
        onImageChange(imageData);
      }
      toast.success('Cover image uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageChange) {
      onImageChange(null);
    }
  };

  return (
    <div
      className={`rounded-lg relative overflow-hidden border-2 border-dashed cursor-pointer transition-all ${
        coverImage 
          ? 'border-transparent' 
          : isDragging 
            ? 'bg-purple-100 border-purple-400' 
            : 'bg-purple-50 border-purple-200'
      }`}
      style={{ width: `${width}px`, height: `${height}px` }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !coverImage && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {coverImage ? (
        <>
          <Image
            src={coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage();
            }}
            className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="bg-white rounded-full p-3 mb-3">
            <Plus className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-purple-600 text-sm font-medium">Add the cover!</p>
          <p className="text-purple-400 text-xs mt-1">Click or drag & drop</p>
        </div>
      )}
    </div>
  );
}

