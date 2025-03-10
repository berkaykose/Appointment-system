import { defineEventHandler, getQuery } from "h3";
import { Appointment } from "~/server/models/appointment.model";

export default defineEventHandler(async (event) => {
  const { date } = getQuery(event); // Kullanıcının seçtiği günü al

  if (!date) {
    throw createError({ statusCode: 400, statusMessage: "Gün seçmelisiniz!" });
  }

  const availableHours = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  // **Seçilen güne ait alınmış saatleri getir**
  const bookedAppointments = await Appointment.find({
    date: {
      $gte: new Date(`${date}T00:00:00Z`),
      $lt: new Date(`${date}T23:59:59Z`),
    },
  });

  // 📌 Saatleri kullanıcının zaman dilimine çevir
  const bookedHours = bookedAppointments.map((appt) => {
    const localTime = new Date(appt.date).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24 saat formatı
    });
    return localTime;
  });


  // **SADECE DOLU SAATLERİ ÇIKART**
  const freeHours = availableHours.filter((hour) => !bookedHours.includes(hour));


  return { success: true, availableHours: freeHours };
});
