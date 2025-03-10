export default defineNuxtRouteMiddleware((to, from) => {
    if (process.server) return; // Eğer sunucu tarafında çalışıyorsa kontrol etme
  
    const token = localStorage.getItem("token");
    if (!token) {
      return navigateTo("/login"); // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    }
  });
  