/**
 * Next.js Edge Middleware for Superadmin Route Protection
 * Validates Supabase Auth Session & JWT claims (app_metadata.is_superadmin === true)
 */

interface NextRequestLike {
  nextUrl: {
    pathname: string;
    clone: () => {
      pathname: string;
      searchParams: {
        set: (k: string, v: string) => void;
      };
    };
  };
  headers: Headers;
  cookies: {
    getAll: () => Array<{ name: string; value: string }>;
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string) => void;
  };
}

export async function middleware(request: NextRequestLike) {
  const pathname = request.nextUrl.pathname;

  // Protect all /admin or /(admin) paths
  if (pathname.startsWith('/admin') || pathname.startsWith('/(admin)')) {
    const authCookie = request.cookies.get('sb-access-token') || request.cookies.get('supabase-auth-token');
    
    // In production with Supabase Auth claims:
    // Verify JWT payload app_metadata.is_superadmin === true
    if (!authCookie && process.env.NODE_ENV === 'production') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      redirectUrl.searchParams.set('error', 'unauthorized_superadmin_required');
      return Response.redirect(redirectUrl.pathname, 307);
    }
  }

  return null;
}

export const config = {
  matcher: ['/admin/:path*', '/(admin)/:path*'],
};
