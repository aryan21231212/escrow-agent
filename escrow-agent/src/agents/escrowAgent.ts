  import { PrismaClient } from "@prisma/client";
  import { createRazorpayPayout } from "../lib/razorpay/client";
  import { generateAuditHash } from "../lib/blockchain-audit/hasher";

  const prisma = new PrismaClient();

  interface VerificationInput {
    milestoneId: string;
    externalProof: string; // e.g., git commit hash, test results, or delivery confirmation
  }

  export async function evaluateAndExecuteMilestone({ milestoneId, externalProof }: VerificationInput) {
    // 1. Fetch milestone and contract details
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { contract: { include: { vendor: true } } },
    });

    if (!milestone) {
      throw new Error("Milestone not found");
    }

    // 2. Simulate AI Evaluation (In production, replace with LLM prompt evaluating `externalProof` against `verificationContext`)
    console.log(`Evaluating proof for: "${milestone.verificationContext}"`);
    
    // Let's assume our deterministic check or LLM returns confidence
    const aiConfidenceScore = 0.98; // Simulated high confidence score (> 0.95 threshold)
    const isVerified = aiConfidenceScore >= 0.95 && externalProof.length > 0;

    if (!isVerified) {
      // Update milestone state to failed/escalated
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: { status: "FAILED_ESCALATED", aiConfidenceScore },
      });
      return { success: false, message: "AI verification failed or confidence too low. Escalated to human review." };
    }

    // 3. Update milestone state to verified
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: "VERIFIED", aiConfidenceScore },
    });

    // 4. Trigger Razorpay Payout
    const fundAccountId = milestone.contract.vendor.razorpayFundId;
    if (!fundAccountId) {
      throw new Error("Vendor Razorpay Fund Account ID is missing.");
    }

    const payoutResult = await createRazorpayPayout({
      fundAccountId,
      amount: milestone.amount,
      referenceId: milestoneId,
    });

    // 5. If payout is successful, mark milestone as paid and record audit log
    if (payoutResult.id) {
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: { 
          status: "PAID", 
          razorpayPayoutId: payoutResult.id 
        },
      });

      await prisma.auditLog.create({
        data: {
          contractId: milestone.contractId,
          action: "AI_VERIFICATION_PASSED_AND_PAID",
          metadata: { payoutId: payoutResult.id, confidence: aiConfidenceScore, proof: externalProof },
        },
      });

      return { success: true, payoutId: payoutResult.id };
    } else {
      throw new Error("Razorpay payout failed to execute.");
    }
  }