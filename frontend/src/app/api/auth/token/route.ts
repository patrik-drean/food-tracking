import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function GET(req: NextRequest) {
  const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

  if (!NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const token = await getToken({
    req,
    secret: NEXTAUTH_SECRET,
  });

  if (!token || !token.sub || !token.email) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }

  // Create a simple JWT with just the user info
  // This will be verifiable by the backend using jose
  const secret = new TextEncoder().encode(NEXTAUTH_SECRET as string);

  const jwt = await new SignJWT({
    sub: token.sub,
    email: token.email,
    name: token.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  return NextResponse.json({ token: jwt });
}
