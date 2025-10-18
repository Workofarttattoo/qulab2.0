import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { jobQueue } from "@/lib/job-queue";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";
import { z } from "zod";

const legalRequestSchema = z.object({
  matter: z.string(),
  type: z.enum(['research', 'drafting', 'filing', 'intake']),
  details: z.any(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('legal-api-request', async (span) => {
    try {
      // Rate limiting
      const rateLimitResponse = await rateLimit(request, 'legal');
      if (rateLimitResponse) {
        trackApiRequest('POST', '/api/legal', Date.now() - startTime, 429);
        return rateLimitResponse;
      }

      // Parse and validate request
      const body = await request.json();
      const validatedData = legalRequestSchema.parse(body);

      span.setAttributes({
        'legal.matter': validatedData.matter,
        'legal.type': validatedData.type,
        'legal.priority': validatedData.priority || 'medium',
      });

      // Create job
      const jobId = await jobQueue.addJob(
        'system', // This would come from the authenticated user
        'legal',
        validatedData
      );

      trackApiRequest('POST', '/api/legal', Date.now() - startTime, 200);

      return NextResponse.json({
        jobId,
        status: 'queued',
        message: 'Legal request queued for processing'
      });

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/legal',
        method: 'POST'
      });

      trackApiRequest('POST', '/api/legal', Date.now() - startTime, 500);

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
