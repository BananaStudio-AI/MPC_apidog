/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FalUsageRecord } from './FalUsageRecord';
/**
 * FAL Platform usage statistics response
 */
export type FalUsageResponse = {
    usage: Array<FalUsageRecord>;
    /**
     * Total requests across all records
     */
    total_requests?: number;
    /**
     * Total cost across all records
     */
    total_cost?: number;
};

