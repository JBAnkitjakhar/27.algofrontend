// src/app/admin/courses/[topicId]/[docId]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useDocument,
  useTopic,
  useCreateDocument,
  useUpdateDocument,
  useDeleteCourseImage
} from '@/hooks/useCoursesManagement';
import CourseEditor from '@/components/admin/CourseEditor';
import {
  ArrowLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CreateDocumentRequest, UpdateDocumentRequest } from '@/types/courses';
import Image from 'next/image';
import { Loader2Icon, SaveIcon } from 'lucide-react';

export default function AdminDocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const docId = params.docId as string;
  const isNew = docId === 'new';
  
  const { data: topic } = useTopic(topicId);
  const { data: document, isLoading: isLoadingDoc } = useDocument(isNew ? '' : docId);
  const createDocumentMutation = useCreateDocument();
  const updateDocumentMutation = useUpdateDocument();
  const deleteImageMutation = useDeleteCourseImage();
  
  const [formData, setFormData] = useState<CreateDocumentRequest | UpdateDocumentRequest>({
    title: '',
    topicId: topicId,
    displayOrder: 1,
    content: '',
    imageUrls: []
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data when document loads
  useEffect(() => {
    if (isNew && !isInitialized) {
      // For new documents, initialize immediately
      setFormData({
        title: '',
        topicId: topicId,
        displayOrder: 1,
        content: '',
        imageUrls: []
      });
      setIsInitialized(true);
    } else if (document && !isInitialized) {
      // For existing documents, initialize once with document data
      // Use a small delay to ensure proper state updates
      const timer = setTimeout(() => {
        console.log('Initializing with document content length:', document.content?.length);
        setFormData({
          title: document.title,
          topicId: document.topicId,
          displayOrder: document.displayOrder,
          content: document.content || '',
          imageUrls: document.imageUrls || []
        });
        setIsInitialized(true);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [document, isNew, topicId, isInitialized]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Document title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Document content is required');
      return;
    }

    setIsSaving(true);
    
    try {
      // Extract image URLs from content
      const parser = new DOMParser();
      const doc = parser.parseFromString(formData.content, 'text/html');
      const images = doc.querySelectorAll('img');
      const imageUrls = Array.from(images).map(img => img.src).filter(src => 
        src.startsWith('https://res.cloudinary.com')
      );
      
      const dataToSave = {
        ...formData,
        imageUrls
      };

      if (isNew) {
        await createDocumentMutation.mutateAsync(dataToSave as CreateDocumentRequest);
        toast.success('Document created successfully');
        router.push(`/admin/courses/${topicId}`);
      } else {
        await updateDocumentMutation.mutateAsync({ 
          docId, 
          data: dataToSave as UpdateDocumentRequest 
        });
        toast.success('Document updated successfully');
      }
    } catch (error) {
      console.error('Failed to save document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (window.confirm('Remove this image from the document?')) {
      // Remove from content
      const newContent = formData.content.replace(
        new RegExp(`<img[^>]*src="${imageUrl}"[^>]*>`, 'g'),
        ''
      );
      setFormData({ ...formData, content: newContent });
      
      // Delete from Cloudinary
      try {
        await deleteImageMutation.mutateAsync(imageUrl);
        toast.success('Image removed');
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  };

  // Show loading while fetching document
  if (!isNew && (isLoadingDoc || !isInitialized)) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <Loader2Icon className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/admin/courses/${topicId}`)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-1" />
                Back
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isNew ? 'Create Document' : 'Edit Document'}
                </h1>
                {topic && (
                  <p className="text-sm text-gray-500">
                    Topic: {topic.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/admin/courses/${topicId}`)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4" />
                    {isNew ? 'Create' : 'Save'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Title and Display Order */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter document title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            {isInitialized && (
              <CourseEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Start writing your document content..."
              />
            )}
          </div>

          {/* Image Management (if editing existing document) */}
          {!isNew && formData.imageUrls && formData.imageUrls.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attached Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      width={200}
                      height={128}
                    />
                    <button
                      onClick={() => handleRemoveImage(url)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Note: Removing images here will also remove them from the document content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}