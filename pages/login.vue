<script setup>
const email = ref("");
const password = ref("");
const message = ref("");

const login = async () => {
  const { data, error } = await useFetch("/api/auth/login", {
    method: "POST",
    body: { email: email.value, password: password.value },
  });

  if (error.value) {
    message.value = error.value.data.statusMessage;
  } else {
    localStorage.setItem("token", data.value.token);
    localStorage.setItem("user", JSON.stringify(data.value.user));
    navigateTo("/");
  }
};
</script>
<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">Randevu Sistemi Girişi</h1>
    <p class="my-4 text-red-500">{{ message }}</p>
    <input
      class="w-full border border-gray-400 p-2 rounded-lg mb-4"
      type="text"
      v-model="email"
      placeholder="Email"
    />
    <input
      class="w-full border border-gray-400 p-2 rounded-lg mb-6"
      type="password"
      v-model="password"
      placeholder="Şifre"
    />
    <div class="float-right">
      <button
        @click="login"
        class="bg-blue-500 hover:bg-blue-600 w-auto transition-all duration-200 text-blue-50 rounded-lg p-2 mr-2 cursor-pointer"
      >
        Giriş Yap
      </button>
      <button
        @click="navigateTo('/register')"
        class="hover:bg-blue-100 transition-all w-auto duration-200 text-blue-600 border border-blue-600 rounded-lg p-2 cursor-pointer"
      >
        Kayıt Ol
      </button>
    </div>
  </div>
</template>

<style></style>
