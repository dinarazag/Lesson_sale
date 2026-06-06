import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Copy, CheckCircle2, Gift } from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/ui/BottomNav';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function Referral() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    if (userData?.user_type !== 'teacher') {
      navigate(createPageUrl('Feed'));
      return;
    }
    setUser(userData);
    
    // Generate or get referral code
    if (!userData.referral_code) {
      const code = `${userData.full_name.substring(0, 3).toUpperCase()}${userData.id.substring(0, 6)}`;
      await base44.auth.updateMe({ referral_code: code });
      setReferralCode(code);
    } else {
      setReferralCode(userData.referral_code);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Код скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Ссылка скопирована!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Реферальная программа
            </h2>
            <p className="text-gray-600 mb-6">
              Приглашайте своих учеников — получайте 20% комиссии с каждого забронированного урока
            </p>
            <Button
              onClick={() => setShowWelcomeModal(false)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500"
            >
              Начать приглашать
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 px-4 pt-4 pb-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 mb-4">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Приглашайте учеников</h1>
          </div>
          <p className="text-white/90">Зарабатывайте 20% с каждого урока</p>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="px-4 -mt-12 relative z-20 space-y-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">Ваш реферальный код</h3>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 tracking-wider mb-2">
                {referralCode || '...'}
              </p>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="h-10 rounded-xl"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Скопировать код
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Попросите учеников ввести этот код при поиске ваших уроков
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Как это работает?</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">1</span>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Поделитесь кодом</p>
                <p className="text-sm text-gray-600">Отправьте свой реферальный код ученикам</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">2</span>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Ученик находит ваши уроки</p>
                <p className="text-sm text-gray-600">Они вводят код в фильтр "Мой учитель" в ленте</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold">3</span>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Получайте выгоду</p>
                <p className="text-sm text-gray-600">Комиссия снижается с 15% до 10% для рефералов</p>
              </div>
            </div>
          </div>
        </div>

        {/* Share Link */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Поделиться ссылкой</h3>
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <p className="text-sm text-gray-600 break-all">
              {window.location.origin}?ref={referralCode}
            </p>
          </div>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full h-11 rounded-xl"
          >
            <Copy className="w-4 h-4 mr-2" />
            Скопировать ссылку
          </Button>
        </div>
      </div>

      <BottomNav userType="teacher" />
    </div>
  );
}