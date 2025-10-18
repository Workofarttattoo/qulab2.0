import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { jobQueue } from "@/lib/job-queue";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";
import { z } from "zod";

const ceioRequestSchema = z.object({
  type: z.enum(['audit', 'optimisation', 'helpdesk', 'escalate']),
  target: z.string(),
  parameters: z.any(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('ceio-api-request', async (span) => {
    try {
      // Rate limiting
      const rateLimitResponse = await rateLimit(request, 'ceio');
      if (rateLimitResponse) {
        trackApiRequest('POST', '/api/ceio', Date.now() - startTime, 429);
        return rateLimitResponse;
      }

      // Parse and validate request
      const body = await request.json();
      const validatedData = ceioRequestSchema.parse(body);

      span.setAttributes({
        'ceio.type': validatedData.type,
        'ceio.target': validatedData.target,
        'ceio.priority': validatedData.priority || 'medium',
      });

      // Create job
      const jobId = await jobQueue.addJob(
        'system', // This would come from the authenticated user
        'ceio',
        validatedData
      );

      trackApiRequest('POST', '/api/ceio', Date.now() - startTime, 200);

      return NextResponse.json({
        jobId,
        status: 'queued',
        message: 'CEIO request queued for processing'
      });

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/ceio',
        method: 'POST'
      });

      trackApiRequest('POST', '/api/ceio', Date.now() - startTime, 500);

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