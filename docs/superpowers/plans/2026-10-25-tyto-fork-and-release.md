# Tyto: форк, ребрендинг и релизы — план реализации (1 из 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Форк Vibe 3.2.2 под именем Tyto. Говорящие включены по умолчанию, телефон скрыт, ссылки и тексты наши. Неподписанные установщики для Windows x64 и mac universal собираются в GitHub Actions и автообновляются из нашего репо.

**Architecture:** Форкаем `thewh1teagle/vibe` в `des-e/tyto`. Чужие файлы трогаем минимально: все переопределения Tauri лежат в отдельном `desktop/src-tauri/tauri.tyto.conf.json`, который передаётся через `--config` (JSON merge patch). Наш CI — отдельный workflow `tyto-release.yml`, upstream-workflow не меняем. Правки фронтенда точечные и закрыты тестами vitest.

**Tech Stack:** Tauri v2, React + TypeScript + Vite, vitest, paraglide (i18n), pnpm, Rust (сайдкар `vibe-server` из релизов Vibe, версия в `.server-version`), GitHub Actions + `tauri-apps/tauri-action@v0`.

**Spec:** `docs/superpowers/specs/2026-10-25-tyto-design.md`

Следующие планы: (2) сервер — коды доступа Tyto и эндпоинт тем в summarize-api; (3) темы в клиенте. Их пишем после этого плана: план 3 опирается на структуру форка.

## Как возобновить работу (план выполняется в несколько сессий)

- **Источник правды о статусе — этот файл в репо `G:/bitrix-projects/tyto/`** (до Task 0 — в `transcribe-desktop`). После каждой принятой задачи координатор отмечает `[x]` у её шагов и у задачи в таблице ниже, коммитит план вместе с кодом задачи и пушит. Задача без коммита считается невыполненной.
- **Для возобновления в новой сессии:** прочитать этот план и `history.md` → найти первую строку таблицы со статусом не «готово» → `git status` и `git log -5`. Если есть незакоммиченные изменения от прерванной задачи, по `git diff` решить: доделать или откатить (`git stash`). Затем продолжать с этой задачи.
- **Ручные шаги Дениса** (Task 1, установки в Task 7) отмечаются в таблице как «ждёт Дениса». Остальные задачи они не блокируют, если в задаче не сказано иное.
- Подтверждения Дениса, полученные 2026-10-25: создание публичного форка `des-e/tyto`, задание секретов, запуск сборок. В новой сессии повторно спрашивать не нужно.

| Task | Статус | Коммит |
|---|---|---|
| 0. Форк и рабочее место | готово | см. git log «Tyto: спека, план, история» |
| 1. Проверка качества (Денис) | ждёт Дениса | |
| 2. Конфиг Tauri | готово | af68a25 |
| 3. Ссылки, тексты, иконка | не начата | |
| 4. Говорящие по умолчанию | не начата | |
| 5. Скрыть телефон | не начата | |
| 6. Workflow релиза | не начата | |
| 7. Установка, README, приёмка | не начата | |

## Global Constraints

- Имя продукта: `Tyto`. Bundle id: `ru.eliseevdenis.tyto` *(моё решение)*. Deep-link схема: `tyto`.
- Версия первого релиза: `0.1.0`. Версию Vibe в upstream-файлах не трогаем.
- Репо `des-e/tyto` публичное. Лицензия MIT Vibe сохраняется, в «О программе» и в README обязательна строка «Основано на Vibe».
- Подписи кода нет. mac: ad-hoc (`signingIdentity: "-"`), Windows без подписи. Обновления подписываются своим ключом Tauri.
- Сборки только Windows x64 (NSIS) и mac universal (dmg). Linux не собираем.
- Аналитику Aptabase не включаем: секреты `APTABASE_*` в наш workflow не передаются.
- Говорящие по умолчанию включены. Модель по умолчанию Large V3 Turbo (как в Vibe).
- Запись с телефона в v1 скрыта из интерфейса, код остаётся.
- Изменения изолированы: правка upstream-файла допустима только там, где это указано в задаче.
- Тексты для пользователя на русском (ru-RU) и английском (en-US). Остальные локали получают замену «Vibe» → «Tyto» автоматически.
- Внешние действия (создание репо, секреты, запуск workflow) Денис подтвердил 2026-10-25. Любые другие внешние действия (удаление, смена видимости репо, публикация релиза не как prerelease, кроме Task 7 Step 5) требуют отдельного подтверждения.

