import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { jobQueue } from "@/lib/job-queue";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";
import { z } from "zod";

const osintRequestSchema = z.object({
  target: z.string(),
  type: z.enum(['discovery', 'identity', 'social', 'spider']),
  parameters: z.any(),
  depth: z.number().min(1).max(5).optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('osint-api-request', async (span) => {
    try {
      // Rate limiting
      const rateLimitResponse = await rateLimit(request, 'osint');
      if (rateLimitResponse) {
        trackApiRequest('POST', '/api/osint', Date.now() - startTime, 429);
        return rateLimitResponse;
      }

      // Parse and validate request
      const body = await request.json();
      const validatedData = osintRequestSchema.parse(body);

      span.setAttributes({
        'osint.target': validatedData.target,
        'osint.type': validatedData.type,
        'osint.depth': validatedData.depth || 1,
      });

      // Create job
      const jobId = await jobQueue.addJob(
        'system', // This would come from the authenticated user
        'osint',
        validatedData
      );

      trackApiRequest('POST', '/api/osint', Date.now() - startTime, 200);

      return NextResponse.json({
        jobId,
        status: 'queued',
        message: 'OSINT request queued for processing'
      });

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/osint',
        method: 'POST'
      });

      trackApiRequest('POST', '/api/osint', Date.now() - startTime, 500);

      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Invalid request data',
          details: error.errors
        }, { status: 400 });
      }

      return NextResponse.json({
        error: 'Internal server error'
      }, { status: 500 });
    }
  });
}
