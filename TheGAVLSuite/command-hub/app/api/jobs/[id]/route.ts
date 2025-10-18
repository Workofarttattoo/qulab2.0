import { NextRequest, NextResponse } from "next/server";
import { jobQueue } from "@/lib/job-queue";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  return withTrace('job-status-request', async (span) => {
    try {
      const jobId = params.id;
      
      span.setAttributes({
        'job.id': jobId,
      });

      const job = await jobQueue.getJob(jobId);
      
      if (!job) {
        trackApiRequest('GET', `/api/jobs/${jobId}`, Date.now() - startTime, 404);
        return NextResponse.json({
          error: 'Job not found'
        }, { status: 404 });
      }

      trackApiRequest('GET', `/api/jobs/${jobId}`, Date.now() - startTime, 200);

      return NextResponse.json(job);

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: `/api/jobs/${params.id}`,
        method: 'GET'
      });

      trackApiRequest('GET', `/api/jobs/${params.id}`, Date.now() - startTime, 500);

      return NextResponse.json({
        error: 'Internal server error'
      }, { status: 500 });
    }
  });
}
