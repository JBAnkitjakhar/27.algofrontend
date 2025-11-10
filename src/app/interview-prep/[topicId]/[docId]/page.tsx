// src/app/interview-prep/[topicId]/[docId]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDocument, useTopic } from '@/hooks/useCoursesManagement';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/layout/UserLayout';
import { dateUtils } from '@/lib/utils/common';
import { Loader2Icon } from 'lucide-react';

function DocumentContent() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const docId = params.docId as string;
  
  const { data: document, isLoading: isLoadingDoc } = useDocument(docId);
  const { data: topic } = useTopic(topicId);

  if (isLoadingDoc) {
    return (
      <UserLayout>
        <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
          <Loader2Icon className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </UserLayout>
    );
  }

  if (!document) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-300">Document not found</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push(`/interview-prep/${topicId}`)}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-1" />
                  Back to Documents
                </button>
                
                {topic && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{topic.name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-4 w-4" />
                <span>Updated {dateUtils.formatRelativeTime(document.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Document Title */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {document.title}
                </h1>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>By {document.createdByName}</span>
                <span>•</span>
                <span>Created {dateUtils.formatDate(document.createdAt)}</span>
              </div>
            </div>

            {/* Document Body */}
            <div className="px-8 py-6">
              <div 
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: document.content || '' }}
              />
            </div>
          </article>

          {/* Additional Info */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Document Information</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Topic</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{topic?.name || document.topicName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Author</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{document.createdByName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                <dd className="text-sm text-gray-900 dark:text-white">{dateUtils.formatDateTime(document.updatedAt)}</dd>
              </div>
              {document.imageUrls && document.imageUrls.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Attachments</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{document.imageUrls.length} images</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
      
      {/* Add custom styles for the content */}
      <style jsx global>{`
        .prose pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        
        .dark .prose pre {
          background-color: #111827;
        }
        
        .prose code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .dark .prose code {
          background-color: #374151;
          color: #e5e7eb;
        }
        
        .prose pre code {
          background-color: transparent;
          padding: 0;
        }
        
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem auto;
        }
        
        .prose h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        
        .prose h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .prose h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
        }
        
        .dark .prose blockquote {
          border-left-color: #4b5563;
          color: #9ca3af;
        }
      `}</style>
    </UserLayout>
  );
}

export default function DocumentViewPage() {
  return (
    <ProtectedRoute>
      <DocumentContent />
    </ProtectedRoute>
  );
}