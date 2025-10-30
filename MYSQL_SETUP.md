# MySQL Kurulum Rehberi

## 1. MySQL Kurulumu

### macOS için:
```bash
# Homebrew ile MySQL kurulumu
brew install mysql

# MySQL servisini başlat
brew services start mysql

# MySQL güvenlik ayarları (opsiyonel)
mysql_secure_installation
```

### Windows için:
1. [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) indirin
2. Kurulum sihirbazını takip edin
3. MySQL Workbench'i de kurabilirsiniz

## 2. Veritabanı Konfigürasyonu

`backend/config/mysql.js` dosyasında MySQL bağlantı ayarlarını düzenleyin:

```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'your_mysql_password', // MySQL şifrenizi buraya girin
    database: 'zirvetelekom',
    charset: 'utf8mb4'
};
```

## 3. Bağımlılıkları Yükleyin

```bash
cd backend
npm install
```

## 4. Sunucuyu Başlatın

```bash
npm run dev
```

## 5. Veritabanı Kontrolü

Sunucu başladığında otomatik olarak:
- `zirvetelekom` veritabanı oluşturulur
- Gerekli tablolar oluşturulur
- Örnek veriler eklenir

## Tablolar

- **products**: Ürün bilgileri
- **users**: Kullanıcı hesapları
- **user_profiles**: Kullanıcı profil bilgileri
- **orders**: Siparişler
- **order_items**: Sipariş detayları

## API Endpoints

Tüm API endpoint'leri aynı kalır:
- `GET /api/products` - Tüm ürünler
- `POST /api/products/add` - Ürün ekle
- `GET /api/users` - Kullanıcılar
- `POST /api/users/register` - Kayıt ol
- `POST /api/users/login` - Giriş yap

## Sorun Giderme

### Bağlantı Hatası
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
- MySQL servisinin çalıştığından emin olun
- Bağlantı bilgilerini kontrol edin

### Şifre Hatası
```
Error: Access denied for user 'root'@'localhost'
```
- MySQL şifrenizi `config/mysql.js` dosyasında güncelleyin

### Port Hatası
```
Error: Can't connect to MySQL server on 'localhost:3306'
```
- MySQL'in 3306 portunda çalıştığından emin olun
- Firewall ayarlarını kontrol edin