## Review Focus

1. **Первый запуск без интернета или с упавшей загрузкой модели диаризации.** Основная модель работает, говорящие тихо выключаются с понятным уведомлением, и программа не застревает на экране настройки. → тест в Task 4.
2. **Пользователь выключил говорящих и перезапустил программу.** Сохранённое `false` остаётся `false`, умолчание `true` действует только на чистой установке. → тест в Task 4.
3. **Tyto никогда не обновляется до Vibe.** Merge patch заменяет массив `endpoints` целиком, адрес `thewh1teagle` не остаётся. → тест в Task 2.
4. **mac на Intel.** Все Mach-O в сайдкарах universal (`lipo -info` показывает `x86_64 arm64`). → проверка в Task 6.
5. **Vibe и Tyto стоят на одной машине.** Свой identifier означает отдельные настройки и проекты; своя deep-link схема, без конфликта `vibe://`. → тест в Task 2.

---

### Task 0: Форк и рабочее место

**Files:**
- Create: `G:/bitrix-projects/tyto/` (клон форка)
- Move: `G:/bitrix-projects/transcribe-desktop/docs/superpowers/**` → `G:/bitrix-projects/tyto/docs/superpowers/`
- Create: `G:/bitrix-projects/tyto/history.md`, `G:/bitrix-projects/tyto/TASK.md`

Tyto — самостоятельный проект, поэтому папка верхнего уровня `G:/bitrix-projects/tyto/` *(моё решение)*. Папка `transcribe-desktop` остаётся архивом июльского плана.

- [x] **Step 1: Подтвердить с Денисом** создание публичного форка `des-e/tyto` (подтверждено 2026-10-25).
- [x] **Step 2: Форкнуть и клонировать**

Run: `gh repo fork thewh1teagle/vibe --fork-name tyto --clone=false; git clone https://github.com/des-e/tyto.git G:/bitrix-projects/tyto; cd G:/bitrix-projects/tyto; git remote add upstream https://github.com/thewh1teagle/vibe.git; git fetch upstream --tags; git checkout -B main v3.2.2`
Expected: `git log -1` показывает `23eae78 Bump version to 3.2.2`. Если upstream main ушёл дальше 3.2.2, в Step 5 пушить через `git push --force-with-lease -u origin main`: база форка — стабильный релиз, а не голова upstream.

- [x] **Step 3: Перенести спеку и планы** (план переезжает вместе с таблицей статуса; дальше статус ведётся только в копии в `tyto/`, в `transcribe-desktop` оставить заметку «перенесено в G:/bitrix-projects/tyto»), создать `history.md` (первая запись: форк от v3.2.2, почему) и `TASK.md` (ссылки на 3 плана, статус). Обновить `Projects/transcribe-desktop.md` в vault: папка → `G:/bitrix-projects/tyto/`, репо → `github.com/des-e/tyto`.
- [x] **Step 4: Поставить зависимости и прогнать базовые тесты** (24 файла / 116 тестов зелёные на Windows)

Run: `corepack enable; cd desktop; pnpm install; pnpm i18n:generate; pnpm test`
Expected: все тесты upstream зелёные. Если какие-то падают на Windows, записать их список в `history.md` как известные и дальше не считать регрессией.

- [x] **Step 5: Commit + push**

