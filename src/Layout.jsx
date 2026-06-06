import React from 'react';
import NotificationToast from '@/components/notifications/NotificationToast';

export default function Layout({ children, currentPageName }) {
  // Pages that should have safe area padding for mobile devices
  const hasSafeArea = ['Feed', 'History', 'Profile', 'CreateLesson', 'FAQ', 'Support'];

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationToast />
      <style>{`
        :root {
          --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        }
        
        .pb-safe {
          padding-bottom: max(0.5rem, var(--safe-area-inset-bottom));
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        
        /* Disable pull-to-refresh on mobile */
        html, body {
          overscroll-behavior-y: none;
        }
        
        /* Better touch targets */
        button, a {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Smooth animations */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
      {children}
    </div>
  );
}