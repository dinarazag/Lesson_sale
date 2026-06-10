import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  privacyConfig,
  PRIVACY_POLICY_VERSION,
  PRIVACY_POLICY_DATE,
  DATA_RETENTION_LABEL,
} from '@/lib/privacyConfig';

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-gray-600 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

export default function Privacy() {
  const { operatorName, operatorEmail, operatorInn, siteUrl } = privacyConfig;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link to="/">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 -ml-2 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Политика конфиденциальности</h1>
              <p className="text-white/80 mt-1 text-sm">
                Версия {PRIVACY_POLICY_VERSION} · действует с {PRIVACY_POLICY_DATE}
              </p>
            </div>
          </div>
          <p className="text-white/90 text-lg">
            Настоящий документ описывает, как Lesson Sale обрабатывает персональные данные
            при регистрации в листе ожидания и использовании сайта.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <Section title="1. Оператор персональных данных">
          <p>
            Оператор: <strong>{operatorName}</strong>
            {operatorInn ? (
              <>
                {' '}
                (ИНН {operatorInn})
              </>
            ) : null}
            .
          </p>
          <p>
            Контакт по вопросам персональных данных:{' '}
            <a href={`mailto:${operatorEmail}`} className="text-orange-600 hover:underline">
              {operatorEmail}
            </a>
          </p>
          {siteUrl ? (
            <p>
              Сайт:{' '}
              <a href={siteUrl} className="text-orange-600 hover:underline">
                {siteUrl}
              </a>
            </p>
          ) : null}
        </Section>

        <Section title="2. Какие данные мы собираем">
          <p>При подписке на лист ожидания вы добровольно предоставляете:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>имя;</li>
            <li>адрес электронной почты;</li>
            <li>роль (ученик или преподаватель).</li>
          </ul>
          <p>
            При отдельном согласии — право направлять вам информационные и рекламные
            сообщения о сервисе Lesson Sale.
          </p>
        </Section>

        <Section title="3. Цели обработки">
          <ul className="list-disc pl-5 space-y-1">
            <li>уведомление о запуске платформы Lesson Sale;</li>
            <li>предоставление раннего доступа к сервису;</li>
            <li>обратная связь по вашему запросу;</li>
            <li>информационная и рекламная рассылка — только при отдельном согласии.</li>
          </ul>
        </Section>

        <Section title="4. Правовые основания">
          <p>
            Обработка персональных данных осуществляется на основании согласия субъекта
            персональных данных (ст. 6 и 9 Федерального закона № 152-ФЗ «О персональных данных»),
            а также в случаях, предусмотренных законодательством Российской Федерации.
          </p>
        </Section>

        <Section title="5. Срок хранения">
          <p>
            Персональные данные хранятся {DATA_RETENTION_LABEL}. По истечении срока или при
            отзыве согласия данные удаляются, если иное не требуется законом.
          </p>
        </Section>

        <Section title="6. Передача третьим лицам">
          <p>
            Мы не продаём персональные данные. Передача возможна только подрядчикам,
            обеспечивающим работу сайта и рассылок (хостинг, email-сервис), исключительно
            в объёме, необходимом для указанных целей, и при соблюдении требований
            законодательства о персональных данных.
          </p>
        </Section>

        <Section title="7. Ваши права">
          <p>Вы вправе:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>получить информацию об обработке ваших данных;</li>
            <li>требовать уточнения, блокирования или удаления данных;</li>
            <li>отозвать согласие на обработку персональных данных;</li>
            <li>отказаться от рекламных рассылок.</li>
          </ul>
          <p>
            Для реализации прав направьте запрос на{' '}
            <a href={`mailto:${operatorEmail}`} className="text-orange-600 hover:underline">
              {operatorEmail}
            </a>
            . Мы ответим в сроки, установленные законом.
          </p>
        </Section>

        <Section title="8. Защита данных">
          <p>
            Мы применяем организационные и технические меры для защиты персональных данных
            от неправомерного доступа, изменения, раскрытия или уничтожения, включая
            использование защищённого соединения (HTTPS) при размещении сайта в сети Интернет.
          </p>
        </Section>

        <Section title="9. Изменения политики">
          <p>
            Мы можем обновлять настоящую Политику. Актуальная версия всегда доступна на этой
            странице. При существенных изменениях мы уведомим пользователей листа ожидания
            по email, если это требуется законом.
          </p>
        </Section>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-sm text-gray-600">
          <strong className="text-gray-900">Важно:</strong> этот текст является шаблоном
          для листа ожидания. Перед публичным запуском рекомендуем согласовать политику
          с юристом с учётом вашей организационно-правовой формы (ИП, ООО, самозанятый)
          и фактической инфраструктуры хранения данных.
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
