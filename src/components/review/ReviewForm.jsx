import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, CheckCircle2 } from 'lucide-react';

export default function ReviewForm({ open, onClose, lesson, onSubmit, isLoading, isSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    onSubmit({ rating, comment });
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Спасибо за отзыв!</h2>
            <p className="text-gray-600 mb-6">
              Ваш отзыв поможет другим ученикам сделать правильный выбор.
            </p>
            <Button 
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 h-12"
            >
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Оставить отзыв</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Как прошёл урок с {lesson?.teacher_name}?
          </p>

          {/* Rating stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star 
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <p className="text-center text-gray-500 mb-6">
            {rating === 1 && 'Ужасно'}
            {rating === 2 && 'Плохо'}
            {rating === 3 && 'Нормально'}
            {rating === 4 && 'Хорошо'}
            {rating === 5 && 'Отлично!'}
          </p>

          {/* Comment */}
          <Textarea
            placeholder="Расскажите подробнее о вашем опыте (необязательно)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] rounded-xl resize-none mb-6"
          />

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl h-12"
              onClick={onClose}
              disabled={isLoading}
            >
              Пропустить
            </Button>
            <Button 
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 h-12"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Отправка...' : 'Отправить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
