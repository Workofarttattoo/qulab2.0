import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withTrace, trackApiRequest, trackError } from "@/lib/observability";
import { z } from "zod";

const exportRequestSchema = z.object({
  case_id: z.string().optional(),
  evidence_ids: z.array(z.string()).optional(),
  format: z.enum(['json', 'csv', 'xlsx', 'zip']),
  include_metadata: z.boolean().optional().default(true),
  include_data: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  return withTrace('osint-export-request', async (span) => {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        trackApiRequest('POST', '/api/osint/export', Date.now() - startTime, 401);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const validatedData = exportRequestSchema.parse(body);

      span.setAttributes({
        'user.id': session.user.id,
        'osint.export_format': validatedData.format,
        'osint.case_id': validatedData.case_id || 'none',
      });

      // In a real implementation, this would call the Python OSINT export module
      // For now, we'll return mock export data
      const mockExportData = {
        export_id: `export_${Date.now()}`,
        format: validatedData.format,
        case_id: validatedData.case_id,
        evidence_count: validatedData.evidence_ids?.length || 10,
        created_at: new Date().toISOString(),
        download_url: `/api/osint/export/download/export_${Date.now()}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      // Log export event for audit
      // This would integrate with the audit logger
      console.log(`Export created for user ${session.user.id}: ${validatedData.format} format`);

      trackApiRequest('POST', '/api/osint/export', Date.now() - startTime, 200);

      return NextResponse.json(mockExportData);

    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        endpoint: '/api/osint/export',
        method: 'POST'
      });

      trackApiRequest('POST', '/api/osint/export', Date.now() - startTime, 500);

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