```bash
git add docs history.md TASK.md
git commit -m "Tyto: спека, план, история"
git push -u origin main
```

---

### Task 1: Проверка качества распознавания (ручная, Денис, параллельно остальным)

Не блокирует задачи 2–7.

- [ ] **Step 1:** Денис прогоняет в Vibe 3.2.2 рабочий созвон длиной не меньше часа: 3+ участника, английские термины, «Разделение по говорящим» включено, модель Large V3 Turbo.
- [ ] **Step 2:** Оценить по 5-балльной шкале: (а) верно ли разделены говорящие, (б) есть ли пунктуация и заглавные буквы, (в) как распознаны термины. Записать в `history.md`.
- [ ] **Step 3:** Если (а) или (б) хуже 3, завести отдельную задачу в `TASK.md` («диаризация: sherpa-onnx» и/или «пунктуация: initial prompt Whisper / ИИ-причёсывание»). Решение по ней принимается отдельно.

---

### Task 2: Конфиг Tauri для Tyto

**Files:**
- Create: `desktop/src-tauri/tauri.tyto.conf.json`
- Create: `desktop/src/lib/tyto/branding.test.ts`
- Modify: `desktop/src/mock-tauri/handlers/plugins.ts:427` (identifier в моке)

**Interfaces:**
- Produces: файл `tauri.tyto.conf.json`, который Task 6 передаёт как `--config src-tauri/tauri.tyto.conf.json`. Локальный запуск: `pnpm tauri dev --config src-tauri/tauri.tyto.conf.json`.

- [x] **Step 1: Сгенерировать ключ обновлений**

Run: `pnpm tauri signer generate -w $HOME/.tauri/tyto.key` (с паролем)
Expected: создан ключ, напечатан public key. Приватный ключ и пароль сохранить в менеджер паролей Дениса. В репо ключ не кладём.

- [x] **Step 2: Написать падающий тест** `branding.test.ts`: читает и мержит `tauri.conf.json` + `tauri.tyto.conf.json` по RFC 7396 (маленький helper `mergePatch(target, patch)` прямо в тесте), затем проверяет:

```ts
expect(merged.productName).toBe('Tyto')
expect(merged.version).toBe('0.1.0')
expect(merged.identifier).toBe('ru.eliseevdenis.tyto')
expect(merged.plugins.updater.endpoints).toEqual(['https://github.com/des-e/tyto/releases/latest/download/latest.json'])
expect(JSON.stringify(merged.plugins.updater)).not.toContain('thewh1teagle')
expect(merged.plugins.updater.pubkey).not.toBe(upstream.plugins.updater.pubkey)
expect(merged.plugins['deep-link'].desktop.schemes).toEqual(['tyto'])
expect(merged.bundle.targets).toEqual(['nsis', 'dmg', 'app'])
expect(merged.bundle.macOS.signingIdentity).toBe('-')
```

- [x] **Step 3: Запустить и убедиться, что падает**

Run: `pnpm vitest run src/lib/tyto/branding.test.ts`
Expected: FAIL (файла `tauri.tyto.conf.json` нет).

- [x] **Step 4: Создать `tauri.tyto.conf.json`** с полями из теста (pubkey из Step 1) и `bundle.macOS.dmg.background`, который указывает на `../../design/tyto/dmg_background.png`, если фон Vibe содержит его бренд (посмотреть `design/dmg_background.png`; если бренда нет, поле не трогать). В моке `plugins.ts:427` поменять identifier на `ru.eliseevdenis.tyto`.
- [x] **Step 5: Тест зелёный** — Run как в Step 3, Expected: PASS.
- [x] **Step 6: Commit** — `git commit -m "Tyto: конфиг Tauri (имя, id, обновления, ad-hoc подпись)"`

---

### Task 3: Ссылки, тексты, иконка

