/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FAL Platform cost estimation response
 */
export type FalEstimateResponse = {
    estimate_type: string;
    /**
     * Total estimated cost
     */
    total_cost: number;
    currency: string;
    /**
     * Cost breakdown by endpoint
     */
    breakdown?: Record<string, number>;
};

