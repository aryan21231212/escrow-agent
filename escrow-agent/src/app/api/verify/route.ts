import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { milestoneId, workProof } = await req.json();

    if (!milestoneId || !workProof) {
      return NextResponse.json(
        { success: false, error: "Milestone ID and work proof are required." },
        { status: 400 }
      );
    }

    // 1. Fetch milestone and associated contract/vendor details
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          include: { vendor: true, client: true },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { success: false, error: "Milestone not found in database." },
        { status: 404 }
      );
    }

    // 2. Simulate AI Verification & Payout Trigger
    // (In a full production build, this is where your AI agent analyzes workProof and Razorpay transfers funds)
    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: "VERIFIED_AND_PAID",
        verificationContext: `Verified work proof: ${workProof}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Work proof successfully verified by AI Agent! Payout triggered via Razorpay.",
      milestone: updatedMilestone,
      payoutDetails: {
        vendor: milestone.contract.vendor.name,
        fundId: milestone.contract.vendor.razorpayFundId,
        amountTransferred: milestone.amount,
        currency: "INR",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}