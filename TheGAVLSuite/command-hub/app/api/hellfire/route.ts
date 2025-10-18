import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { jobQueue } from "@/lib/job-queue";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";
import { z } from "zod";

const hellfireRequestSchema = z.object({
  target: z.string(),
  type: z.enum(['recon', 'entry', 'report', 'training']),
  parameters: z.any(),
  scope: z.enum(['network', 'physical', 'social']).optional(),
  streetView: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('hellfire-api-request', async (span) => {
    try {
      // Rate limiting
      const rateLimitResponse = await rateLimit(request, 'hellfire');
      if (rateLimitResponse) {
        trackApiRequest('POST', '/api/hellfire', Date.now() - startTime, 429);
        return rateLimitResponse;
      }

      // Parse and validate request
      const body = await request.json();
      const validatedData = hellfireRequestSchema.parse(body);

      span.setAttributes({
        'hellfire.target': validatedData.target,
        'hellfire.type': validatedData.type,
        'hellfire.scope': validatedData.scope || 'network',
        'hellfire.streetView': validatedData.streetView || false,
      });

      // Create job
      const jobId = await jobQueue.addJob(
        'system', // This would come from the authenticated user
        'hellfire',
        validatedData
      );

      trackApiRequest('POST', '/api/hellfire', Date.now() - startTime, 200);

      return NextResponse.json({
        jobId,
        status: 'queued',
        message: 'HELLFIRE request queued for processing'
      });

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/hellfire',
        method: 'POST'
      });

      trackApiRequest('POST', '/api/hellfire', Date.now() - startTime, 500);

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
