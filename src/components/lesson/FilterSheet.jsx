import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { ALL_SUBJECTS } from '@/lib/lessonSubjects';

const subjects = ALL_SUBJECTS;

const timeSlots = [
  { label: 'Утро (8-12)', value: 'morning' },
  { label: 'День (12-17)', value: 'afternoon' },
  { label: 'Вечер (17-21)', value: 'evening' },
];

export default function FilterSheet({ filters, onFiltersChange, activeFiltersCount }) {
  const [open, setOpen] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      subject: null,
      maxPrice: 5000,
      minRating: 0,
      timeSlot: null
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative rounded-xl border-gray-200">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Фильтры
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl h-[85vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">Фильтры</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto pb-24">
          {/* Subject */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Предмет</Label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <Badge
                  key={subject}
                  variant={localFilters.subject === subject ? 'default' : 'outline'}
                  className={`cursor-pointer py-2 px-4 text-sm ${
                    localFilters.subject === subject 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setLocalFilters({
                    ...localFilters,
                    subject: localFilters.subject === subject ? null : subject
                  })}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Максимальная цена: {localFilters.maxPrice} ₽
            </Label>
            <Slider
              value={[localFilters.maxPrice]}
              onValueChange={([value]) => setLocalFilters({ ...localFilters, maxPrice: value })}
              max={5000}
              min={500}
              step={100}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>500 ₽</span>
              <span>5000 ₽</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Минимальный рейтинг: {localFilters.minRating > 0 ? localFilters.minRating : 'Любой'}
            </Label>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <Badge
                  key={rating}
                  variant={localFilters.minRating === rating ? 'default' : 'outline'}
                  className={`cursor-pointer py-2 px-4 ${
                    localFilters.minRating === rating 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setLocalFilters({ ...localFilters, minRating: rating })}
                >
                  {rating === 0 ? 'Любой' : `${rating}+`}
                </Badge>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Время</Label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <Badge
                  key={slot.value}
                  variant={localFilters.timeSlot === slot.value ? 'default' : 'outline'}
                  className={`cursor-pointer py-2 px-4 ${
                    localFilters.timeSlot === slot.value 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setLocalFilters({
                    ...localFilters,
                    timeSlot: localFilters.timeSlot === slot.value ? null : slot.value
                  })}
                >
                  {slot.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 rounded-xl"
            onClick={handleReset}
          >
            Сбросить
          </Button>
          <Button 
            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500"
            onClick={handleApply}
          >
            Применить
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}