**Files:**
- Modify: `desktop/src/lib/config.ts:1-12` (URL-константы)
- Modify: `desktop/src/lib/app.ts:86` (ссылка на новый issue)
- Modify: `desktop/src/pages/settings/sections/general.tsx:~110-125` (кнопки «Помощь и сообщество»)
- Modify: `i18n/desktop/*.json` (замена «Vibe» → «Tyto»), добавить ключ `basedOnVibe` в `ru-RU.json` и `en-US.json`
- Create: `scripts/tyto/rebrand-i18n.mjs`
- Create: `design/tyto/icon.svg`; перегенерировать `desktop/src-tauri/icons/*`
- Modify: `desktop/src/components/brand-glyph.tsx` (глиф в интерфейсе → сова)
- Create: `PRIVACY.md`
- Test: `desktop/src/lib/tyto/rebrand.test.ts`

**Interfaces:**
- Produces: `config.repoURL = 'https://github.com/des-e/tyto'`, `config.upstreamURL = 'https://github.com/thewh1teagle/vibe'` (новая константа), используется в «О программе».

- [ ] **Step 1: Падающий тест** `rebrand.test.ts`:

```ts
// URL-константы
for (const key of ['aboutURL','repoURL','changelogURL','privacyPolicyURL'])
  expect(String(typeof config[key] === 'function' ? config[key]() : config[key])).toContain('des-e/tyto')
expect(config).not.toHaveProperty('discordURL')
expect(config).not.toHaveProperty('supportVibeURL')
expect(config.upstreamURL).toBe('https://github.com/thewh1teagle/vibe')
// ссылка на issue
expect(app.issueUrl(/* аргументы как в upstream */)).toMatch(/^https:\/\/github\.com\/des-e\/tyto\/issues\/new\?/)
// тексты: ни одно значение ru-RU / en-US не содержит «Vibe», кроме basedOnVibe
for (const loc of ['ru-RU','en-US']) {
  const msgs = readJson(`i18n/desktop/${loc}.json`)
  for (const [k, v] of Object.entries(msgs)) if (k !== 'basedOnVibe') expect(v).not.toMatch(/\bVibe\b/)
  expect(msgs.basedOnVibe).toMatch(/Vibe/)
}
```

Название функции в `app.ts:86` взять из upstream; тест вызывает именно её.

- [ ] **Step 2: Запустить, увидеть FAIL** — `pnpm vitest run src/lib/tyto/rebrand.test.ts`
- [ ] **Step 3: URL-константы.**
  - `aboutURL` → `https://github.com/des-e/tyto#readme`;
  - `repoURL` → `https://github.com/des-e/tyto`;
  - `changelogURL(v)` → `https://github.com/des-e/tyto/releases` (с `/tag/v${v}`, если версия передана);
  - `privacyPolicyURL` → `https://github.com/des-e/tyto/blob/main/PRIVACY.md`;
  - удалить `discordURL` и `supportVibeURL`, добавить `upstreamURL`;
  - `modelsDocURL` и URL моделей не трогать: модели качаем с тех же адресов, что и Vibe.

  В `app.ts:86` поменять репо на `des-e/tyto`. В `general.tsx` убрать кнопки Discord и «Поддержать Vibe». Оставить «О Tyto» и «Сообщить о проблеме», добавить строку `m.basedOnVibe()` со ссылкой на `upstreamURL`.
- [ ] **Step 4: Скрипт `rebrand-i18n.mjs`**: во всех `i18n/desktop/*.json` заменяет в значениях `\bVibe\b` → `Tyto`. Ключи и плейсхолдеры не трогает. Строки про поддержку автора удаляются вместе с кнопкой: ключ остаётся неиспользуемым, это безопасно для слияний. Добавляет `basedOnVibe`:
  - ru: `Основано на Vibe (MIT) — спасибо автору`;
  - en: `Based on Vibe (MIT) — thanks to its author`.

  Скрипт идемпотентный, запуск: `node scripts/tyto/rebrand-i18n.mjs`. После каждого слияния с upstream скрипт запускается заново.
