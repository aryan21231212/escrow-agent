import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    let vendor = await prisma.user.findUnique({
      where: { email: "vendor@example.com" },
    }).catch(() => null);

    if (!vendor) {
      vendor = await prisma.user.create({
        data: {
          email: "vendor@example.com",
          name: "Acme Dev Vendor",
          razorpayFundId: "fa_dummy_123456789",
        },
      });
    }

    let client = await prisma.user.findUnique({
      where: { email: "client@example.com" },
    }).catch(() => null);

    if (!client) {
      client = await prisma.user.create({
        data: {
          email: "client@example.com",
          name: "Startup Client Inc",
        },
      });
    }

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

    return NextResponse.json({
      success: true,
      message: "Seed data created successfully!",
      milestoneId: milestone.id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}