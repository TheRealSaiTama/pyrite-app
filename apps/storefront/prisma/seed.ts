import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function seedDiaries() {
  const diaryFiles = [
    'RE Products Page - Hardbound Diaries.csv',
    'RE Products Page - Premium PU Leather Diaries.csv',
  ];

  console.log('Seeding diaries from:', diaryFiles);

  for (const file of diaryFiles) {
    try {
      const csvPath = path.resolve(__dirname, `../csv/${file}`);
      if (!fs.existsSync(csvPath)) {
        console.warn(`CSV file not found: ${csvPath}. Skipping.`);
        continue;
      }
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
      }) as Record<string, string>[];

      for (const record of records) {
        if (!record['Product Name'] || record['Product Name'].trim() === '') {
            console.warn('Skipping record with empty Product Name in', file);
            continue;
        }

        const priceText = record['Price Range'] || '0';
        const prices = priceText.match(/\d+/g)?.map(Number) || [0];
        const minPrice = prices[0];
        const maxPrice = prices.length > 1 ? prices[1] : prices[0];
        
        const slug = (record['Product Name'] || 'diary')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `diary-${Date.now()}`;
        const tags = (record['Tags'] || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        
        await prisma.diary.upsert({
          where: { slug },
          update: {
            name: record['Product Name'],
            description: record['Short Description'],
            minPrice: isNaN(minPrice) ? null : minPrice,
            maxPrice: isNaN(maxPrice) ? null : maxPrice,
            imageUrl: record['Product image'],
            category: record['Categories'],
            tags,
          },
          create: {
            slug,
            name: record['Product Name'],
            description: record['Short Description'],
            minPrice: isNaN(minPrice) ? null : minPrice,
            maxPrice: isNaN(maxPrice) ? null : maxPrice,
            imageUrl: record['Product image'],
            category: record['Categories'],
            tags,
          },
        });
      }
      console.log(`Successfully seeded diaries from ${file}`);
    } catch (error) {
      console.error(`Error seeding diaries from ${file}:`, error);
    }
  }
}

async function seedProducts() {
    const productFiles = [
        'RE Products Page - Corporate Gift Sets.csv',
        'RE Products Page - SBI Gift Items.csv',
    ];

    console.log('Seeding products from:', productFiles);

    for (const file of productFiles) {
        try {
            const csvPath = path.resolve(__dirname, `../csv/${file}`);
            if (!fs.existsSync(csvPath)) {
                console.warn(`CSV file not found: ${csvPath}. Skipping.`);
                continue;
            }
            const csvData = fs.readFileSync(csvPath, 'utf-8');
            const records = parse(csvData, {
                columns: true,
                skip_empty_lines: true,
            }) as Record<string, string>[];

            for (const record of records) {
                if (!record['Product Name'] || record['Product Name'].trim() === '') {
                    console.warn('Skipping record with empty Product Name in', file);
                    continue;
                }

                const priceText = record['Price Range'] || '0';
                const prices = priceText.match(/\d+/g)?.map(Number) || [0];
                const minPrice = prices[0];
                const maxPrice = prices.length > 1 ? prices[1] : prices[0];

                const slug = (record['Product Name'] || 'product')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, '') || `product-${Date.now()}`;
                const tags = (record['Tags'] || '')
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean);

                await prisma.product.upsert({
                    where: { slug },
                    update: {
                        name: record['Product Name'],
                        description: record['Short Description'],
                        minPrice: isNaN(minPrice) ? null : minPrice,
                        maxPrice: isNaN(maxPrice) ? null : maxPrice,
                        imageUrl: record['Product image'],
                        tags,
                        category: record['Categories'] || 'Corporate Gift Set',
                    },
                    create: {
                        slug,
                        name: record['Product Name'],
                        description: record['Short Description'],
                        minPrice: isNaN(minPrice) ? null : minPrice,
                        maxPrice: isNaN(maxPrice) ? null : maxPrice,
                        imageUrl: record['Product image'],
                        tags,
                        category: record['Categories'] || 'Corporate Gift Set',
                    },
                });
            }
            console.log(`Successfully seeded products from ${file}`);
        } catch (error) {
            console.error(`Error seeding products from ${file}:`, error);
        }
    }
}


async function main() {
  console.log('Start seeding...');
  
  
  await seedDiaries();
  await seedProducts();
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  });