- [ ] **Step 5: Иконка.** `design/tyto/icon.svg`: стилизованная морда сипухи (сердцевидный лицевой диск, два тёмных глаза), фон тёмно-синий `#1e3a8a`, морда светлая `#f5efe6`, без текста. Сгенерировать PNG 1024 и затем `pnpm tauri icon design/tyto/icon-1024.png`. `brand-glyph.tsx` рендерит ту же сову (inline SVG).
- [ ] **Step 6: `PRIVACY.md`** на русском, 5–8 предложений:
  - расшифровка всегда идёт на компьютере;
  - текст уходит наружу только для тем и сводки: провайдеру по своему ключу или на сервер Tyto по коду доступа;
  - сервер не хранит тексты дольше обработки запроса;
  - аналитики нет.
- [ ] **Step 7: Тест зелёный + полный прогон** — `pnpm i18n:generate; pnpm test; pnpm build` → всё PASS, `tsc` без ошибок.
- [ ] **Step 8: Commit** — `git commit -m "Tyto: ссылки, тексты, иконка, PRIVACY"`

---

### Task 4: Говорящие по умолчанию

**Files:**
- Modify: `desktop/src/providers/preference.tsx:254` (умолчание `false` → `true`)
- Modify: `desktop/src/pages/setup/view-model.ts` (после основной модели скачать модель диаризации)
- Modify: `desktop/src/pages/main/hooks/use-transcribe-queue.ts:~149-152` (защита от отсутствующей модели)
- Test: `desktop/src/lib/tyto/diarize-default.test.tsx`

**Interfaces:**
- Consumes: `config.diarizeModelFilename`, `config.diarizeModelUrl`, `config.diarizeModelIntegrity` (`lib/config.ts:59-61`), `utils.downloadModel`, `utils.isModelFileUsable`, `preference.setDiarizeEnabled`.
- Produces: `ensureDiarizeModelOnSetup(): Promise<boolean>` в `setup/view-model.ts`. Возвращает `false` при ошибке и тогда вызывает `setDiarizeEnabled(false)` и `toast.warning(m.diarizeDownloadFailed())`. Новый ключ i18n ru/en.

- [ ] **Step 1: Падающие тесты** (моки как в соседних upstream-тестах, через `mock-tauri`):

```ts
test('чистая установка: diarizeEnabled = true')
  // пустой store → usePreference().diarizeEnabled === true
test('сохранённое false переживает перезапуск')
  // store {'transcription.recognizeSpeakers': false} → diarizeEnabled === false
test('setup: после основной модели качается модель диаризации')
  // downloadModel вызван дважды, второй раз с config.diarizeModelUrl
test('setup: падение загрузки диаризации не ломает настройку')
  // второй downloadModel reject → setDiarizeEnabled(false), toast.warning вызван, переход на главный экран состоялся
test('очередь: diarize включён, но файла модели нет → транскрибация без diarize_model и toast')
  // isModelFileUsable(diarizePath) = false → в параметрах нет diarize_model, setDiarizeEnabled(false)
```

- [ ] **Step 2: Запустить, увидеть 5 FAIL** — `pnpm vitest run src/lib/tyto/diarize-default.test.tsx`
- [ ] **Step 3: Реализация.**
  - Умолчание `true` в `preference.tsx:254`.
  - `ensureDiarizeModelOnSetup` вызывается в `downloadModel()` после успешной загрузки основной модели. Прогресс идёт через тот же `download_progress`, отдельного экрана нет.
  - В `use-transcribe-queue.ts` перед формированием параметров проверить `isModelFileUsable` для модели диаризации; при отсутствии файла выключить говорящих и показать toast `m.diarizeModelMissing()`. Новый ключ: ru `Модель для разделения по говорящим не найдена — включите их снова в настройках`.
