import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Bell, MessageSquare, Calendar, Loader2 } from 'lucide-react';
import BottomNav from '@/components/ui/BottomNav';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_new_message: true,
    email_new_booking: true,
    push_new_message: true,
    push_new_booking: true
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    if (userData.notification_settings) {
      setSettings(userData.notification_settings);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await base44.auth.updateMe({
      notification_settings: settings
    });
    setIsSaving(false);
    navigate(-1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <Bell className="w-5 h-5 text-orange-500" />
          <h1 className="text-lg font-semibold text-gray-900">Уведомления</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Email notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Email-уведомления</h2>
          </div>
          <div className="bg-white rounded-2xl divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <Label className="font-medium text-gray-900">Новые сообщения</Label>
                  <p className="text-sm text-gray-500">Получать email при новом сообщении</p>
                </div>
              </div>
              <Switch
                checked={settings.email_new_message}
                onCheckedChange={(checked) => setSettings({ ...settings, email_new_message: checked })}
              />
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <Label className="font-medium text-gray-900">Бронирования</Label>
                  <p className="text-sm text-gray-500">Получать email при бронировании урока</p>
                </div>
              </div>
              <Switch
                checked={settings.email_new_booking}
                onCheckedChange={(checked) => setSettings({ ...settings, email_new_booking: checked })}
              />
            </div>
          </div>
        </div>

        {/* Push notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Уведомления в приложении</h2>
          </div>
          <div className="bg-white rounded-2xl divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <Label className="font-medium text-gray-900">Новые сообщения</Label>
                  <p className="text-sm text-gray-500">Показывать всплывающие уведомления</p>
                </div>
              </div>
              <Switch
                checked={settings.push_new_message}
                onCheckedChange={(checked) => setSettings({ ...settings, push_new_message: checked })}
              />
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <Label className="font-medium text-gray-900">Бронирования</Label>
                  <p className="text-sm text-gray-500">Показывать уведомления о бронировании</p>
                </div>
              </div>
              <Switch
                checked={settings.push_new_booking}
                onCheckedChange={(checked) => setSettings({ ...settings, push_new_booking: checked })}
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-sm text-blue-700">
            Вы всегда можете изменить эти настройки. Email-уведомления отправляются на адрес <strong>{user.email}</strong>
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-lg font-semibold"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>

      <BottomNav userType={user?.user_type} />
    </div>
  );
}