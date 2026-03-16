import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
    // Check for Supabase auth tokens in cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Look for access token in cookies (Supabase stores auth in cookies)
    const allCookies = request.cookies.getAll()
    const authCookie = allCookies.find(c =>
        c.name.includes('auth-token') ||
        c.name.includes('sb-') && c.name.includes('-auth-token')
    )

    if (!authCookie?.value) {
        // No auth cookie found — redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Try to parse the token and verify basic structure
    try {
        let accessToken = authCookie.value

        // Supabase SSR stores tokens as JSON in some setups
        try {
            const parsed = JSON.parse(authCookie.value)
            if (parsed.access_token) accessToken = parsed.access_token
        } catch {
            // Not JSON, use raw value
        }

        // Verify the token with Supabase
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data: { user }, error } = await supabase.auth.getUser(accessToken)

        if (error || !user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        return NextResponse.next()
    } catch {
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    matcher: ['/admin/:path*'],
}
