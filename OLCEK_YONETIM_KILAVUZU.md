# Ölçek Yönetim Sistemi - Kullanım Kılavuzu

## Genel Bakış

Ölçek Yönetim Sistemi, psikolojik ölçeklerin kurum bazlı yönetimi ve uygulanması için geliştirilmiş bir modüldür. Sistem üç ana kullanıcı rolüne sahiptir:

### Kullanıcı Rolleri

1. **Admin Yönetici**: Kurum dâhilinde tüm yetkilere sahip kişi
2. **Doktor**: Hastalara ölçek atayabilen kullanıcı
3. **Hasta**: Kendisine atanan ölçekleri dolduran kişi

## Özellikler

### 🏢 Kurum Bazlı Lisanslama
- Her kurum kendi verilerine erişir
- Lisans süresi ve durum kontrolü
- Kurum bazlı kullanıcı yönetimi

### 👨‍💼 Admin Paneli
- **Kullanıcı Yönetimi**: Doktor ve hasta hesapları oluşturma
- **Ölçek Yönetimi**: Yeni ölçek ekleme ve düzenleme
- **Uygulamalar**: Tüm ölçek uygulamalarını görüntüleme
- **Kurum Ayarları**: Lisans bilgileri ve kurum detayları

### 👨‍⚕️ Doktor Paneli
- Hastalara ölçek atama
- Ölçek linki oluşturma ve paylaşma
- Uygulama durumlarını takip etme
- Tamamlanan ölçeklerin sonuçlarını görüntüleme
- Hasta listesini görüntüleme

### 🧑‍🦱 Hasta Paneli
- Atanan ölçekleri görüntüleme
- Adım adım ölçek doldurma
- İlerleme takibi
- Tamamlanan ölçekleri görüntüleme

## Kullanım

### Sisteme Erişim

HastaMuayene.js ekranında **Ölçekler** sekmesine gidip **"Yeni Ölçek Uygula"** butonuna tıklayın. Yeni bir pencerede ölçek yönetim sistemi açılacaktır.

### Demo Hesaplar

Sistem otomatik olarak demo hesaplar oluşturur:

**Admin Hesabı:**
- Kullanıcı Adı: `admin`
- Şifre: `admin123`

**Doktor Hesabı:**
- Kullanıcı Adı: `doktor1`
- Şifre: `doktor123`

**Hasta Hesabı:**
- Kullanıcı Adı: `hasta1`
- Şifre: `hasta123`

## İş Akışı

### 1. Admin İşlemleri
1. Admin olarak giriş yapın
2. **Kullanıcı Yönetimi** sekmesinden yeni doktor ve hasta hesapları oluşturun
3. **Ölçek Yönetimi** sekmesinden yeni ölçekler ekleyin
4. Kurum bilgilerini kontrol edin

### 2. Doktor İşlemleri
1. Doktor olarak giriş yapın
2. **"Yeni Ölçek Ata"** butonuna tıklayın
3. Hasta ve ölçek seçin
4. **"Ata ve Link Oluştur"** butonuna tıklayın
5. Oluşan linki kopyalayıp hastaya gönderin

### 3. Hasta İşlemleri
1. Hasta olarak giriş yapın
2. **"Doldurmanız Gereken Ölçekler"** bölümünden ölçeği görün
3. **"Başla"** butonuna tıklayın
4. Soruları adım adım cevaplayın
5. Son soruda **"Tamamla"** butonuna tıklayın

## Teknik Detaylar

### Veri Yapısı

**LocalStorage Anahtarları:**
- `olcekInstitutions`: Kurum listesi
- `olcekUsers`: Kullanıcı listesi
- `olcekScales`: Ölçek tanımları
- `olcekApplications`: Ölçek uygulamaları
- `olcekCurrentUser`: Aktif kullanıcı
- `olcekInstitution`: Aktif kurum

### Dosya Yapısı

```
src/
├── OlcekYonetim.js           # Ana konteyner component
└── components/
    ├── OlcekLogin.js         # Giriş ekranı
    ├── AdminDashboard.js     # Admin paneli
    ├── DoktorEkrani.js       # Doktor paneli
    └── HastaEkrani.js        # Hasta paneli
```

### Route Yapısı

- `/olcek-yonetim` - Ana ölçek yönetim sistemi

## Özelleştirme

### Yeni Ölçek Ekleme

Admin panelinde:
1. **Ölçek Yönetimi** sekmesine gidin
2. **"Yeni Ölçek Ekle"** butonuna tıklayın
3. Ölçek adı ve açıklaması girin
4. **"Ekle"** butonuna tıklayın

### Yeni Kurum Ekleme

localStorage'dan `olcekInstitutions` anahtarını düzenleyin veya kod içinde demoInstitutions array'ine yeni kurum ekleyin.

## Güvenlik

- Şifreler plain text olarak saklanır (Üretim için bcrypt kullanılmalı)
- Lisans kontrolü her girişte yapılır
- Kurum bazlı veri izolasyonu sağlanır
- Her kullanıcı sadece kendi kurumunun verilerine erişebilir

## Geliştirme Notları

### Yapılacaklar
- [ ] Gerçek ölçek soruları veritabanından yükleme
- [ ] Ölçek sonuçlarının detaylı analizi
- [ ] PDF rapor oluşturma
- [ ] Email ile link gönderme
- [ ] Şifre şifreleme (bcrypt)
- [ ] Profil fotoğrafı yükleme
- [ ] Gelişmiş arama ve filtreleme

### Bilinen Sınırlamalar
- Demo sorular kullanılıyor
- LocalStorage kullanıldığı için veri kalıcılığı sınırlı
- Gerçek backend entegrasyonu yok
- Email/SMS entegrasyonu yok

## Destek

Sorularınız veya sorunlarınız için lütfen geliştirici ile iletişime geçin.