- [ ] **Step 4: Тесты зелёные + полный прогон** — `pnpm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "Tyto: говорящие по умолчанию, модель качается при первом запуске"`

---

### Task 5: Скрыть запись с телефона

**Files:**
- Create: `desktop/src/lib/tyto/features.ts` — `export const FEATURES = { phone: false } as const`
- Modify: `desktop/src/pages/settings/page.tsx:77` (пункт `phone` в списке разделов — только если `FEATURES.phone`)
- Modify: `desktop/src/pages/main/components/recents-sidebar.tsx:~495-505` (кнопка телефона — только если `FEATURES.phone`)
- Modify: `desktop/src/pages/settings/sections/recording.tsx`, `desktop/src/components/audio-device-input.tsx` — если там есть вход в телефонную функцию, скрыть его тем же флагом
- Test: `desktop/src/lib/tyto/features.test.tsx`

- [ ] **Step 1: Падающие тесты:**
  - `'настройки: нет раздела «Телефон»'` — рендер `SettingsPage`, `queryByText(m.phone())` даёт `null`;
  - `'боковая панель: нет кнопки телефона'` — `queryByLabelText(m.phone())` даёт `null`.
- [ ] **Step 2: FAIL** — `pnpm vitest run src/lib/tyto/features.test.tsx`
- [ ] **Step 3: Обернуть точки входа** в `FEATURES.phone`. Компонент `PhoneSection` и Rust-часть handoff не удалять. Upstream-тест `phone.test.tsx` рендерит секцию напрямую и должен остаться зелёным.
- [ ] **Step 4: PASS + полный прогон** — `pnpm test`
- [ ] **Step 5: Commit** — `git commit -m "Tyto: скрыть запись с телефона в v1"`

---

### Task 6: Workflow релиза

**Files:**
- Create: `.github/workflows/tyto-release.yml`
- Create: `scripts/tyto/make-universal-sidecars.sh`

**Interfaces:**
- Consumes: `tauri.tyto.conf.json` (Task 2), `chore setup <triple>` из upstream `chorefile`.
- Produces: GitHub Release `v0.1.0` с `Tyto_0.1.0_x64-setup.exe`, `Tyto_0.1.0_universal.dmg`, `latest.json`, `.sig`-файлами и аттестациями провенанса.

- [ ] **Step 1: Скрипт `make-universal-sidecars.sh <bin_dir>`.**
  - Для `vibe-server` и `ffmpeg` склеивает `-aarch64-apple-darwin` и `-x86_64-apple-darwin` через `lipo -create` в `-universal-apple-darwin`.
  - Если архив сайдкара содержит ещё dylib, склеивает каждый Mach-O с одинаковым именем.
  - В конце для каждого результата `lipo -info` и `exit 1`, если в выводе нет обеих архитектур `x86_64` и `arm64`.
- [ ] **Step 2: `tyto-release.yml`** по образцу upstream `release.yml`. Запуск: `workflow_dispatch`. Права: `contents: write`, `id-token: write`, `attestations: write`. Матрица:
  - `windows-latest`: `--target x86_64-pc-windows-msvc`, `chore setup x86_64-pc-windows-msvc`;
  - `macos-latest`: rust targets `aarch64-apple-darwin,x86_64-apple-darwin`, `chore setup` для обоих triple, затем `bash scripts/tyto/make-universal-sidecars.sh desktop/src-tauri/binaries`, `--target universal-apple-darwin`.

  Общее:
  - `args: <target> --config src-tauri/tauri.tyto.conf.json`;
  - env только `GITHUB_TOKEN`, `TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}`. Никаких APTABASE, APPLE_*, SIGN_*;
  - шаг проверки release notes upstream не копируем;
  - `tagName: v__VERSION__`, `releaseName: Tyto v__VERSION__`, `prerelease: true`;
  - `releaseBody`: `Установка: https://github.com/des-e/tyto/blob/main/docs/install.md — программа не подписана, при первом запуске нужно разрешить её открыть.`;
  - после сборки `actions/attest-build-provenance@v2` с `subject-path` на `desktop/src-tauri/target/**/bundle/**/*.{exe,dmg}`.
