/**
 * Proxy services (resellers of model tokens) give one address in two forms: `https://<service>/v1`
 * for the OpenAI format and the same address without `/v1` for the Claude (Anthropic) format.
 * So the address alone tells which request format the person pasted.
 */
export type ProxyFormat = 'openai' | 'claude'

export function detectProxyFormat(baseUrl: string): ProxyFormat {
	return /\/v1\/*$/i.test(baseUrl.trim()) ? 'openai' : 'claude'
}

/** `base` + `path` with exactly one slash between them, whatever either side ends or starts with. */
export function joinApiUrl(base: string, path: string): string {
	return `${base.trim().replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}
