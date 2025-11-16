/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FAL Platform cost estimation request
 */
export type FalEstimateRequest = {
    /**
     * Type of cost estimation
     */
    estimate_type: FalEstimateRequest.estimate_type;
    /**
     * Map of endpoint IDs to quantities
     */
    endpoints: Record<string, {
        /**
         * Number of units to estimate
         */
        unit_quantity: number;
    }>;
};
export namespace FalEstimateRequest {
    /**
     * Type of cost estimation
     */
    export enum estimate_type {
        UNIT_PRICE = 'unit_price',
    }
}

