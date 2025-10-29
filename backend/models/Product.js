// Simple in-memory product model
class Product {
    constructor(data) {
        this.id = data.id || Date.now();
        this.name = data.name;
        this.category = data.category;
        this.description = data.description || '';
        this.price = data.price;
        this.oldPrice = data.oldPrice || null;
        this.stock = data.stock || 0;
        this.badge = data.badge || '';
        this.image = data.image || '/images/default.jpg';
        this.createdAt = new Date();
    }

    static validate(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Ürün adı en az 2 karakter olmalıdır');
        }
        
        if (!data.category) {
            errors.push('Kategori seçilmelidir');
        }
        
        if (!data.price || data.price <= 0) {
            errors.push('Geçerli bir fiyat girilmelidir');
        }
        
        if (data.stock < 0) {
            errors.push('Stok negatif olamaz');
        }
        
        return errors;
    }
}

module.exports = Product;