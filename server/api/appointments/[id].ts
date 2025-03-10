import { defineEventHandler, createError } from "h3";
import authMiddleware from "~/server/middlewares/auth.middleware";
import { Appointment } from "~/server/models/appointment.model";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  
  const userId = event.context.auth?.id;
  const appointmentId = event.context.params.id;

  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: appointmentId,
      user: userId // Sadece kendi randevusunu iptal edebilir
    });

    if (!appointment) {
      throw createError({
        statusCode: 404,
        statusMessage: "Randevu bulunamadı",
      });
    }

    return {
      success: true,
      message: "Randevu başarıyla iptal edildi"
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Randevu iptal edilirken bir hata oluştu",
    });
  }
}); 