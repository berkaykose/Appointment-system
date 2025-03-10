<script setup>
definePageMeta({
  middleware: "auth",
});

const router = useRouter();
const user = ref(null);
const availableDays = ref([]);
const availableHours = ref([]);
const selectedDay = ref("");
const selectedHour = ref("");
const message = ref("");
const myAppointments = ref([]);
const lastSeenDate = ref(null);
const hasMoreAppointments = ref(true);
const showLoginAlert = ref(false);

const fetchAvailableDays = async () => {
  const response = await $fetch("/api/appointments/availableDays");
  availableDays.value = response.availableDays;
};

const fetchAvailableHours = async () => {
  if (!selectedDay.value) return;
  const response = await $fetch(
    `/api/appointments/availableHours?date=${selectedDay.value}`
  );
  availableHours.value = response.availableHours;
};

const bookAppointment = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    message.value = "Bu sayfayı görüntülemek için giriş yapın!";
    return;
  }

  // Tarihi UTC formatına çevir ve düzelt
  const selectedDate = new Date(selectedDay.value);
  selectedDate.setHours(12, 0, 0, 0);
  const formattedDate = selectedDate.toISOString().split("T")[0];

  try {
    const response = await $fetch("/api/appointments/book", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: { date: formattedDate, time: selectedHour.value },
    });

    message.value = response.message;

    selectedDay.value = "";
    selectedHour.value = "";

    fetchAvailableHours();
    fetchMyAppointments();
  } catch (error) {
    message.value = error.data.statusMessage;
  }
};

const logout = () => {
  localStorage.clear();
  router.push("/login");
};

const fetchMyAppointments = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }

  try {
    const response = await $fetch("/api/appointments/myAppointments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      query: { lastSeenDate: lastSeenDate.value },
    });

    if (response.appointments.length > 0) {
      myAppointments.value.push(...response.appointments); // 📌 Yeni randevuları listeye ekle
      lastSeenDate.value = response.nextLastSeenDate; // 📌 Son kaydın tarihini güncelle
    }

    hasMoreAppointments.value = response.appointments.length === 10;
  } catch (error) {
    console.error("Randevular getirilemedi:", error);
  }
};

const loadMoreAppointments = () => {
  if (hasMoreAppointments.value) {
    fetchMyAppointments();
  }
};

onMounted(async () => {
  try {
    await $fetch("/api/auth/check", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("🚨 401 - Yetkisiz erişim! Kullanıcı çıkış yapacak.");

      // 📌 LocalStorage'ı temizle
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 📌 Kullanıcıyı giriş sayfasına yönlendir
      router.push("/login");
    }
  }

  fetchAvailableDays();
  fetchMyAppointments();
  const userData = localStorage.getItem("user");
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    router.push("/login");
  }
});

const cancelAppointment = async (appointmentId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    message.value = "Bu işlemi yapmak için giriş yapmalısınız!";
    return;
  }

  try {
    await $fetch(`/api/appointments/${appointmentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchMyAppointments();
    fetchAvailableDays();
    message.value = "Randevu başarıyla iptal edildi";
  } catch (error) {
    message.value =
      error.data?.statusMessage || "Randevu iptal edilirken bir hata oluştu";
  }
};
</script>
<template>
  <div v-if="user && !showLoginAlert">
    <div class="flex justify-between items-center">
      <h1 class="">
        Kullanıcı: <span class="font-bold">{{ user?.name }}</span>
      </h1>
      <button
        type="button"
        @click="logout"
        class="bg-red-500 hover:bg-red-600 transition-all duration-200 text-red-50 rounded-lg py-1 px-4 cursor-pointer"
      >
        Çıkış
      </button>
    </div>
    <p class="mt-2 text-left">
      Buradan randevu alabilir veya almış olduğunuz randevuyu iptal
      edebilirsiniz.
    </p>
    <div class="mt-6">
      <form @submit.prevent="bookAppointment" class="space-y-4">
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700"
            >Tarih Seçin</label
          >
          <select
            id="date"
            v-model="selectedDay"
            @change="fetchAvailableHours"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1"
          >
            <option value="">Tarih</option>
            <option v-for="day in availableDays" :key="day" :value="day">
              {{ new Date(day).toLocaleDateString("tr-TR") }}
            </option>
          </select>
        </div>

        <div>
          <label for="time" class="block text-sm font-medium text-gray-700"
            >Saat Seçin</label
          >
          <select
            id="time"
            v-model="selectedHour"
            :disabled="!selectedDay"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1"
          >
            <option value="">Saat</option>
            <option v-for="hour in availableHours" :key="hour" :value="hour">
              {{ hour }}
            </option>
          </select>
        </div>

        <button
          type="submit"
          :disabled="!selectedDay || !selectedHour"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Randevu Al
        </button>
      </form>
    </div>
    <div class="mt-10">
      <div class="text-left">
        <h3 class="text-2xl font-bold mb-4">Randevularım</h3>
        <div v-if="myAppointments.length === 0" class="text-gray-500">
          Henüz bir randevunuz bulunmamaktadır.
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="appointment in myAppointments"
            :key="appointment._id"
            class="bg-white p-4 rounded-lg shadow border border-gray-200"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-semibold">
                  {{ new Date(appointment.date).toLocaleDateString("tr-TR") }}
                </div>
                <div class="text-gray-600">
                  Saat:
                  {{
                    new Date(appointment.date).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </div>
              </div>
              <button
                @click="cancelAppointment(appointment._id)"
                class="text-red-500 hover:text-red-700 font-medium cursor-pointer"
              >
                İptal Et
              </button>
            </div>
          </div>
          <div class="mt-4 flex justify-center">
            <button
              v-if="hasMoreAppointments"
              @click="loadMoreAppointments"
              class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Daha Fazla Göster
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
