import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // refreshing the auth token
    const { data: { user } } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    console.log('Storefront Middleware Path:', url.pathname, 'User:', !!user)

    // Protected routes logic
    if (!user && (
        url.pathname.startsWith('/account')
    )) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect logged in users away from auth pages
    // Commented out to allow the login page to handle "Shadow Sessions" (user exists but no profile)
    /*
    if (user && (
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/register')
    )) {
        url.pathname = '/'
        return NextResponse.redirect(url)
    }
    */

    return supabaseResponse
}
