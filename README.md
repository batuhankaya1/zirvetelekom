# Zirve Telekom - E-Ticaret Sitesi

Teknoloji ürünleri satışı yapan modern e-ticaret platformu.

## Proje Yapısı

```
zirvetelekom/
├── frontend/           # Frontend dosyaları
│   ├── css/           # Stil dosyaları
│   ├── js/            # JavaScript dosyaları
│   ├── images/        # Resim dosyaları
│   ├── pages/         # HTML sayfaları
│   └── index.html     # Ana sayfa
├── backend/           # Backend API
│   ├── controllers/   # Controller dosyaları
│   ├── models/        # Veri modelleri
│   ├── routes/        # API rotaları
│   ├── middleware/    # Middleware dosyaları
│   ├── config/        # Konfigürasyon
│   └── server.js      # Ana server dosyası
└── docs/              # Dokümantasyon
```

## Özellikler

- **Mavi-Beyaz Modern Tasarım**
- **Responsive Mobil Uyumlu**
- **Ürün Kategorileri**: Telefon, Tablet, Aksesuar, Laptop
- **Sepet Sistemi**
- **Ürün Filtreleme**
- **RESTful API**

## Kurulum

### Frontend
```bash
# Frontend dosyalarını tarayıcıda açın
open frontend/index.html
```

### Backend
```bash
cd backend
npm install
# MySQL kurulumu için MYSQL_SETUP.md dosyasını inceleyin
npm run dev
```

## API Endpoints

- `GET /api/products` - Tüm ürünler
- `GET /api/products/:id` - Tek ürün
- `POST /api/users/register` - Kullanıcı kaydı
- `POST /api/users/login` - Kullanıcı girişi
- `POST /api/orders` - Sipariş oluştur

## Teknolojiler

**Frontend:**
- HTML5, CSS3, JavaScript
- Font Awesome Icons
- Responsive Grid Layout

**Backend:**
- Node.js
- Express.js
- MySQL2
- CORS
- RESTful API

## Renk Paleti

- Ana Mavi: #2563eb
- Koyu Mavi: #1d4ed8
- Beyaz: #ffffff
- Gri Tonları: #f8fafc, #e5e7eb