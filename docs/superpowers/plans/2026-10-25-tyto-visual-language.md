# Tyto: визуальный язык, тексты и ИИ через прокси — план реализации (план 1б)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tyto перестаёт выглядеть как Vibe. В нём своя система кнопок, первый запуск с идущей совой, новый экспорт, 12 визуальных отличий и единый голос в текстах. Ещё ИИ можно подключить через прокси-сервис. Итог — релиз 0.1.2.

**Architecture:** Всё по дизайн-документу. Токены и правила лежат в `desktop/src/lib/tyto/theme.css`, новые куски разметки — в `desktop/src/lib/tyto/*.tsx`. В upstream-файлах Vibe меняем по 1–3 строки подключения, кроме `transcript-export-dialog.tsx`, который переписываем. Тексты меняем в `i18n/desktop/ru-RU.json` (+ en-US для новых ключей).

**Tech Stack:** React + TS + Tailwind (shadcn-компоненты в `components/ui`), paraglide i18n, vitest + Testing Library, mock-tauri для браузерного режима и скриншотов (как в `restyle-report.md`).

**Spec:** `docs/design/2026-10-25-tyto-visual-language.md`. Все точные значения (радиусы, отступы, шкала шрифта, тексты old→new, раскладки) берутся оттуда, в этом плане они не повторяются. Макеты: `G:/bitrix-projects/transcribe-desktop/.superpowers/brainstorm/1669-1792912113/content/tyto-visual-language-v2.html`. Предыдущий план, базовые решения и ledger: `docs/superpowers/plans/2026-10-25-tyto-fork-and-release.md`.

## Как возобновить работу

Статус ведётся в таблице ниже и в ledger `.superpowers/sdd/2026-10-25-tyto-visual-language/progress.md`. После каждой принятой задачи: отметить `[x]`, вписать коммит, закоммитить план, `git push origin plan-1`. Возобновление: первая строка таблицы со статусом не «готово» → `git status`, `git log -5`. Подтверждения Дениса от 2026-10-25 действуют и для этого плана: push в plan-1 и fast-forward main, запуск сборок, релиз 0.1.2 как обычный (не prerelease) после его «ок» по скриншотам.

| Task | Статус | Коммит |
|---|---|---|
| 1. Основа: токены, кнопки, тосты | готово | 112827a |
| 2. Тексты | готово | 51f8513, 6d6cd47 |
| 3. Первый запуск + идущая сова | готово | d4e8708 |
| 4. Экспорт v2 | готово | 3bbf0d1, a0c1a7f, 4b4aa6d |
| 5. Главный экран: пустой экран, вкладки, расшифровка-сценарий, метки говорящих | готово | 99c00ef, 38295df |
| 6. Боковая панель и плеер | готово | 91796e7, 23fd493 |
| 7. Настройки строками | готово | 1a1443d, 32be4cf |
| 8. ИИ через прокси-сервис | готово | 9fbf167, 5931995 |
| 9. Язык расшифровки по умолчанию | готово | 8e77111, a8af210 |
| 10. Скриншоты, приёмка, релиз 0.1.2 | готово: приняты 26.10, верхняя сова убрана (9a8e4db), v0.1.2 выпущен (latest) | |

## Global Constraints

- Стиль «строгий минимализм» и токены из `desktop/src/lib/tyto/theme.css` (предыдущий рестайл) сохраняются. Новые значения берутся из дизайн-документа. Сетка 4 px, шкала отступов 2/4/8/12/16/24/32/48.
- Обе темы. Контраст текста ≥ 4.5:1 везде, в том числе у выбранных и неактивных элементов.
- Раскладку Vibe меняем только там, где это сказано в документе. Новая разметка лежит в `lib/tyto/*`.
- Тексты: «расшифровка / расшифровать / сводка», без эмодзи, без «!», без длинных тире, «ё» не обязательна.
- Логика и пропсы upstream-компонентов не меняются, если задача прямо не говорит обратного. Upstream-тесты не ослаблять.
- Анимации трогают только `transform`/`opacity`. При `prefers-reduced-motion: reduce` всё неподвижно.
- Ключ API Дениса из переписки не использовать и нигде не сохранять.

## Review Focus

