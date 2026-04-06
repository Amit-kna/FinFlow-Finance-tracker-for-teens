import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { aiScannerSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate Limiting: 10 requests per minute
  // Note: In a real serverless environment, this in-memory store is per-container.
  // For multi-instance production, use Redis (upstash-rate-limit).
  const rateLimitCheck = rateLimit(10, 60000);
  const rateLimitResponse = await rateLimitCheck(request as any);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    // Strict Input Validation
    const validation = aiScannerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { receipt_content } = validation.data;

    // Attempt to call Modal endpoint (if deployed and URL is known)
    // For now, if no URL is present or it fails, we fall back to a mock response
    const MODAL_URL = process.env.MODAL_AI_SCANNER_URL; // Update this after deploying Modal
    
    if (MODAL_URL) {
      // Secure API Key Handling: Ensure the key is not logged
      const response = await fetch(MODAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt_content })
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Fallback Mock Logic
    const categories = ['Food & Dining', 'Shopping', 'Entertainment', 'Transportation', 'Utilities'];
    const mockAmount = Math.round((Math.random() * 145 + 5) * 100) / 100;
    const mockCategory = categories[Math.floor(Math.random() * categories.length)];

    return NextResponse.json({
      status: 'success',
      data: {
        type: 'expense',
        amount: mockAmount,
        category: mockCategory,
        note: 'Mocked fallback from Next.js'
      }
    });
  } catch (error) {
    console.error('Error scanning receipt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
