/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Unified model record for cross-provider aggregation
 */
export type UnifiedModelRecord = {
    /**
     * Model provider
     */
    provider: UnifiedModelRecord.provider;
    /**
     * Unique model identifier
     */
    model_id: string;
    /**
     * Human-readable name
     */
    display_name?: string;
    /**
     * Model category
     */
    category?: string;
    /**
     * Model description
     */
    description?: string;
    pricing?: {
        unit_price?: number;
        unit?: string;
        currency?: string;
    };
    /**
     * Additional provider-specific metadata
     */
    metadata?: Record<string, any>;
};
export namespace UnifiedModelRecord {
    /**
     * Model provider
     */
    export enum provider {
        COMET = 'comet',
        FAL = 'fal',
    }
}

