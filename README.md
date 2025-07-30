# Masaj Randevu Sistemi (Massage Booking System)

## Proje Türü
Full-Stack Web Uygulaması

## Genel Amaç
Bu proje, bir masaj salonunun veya bağımsız bir masaj terapistinin randevu alma ve yönetme süreçlerini dijitalleştiren, kullanıcı dostu ve verimli bir online platform geliştirmeyi hedeflemektedir. Müşterilerin, sunulan masaj hizmetlerini, müsait terapistleri ve boş zaman dilimlerini kolayca görüntüleyerek online ortamda randevu oluşturabilmelerini sağlayacaktır. Aynı zamanda, işletme sahipleri/terapistler için randevuları yönetebilecekleri, hizmet ve terapist bilgilerini güncelleyebilecekleri basit bir yönetim arayüzü sunacaktır.

## Kullanılan Temel Teknolojiler
- **Backend (Sunucu Tarafı):** C# .NET Core (RESTful API)
- **Veritabanı:** MSSQL (Microsoft SQL Server)
- **Frontend (Kullanıcı Arayüzü):** React (Single Page Application - SPA)

## Temel Fonksiyonellikler (MVP)

### Hizmet Kataloğu
- Sistemde sunulan farklı masaj hizmetlerinin (örneğin, İsveç Masajı, Derin Doku Masajı, Aromaterapi) listelenmesi.
- Her hizmetin detayları: Adı, açıklaması, süresi (dakika cinsinden) ve fiyatı.
- Müşterilerin hizmetleri kolayca gözden geçirebileceği basit bir arayüz.

### Terapist Bilgileri
- Sistemdeki tüm masaj terapistlerinin listelenmesi.
- Her terapist için temel bilgiler: Adı, kısa bir biyografi/uzmanlık alanı.
- (Gelecekte eklenebilir: Terapist fotoğrafı, puanlamalar.)

### Müsaitlik ve Takvim Yönetimi
- Her terapistin günlük/haftalık çalışma saatlerinin ve randevu alabileceği boş zaman dilimlerinin belirlenmesi.
- Randevu oluşturulurken, seçilen hizmete ve terapiste göre uygun, çakışmayan boş zaman dilimlerinin dinamik olarak gösterilmesi.
- Bir zaman dilimi rezerve edildiğinde, o dilimin otomatik olarak "dolu" olarak işaretlenmesi.

### Online Randevu Oluşturma
- Müşterilerin, adım adım ilerleyen bir süreçle (hizmet seçimi -> terapist seçimi -> tarih/saat seçimi -> müşteri bilgileri) kolayca randevu alabilmesi.
- Randevu tamamlama aşamasında temel müşteri bilgilerinin (ad, soyad, telefon numarası) alınması. (Başlangıçta kullanıcı kaydı/girişi zorunlu olmayacak, ancak sonra eklenebilir.)

### Randevu Yönetimi (Basit Yönetici Görünümü)
- Salon sahibi veya terapistlerin sistemdeki tüm randevuları (oluşturulmuş, onaylanmış, iptal edilmiş) görüntüleyebileceği basit bir liste veya takvim görünümü.
- Randevuları tarihe veya terapiste göre filtreleyebilme imkanı.
- (Gelecekte eklenebilir: Randevu durumunu güncelleme - Onaylama/İptal Etme.)

## Projeyi Etkileyici Kılacak Unsurlar
- Akıcı ve Görsel Takvim Arayüzü (React): Müşterilerin ve yöneticilerin müsaitlikleri ve randevuları renkli, interaktif bir takvim (örn. React Big Calendar) üzerinde görmesi, kullanıcı deneyimini önemli ölçüde artıracaktır.
- Duyarlı Tasarım (Responsive Design): Uygulama, hem masaüstü bilgisayarlar, hem tabletler hem de mobil telefonlar gibi farklı cihazlarda sorunsuz ve kullanışlı bir deneyim sunacaktır.
- Temiz ve Modern UI: Minimalist, profesyonel ve estetik bir kullanıcı arayüzü tasarımı (örn. Material-UI veya Chakra UI kullanarak) projenin kalitesini yükseltecektir.
- Gerçek Dünya Problemlerine Çözüm: Telefon trafiğini azaltma, randevu çakışmalarını engelleme ve müşteri memnuniyetini artırma gibi somut iş problemlerine çözüm sunması.

---

Bu açıklama, projenin amacını, hedeflerini ve temel bileşenlerini özetlemektedir. Katkıda bulunmak veya projeyi geliştirmek isteyenler için hızlı bir başlangıç noktası sağlar.