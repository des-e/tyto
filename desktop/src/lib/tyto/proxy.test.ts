import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_AI, migrateLegacy, normalizeAi, type AiConnection } from '~/lib/ai/config'
import { createClient, testConnection } from '~/lib/ai/client'
import { detectProxyFormat, joinApiUrl } from './proxy-format'

const fetchMock = vi.fn()
vi.mock('@tauri-apps/plugin-http', () => ({ fetch: (...args: unknown[]) => fetchMock(...args) }))

afterEach(() => fetchMock.mockReset())

// Fake keys only: nothing here talks to a real service.
const FAKE_KEY = 'test-key-not-real'

function proxy(patch: Partial<AiConnection>): AiConnection {
	return { ...DEFAULT_AI.connection, platform: 'proxy', proxyApiKey: FAKE_KEY, model: 'some-model', ...patch }
}

const claudeReply = { ok: true, json: async () => ({ content: [{ text: 'OK' }] }) }
const openaiReply = { ok: true, json: async () => ({ choices: [{ message: { content: 'OK' } }] }) }

describe('detectProxyFormat', () => {
	it('адрес с /v1 на конце: формат OpenAI', () => {
		expect(detectProxyFormat('https://x.top/v1')).toBe('openai')
		expect(detectProxyFormat('https://x.top/v1/')).toBe('openai')
		expect(detectProxyFormat('  https://x.top/v1  ')).toBe('openai')
	})

	it('адрес без /v1: формат Claude', () => {
		expect(detectProxyFormat('https://x.top')).toBe('claude')
		expect(detectProxyFormat('https://x.top/')).toBe('claude')
		expect(detectProxyFormat('')).toBe('claude')
	})
})

describe('joinApiUrl', () => {
	it('склеивает без двойных слэшей', () => {
		expect(joinApiUrl('https://x.top', '/v1/messages')).toBe('https://x.top/v1/messages')
		expect(joinApiUrl('https://x.top/', '/v1/messages')).toBe('https://x.top/v1/messages')
		expect(joinApiUrl('https://x.top/v1/', 'chat/completions')).toBe('https://x.top/v1/chat/completions')
		expect(joinApiUrl('https://x.top/v1', '/chat/completions')).toBe('https://x.top/v1/chat/completions')
	})
})

describe('Claude: адрес API', () => {
	it('берёт claudeBaseUrl', async () => {
		fetchMock.mockResolvedValue(claudeReply)
		await createClient({ ...DEFAULT_AI.connection, platform: 'claude', claudeBaseUrl: 'https://x.top/' }).ask('p')
		expect(fetchMock.mock.calls[0][0]).toBe('https://x.top/v1/messages')
	})

	it('пустой адрес даёт официальный', async () => {
		fetchMock.mockResolvedValue(claudeReply)
		await createClient({ ...DEFAULT_AI.connection, platform: 'claude', claudeBaseUrl: '' }).ask('p')
		expect(fetchMock.mock.calls[0][0]).toBe('https://api.anthropic.com/v1/messages')
	})

	it('по умолчанию официальный адрес', () => {
		expect(DEFAULT_AI.connection.claudeBaseUrl).toBe('https://api.anthropic.com')
	})

	it('адрес, уже оканчивающийся на /v1, не удваивает /v1', async () => {
		fetchMock.mockResolvedValue(claudeReply)
		await createClient({ ...DEFAULT_AI.connection, platform: 'claude', claudeBaseUrl: 'https://x.top/v1' }).ask('p')
		expect(fetchMock.mock.calls[0][0]).toBe('https://x.top/v1/messages')
	})
})

