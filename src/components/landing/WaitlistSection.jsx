import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { joinWaitlist } from '@/lib/waitlist';
import { PRIVACY_POLICY_VERSION, DATA_RETENTION_LABEL } from '@/lib/privacyConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Ученик' },
  { value: 'teacher', label: 'Преподаватель' },
];

const loadDraft = (storageKey) => {
  if (!storageKey) return null;
  try {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveDraft = (storageKey, data) => {
  if (!storageKey) return;
  sessionStorage.setItem(storageKey, JSON.stringify(data));
};

export default function WaitlistSection({ formOpen, onFormOpenChange, draftStorageKey }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState('');
  const [personalDataConsent, setPersonalDataConsent] = React.useState(false);
  const [marketingConsent, setMarketingConsent] = React.useState(false);
  const [formData, setFormData] = React.useState(() => {
    const draft = loadDraft(draftStorageKey);
    return {
      full_name: draft?.full_name || '',
      email: draft?.email || '',
      user_type: draft?.user_type || 'student',
    };
  });

  useEffect(() => {
    if (formOpen) {
      setError('');
      const draft = loadDraft(draftStorageKey);
      if (draft) {
        setFormData((prev) => ({
          full_name: draft.full_name || prev.full_name,
          email: draft.email || prev.email,
          user_type: draft.user_type || prev.user_type,
        }));
        if (typeof draft.personal_data_consent === 'boolean') {
          setPersonalDataConsent(draft.personal_data_consent);
        }
        if (typeof draft.marketing_consent === 'boolean') {
          setMarketingConsent(draft.marketing_consent);
        }
      }
    }
  }, [formOpen, draftStorageKey]);

  useEffect(() => {
    if (!formOpen || !draftStorageKey) return;
    saveDraft(draftStorageKey, {
      ...formData,
      personal_data_consent: personalDataConsent,
      marketing_consent: marketingConsent,
    });
  }, [formData, personalDataConsent, marketingConsent, formOpen, draftStorageKey]);

  const openPrivacyPolicy = () => {
    sessionStorage.setItem('lesson_sale_waitlist_form_open', '1');
    saveDraft(draftStorageKey, {
      ...formData,
      personal_data_consent: personalDataConsent,
      marketing_consent: marketingConsent,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const email = formData.email.trim().toLowerCase();
    const fullName = formData.full_name.trim();

    if (!fullName) {
      setError('Укажите имя');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Укажите корректный email');
      return;
    }
    if (!personalDataConsent) {
      setError('Необходимо согласие на обработку персональных данных');
      return;
    }

    setIsSubmitting(true);
    const consentDate = new Date().toISOString();

    try {
      await joinWaitlist({
        full_name: fullName,
        email,
        user_type: formData.user_type,
        personal_data_consent: true,
        personal_data_consent_date: consentDate,
        privacy_policy_version: PRIVACY_POLICY_VERSION,
        marketing_consent: marketingConsent,
        marketing_consent_date: marketingConsent ? consentDate : null,
      });

      if (draftStorageKey) {
        sessionStorage.removeItem(draftStorageKey);
        sessionStorage.removeItem('lesson_sale_waitlist_form_open');
      }

      setIsSuccess(true);
      onFormOpenChange?.(false);
    } catch (err) {
      if (err?.code === 'duplicate_email') {
        setError('Этот email уже в списке ожидания');
      } else {
        setError('Не удалось отправить заявку. Попробуйте ещё раз.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="waitlist"
      className="scroll-mt-4 bg-gradient-to-br from-orange-500 to-red-500 text-white py-20"
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
          <Bell className="w-5 h-5" />
          <span className="font-semibold text-sm">Скоро запуск</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Будьте первыми
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Lesson Sale скоро откроется. Оставьте email — сообщим о запуске и дадим ранний доступ
        </p>

        {isSuccess ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <CheckCircle2 className="w-14 h-14 text-white mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">Вы в списке ожидания!</p>
            <p className="text-white/80">
              Мы напишем на {formData.email} перед запуском платформы
            </p>
          </div>
        ) : !formOpen ? (
          <Button
            type="button"
            onClick={() => onFormOpenChange?.(true)}
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-50 h-14 px-8 rounded-2xl text-lg font-semibold shadow-lg"
          >
            Добавьте меня в лист ожидания
          </Button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 md:p-8 text-left max-w-md mx-auto shadow-xl"
          >
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-medium">Имя</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Как к вам обращаться"
                  className="mt-2 h-12 rounded-xl text-gray-900"
                  autoFocus
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="mt-2 h-12 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium mb-2 block">Я хочу</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, user_type: role.value })}
                      className={`h-12 rounded-xl border-2 font-medium transition-colors ${
                        formData.user_type === role.value
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="waitlist-pd-consent"
                    checked={personalDataConsent}
                    onCheckedChange={(checked) => setPersonalDataConsent(checked === true)}
                    className="mt-0.5 border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <div className="text-sm text-gray-600 leading-snug text-left">
                    <label htmlFor="waitlist-pd-consent" className="cursor-pointer">
                      Я соглашаюсь на обработку персональных данных
                    </label>{' '}
                    в соответствии с{' '}
                    <Link
                      to={createPageUrl('Privacy')}
                      onClick={openPrivacyPolicy}
                      className="text-orange-600 hover:underline font-medium"
                    >
                      Политикой конфиденциальности
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="waitlist-marketing-consent"
                    checked={marketingConsent}
                    onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                    className="mt-0.5 border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <label
                    htmlFor="waitlist-marketing-consent"
                    className="text-sm text-gray-600 leading-snug cursor-pointer text-left"
                  >
                    Хочу получать новости и предложения Lesson Sale на email (необязательно)
                  </label>
                </div>

                {!personalDataConsent && (
                  <p className="text-xs text-orange-600">
                    Отметьте согласие на обработку данных, чтобы отправить заявку
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl p-3">
                <strong className="text-gray-700">Цель:</strong> уведомление о запуске платформы
                и ранний доступ.{' '}
                <strong className="text-gray-700">Срок хранения:</strong> {DATA_RETENTION_LABEL}.
              </p>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onFormOpenChange?.(false);
                    setError('');
                    setPersonalDataConsent(false);
                    setMarketingConsent(false);
                  }}
                  className="flex-1 h-12 rounded-xl"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Отправка...
                    </span>
                  ) : (
                    'Встать в очередь'
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
