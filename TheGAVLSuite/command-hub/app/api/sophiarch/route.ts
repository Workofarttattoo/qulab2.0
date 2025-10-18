import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { jobQueue } from "@/lib/job-queue";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";
import { z } from "zod";

const sophiarchRequestSchema = z.object({
  type: z.enum(['inference', 'synthesis', 'dataset', 'model']),
  parameters: z.any(),
  timeframe: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('sophiarch-api-request', async (span) => {
    try {
      // Rate limiting
      const rateLimitResponse = await rateLimit(request, 'sophiarch');
      if (rateLimitResponse) {
        trackApiRequest('POST', '/api/sophiarch', Date.now() - startTime, 429);
        return rateLimitResponse;
      }

      // Parse and validate request
      const body = await request.json();
      const validatedData = sophiarchRequestSchema.parse(body);

      span.setAttributes({
        'sophiarch.type': validatedData.type,
        'sophiarch.timeframe': validatedData.timeframe || '30d',
        'sophiarch.confidence': validatedData.confidence || 0.8,
      });

      // Create job
      const jobId = await jobQueue.addJob(
        'system', // This would come from the authenticated user
        'sophiarch',
        validatedData
      );

      trackApiRequest('POST', '/api/sophiarch', Date.now() - startTime, 200);

      return NextResponse.json({
        jobId,
        status: 'queued',
        message: 'Sophiarch request queued for processing'
      });

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/sophiarch',
        method: 'POST'
      });

      trackApiRequest('POST', '/api/sophiarch', Date.now() - startTime, 500);

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