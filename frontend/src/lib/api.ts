const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ApiOptions {
    method?: string
    body?: any
    token?: string
    headers?: Record<string, string>
}

class ApiError extends Error {
    status: number
    constructor(message: string, status: number) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

async function request<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, token, headers = {} } = options

    const fetchHeaders: Record<string, string> = {
        ...headers,
    }

    if (token) {
        fetchHeaders['Authorization'] = `Bearer ${token}`
    }

    if (body && !(body instanceof FormData)) {
        fetchHeaders['Content-Type'] = 'application/json'
    }

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: fetchHeaders,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }))
        throw new ApiError(errorData.message || res.statusText, res.status)
    }

    return res.json()
}

export const api = {
    get: <T = any>(path: string, token?: string) => request<T>(path, { token }),
    post: <T = any>(path: string, body: any, token?: string) => request<T>(path, { method: 'POST', body, token }),
    patch: <T = any>(path: string, body: any, token?: string) => request<T>(path, { method: 'PATCH', body, token }),
    delete: <T = any>(path: string, token?: string) => request<T>(path, { method: 'DELETE', token }),
    upload: <T = any>(path: string, formData: FormData, token?: string) => request<T>(path, { method: 'POST', body: formData, token }),
}
