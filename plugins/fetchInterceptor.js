export default defineNuxtPlugin(() => {
    globalThis.$fetch = globalThis.$fetch.create({
      onResponseError({ response }) {
        if (response.status === 401) {
          console.warn("🚨 401 - Yetkisiz erişim! Kullanıcı çıkış yapacak.");
  
          // 📌 LocalStorage'ı temizle
          localStorage.removeItem("token");
          localStorage.removeItem("user");
  
          // 📌 Kullanıcıyı giriş sayfasına yönlendir
          navigateTo("/login");
        }
      }
    });
  });
  