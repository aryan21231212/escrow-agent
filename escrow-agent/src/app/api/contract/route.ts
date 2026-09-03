import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Ensure vendor exists
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

    // Create Milestone
    const milestone = await prisma.milestone.create({
      data: {
        contractId: contract.id,
        description: milestoneDescription || title,
        amount: milestoneAmount || totalAmount,
        status: "PENDING",
        verificationContext: `Must fulfill: ${plainTerms}`,
      },
    });

    // Send Notification Email to Vendor
    try {
      await resend.emails.send({
        from: "Escrow Protocol <onboarding@resend.dev>",
        to: [vendorEmail],
        subject: `New Escrow Task Assigned: ${title}`,
        html: `
          <div style="font-family: sans-serif; background: #000; color: #fff; padding: 24px; border-radius: 8px;">
            <h2 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 12px;">New Escrow Task Assigned</h2>
            <p>You have been assigned to a new project contract by <b>${clientEmail}</b>.</p>
            <p><b>Project:</b> ${title}</p>
            <p><b>Terms:</b> ${plainTerms}</p>
            <p><b>Milestone:</b> ${milestoneDescription}</p>
            <p><b>Amount in Escrow:</b> ₹${milestoneAmount || totalAmount}</p>
            <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">Copy your Milestone ID <code>${milestone.id}</code> and submit your work proof through the developer portal.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send vendor notification email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Escrow contract created, funds locked, and notification email dispatched to vendor!",
      contract,
      milestone,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}