describe('платформа proxy', () => {
	it('формат claude: адрес /v1/messages и заголовки Claude', async () => {
		fetchMock.mockResolvedValue(claudeReply)
		const reply = await createClient(proxy({ proxyBaseUrl: 'https://x.top', proxyFormat: 'claude' })).ask('p')
		expect(reply).toBe('OK')
		const [url, init] = fetchMock.mock.calls[0]
		expect(url).toBe('https://x.top/v1/messages')
		const headers = Object.fromEntries(Object.entries(init.headers as Record<string, string>).map(([k, v]) => [k.toLowerCase(), v]))
		expect(headers['x-api-key']).toBe(FAKE_KEY)
		expect(headers['anthropic-version']).toBeTruthy()
		expect(headers.authorization).toBeUndefined()
		expect(JSON.parse(init.body)).toMatchObject({ model: 'some-model' })
	})

	it('формат openai: адрес /chat/completions и Authorization: Bearer', async () => {
		fetchMock.mockResolvedValue(openaiReply)
		const reply = await createClient(proxy({ proxyBaseUrl: 'https://x.top/v1', proxyFormat: 'openai' })).ask('p')
		expect(reply).toBe('OK')
		const [url, init] = fetchMock.mock.calls[0]
		expect(url).toBe('https://x.top/v1/chat/completions')
		expect(init.headers.Authorization).toBe(`Bearer ${FAKE_KEY}`)
		expect(init.headers['X-API-Key']).toBeUndefined()
	})

	it('ключи и адреса других платформ не используются', async () => {
		fetchMock.mockResolvedValue(openaiReply)
		await createClient(
			proxy({ proxyBaseUrl: 'https://x.top/v1', proxyFormat: 'openai', openaiBaseUrl: 'https://other/v1', openaiApiKey: 'other-key' }),
		).ask('p')
		expect(fetchMock.mock.calls[0][0]).toBe('https://x.top/v1/chat/completions')
		expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${FAKE_KEY}`)
	})

	it('без адреса не идёт в сеть, а сообщает об ошибке', async () => {
		const result = await testConnection(proxy({ proxyBaseUrl: '  ', proxyFormat: 'openai' }))
		expect(result.ok).toBe(false)
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('«Проверить подключение» для proxy', () => {
	it('вызывает клиент Claude при формате claude', async () => {
		fetchMock.mockResolvedValue(claudeReply)
		const result = await testConnection(proxy({ proxyBaseUrl: 'https://x.top', proxyFormat: 'claude' }))
		expect(result).toMatchObject({ ok: true, reply: 'OK' })
		expect(fetchMock.mock.calls[0][0]).toBe('https://x.top/v1/messages')
	})

	it('вызывает клиент OpenAI при формате openai', async () => {
		fetchMock.mockResolvedValue(openaiReply)
		const result = await testConnection(proxy({ proxyBaseUrl: 'https://x.top/v1', proxyFormat: 'openai' }))
		expect(result).toMatchObject({ ok: true, reply: 'OK' })
		expect(fetchMock.mock.calls[0][0]).toBe('https://x.top/v1/chat/completions')
	})

	it('показывает ошибку сервиса', async () => {
		fetchMock.mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized', text: async () => '{"error":{"message":"bad key"}}' })
		const result = await testConnection(proxy({ proxyBaseUrl: 'https://x.top', proxyFormat: 'claude' }))
		expect(result).toMatchObject({ ok: false, error: 'Claude: 401 Unauthorized · bad key' })
	})
})

describe('миграция настроек', () => {
	it('старый конфиг 3.2 без новых полей получает умолчания и ничего не теряет', () => {
		const stored = {
			connection: {
				platform: 'openai',
				model: 'my-model',
				contextTokens: 8192,
				claudeApiKey: 'old-claude-key',
				ollamaBaseUrl: 'http://box:11434',
				openaiBaseUrl: 'https://my/v1',
				openaiApiKey: 'old-openai-key',
			},
			tasks: DEFAULT_AI.tasks,
		}
		const ai = normalizeAi(stored as never)
		expect(ai.connection).toEqual({
			...DEFAULT_AI.connection,
			...stored.connection,
		})
		expect(ai.connection.claudeBaseUrl).toBe('https://api.anthropic.com')
		expect(ai.connection.proxyBaseUrl).toBe('')
		expect(ai.connection.proxyApiKey).toBe('')
		expect(['openai', 'claude']).toContain(ai.connection.proxyFormat)
		expect(ai.tasks).toEqual(DEFAULT_AI.tasks)
	})

	it('мусор и пустое значение дают умолчания', () => {
		expect(normalizeAi(null as never)).toEqual(DEFAULT_AI)
		expect(normalizeAi(undefined as never)).toEqual(DEFAULT_AI)
		expect(normalizeAi({} as never)).toEqual(DEFAULT_AI)
	})

	it('пустой адрес Claude возвращается к официальному', () => {
		const ai = normalizeAi({ ...DEFAULT_AI, connection: { ...DEFAULT_AI.connection, claudeBaseUrl: '' } })
		expect(ai.connection.claudeBaseUrl).toBe('https://api.anthropic.com')
	})

	it('формат прокси без сохранённого значения берётся по адресу', () => {
		const { proxyFormat: _drop, ...connection } = { ...DEFAULT_AI.connection, platform: 'proxy' as const, proxyBaseUrl: 'https://x.top/v1' }
		expect(normalizeAi({ ...DEFAULT_AI, connection } as never).connection.proxyFormat).toBe('openai')
	})

	it('migrateLegacy из pre-3.2 тоже проставляет новые поля', () => {
		const migrated = migrateLegacy({ platform: 'claude', claudeApiKey: 'old', prompt: '' })
		expect(migrated.connection).toMatchObject({ claudeApiKey: 'old', claudeBaseUrl: 'https://api.anthropic.com', proxyBaseUrl: '', proxyApiKey: '' })
	})

	it('сохранённая платформа proxy переживает нормализацию', () => {
		const ai = normalizeAi({ ...DEFAULT_AI, connection: proxy({ proxyBaseUrl: 'https://x.top', proxyFormat: 'claude' }) })
		expect(ai.connection).toMatchObject({ platform: 'proxy', proxyBaseUrl: 'https://x.top', proxyFormat: 'claude', proxyApiKey: FAKE_KEY })
	})
})
