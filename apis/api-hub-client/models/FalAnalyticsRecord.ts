/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FAL Platform analytics record for a model
 */
export type FalAnalyticsRecord = {
    endpoint_id: string;
    /**
     * Total number of requests
     */
    total_requests?: number;
    /**
     * Success rate (0-1)
     */
    success_rate?: number;
    /**
     * Average request duration in milliseconds
     */
    avg_duration_ms?: number;
    /**
     * 50th percentile duration
     */
    p50_duration_ms?: number;
    /**
     * 95th percentile duration
     */
    p95_duration_ms?: number;
    /**
     * 99th percentile duration
     */
    p99_duration_ms?: number;
};

