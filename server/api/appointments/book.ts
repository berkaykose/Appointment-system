import { defineEventHandler, readBody, createError } from "h3";
import mongoose from "mongoose";
import authMiddleware from "~/server/middlewares/auth.middleware";
import { Appointment } from "~/server/models/appointment.model";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);

  const userId = event.context.auth?.id;
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Giriş yapmalısınız!",
    });
  }

  const body = await readBody(event);
  const { date, time } = body;
  if (!date || !time) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tarih ve saat gerekli!",
    });
  }

  const appointmentDate = new Date(`${date}T${time}`);

  try {
    // Önce bu saatte randevu var mı kontrol et
    const existingAppointment = await Appointment.findOne({
      date: appointmentDate
    });

    if (existingAppointment) {
      throw createError({
        statusCode: 409,
        statusMessage: "Bu randevu saati dolu!",
      });
    }

    // Yeni randevu oluştur
    const appointment = await Appointment.create({
      user: userId,
      date: appointmentDate
    });

    return {
      success: true,
      message: "Randevu başarıyla alındı",
      appointment,
    };
  } catch (error: any) {
    console.error("❌ Randevu alma hatası:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Randevu alınırken bir hata oluştu",
    });
  }
});