1. **Выбранные элементы в тёмной теме** (карточки экспорта, вкладки, строка истории): текст читается, контраст ≥ 4.5:1. Это тот же класс бага, что «нечитаемые карточки» в макете. → тест в Task 1 (контраст выбранных токенов) и Task 4.
2. **Экспорт SRT/VTT** с выключенной галочкой «Время каждой реплики»: субтитры всё равно получают время. Галочка заблокирована и отмечена. → тест в Task 4.
3. **Первый запуск без интернета или при отмене:** сова стоит, кнопка «Повторить» работает, отмена ведёт туда же, куда раньше (поведение Task 4 плана 1 не ломается). → тесты в Task 3.
4. **Прокси-адрес с завершающим `/` или с `/v1/`:** формат определяется верно, URL запроса не получает двойной слэш. → тест в Task 8.
5. **Длинные имена записей и говорящих** в боковой панели, метке говорящего и имени файла в подвале экспорта: обрезаются многоточием, вёрстка не ломается. → тесты в Task 4 и 6.

---

### Task 1: Основа — токены, кнопки, тосты (отличия 1, 2, 3, 4, 12 + система кнопок)

**Files:** Modify `desktop/src/lib/tyto/theme.css`, `desktop/src/components/ui/button.tsx`, `desktop/src/components/ui/sonner.tsx`, `desktop/src/lib/tyto/owl-mark.tsx` (моргание); Test `desktop/src/lib/tyto/theme.test.ts`, `desktop/src/lib/tyto/button.test.tsx`.

**Interfaces — Produces:**
- CSS-токены `--tyto-r-xs/sm/md/lg`, `--tyto-bar-h: 56px`, шкала шрифта, класс `.tyto-eyebrow`;
- варианты `Button`: `variant: 'primary' | 'secondary' | 'ghost' | 'destructive'`, `size: 'sm' | 'md'`, `iconOnly?: boolean`, при этом upstream-имена вариантов маппятся на новые, чтобы вызовы Vibe не ломались;
- тост внизу по центру основной области, над плеером (отступ = `--tyto-bar-h` + 12 px).

- [x] Падающие тесты:
  - `theme.test.ts`: значения радиусов, `--tyto-bar-h`, eyebrow без `text-transform: uppercase`, stroke-width иконок 1.5, контраст «выбранный текст / выбранный фон» ≥ 4.5:1 в обеих темах;
  - `button.test.tsx`: каждый вариант рендерит свой класс; `disabled` не полупрозрачный (явный серый фон); у `iconOnly` обязателен `aria-label`;
  - upstream-имена вариантов (взять из текущего `button.tsx`) рендерятся без ошибок.
- [x] Реализация по разделам «Токены», «Система кнопок» и отличиям 1–4, 12 дизайн-документа.
- [x] `pnpm test`, `pnpm build`, коммит.

### Task 2: Тексты

**Files:** Modify `i18n/desktop/ru-RU.json` (+ `en-US.json` только для новых ключей); Test `desktop/src/lib/tyto/copy.test.ts`.

- [x] Падающий тест `copy.test.ts`:
  - для каждой строки таблицы «Тексты» дизайн-документа значение ru-RU по ключу равно новому тексту (таблица переносится в тест как массив `[key, expected]`);
  - ни одно ru-значение не содержит эмодзи (`/\p{Extended_Pictographic}/u`), «!» и « — »;
  - слова «транскрипц», «саммари», «суммариз» не встречаются.
- [x] Обновить JSON. Где новый текст не помещается в старый ключ из-за падежа (например, `exportTranscript` в самом файле экспорта), завести новый ключ, как предупреждал дизайнер, и использовать его только в UI.
- [x] `pnpm i18n:generate`, `pnpm test`, коммит.

### Task 3: Первый запуск + идущая сова

**Files:** Create `desktop/src/lib/tyto/owl-walk.tsx`, `desktop/src/lib/tyto/setup-steps.tsx`, `desktop/src/lib/tyto/download-eta.ts`; Modify `desktop/src/pages/setup/page.tsx` (подключение), `desktop/src/pages/setup/view-model.ts` (состояния `step: 'speech' | 'speakers'`, `bytes: [current,total]`); Test `desktop/src/lib/tyto/setup.test.tsx`, `download-eta.test.ts`.

**Interfaces — Produces:**
- `estimateEta(samples: Array<{t: number; bytes: number}>, total: number): number | null` возвращает секунды или `null`, пока прошло меньше 3 с;
- `<OwlWalk walking: boolean />`.

- [x] Падающие тесты:
  - `download-eta`: `null` до 3 с; равномерная скорость 10 МБ/с при остатке 600 МБ даёт 60 ± 1 с; при скачке скорости сглаживание за окно 2–3 с;
  - `setup.test.tsx`:
    - во время загрузки виден шаг 1 с «X из Y ГБ» (формат «1,0 из 1,6 ГБ»), шаг 2 «Следующим»;
    - после перехода на модель говорящих активен шаг 2;
    - при выключенных говорящих шага 2 нет;
    - без сети видны текст «Нет подключения к интернету», «Повторить» и «Указать файл вручную»;
    - `OwlWalk` получает `walking=false` на ошибке;
    - при `prefers-reduced-motion` у совы нет анимации (класс/стиль);
  - существующие тесты `diarize-default.test.tsx` (отмена, сброс прогресса) зелёные без правок.
