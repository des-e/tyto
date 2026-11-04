<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/des-e/tyto-app/main/design/tyto/logo/lockup-horizontal-dark.png" />
    <img src="https://raw.githubusercontent.com/des-e/tyto-app/main/design/tyto/logo/lockup-horizontal-light.png" alt="Tyto" width="420" />
  </picture>
</p>

<p align="center">
  Записывает и расшифровывает звонки прямо на вашем компьютере.<br />
  Windows и macOS.
</p>

<p align="center">
  <a href="https://github.com/des-e/tyto/releases/latest"><b>Скачать Tyto</b></a>
  &nbsp;·&nbsp;
  <a href="#установка">Установка</a>
  &nbsp;·&nbsp;
  <a href="https://t.me/tytoapp">Канал в Telegram</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/des-e/tyto-app/main/design/screens/readme/transcript-dark.png" />
    <img src="https://raw.githubusercontent.com/des-e/tyto-app/main/design/screens/readme/transcript-light.png" alt="Расшифровка в Tyto: саммари, текст по говорящим и темы" width="900" />
  </picture>
</p>

## Что умеет

- **Записывает звонки:** ваш микрофон и звук собеседников, а по желанию и видео с экрана: окно звонка или весь экран.
- **Сам замечает звонок** в Яндекс Телемосте, Битрикс24, Zoom, Google Meet, Microsoft Teams и в браузере и предлагает записать.
- **Расшифровывает на вашем компьютере** аудио и видео через Whisper. Запись никуда не отправляется, интернет не нужен.
- **Разделяет текст по говорящим.** Участников можно переименовать, имя сменится во всем тексте.
- **Плеер:** клик по реплике переводит к этому месту записи, видео открывается в отдельном окне.
- **Tyto ИИ:** саммари, темы с переходом по времени и ИИ-разбор: о чем говорили, кто что делает и к какому сроку. Работает по коду из [Telegram-бота](https://t.me/Tytotranscribe_bot), первые 2 часа бесплатно. Можно подключить и свой ключ или Ollama.
- **Словарь:** имена, компании и термины, которые Tyto будет писать правильно.
- **Экспорт** в PDF, Word, TXT, Markdown, HTML, SRT, VTT и JSON.
- **Диктовка** в любое приложение по сочетанию клавиш.
- **Обновляется сама.**

<p align="center">
  <img src="https://raw.githubusercontent.com/des-e/tyto-app/main/design/screens/readme/main-light.png" alt="Главное окно Tyto: записать звонок или расшифровать файл" width="900" />
</p>

## Установка

Скачайте программу со страницы [последней версии](https://github.com/des-e/tyto/releases/latest): для Windows файл `Tyto_…_x64-setup.exe`, для мака `Tyto_…_universal.dmg` (один для Intel и Apple Silicon).

Tyto пока не подписана платным сертификатом, поэтому при первом запуске система покажет предупреждение. Это нужно пройти один раз.

### Windows

1. Запустите `Tyto_…_x64-setup.exe`.
2. Windows покажет окно «Windows защитила ваш компьютер». Нажмите «Подробнее», затем «Выполнить в любом случае».
3. Если установщик пишет «Tyto is running! Click OK to kill it», значит Tyto уже открыта. Нажмите OK, установка продолжится.
4. Откройте Tyto. При первом запуске она скачает модели распознавания речи и говорящих. Нужен интернет, это займет несколько минут.

### Mac

Нужна macOS 12 Monterey или новее, запись видео с экрана работает с macOS 13.

1. Откройте `.dmg` и перетащите Tyto в папку «Программы».

   <img src="https://raw.githubusercontent.com/des-e/tyto-app/main/docs/install/mac-1-dmg.png" alt="Окно dmg: перетащите Tyto в «Программы»" width="520" />

2. Откройте Tyto. Mac покажет «Файл "Tyto" не был открыт». Нажмите «Готово», не «Переместить в Корзину».

   <img src="https://raw.githubusercontent.com/des-e/tyto-app/main/docs/install/mac-3-warning.png" alt="Предупреждение «Файл "Tyto" не был открыт»" width="300" />

3. Откройте «Системные настройки» → «Конфиденциальность и безопасность», прокрутите до раздела «Безопасность» и нажмите «Все равно открыть» у строки про Tyto.

   <img src="https://raw.githubusercontent.com/des-e/tyto-app/main/docs/install/mac-4-settings.png" alt="Конфиденциальность и безопасность: «Все равно открыть»" width="520" />

4. Откройте Tyto еще раз и подтвердите «Все равно открыть» паролем или Touch ID.
5. При первом запуске Tyto скачает модели. Нужен интернет, это займет несколько минут.

**Запись экрана на маке.** Когда вы первый раз включите «Записывать экран», Tyto попросит разрешение. В «Системных настройках» → «Конфиденциальность и безопасность» → «Запись экрана и системного звука» включите Tyto и перезапустите ее. Если после обновления запись снова просит разрешение, выключите и снова включите Tyto в этом списке.

### Обновления

Когда выходит новая версия, Tyto сама предложит обновиться: откроется окно со списком изменений. Обновление ставится в один клик.

## Приватность

Расшифровка всегда идет на вашем компьютере, звук и видео никуда не отправляются. Текст уходит наружу, только если вы делаете саммари, темы или ИИ-разбор через сервис. Подробнее в [PRIVACY.md](PRIVACY.md).

## Поддержать

- [Boosty](https://boosty.to/tytoapp): уровни с часами Tyto ИИ
- [Канал Tyto в Telegram](https://t.me/tytoapp): новости и обновления
- Ошибки и пожелания: [Issues](https://github.com/des-e/tyto/issues)

## Исходный код и лицензия

Код Tyto: [des-e/tyto-app](https://github.com/des-e/tyto-app). Настольная часть построена на открытом проекте [Vibe](https://github.com/thewh1teagle/vibe) от thewh1teagle, лицензия MIT, спасибо автору. Текст лицензии в файле [LICENSE](LICENSE).
