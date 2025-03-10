import { loginUser } from "../../services/auth.service";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email ve şifre gerekli!",
    });
  }

  try {
    const { email, password } = body;
    const response = await loginUser(email, password);
    return { success: true, ...response };
  } catch (error: any) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: error.message })
    );
  }
});
