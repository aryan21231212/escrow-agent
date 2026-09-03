import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const vendor = await prisma.user.create({
    data: {
      email: "vendor@example.com",
      name: "Acme Dev Vendor",
      razorpayFundId: "fa_dummy_123456789",
    },
  });

  const client = await prisma.user.create({
    data: {
      email: "client@example.com",
      name: "Startup Client Inc",
    },
  });

  const contract = await prisma.escrowContract.create({
    data: {
      title: "Full-Stack Dashboard Development",
      plainTerms: "Build dual dashboard for hospital bed availability and booking.",
      totalAmount: 5000,
      clientId: client.id,
      vendorId: vendor.id,
      status: "IN_PROGRESS",
    },
  });

  const milestone = await prisma.milestone.create({
    data: {
      contractId: contract.id,
      description: "Complete database schema and API routes",
      amount: 5000,
      verificationContext: "Verify GitHub commit matching API backend implementation",
      status: "PENDING",
    },
  });

  console.log("✅ Seed data created successfully!");
  console.log(`👉 Copy this Milestone ID for testing: ${milestone.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });