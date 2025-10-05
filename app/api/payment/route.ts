import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipient, amount, token, chainId, description } = body;

    // Simulate payment requirements for x402 protocol
    // In a real implementation, this would validate the payment and return 402 if payment is required
    
    // For demo purposes, we'll return a 402 response with payment requirements
    // The x402-axios interceptor will handle this automatically
    
    const paymentRequirements = {
      recipient,
      amount,
      token,
      chainId,
      description,
      // Additional x402 payment protocol fields
      paymentId: `payment_${Date.now()}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    };

    // Return 402 Payment Required to trigger x402 flow
    return NextResponse.json(
      {
        error: 'Payment Required',
        paymentRequirements,
      },
      {
        status: 402,
        headers: {
          'X-Payment-Required': JSON.stringify(paymentRequirements),
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for payment status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('paymentId');

  if (!paymentId) {
    return NextResponse.json(
      { error: 'Payment ID required' },
      { status: 400 }
    );
  }

  // Simulate payment status check
  return NextResponse.json({
    paymentId,
    status: 'completed',
    transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
    timestamp: new Date().toISOString(),
  });
}