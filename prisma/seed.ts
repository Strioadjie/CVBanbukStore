import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hapus data lama
  await prisma.transaction.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Buat users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const salesPassword = await bcrypt.hash('sales123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const sales = await prisma.user.create({
    data: {
      email: 'sales@test.com',
      password: salesPassword,
      name: 'Sales User',
      role: 'SALES',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@test.com',
      password: customerPassword,
      name: 'Customer User',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Users created');

  // Buat produk
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Tas Kulit Premium',
        price: 500000,
        stock: 15,
        description: 'Tas kulit asli dengan desain elegan dan tahan lama',
        material: 'Kulit Asli',
        size: '30x25x10 cm',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Dompet Pria Klasik',
        price: 150000,
        stock: 30,
        description: 'Dompet kulit pria dengan banyak slot kartu',
        material: 'Kulit Sintetis',
        size: '12x9 cm',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sepatu Formal Pria',
        price: 750000,
        stock: 8,
        description: 'Sepatu formal berkualitas tinggi untuk acara resmi',
        material: 'Kulit Premium',
        size: '39-44',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ikat Pinggang Kulit',
        price: 200000,
        stock: 20,
        description: 'Ikat pinggang kulit dengan buckle stainless steel',
        material: 'Kulit Asli',
        size: 'Adjustable',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ransel Laptop',
        price: 450000,
        stock: 12,
        description: 'Ransel dengan kompartemen laptop hingga 15 inch',
        material: 'Canvas + Kulit',
        size: '40x30x15 cm',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Jaket Kulit Motor',
        price: 1200000,
        stock: 5,
        description: 'Jaket kulit untuk berkendara dengan proteksi maksimal',
        material: 'Kulit Premium',
        size: 'M, L, XL',
      },
    }),
  ]);

  console.log('✅ Products created');

  // Buat inquiry
  await prisma.inquiry.create({
    data: {
      productId: products[0].id,
      userId: customer.id,
      status: 'PENDING',
      message: 'Apakah tersedia warna coklat?',
    },
  });

  await prisma.inquiry.create({
    data: {
      productId: products[1].id,
      userId: customer.id,
      status: 'DIPROSES',
      assignedTo: sales.id,
      message: 'Berapa lama pengiriman ke Jakarta?',
    },
  });

  console.log('✅ Inquiries created');

  // Buat wishlist
  await prisma.wishlist.create({
    data: {
      userId: customer.id,
      productId: products[2].id,
    },
  });

  await prisma.wishlist.create({
    data: {
      userId: customer.id,
      productId: products[5].id,
    },
  });

  console.log('✅ Wishlists created');

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📝 Demo Accounts:');
  console.log('Admin: admin@test.com / admin123');
  console.log('Sales: sales@test.com / sales123');
  console.log('Customer: customer@test.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
