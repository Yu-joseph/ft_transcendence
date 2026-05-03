import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv'; 

type AuthTokenPayload = JwtPayload & {
  user_id?: string | number;
};
///vault/game/apiss.env
///vault/secrets/database.env
dotenv.config({ path: '/vault/game/apiss.env' });

const JWT_SECRET = process.env.SECRET_KEY ;

export async function getUserIdFromToken(token: string): Promise<string | null> {
  if (!JWT_SECRET) {
    console.error("Missing JWT secret. Set SECRET_KEY or DJANGO_SECRET_KEY.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as string | AuthTokenPayload;

    if (typeof decoded === "string") return null;
    if (decoded.user_id === undefined || decoded.user_id === null) return null;

    return String(decoded.user_id);
  } catch {
    return null;
  }
}