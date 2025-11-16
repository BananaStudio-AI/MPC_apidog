/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FAL Platform pricing information
 */
export type FalPricingResponse = {
    prices: Array<{
        endpoint_id: string;
        /**
         * Price per unit
         */
        unit_price: number;
        /**
         * Billing unit
         */
        unit: string;
        /**
         * Currency code
         */
        currency: string;
    }>;
    has_more?: boolean;
    next_cursor?: string | null;
};

