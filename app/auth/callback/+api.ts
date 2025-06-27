import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      // Redirect to app with success
      return Response.redirect(new URL(`${next}?verified=true`, request.url));
    }
  }

  // Redirect to app with error
  return Response.redirect(new URL(`/auth/error?message=verification_failed`, request.url));
}