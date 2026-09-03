// Basic wrapper for Razorpay payout handling
export async function createRazorpayPayout({
    fundAccountId,
    amount,
    referenceId,
  }: {
    fundAccountId: string;
    amount: number;
    referenceId: string;
  }) {
    // In production, you will use your Razorpay Key ID and Key Secret from .env
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
    const response = await fetch("https://api.razorpay.com/v1/payouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
        fund_account_id: fundAccountId,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: "INR",
        mode: "IMPS",
        purpose: "payout",
        reference_id: referenceId,
      }),
    });
  
    return await response.json();
  }