- [x] Реализация:
  - `OwlWalk` — inline SVG по форме `design/tyto/owl-walk-right.svg`, код свой. Цвет `currentColor`. Сова ходит туда-обратно по полосе высотой ~56 px, у края разворачивается через `scaleX(-1)`.
  - Раскладка экрана и тексты — по разделу «Первый запуск».
- [x] `pnpm test`, `pnpm build`, коммит.

### Task 4: Экспорт v2

**Files:** Modify `desktop/src/pages/main/components/transcript-export-dialog.tsx` (переписываем разметку, логика и пропсы те же), при необходимости `desktop/src/pages/main/hooks/use-transcript-export.ts` (только скрыть CSV в списке); Create `desktop/src/lib/tyto/export-format-grid.tsx`; Test `desktop/src/lib/tyto/export-dialog.test.tsx`.

- [x] Падающие тесты:
  - нет пункта CSV;
  - две группы по 4 радио в порядке из документа;
  - карточки «Расшифровку / Сводку» с описаниями. При отсутствии сводки карточка disabled с текстом «Сначала создайте сводку»;
  - при выборе SRT или VTT галочка «Время каждой реплики» отмечена и disabled, в экспорт уходит `showTimestamps: true`;
  - «Тёмная тема документа» видна только для PDF, HTML и DOCX;
  - главная кнопка «Сохранить PDF» меняет подпись по формату;
  - в подвале имя файла `«<название>.pdf»`, длинное имя обрезается (класс `truncate`, есть `title`);
  - выбранная карточка в тёмной теме: контраст текста ≥ 4.5:1 (проверить вычисленные токены).
- [x] Реализация по разделу «Диалог экспорта» (v2): сетка `1fr 1fr`, строки по 32 px, оформление четырьмя галочками, предпросмотр в виде листа.
- [x] `pnpm test`, `pnpm build`, коммит.

### Task 5: Главный экран — отличия 9, 10, 6, 7

**Files:** Modify `desktop/src/pages/main/components/idle-hero.tsx`, `transcript-toolbar.tsx`, `transcript-view.tsx`, `speaker-label.tsx` (минимальные правки подключения); Create `desktop/src/lib/tyto/script-line.tsx`, `desktop/src/lib/tyto/speaker-mark.tsx`, `desktop/src/lib/tyto/group-replicas.ts`; Test `desktop/src/lib/tyto/main-screen.test.tsx`, `group-replicas.test.ts`.

**Interfaces — Produces:** `groupReplicas(segments: Segment[]): Array<{ speaker: number | null; segments: Segment[] }>`: подряд идущие сегменты одного говорящего объединяются в серию.

- [x] Падающие тесты:
  - `groupReplicas`: [1,1,2,1] → три серии; `null`-говорящие (без диаризации) дают одну серию;
  - имя говорящего выводится один раз на серию;
  - время на поле слева, при наведении это кнопка с `aria-label` «Воспроизвести с 01:32», клик вызывает переход плеера;
  - метка говорящего — квадрат с первой буквой: залитая для 1-го, контурная для 2-го, серая для 3-го, дальше повтор с цифрой;
  - вкладки «Текст / Сводка / Темы»: «Темы» видна и неактивна (заглушка под план 3);
  - пустой экран:
    - три подписанные кнопки «Выбрать файл / Записать / По ссылке»;
    - строка «Файлы не покидают компьютер»;
    - drop работает на всей правой области, тест вызывает обработчик upstream.
- [x] Реализация по отличиям 6, 7, 9, 10. Существующие функции (правка текста по клику, поиск, подсветка текущей фразы) должны продолжать работать: их upstream-тесты зелёные.
- [x] `pnpm test`, `pnpm build`, коммит.

### Task 6: Боковая панель и плеер — отличия 5, 8

**Files:** Modify `desktop/src/pages/main/components/recents-sidebar.tsx`, `player-bar.tsx` (подключение); Create `desktop/src/lib/tyto/recents-groups.ts`, `desktop/src/lib/tyto/replica-timeline.tsx`; Test `desktop/src/lib/tyto/sidebar-player.test.tsx`, `recents-groups.test.ts`.

- [x] Падающие тесты:
  - `recents-groups`: записи раскладываются на «Сегодня / Вчера / На этой неделе / Раньше» относительно заданного `now`, граница суток по локальному времени;
  - под названием мета «10:02 · 48 мин»;
  - выбранная запись помечена чертой слева (класс), а не плашкой;
  - идущая расшифровка показывает мини-полосу прогресса;
  - длинное название обрезается;
  - поиск фильтрует по названию;
  - плеер: шкала из отрезков реплик, клик по отрезку перематывает к его началу;
  - нижняя полоса панели и плеер используют `--tyto-bar-h` (оба элемента получают один класс или стиль).
