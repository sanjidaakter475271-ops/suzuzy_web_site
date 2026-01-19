import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getRoleLevel } from './roles'

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
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

    const { data: { user } } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    console.log('Middleware Path:', url.pathname, 'User:', !!user)

    // Protected routes logic
    const isProtectedRoute =
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/dealer') ||
        url.pathname.startsWith('/admin') ||
        url.pathname.startsWith('/super-admin')

    const isAuthRoute =
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/register')

    if (!user && isProtectedRoute) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Role-based redirection for logged in users on auth pages or root
    if (user && (isAuthRoute || url.pathname === '/')) {
        // Fetch user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (profile) {
            const userRole = profile.role || 'customer';
            const level = getRoleLevel(userRole);
            console.log('Middleware Session Detection:', { id: user.id, role: userRole, level });

            // If user is a Customer (level 99), they shouldn't be auto-redirected TO a dashboard
            // Instead, if they are on root, send them to unauthorized which handles the switch experience
            if (level > 12) {
                if (url.pathname === '/') {
                    url.pathname = '/unauthorized';
                    return NextResponse.redirect(url);
                }
                // If they are on an auth route (login/register) and they are just a customer,
                // let them see the page so they can sign in with a different account.
                return supabaseResponse;
            }

            // Redirect valid portal users (Admin/Dealer) to their respective dashboards
            if (level === 1) {
                url.pathname = '/super-admin/dashboard';
            } else if (level <= 5) {
                url.pathname = '/admin/dashboard';
            } else if (level <= 12) {
                url.pathname = '/dealer/dashboard';
            }

            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse
}
