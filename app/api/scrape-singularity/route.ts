import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(_request: Request) {
  // Rate Limiting: 5 requests per minute (scraping is heavy)
  const rateLimitCheck = rateLimit(5, 60000);
  const rateLimitResponse = await rateLimitCheck(_request as any);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // In production, this would call your deployed Modal webhook URL.
    // Set MODAL_SINGULARITY_ENDPOINT in your .env.local after running `modal deploy modal/singularity_scraper.py`
    const MODAL_ENDPOINT_URL = process.env.MODAL_SINGULARITY_ENDPOINT;
    
    // If the Modal endpoint is securely deployed, hit that.
    if (MODAL_ENDPOINT_URL) {
      const modalResponse = await fetch(MODAL_ENDPOINT_URL);
      if (!modalResponse.ok) {
          throw new Error(`Modal endpoint returned ${modalResponse.status}`);
      }
      const data = await modalResponse.json();
      return NextResponse.json(data);
    }

    // Fallback: If Modal is not configured yet, just fetch from Next.js server directly.
    const redditRes = await fetch("https://www.reddit.com/r/singularity/top.json?limit=6&t=day", {
        headers: { "User-Agent": "FinFlow-App-Scraper/1.0" }
    });
    
    const data = await redditRes.json();
    const posts = data.data?.children?.map((post: any) => ({
      title: post.data.title,
      url: post.data.url,
      score: post.data.score,
      num_comments: post.data.num_comments,
      author: post.data.author
    })) || [];
    
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching Singularity posts:", error);
    return NextResponse.json(
      { error: "Failed to load Singularity posts" },
      { status: 500 }
    );
  }
}