- [ ] **Step 3: Задать секреты и запустить (подтверждено Денисом 2026-10-25)**

Run: `gh secret set TAURI_PRIVATE_KEY -R des-e/tyto < $HOME/.tauri/tyto.key; gh secret set TAURI_KEY_PASSWORD -R des-e/tyto; gh workflow run tyto-release.yml -R des-e/tyto; gh run watch -R des-e/tyto`
Expected: обе джобы зелёные. В шаге `make-universal-sidecars` для каждого файла напечатано `x86_64 arm64`. В релизе `v0.1.0` лежат exe, dmg, latest.json и .sig.

- [ ] **Step 4: Если universal не собирается** (Tauri не находит сайдкары или lipo падает на файле, который не склеить): переключить mac на две отдельные сборки, `aarch64` и `x86_64`, как в upstream, и записать причину в `history.md`. Это допустимый запасной вариант, он не требует нового согласования, но в `docs/install.md` тогда объясняется, какой файл качать.
- [ ] **Step 5: Commit** — `git commit -m "Tyto: workflow релиза (Win x64, mac universal, без подписи)"` + push.

---

### Task 7: Инструкция по установке, README и приёмка

**Files:**
- Create: `docs/install.md`, `docs/install/*.png`
- Modify: `README.md` — сверху русский блок про Tyto: что это, ссылка на установку, «Основано на Vibe (MIT)». Остальной README upstream оставить ниже, под заголовком «Upstream: Vibe».

- [ ] **Step 1: Установить `v0.1.0` на Windows (Денис)** и снять скриншоты: SmartScreen → «Подробнее» → «Выполнить в любом случае».
- [ ] **Step 2: Установить на mac (Денис, на своём маке)** и снять скриншоты: первое открытие → предупреждение → «Системные настройки → Конфиденциальность и безопасность → Всё равно открыть» → пароль.
- [ ] **Step 3: Написать `docs/install.md`** простым языком, без слова «терминал»: два раздела, Windows и mac, по 3–5 шагов со скриншотами. Отдельно указать, что предупреждение появляется только один раз.
- [ ] **Step 4: Приёмка на обеих системах** (чек-лист в `history.md`, по каждому пункту да/нет):
  - [ ] установка без терминала;
  - [ ] в заголовке окна и в «О программе» Tyto, есть строка «Основано на Vibe»;
  - [ ] при первом запуске качаются основная модель и модель диаризации;
  - [ ] короткая запись расшифрована, реплики подписаны «Говорящий N»;
  - [ ] нет раздела и кнопки «Телефон»;
  - [ ] нет Discord и «Поддержать Vibe»;
  - [ ] на одной машине с Vibe обе программы работают, проекты не смешиваются (если Vibe установлен).
- [ ] **Step 5: Проверка автообновления.** Поднять версию в `tauri.tyto.conf.json` до `0.1.1`, выпустить релиз, снять с него `prerelease` (иначе `latest/download` его не отдаёт). Открыть установленную 0.1.0 и убедиться, что она предлагает обновиться до 0.1.1 и обновляется.
- [ ] **Step 6: Commit + push, обновить vault** (карточка проекта: «Реализовано: форк, ребрендинг, релиз 0.1.x»; `Tasks/backlog.md`).

---

## Вне этого плана

- Сервер: коды Tyto (отдельно от ключей v0.20, лимит около 200 тыс. токенов, остаток, 429) и `POST /tyto/topics` — **план 2**.
- Темы (панель слева, цветная шкала, автозапуск, хранение в проекте, экспорт, «Наш сервис» в ИИ-ассистенте, предупреждение о приватности) — **план 3**.
- Заявка в SignPath — после того как v0.1 поживёт у пользователей.
