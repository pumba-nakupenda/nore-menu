import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Désactivation temporaire du filtrage pour debug production
    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}