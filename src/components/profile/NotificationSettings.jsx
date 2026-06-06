import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Mail, Smartphone, CheckCircle2 } from 'lucide-react';

export default function NotificationSettings({ user, onUpdate }) {
  const [settings, setSettings] = useState(user?.notification_settings || {
    email_new_message: true,
    email_new_booking: true,
    email_lesson_reminder: true,
    push_new_message: true,
    push_new_booking: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await base44.auth.updateMe({ notification_settings: settings });
    setIsLoading(false);
    setIsSaved(true);
    onUpdate?.();
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Email уведомления</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email_new_message" className="text-gray-700">
              Новые сообщения
            </Label>
            <Switch
              id="email_new_message"
              checked={settings.email_new_message}
              onCheckedChange={(checked) => setSettings({ ...settings, email_new_message: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email_new_booking" className="text-gray-700">
              Новые бронирования
            </Label>
            <Switch
              id="email_new_booking"
              checked={settings.email_new_booking}
              onCheckedChange={(checked) => setSettings({ ...settings, email_new_booking: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email_lesson_reminder" className="text-gray-700">
              Напоминания о уроках
            </Label>
            <Switch
              id="email_lesson_reminder"
              checked={settings.email_lesson_reminder}
              onCheckedChange={(checked) => setSettings({ ...settings, email_lesson_reminder: checked })}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Уведомления в приложении</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push_new_message" className="text-gray-700">
              Новые сообщения
            </Label>
            <Switch
              id="push_new_message"
              checked={settings.push_new_message}
              onCheckedChange={(checked) => setSettings({ ...settings, push_new_message: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push_new_booking" className="text-gray-700">
              Новые бронирования
            </Label>
            <Switch
              id="push_new_booking"
              checked={settings.push_new_booking}
              onCheckedChange={(checked) => setSettings({ ...settings, push_new_booking: checked })}
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isLoading || isSaved}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500"
      >
        {isSaved ? (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Сохранено
          </>
        ) : (
          isLoading ? 'Сохранение...' : 'Сохранить настройки'
        )}
      </Button>
    </div>
  );
}