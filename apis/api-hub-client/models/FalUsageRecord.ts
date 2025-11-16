/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FAL Platform usage record for a specific date
 */
export type FalUsageRecord = {
    endpoint_id: string;
    date: string;
    /**
     * Number of requests
     */
    requests: number;
    /**
     * Total cost for the period
     */
    total_cost?: number;
    currency?: string;
};

