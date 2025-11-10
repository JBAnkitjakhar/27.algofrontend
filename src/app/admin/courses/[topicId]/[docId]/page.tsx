// src/app/admin/courses/[topicId]/[docId]/page.tsx
// DEBUG VERSION - with console logs

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
      setFormData({
        title: '',
        topicId: topicId,
        displayOrder: 1,
        content: '',
        imageUrls: []
      });
      setIsInitialized(true);
    } else if (document && !isInitialized) {
      const timer = setTimeout(() => {
        // console.log('📄 ADMIN: Initializing with document content length:', document.content?.length);
        
        // DEBUG: Log a sample of code blocks from loaded document
        // if (document.content) {
        //   const parser = new DOMParser();
        //   const doc = parser.parseFromString(document.content, 'text/html');
        //   const codeBlocks = doc.querySelectorAll('pre code');
        //   // console.log('📄 ADMIN: Found code blocks:', codeBlocks.length);
        //   if (codeBlocks.length > 0) {
        //     // console.log('📄 ADMIN: First code block HTML:', codeBlocks[0].outerHTML.substring(0, 200));
        //     // console.log('📄 ADMIN: First code block classes:', codeBlocks[0].className);
        //   }
        // }
        
        setFormData({
          title: document.title,
          topicId: document.topicId,
          displayOrder: document.displayOrder || 1,
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
      // DEBUG: Log the HTML content being saved
      // console.log('💾 ADMIN: Saving document with content length:', formData.content.length);
      
      // Extract and log code blocks
      const parser = new DOMParser();
      const doc = parser.parseFromString(formData.content, 'text/html');
      // const codeBlocks = doc.querySelectorAll('pre code');
      // console.log('💾 ADMIN: Saving with code blocks:', codeBlocks.length);
      
      // if (codeBlocks.length > 0) {
      //   console.log('💾 ADMIN: First code block HTML being saved:');
      //   console.log(codeBlocks[0].outerHTML.substring(0, 300));
      //   console.log('💾 ADMIN: First code block classes:', codeBlocks[0].className);
      //   console.log('💾 ADMIN: First code block has hljs classes:', codeBlocks[0].className.includes('hljs'));
        
      //   // Log all span elements with hljs classes inside code block
      //   const spans = codeBlocks[0].querySelectorAll('span[class*="hljs"]');
      //   console.log('💾 ADMIN: Number of hljs spans in first code block:', spans.length);
      //   if (spans.length > 0) {
      //     console.log('💾 ADMIN: Sample span classes:', spans[0].className);
      //   }
      // }
      
      // Extract image URLs from content
      const images = doc.querySelectorAll('img');
      const imageUrls = Array.from(images).map(img => img.src).filter(src => 
        src.startsWith('https://res.cloudinary.com')
      );
      
      const dataToSave = {
        ...formData,
        imageUrls
      };

      // console.log('💾 ADMIN: Data to save:', {
      //   title: dataToSave.title,
      //   contentLength: dataToSave.content.length,
      //   imageCount: imageUrls.length,
      //   codeBlockCount: codeBlocks.length
      // });

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
      console.error('❌ ADMIN: Failed to save document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    if (window.confirm('Remove this image from the document?')) {
      const newContent = formData.content.replace(
        new RegExp(`<img[^>]*src="${imageUrl}"[^>]*>`, 'g'),
        ''
      );
      setFormData({ ...formData, content: newContent });
      
      try {
        await deleteImageMutation.mutateAsync(imageUrl);
        toast.success('Image removed');
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  };

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
                value={formData.displayOrder || 1}
                onChange={(e) => {
                  const value = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                  if (!isNaN(value) && value > 0) {
                    setFormData({ ...formData, displayOrder: value });
                  }
                }}
                min="1"
                placeholder="1"
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
                onChange={(content) => {
                  // DEBUG: Log when content changes in editor
                  // console.log('✏️ ADMIN: Editor content changed, length:', content.length);
                  setFormData({ ...formData, content });
                }}
                placeholder="Start writing your document content..."
              />
            )}
          </div>

          {/* Image Management */}
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