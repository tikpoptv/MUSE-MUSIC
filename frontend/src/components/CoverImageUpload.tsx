'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X, Loader2, Lock, LogIn } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { imageService } from '@/services/imageService';
import { authService } from '@/services/authService';

interface CoverImageUploadProps {
  width?: number;
  height?: number;
  onImageChange?: (imageUrl: string | null) => void | Promise<void>;
  initialImage?: string | null;
  isSaving?: boolean;
  readonly?: boolean;
}

export default function CoverImageUpload({
  width = 304,
  height = 302,
  onImageChange,
  initialImage = null,
  isSaving = false,
  readonly = false
}: CoverImageUploadProps) {
  const [coverImage, setCoverImage] = useState<string | null>(initialImage);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  useEffect(() => {
    setCoverImage(initialImage);
  }, [initialImage]);

  const handleFileSelect = async (file: File) => {
    if (!isAuthenticated) {
      toast.error('Please login to upload cover image');
      router.push('/login');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed (JPG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await imageService.uploadImage(file);
      
      setCoverImage(imageUrl);
      if (onImageChange) {
        onImageChange(imageUrl);
      }
      toast.success('Cover image uploaded successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
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

    if (!isAuthenticated) {
      toast.error('Please login to upload cover image');
      router.push('/login');
      return;
    }

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

  const handleRemoveImage = async () => {
    const imageUrlToDelete = coverImage;
    
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageChange) {
      onImageChange(null);
    }

    if (imageUrlToDelete && (imageUrlToDelete.startsWith('http') || imageUrlToDelete.startsWith('/api/images'))) {
      try {
        await imageService.deleteImage(imageUrlToDelete);
      } catch {
        // Silently fail since UI is already updated
      }
    }
  };

  return (
    <div
      className={`rounded-lg relative overflow-hidden border-2 border-dashed transition-all ${
        readonly
          ? 'border-transparent cursor-default'
          : coverImage 
          ? 'border-transparent cursor-default' 
          : isDragging 
            ? 'bg-purple-100 border-purple-400 cursor-pointer' 
            : !isAuthenticated
            ? 'bg-purple-50 border-purple-200 cursor-pointer hover:bg-purple-100'
            : 'bg-purple-50 border-purple-200 cursor-pointer'
      }`}
      style={{ width: `${width}px`, height: `${height}px` }}
      onDrop={readonly ? undefined : handleDrop}
      onDragOver={readonly ? undefined : handleDragOver}
      onDragLeave={readonly ? undefined : handleDragLeave}
      onClick={readonly ? undefined : () => {
        if (!isAuthenticated && !coverImage) {
          router.push('/login');
          return;
        }
        if (!coverImage && !isUploading && isAuthenticated) {
          fileInputRef.current?.click();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {isUploading ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-purple-50">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin mb-3" />
          <p className="text-purple-600 text-sm font-medium">Uploading...</p>
        </div>
      ) : isSaving ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 relative">
          {coverImage && (
            (coverImage.startsWith('http') || coverImage.startsWith('/api/images')) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage}
                alt="Cover"
                className="object-cover opacity-50"
                style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', inset: 0 }}
              />
            ) : (
              <Image
                src={coverImage}
                alt="Cover"
                fill
                className="object-cover opacity-50"
                sizes={`${width}px`}
                priority
              />
            )
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
            <Loader2 className="h-6 w-6 text-white animate-spin mb-2" />
            <p className="text-white text-xs font-medium">Saving...</p>
          </div>
        </div>
      ) : coverImage ? (
        <>
          {(coverImage.startsWith('http') || coverImage.startsWith('/api/images')) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt="Cover"
              className="object-cover"
              style={{ 
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
            />
          ) : (
            <Image
              src={coverImage}
              alt="Cover"
              fill
              className="object-cover"
              sizes={`${width}px`}
              priority
            />
          )}
          {isAuthenticated && !readonly && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity z-10"
              disabled={isUploading}
            >
              <X className="h-4 w-4 text-white" />
            </button>
          )}
        </>
      ) : (
        <>
          {!readonly && !isAuthenticated && (
            <div 
              className="absolute inset-0 rounded-lg flex flex-col items-center justify-center z-10 cursor-pointer transition-all hover:opacity-95"
              style={{ 
                background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.9) 0%, rgba(123, 97, 255, 0.75) 100%)',
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => router.push('/login')}
            >
              <div className="flex flex-col items-center gap-3 px-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mb-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <Lock style={{ width: '32px', height: '32px', color: 'white' }} strokeWidth={2} />
                </div>
                <p className="text-white text-center text-base font-semibold">
                  Pretty please?
                </p>
                <p className="text-white text-center text-sm font-medium opacity-95">
                  Login to upload cover image!
                </p>
                <div className="flex items-center gap-1 mt-1 text-white opacity-90">
                  <LogIn style={{ width: '16px', height: '16px', color: 'white' }} strokeWidth={2} />
                  <span className="text-xs">Click to login</span>
                </div>
              </div>
            </div>
          )}
          <div 
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ 
              opacity: isAuthenticated ? 1 : 0.4,
              pointerEvents: isAuthenticated ? 'auto' : 'none'
            }}
          >
            <div className="bg-white rounded-full p-3 mb-3">
              <Plus className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-purple-600 text-sm font-medium">Add the cover!</p>
            <p className="text-purple-400 text-xs mt-1">Click or drag & drop</p>
            <p className="text-purple-300 text-xs mt-2">Accepted: JPG, PNG, GIF, WebP (max 5MB)</p>
          </div>
        </>
      )}
    </div>
  );
}

