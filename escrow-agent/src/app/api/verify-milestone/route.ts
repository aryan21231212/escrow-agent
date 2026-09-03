import { NextResponse } from "next/server";
import { evaluateAndExecuteMilestone } from "../../../agents/escrowAgent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { milestoneId, externalProof } = body;

    if (!milestoneId || !externalProof) {
      return NextResponse.json(
        { success: false, error: "Missing milestoneId or externalProof in request body" },
        { status: 400 }
      );
    }

    // Run the agentic workflow
    const result = await evaluateAndExecuteMilestone({
      milestoneId,
      externalProof,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error in verify-milestone API:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}