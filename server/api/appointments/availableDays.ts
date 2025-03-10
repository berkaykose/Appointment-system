import { defineEventHandler } from "h3";
import { Appointment } from "~/server/models/appointment.model";

export default defineEventHandler(async () => {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  // Gelecek 1 ayın tüm günlerini oluştur
  const days = [];
  for (let d = new Date(today); d <= nextMonth; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d).toISOString().split("T")[0]); // YYYY-MM-DD formatında sakla
  }

  // **TÜM REZERVASYONLARI GETİR**
  const bookedAppointments = await Appointment.find({
    date: { $gte: today, $lte: nextMonth },
  });

  // **SADECE FULL DOLU GÜNLERİ BUL**
  const bookedDays = bookedAppointments.map((appt) =>
    appt.date.toISOString().split("T")[0]
  );

  // **TÜM GÜNÜ DEĞİL, SADECE FULL DOLU OLANLARI ÇIKART**
  const availableDays = days.filter(
    (day) => bookedDays.filter((d) => d === day).length < 9 // 7 saat dolmadıysa göster
  );

  return { success: true, availableDays };
});
