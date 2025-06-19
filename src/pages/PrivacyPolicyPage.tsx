import React from 'react';
import { FileText, Shield, Lock, ChevronRight, Mail, Phone } from 'lucide-react';

interface PrivacyPolicyPageProps {
  isDarkMode?: boolean;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ isDarkMode }) => {
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
      style={{ backgroundImage: isDarkMode ? 'none' : "url('https://югославия-гриль.рф/static/img/bg.png')" }}
    >
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden mb-12`}>
          <div className={`p-8 ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-orange-100'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-orange-100 mb-4">
                <Shield className="w-10 h-10 text-orange-600" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-bold mb-2">Политика конфиденциальности</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-lg`}>
                Ваша конфиденциальность важна для нас. Ознакомьтесь с нашей политикой обработки персональных данных.
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="prose prose-orange max-w-none">
              <section className="mb-10">
                <div className="flex items-start mb-6">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'} mr-4`}>
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">1. Общие положения</h2>
                    <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>
                        Настоящая политика конфиденциальности (далее — Политика) определяет порядок обработки и защиты
                        персональных данных физических лиц (далее — Пользователи), пользующихся сервисами, информацией, услугами
                        сети ресторанов "Югославия Гриль" (далее — Компания).
                      </p>
                      <p>
                        Политика применяется в отношении всей информации, которую Компания может получить о Пользователе во время
                        использования им сайта, мобильного приложения, программ лояльности и других сервисов Компании.
                      </p>
                      <p>
                        Использование сервисов Компании означает безоговорочное согласие Пользователя с настоящей Политикой и
                        указанными в ней условиями обработки его персональных данных.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <div className="flex items-start mb-6">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'} mr-4`}>
                    <Lock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">2. Обрабатываемые данные и цели их обработки</h2>
                    <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>Компания собирает и обрабатывает следующие персональные данные:</p>
                      <ul className="space-y-2 pl-5">
                        {['Имя, фамилия, отчество', 'Номер телефона', 'Адрес электронной почты', 'Адрес доставки', 'История заказов и платежей', 'Информация об используемом устройстве (тип устройства, операционная система, IP-адрес)'].map((item, index) => (
                          <li key={index} className="flex">
                            <ChevronRight className="w-4 h-4 text-orange-500 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p>Персональные данные обрабатываются в следующих целях:</p>
                      <ul className="space-y-2 pl-5">
                        {['Идентификация Пользователя', 'Предоставление Пользователю персонализированных сервисов', 'Связь с Пользователем, в том числе направление уведомлений, запросов и информации', 'Улучшение качества сервисов, удобства их использования', 'Проведение статистических и иных исследований на основе обезличенных данных'].map((item, index) => (
                          <li key={index} className="flex">
                            <ChevronRight className="w-4 h-4 text-orange-500 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <div className="flex items-start mb-6">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'} mr-4`}>
                    <Shield className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">3. Обработка и хранение данных</h2>
                    <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>
                        Обработка персональных данных Пользователя осуществляется без ограничения срока, любым законным способом,
                        в том числе в информационных системах персональных данных с использованием средств автоматизации или без
                        использования таких средств.
                      </p>
                      <p>
                        Компания принимает необходимые организационные и технические меры для защиты персональной информации
                        Пользователя от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования,
                        распространения, а также от иных неправомерных действий третьих лиц.
                      </p>
                      <p>
                        Компания хранит персональные данные Пользователей в соответствии с внутренними регламентами конкретных
                        сервисов и законодательством РФ.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <div className="flex items-start mb-6">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'} mr-4`}>
                    <Lock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">4. Передача данных третьим лицам</h2>
                    <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>
                        Компания вправе передать персональные данные Пользователя третьим лицам в следующих случаях:
                      </p>
                      <ul className="space-y-2 pl-5">
                        {['Пользователь выразил свое согласие на такие действия', 'Передача необходима для использования Пользователем определенного сервиса', 'Передача предусмотрена российским или иным применимым законодательством', 'В случае продажи компании или её активов'].map((item, index) => (
                          <li key={index} className="flex">
                            <ChevronRight className="w-4 h-4 text-orange-500 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <div className="flex items-start mb-6">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'} mr-4`}>
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">5. Права пользователя</h2>
                    <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>Пользователь вправе:</p>
                      <ul className="space-y-2 pl-5">
                        {['Получать информацию, касающуюся обработки его персональных данных', 'Требовать уточнения, блокирования или уничтожения своих персональных данных', 'Отозвать свое согласие на обработку персональных данных', 'Требовать устранения неправомерных действий Компании', 'Обжаловать действия или бездействие Компании'].map((item, index) => (
                          <li key={index} className="flex">
                            <ChevronRight className="w-4 h-4 text-orange-500 mt-1 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <div className="flex items-start mb-6">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'} mr-4`}>
                    <Shield className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">6. Использование файлов cookie</h2>
                    <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>
                        Компания использует файлы cookie и аналогичные технологии для улучшения работы сервисов, повышения
                        удобства и эффективности работы с ними, а также для аналитики.
                      </p>
                      <p>
                        Файлы cookie — это небольшие текстовые файлы, которые размещаются на устройстве Пользователя для хранения
                        информации о его предпочтениях.
                      </p>
                      <p>
                        Пользователь может отключить сохранение файлов cookie в настройках браузера. При этом некоторые функции
                        сервисов могут стать недоступными.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start mb-6">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'} mr-4`}>
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">7. Заключительные положения</h2>
                    <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>
                        Компания вправе вносить изменения в настоящую Политику конфиденциальности без согласия Пользователя. Новая
                        редакция Политики вступает в силу с момента ее размещения на сайте Компании, если иное не предусмотрено
                        новой редакцией Политики.
                      </p>
                      <p>
                        Действующая редакция Политики конфиденциальности доступна в сети Интернет по адресу:{' '}
                        <a href="/privacy-policy" className={`font-medium ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-500'} underline transition-colors`}>
                          https://югославия-гриль.рф/privacy-policy
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Contact Section */}
          <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'} border-t ${isDarkMode ? 'border-gray-600' : 'border-orange-100'}`}>
            <h3 className="text-lg font-semibold mb-4">Контакты для связи</h3>
            <div className="space-y-3">
              <a 
                href="mailto:info@yugoslavia-grill.ru" 
                className={`flex items-center ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-500'} transition-colors`}
              >
                <Mail className="w-5 h-5 mr-2" />
                info@yugoslavia-grill.ru
              </a>
              <a 
                href="tel:+79370000307" 
                className={`flex items-center ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-500'} transition-colors`}
              >
                <Phone className="w-5 h-5 mr-2" />
                +7 (937) 000-03-07
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'} text-sm text-center`}>
            <p>Последнее обновление: 10 июня 2025 года</p>
            <p className="mt-1">© 2025 Югославия Гриль. Все права защищены.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;