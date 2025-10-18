import { trace, metrics, logs } from '@opentelemetry/api'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'

// Initialize OpenTelemetry
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'gavl-command-hub',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
    }),
    exportIntervalMillis: 10000,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()

// Get tracer and meter
export const tracer = trace.getTracer('gavl-command-hub')
export const meter = metrics.getMeter('gavl-command-hub')

// Create custom metrics
export const jobCounter = meter.createCounter('jobs_total', {
  description: 'Total number of jobs processed',
})

export const jobDuration = meter.createHistogram('job_duration_seconds', {
  description: 'Duration of job processing in seconds',
})

export const apiRequestCounter = meter.createCounter('api_requests_total', {
  description: 'Total number of API requests',
})

export const apiRequestDuration = meter.createHistogram('api_request_duration_seconds', {
  description: 'Duration of API requests in seconds',
})

export const errorCounter = meter.createCounter('errors_total', {
  description: 'Total number of errors',
})

// Utility functions for tracing
export function withTrace<T>(
  name: string,
  fn: (span: any) => Promise<T> | T,
  attributes?: Record<string, any>
): Promise<T> | T {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes)
      }
      
      const result = await fn(span)
      span.setStatus({ code: 1 }) // OK
      return result
    } catch (error) {
      span.setStatus({ code: 2, message: error instanceof Error ? error.message : String(error) }) // ERROR
      span.recordException(error instanceof Error ? error : new Error(String(error)))
      throw error
    } finally {
      span.end()
    }
  })
}

// Error tracking
export function trackError(error: Error, context?: Record<string, any>) {
  errorCounter.add(1, {
    error_type: error.constructor.name,
    error_message: error.message,
    ...context,
  })
  
  console.error('Error tracked:', {
    error: error.message,
    stack: error.stack,
    context,
  })
}

// Performance monitoring
export function trackApiRequest(method: string, path: string, duration: number, statusCode: number) {
  apiRequestCounter.add(1, {
    method,
    path,
    status_code: statusCode.toString(),
  })
  
  apiRequestDuration.record(duration, {
    method,
    path,
    status_code: statusCode.toString(),
  })
}

// Job monitoring
export function trackJob(module: string, status: string, duration?: number) {
  jobCounter.add(1, {
    module,
    status,
  })
  
  if (duration !== undefined) {
    jobDuration.record(duration, {
      module,
      status,
    })
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('OpenTelemetry terminated'))
    .catch((error) => console.log('Error terminating OpenTelemetry', error))
})
