import jwt from "jsonwebtoken";
import { navigateTo } from "nuxt/app";

const JWT_SECRET = useRuntimeConfig().jwtSecret;

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");

  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: "Token gerekli" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    event.context.auth = {
      id: decoded.userId, // veya decoded.id - token içindeki field'a göre
      ...decoded
    };
  } catch (error: any) {
    throw createError({ statusCode: 401, statusMessage: "Geçersiz token" });
  }
});
