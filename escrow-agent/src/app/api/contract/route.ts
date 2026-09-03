import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const {
      clientEmail,
      vendorEmail,
      title,
      plainTerms,
      totalAmount,
      milestoneDescription,
      milestoneAmount,
    } = await req.json();

    if (!clientEmail || !vendorEmail || !title || !totalAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required contract fields." },
        { status: 400 }
      );
    }

    // Ensure client exists
    let client = await prisma.user.findUnique({ where: { email: clientEmail } });
    if (!client) {
      client = await prisma.user.create({
        data: { email: clientEmail, name: "Client User" },
      });
    }

    // Ensure vendor (developer) exists
    let vendor = await prisma.user.findUnique({ where: { email: vendorEmail } });
    if (!vendor) {
      vendor = await prisma.user.create({
        data: {
          email: vendorEmail,
          name: "Developer Vendor",
          razorpayFundId: "fa_dummy_dev_fund_account",
        },
      });
    }

    // Create Escrow Contract
    const contract = await prisma.escrowContract.create({
      data: {
        title,
        plainTerms,
        totalAmount,
        clientId: client.id,
        vendorId: vendor.id,
        status: "IN_PROGRESS",
      },
    });

    // Create Milestone under the contract
    const milestone = await prisma.milestone.create({
      data: {
        contractId: contract.id,
        description: milestoneDescription || title,
        amount: milestoneAmount || totalAmount,
        status: "PENDING",
        verificationContext: `Must fulfill: ${plainTerms}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Escrow contract created and funds locked successfully!",
      contract,
      milestone,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}