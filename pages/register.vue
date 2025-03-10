<script setup>
const name = ref("");
const email = ref("");
const password = ref("");
const message = ref("");

const register = async () => {
  const { data, error } = await useFetch("/api/auth/register", {
    method: "POST",
    body: { name: name.value, email: email.value, password: password.value },
  });

  if (error.value) {
    message.value = error.value.data.statusMessage;
  } else {
    navigateTo("/login");
  }
};
</script>
<template>
  <div class="font-light">
    <h1 class="mb-6 text-2xl font-bold">Randevu Sistemine Kayıt Ol</h1>
    <p class="my-4 text-red-500">{{ message }}</p>
    <input
      class="w-full border border-gray-400 p-2 rounded-lg mb-4"
      type="text"
      v-model="name"
      placeholder="Ad"
    />
    <input
      class="w-full border border-gray-400 p-2 rounded-lg mb-4"
      type="email"
      v-model="email"
      placeholder="Email"
    />
    <input
      class="w-full border border-gray-400 p-2 rounded-lg mb-6"
      type="password"
      v-model="password"
      placeholder="Şifre"
    />
    <div class="flex float-right">
      <button
        @click="navigateTo('/login')"
        class="hover:bg-blue-100 text-blue-600 w-auto transition-all border border-blue-600 duration-200 text-blue-50 rounded-lg p-2 mr-2 cursor-pointer"
      >
        Giriş Yap
      </button>
      <button
      @click="register"
      class="bg-blue-500 w-auto hover:bg-blue-600 transition-all duration-200 text-blue-50 rounded-lg p-2 cursor-pointer float-right"
      >
      Kayıt Ol
    </button>
  </div>
  </div>
</template>

<style></style>
