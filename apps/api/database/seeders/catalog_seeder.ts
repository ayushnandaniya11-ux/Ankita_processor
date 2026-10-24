import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/category'
import Product from '#models/product'

export default class extends BaseSeeder {
  async run() {
    // 1. Create or Update Categories
    const categoriesData = [
      { id: 1, name: 'Sarees', slug: 'sarees', description: 'Traditional and designer handcrafted sarees' },
      { id: 2, name: 'Dupattas', slug: 'dupattas', description: 'Graceful embroidered and printed dupattas' },
      { id: 3, name: 'Scarves', slug: 'scarves', description: 'Lightweight modal and cotton printed scarves' },
      { id: 4, name: 'Dress Material', slug: 'dress-material', description: 'Unstitched premium fabric sets' },
    ]

    for (const cat of categoriesData) {
      await Category.updateOrCreate({ id: cat.id }, cat)
    }

    // 2. Create Authentic Textile Products with Multiple Images and Full Specs
    const productsData = [
      {
        name: 'Royal Banarasi Silk Saree with Zari Border',
        slug: 'royal-banarasi-silk-saree-zari-border',
        sku: 'AP-SAR-001',
        description: 'An exquisite handwoven Banarasi silk saree crafted with intricate golden zari floral jaal. Features an opulent pallu with traditional paisley motifs and a contrast richly designed border. Perfect for grand weddings, festive celebrations, and ceremonial events.',
        mrp: 5999,
        sellingPrice: 3499,
        stock: 15,
        categoryId: 1,
        isPublished: true,
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80',
        images: [
          {
            id: '1',
            url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80',
            sortOrder: 0,
            isPrimary: true,
            altText: 'Royal Banarasi Silk Saree Front View',
          },
          {
            id: '2',
            url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&q=80',
            sortOrder: 1,
            isPrimary: false,
            altText: 'Pallu and Zari Work Close Up',
          },
          {
            id: '3',
            url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=80',
            sortOrder: 2,
            isPrimary: false,
            altText: 'Pleats and Border Detail',
          },
          {
            id: '4',
            url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=900&q=80',
            sortOrder: 3,
            isPrimary: false,
            altText: 'Fabric Drape and Texture',
          },
        ],
        attributes: {
          color: 'Crimson Red',
          fabric: 'Pure Banarasi Art Silk',
          size: '5.5 Meters',
          blouse: 'Unstitched Blouse Piece (0.8 Meters)',
          blouseFabric: 'Silk Blend with Zari Border',
          blouseColor: 'Contrast Emerald Green',
          border: 'Heavy Zari Woven Border',
          borderWidth: 'Broad 4-inch Border',
          palluDetail: 'Intricate Floral Brocade with Tassels',
          pattern: 'Traditional Zari Jaal',
          loomType: 'Powerloom Hand-finished',
          occasion: 'Wedding, Festive, Reception',
          transparency: 'Non-transparent',
          weight: '680 grams',
          gstRate: '5',
          hsnCode: '5208',
          genericName: 'Saree with Blouse Piece',
          netQuantity: '1 Unit',
        },
      },
      {
        name: 'Handcrafted Chanderi Cotton Silk Saree',
        slug: 'handcrafted-chanderi-cotton-silk-saree',
        sku: 'AP-SAR-002',
        description: 'Lightweight and breathable Chanderi saree blending the soft comfort of pure cotton with the subtle sheen of silk. Adorned with delicate metallic zari butis across the body and finished with a shimmering zari patti border.',
        mrp: 3899,
        sellingPrice: 2299,
        stock: 22,
        categoryId: 1,
        isPublished: true,
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
        imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=900&q=80',
        images: [
          {
            id: '1',
            url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=900&q=80',
            sortOrder: 0,
            isPrimary: true,
            altText: 'Chanderi Saree Full Drape',
          },
          {
            id: '2',
            url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80',
            sortOrder: 1,
            isPrimary: false,
            altText: 'Buti Weave Detail',
          },
          {
            id: '3',
            url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&q=80',
            sortOrder: 2,
            isPrimary: false,
            altText: 'Pallu Pattern Close Up',
          },
        ],
        attributes: {
          color: 'Pastel Mint Green',
          fabric: 'Chanderi Cotton Silk',
          size: '5.5 Meters',
          blouse: 'Running Unstitched Fabric (0.8 Meters)',
          blouseFabric: 'Chanderi Silk',
          blouseColor: 'Pastel Mint Green',
          border: 'Zari Patti Border',
          borderWidth: '2-inch Delicate Border',
          palluDetail: 'Golden Stripes and Floral Butis',
          pattern: 'Geometric Zari Buti',
          loomType: 'Handloom Crafted',
          occasion: 'Formal, Office Festive, Puja',
          transparency: 'Semi-sheer with rich body',
          weight: '450 grams',
          gstRate: '5',
          hsnCode: '5208',
          genericName: 'Chanderi Saree',
          netQuantity: '1 Unit',
        },
      },
      {
        name: 'Pure Modal Silk Bandhani Print Dupatta',
        slug: 'pure-modal-silk-bandhani-print-dupatta',
        sku: 'AP-DUP-001',
        description: 'A luxurious modal silk dupatta featuring authentic Gujarati Bandhani tie-dye prints with delicate zari border accents. Lightweight, ultra-soft texture with an effortless drape.',
        mrp: 1899,
        sellingPrice: 1199,
        stock: 30,
        categoryId: 2,
        isPublished: true,
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: true,
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=80',
        images: [
          {
            id: '1',
            url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=80',
            sortOrder: 0,
            isPrimary: true,
            altText: 'Bandhani Dupatta Spread View',
          },
          {
            id: '2',
            url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&q=80',
            sortOrder: 1,
            isPrimary: false,
            altText: 'Bandhani Print Close Up',
          },
        ],
        attributes: {
          color: 'Royal Blue & Maroon',
          fabric: '100% Pure Modal Silk',
          size: '2.5 Meters × 1 Meter',
          pattern: 'Traditional Bandhej / Bandhani',
          border: 'Zari Weave Lace Border',
          occasion: 'Casual Festive, Ethnic Pairing',
          weight: '180 grams',
          gstRate: '5',
          hsnCode: '5208',
          genericName: 'Dupatta',
          netQuantity: '1 Unit',
        },
      },
    ]

    for (const prod of productsData) {
      await Product.updateOrCreate({ slug: prod.slug }, prod)
    }

    console.log('Catalog categories and products seeded successfully!')
  }
}
