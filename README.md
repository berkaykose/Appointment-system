# Projeyi Çalıştırma

### Öncelikle gerekli bağlılıkları yükleyin.

```sh
npm install
```

### Bu proje MongoDB kullanmaktadır. Eğer MongoDB'yi kendi bilgisayarınızda çalıştırmak istiyorsanız:

```sh
mongod --dbpath ./data/db
```
### Eğer MongoDB Atlas (Bulut) Kullanıyorsanız:

1-MongoDB Atlas hesabı açın.
2-Bir Cluster oluşturun ve bağlantı URL'sini alın.
3-Aşağıdaki adımda .env dosyanızda MONGODB_URI olarak ekleyin.

### '.env' dosyası oluşturun

Projenin çalışması için bir .env dosyası oluşturmanız gerekmektedir.
Proje dizinine gidin ve aşağıdaki komutla .env dosyanızı oluşturun:

```sh
touch .env
```
Daha sonra, '.env' dosyanızın içine şu değişkenleri ekleyin:

```sh
# 🌍 Sunucu Ayarları
NODE_ENV=development
PORT=3000

# 🔑 MongoDB Bağlantı Bilgileri
MONGODB_URI=mongodb://localhost:27017/appointments_db

# 🔐 JWT Gizli Anahtarı
JWT_SECRET=supersecretkey

# 🌐 WebSocket Portu
WEBSOCKET_PORT=3001
```
Eğer MongoDB Atlas kullanıyorsanız, MONGODB_URI kısmına MongoDB Atlas bağlantı URL'nizi yazın.

JWT_SECRET değerini değiştirebilirsiniz, bu token şifreleme için kullanılacaktır.

### Son Olarak Projeyi Başlatın

```sh

npm run dev

```

# API Endpointleri

-/api/auth/register -> Kullanıcı kaydı oluşturur // POST
-/api/auth/login -> Kullanıcı girişi yapar // POST
-/api/appointments/book -> Yeni randevu oluşturur // POST
-/api/appointments/myAppointments -> Kullanıcının randevularını getirir // GET
-/api/appointments/:id -> Belirtilen randevuyu iptal eder // DELETE

Tüm korumalı endpoint'ler için Authorization: Bearer <TOKEN> başlığı gereklidir.

# GENEL ÖZET

- Nuxt 3 + MongoDB ile randevu sistemi
- Kullanıcı giriş/çıkış, JWT authentication
- Veritabanı olarak MongoDB kullanımı
- Sayfalama (Keyset Pagination) destekli API endpoint'leri

# Belirtilen MongoDB pagination performans sorusu cevabı

MongoDB’de skip(n).limit(m) kullanımı, veritabanında büyük miktarda veri içeren koleksiyonlar için performans problemlerine yol açabilir.

- MongoDB, skip() kullanıldığında önce tüm dokümanları bulur ve sonra ilk n dokümanı atlar. Bu, milyonlarca kayıtta gereksiz bir yük oluşturur.
- MongoDB’nin skip() işlemi indekslenmiş bile olsa, büyük koleksiyonlarda giderek daha yavaş çalışır.
- skip() işlemi sırasında bellek kullanımını artırır ve belirli durumlarda performans O(n) karmaşıklığında artarak kötüleşir.

## Önlemek için daha verimli pagination örnekleri

### "Keyset Pagination" (Diğer adıyla "Range-based Pagination")

Bu yöntemde, "daha önceki sayfanın son elemanını referans alarak" sonraki sayfaya geçiş yapılır.
Bunun için sıralı ve indeksli bir alan (_id, createdAt, updatedAt gibi) kullanılır. Bu projede de bu yaklaşım kullanılmıştır.

Bu yöntem ile:
✅ Büyük skip() kullanımı ortadan kalkar.
✅ İndeks kullanımı etkin hale gelir, performans artar.
✅ Sorgu süresi uzamaz, her sayfa sabit hızda yüklenir.

Dezavantajları:
❌ Sadece "ileri" ve "geriye" gitmek mümkündür, belirli bir sayfaya direkt atlamak zorlaşır.
❌ Eğer kullanıcı veri değiştiğinde en son "lastSeenId" değerine erişemezse, kayıt kaymaları olabilir.

### "Bucket Pattern" ile Sayfalama

Bu yöntemde, belirli aralıklara bölünmüş veri kümeleri (buckets) kullanılır.
Örneğin, createdAt alanı belirli günlere göre bölünerek indekslenir.

Bu yöntem ile:
✅ Büyük veriler küçük parçalara ayrılır, sorgu daha hızlı çalışır.
✅ Önceden belirlenmiş aralıklara göre sayfalama yapılabilir.

Dezavantajları:
❌ Esnek değildir, önceden belirlenmiş bir tarih aralığına bağlı kalır.
❌ Dengesiz veri dağılımı olan koleksiyonlarda bazı sayfalarda fazla, bazılarında az veri olabilir.

### "Offset + Cached Pages" (Önbellekli Sayfalama)

Bu yöntemde, skip() kullanılır ama sık kullanılan sayfalar Redis veya başka bir önbellek mekanizmasına kaydedilir.
Örneğin, ilk 100 sayfa sıkça kullanılıyorsa, bunları bir Redis önbelleğinde tutabiliriz.

Bu yöntem ile:
✅ Önbelleğe alınmış sayfalar sayesinde sorgu süresi büyük oranda azalır.
✅ Kullanıcı belirli bir sayfaya hızlıca gidebilir.

Dezavantajları:
❌ Gerçek zamanlı veriler için uygun değildir, çünkü önbellekteki veriler eski olabilir.
❌ Önbellek kapasitesi büyük koleksiyonlarda sınırlı olabilir.

# Projede Karşılaşılan Zorluklar

- Daha önceden authentication, pagination, error handling, data fetching, api entegrasyonu gibi konular ile ayrı ayrı veya birkaç tanesi birlikte olacak şekilde ufak geliştirmeler yapmıştım fakat hepsinin bir araya geldiği bütün bir appi kısa sürede ilk defa bir araya getirdim.  

- Kısıtlı zamanımdan kaynaklı istediğim kadar detaylı ve daha performanslı bir application yapamadığımı düşünüyorum. User experience konusunda bir çok geliştirme ve ekleme yapılabilirdi.

- Gerçek bir randevu sisteminde mutlaka olması gereken WebSockets ile gerçek zamanlı randevu güncellemesi yapılması gerekiyordu fakat kısıtlı zamandan ötürü bir workaround uygulamaya çalıştım. Tabii ki en doğru yaklaşım Socket.io entegrasyonu.

- Race condition ve concurrency için mongoDB' nin transactions yapısı olduğunu keşfettim ve kullanmak istemiştim fakat bunun için mongoDB Replica Set kurmam gerekiyordu ve onun için de aynı anda 3 adet sunucuya ihtiyacım olduğunu öğrendiğim için uygulayamadım.