- [x] Реализация по отличиям 5 и 8.
- [x] `pnpm test`, `pnpm build`, коммит.

### Task 7: Настройки строками — отличие 11

**Files:** Modify `desktop/src/pages/settings/page.tsx` (группы меню), `desktop/src/pages/settings/sections/shared.tsx` (строки вместо карточек); Test `desktop/src/lib/tyto/settings-layout.test.tsx`.

- [x] Падающие тесты:
  - меню сгруппировано «Расшифровка / Запись и голос / Дополнительно», пункты без иконок;
  - разделы рендерят строки без обёртки-карточки;
  - скрытые флагами разделы (телефон) по-прежнему скрыты, то есть `features.test.tsx` зелёный.
- [x] Реализация, `pnpm test`, `pnpm build`, коммит.

### Task 8: ИИ через прокси-сервис

**Files:** Modify `desktop/src/lib/ai/config.ts` (платформа `'proxy'`, поля `proxyBaseUrl`, `proxyApiKey`, `proxyFormat: 'openai' | 'claude'`, `claudeBaseUrl` с умолчанием `https://api.anthropic.com`, миграция старых настроек без потерь), `desktop/src/lib/ai/client.ts` (Claude по `claudeBaseUrl`; прокси переиспользует клиенты OpenAI и Claude с подменой адреса и ключа), `desktop/src/pages/settings/sections/ai.tsx` (поля); Create `desktop/src/lib/tyto/proxy-format.ts`; Test `desktop/src/lib/tyto/proxy.test.ts`.

**Interfaces — Produces:** `detectProxyFormat(baseUrl: string): 'openai' | 'claude'`, `joinApiUrl(base: string, path: string): string`.

- [x] Падающие тесты:
  - `detectProxyFormat('https://x.top/v1')`, `('https://x.top/v1/')` дают `'openai'`; `('https://x.top')`, `('https://x.top/')` дают `'claude'`;
  - `joinApiUrl` без двойных слэшей: для формата Claude итоговый адрес `https://x.top/v1/messages`, для OpenAI `https://x.top/v1/chat/completions`;
  - клиент Claude берёт `claudeBaseUrl`; пустое значение даёт официальный адрес;
  - платформа `proxy` с форматом `claude` шлёт заголовки Claude (`x-api-key`, `anthropic-version`), с форматом `openai` — `Authorization: Bearer`;
  - миграция старого конфига без новых полей проходит без ошибок, умолчания проставлены;
  - «Проверить подключение» для `proxy` вызывает клиент выбранного формата (мок fetch).
- [x] UI: пункт «Через прокси-сервис», поля «Адрес API», «Ключ», «Модель», переключатель «Формат: OpenAI / Claude» (выставляется автоматически при вводе адреса, можно сменить), подсказка из документа. У платформы Claude — поле «Адрес API».
- [x] `pnpm test`, `pnpm build`, коммит.

### Task 9: Язык расшифровки по умолчанию

**Files:** найти, где задаётся язык по умолчанию на пустом экране (grep `language` в `providers/preference.tsx` и `idle-hero.tsx`); Test `desktop/src/lib/tyto/default-language.test.tsx`.

- [x] Падающий тест: на чистой установке язык расшифровки — «автоопределение». Сохранённый выбор пользователя переживает перезапуск.
- [x] Реализация: умолчание `auto`, или как значение называется в Vibe.
- [x] `pnpm test`, коммит.

### Task 10: Скриншоты, приёмка, релиз 0.1.2

- [ ] Скриншоты в mock-режиме, обе темы: первый запуск (идёт загрузка, нет сети), пустой экран, главный экран с расшифровкой, экспорт (PDF и SRT), настройки «Общие» и «ИИ-ассистент» (прокси). Сохранить в `.superpowers/sdd/2026-10-25-tyto-visual-language/shots/`.
- [ ] Дополнительно проверить отступы по шкале навыком `impeccable` (layout/craft) на скриншотах. Найденное исправить или записать в ledger.
- [ ] Показать Денису скриншоты, получить «ок».
- [ ] Версия `0.1.2` в `tauri.tyto.conf.json` и `branding.test.ts`. Затем push plan-1, fast-forward main, запуск `tyto-release.yml`. Релиз сделать обычным (не prerelease), проверить `latest.json`.
- [ ] Обновить vault (карточка проекта, backlog) и `history.md`.
