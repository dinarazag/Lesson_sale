import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LandingFooter() {
  return (
    <div className="bg-gray-900 text-gray-400 py-8">
      <div className="max-w-6xl mx-auto px-4 text-center space-y-3">
        <p className="text-sm">
          © 2026 Lesson Sale. Платформа для бронирования горящих уроков
        </p>
        <Link
          to={createPageUrl('Privacy')}
          className="text-sm text-gray-300 hover:text-white underline underline-offset-4"
        >
          Политика конфиденциальности
        </Link>
      </div>
    </div>
  );
}
