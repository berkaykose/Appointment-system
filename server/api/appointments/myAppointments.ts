import { defineEventHandler, getQuery, createError } from "h3";
import authMiddleware from "~/server/middlewares/auth.middleware";
import { Appointment } from "~/server/models/appointment.model";

export default defineEventHandler(async (event) => {
  await authMiddleware(event); // 📌 Yetkilendirme middleware'ini çağır

  const userId = event.context.auth?.id;
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Giriş yapmalısınız!" });
  }

  // **Query Parametrelerini Al**
  const query = getQuery(event);
  const pageSize = 10; // **Her sayfa için 10 kayıt**
  const lastSeenDate = query.lastSeenDate || null; // **En son görülen randevunun tarihi**

  // **Eğer `lastSeenDate` varsa, bu tarihten daha yeni olanları getir**
  let filter = { user: userId };
  if (lastSeenDate) {
    filter = { ...filter, date: { $gt: new Date(lastSeenDate) } };
  }

  try {
    const appointments = await Appointment.find(filter)
      .sort({ date: 1 }) // 📌 En eski randevudan başlayarak sırala
      .limit(pageSize); // 📌 10 kayıt al

    // **Son kaydın tarihini al**
    const nextLastSeenDate = appointments.length > 0 ? appointments[appointments.length - 1].date : null;

    return {
      success: true,
      appointments,
      nextLastSeenDate, // 📌 Frontend bu değeri kullanarak sonraki sayfayı yükleyecek
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "Randevular getirilirken bir hata oluştu",
    });
  }
});
