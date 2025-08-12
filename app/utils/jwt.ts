import { SignJWT,jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret');

export type TokenPayload = {
    sub: string;
    wedding_code: string; 
}

export async function signToken(payload: TokenPayload, expiresIn= '7d') {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
}

