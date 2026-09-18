import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/config/database.js";

const ADMIN_EMAIL = "admin@pharmablaze.com";
const ADMIN_PASSWORD = "Admin@12345";

const categories = [
  {
    name: "Pharmacy Products",
    slug: "pharmacy-products",
    description: "Everyday pharmacy products and essentials.",
    image: "/images/category-pharmacy.jpg",
  },
  {
    name: "Wellness",
    slug: "wellness",
    description: "Wellness and everyday health products.",
    image: "/images/category-wellness.jpg",
  },
  {
    name: "Vitamins",
    slug: "vitamins",
    description: "Vitamins and nutritional products.",
    image: "/images/category-vitamins.jpg",
  },
  {
    name: "Personal Care",
    slug: "personal-care",
    description: "Personal care and hygiene products.",
    image: "/images/category-personal-care.jpg",
  },
  {
    name: "Medical Devices",
    slug: "medical-devices",
    description: "Medical devices and health monitoring products.",
    image: "/images/category-medical-devices.jpg",
  },
];

const products = [
  {
    name: "Product Example One",
    slug: "product-example-one",
    sku: "PB-PHARM-001",
    description: "Example pharmacy product for development.",
    price: 4500,
    stock: 25,
    image: "/images/product-1.jpg",
    rating: 5,
    featured: true,
    categorySlug: "pharmacy-products",
  },
  {
    name: "Product Example Two",
    slug: "product-example-two",
    sku: "PB-WELL-001",
    description: "Example wellness product for development.",
    price: 7200,
    stock: 18,
    image: "/images/product-2.jpg",
    rating: 4.8,
    featured: true,
    categorySlug: "wellness",
  },
  {
    name: "Product Example Three",
    slug: "product-example-three",
    sku: "PB-CARE-001",
    description: "Example personal care product for development.",
    price: 5800,
    stock: 32,
    image: "/images/product-3.jpg",
    rating: 4.7,
    featured: false,
    categorySlug: "personal-care",
  },
  {
    name: "Product Example Four",
    slug: "product-example-four",
    sku: "PB-VIT-001",
    description: "Example vitamins and nutritional product for development.",
    price: 9100,
    stock: 12,
    image: "/images/product-4.jpg",
    rating: 4.9,
    featured: true,
    categorySlug: "vitamins",
  },
];

async function main() {
  // ==========================================
  // ADMIN
  // ==========================================

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: {
      email: ADMIN_EMAIL,
    },
    update: {
      name: "Pharmablaze Admin",
      passwordHash,
      role: "ADMIN",
      active: true,
    },
    create: {
      name: "Pharmablaze Admin",
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });

  console.log("✅ Admin account ready");
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);

  // ==========================================
  // CATEGORIES
  // ==========================================

  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
        image: category.image,
        active: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        active: true,
      },
    });

    console.log(`✅ Category ready: ${savedCategory.name}`);
  }

  // ==========================================
  // PRODUCTS
  // ==========================================

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: {
        slug: product.categorySlug,
      },
    });

    if (!category) {
      throw new Error(`Category not found: ${product.categorySlug}`);
    }

    const savedProduct = await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      update: {
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        rating: product.rating,
        featured: product.featured,
        status: "ACTIVE",
        categoryId: category.id,
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        rating: product.rating,
        featured: product.featured,
        status: "ACTIVE",
        categoryId: category.id,
      },
    });

    console.log(`✅ Product ready: ${savedProduct.name}`);
  }

  console.log("🎉 Database seed completed successfully");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
