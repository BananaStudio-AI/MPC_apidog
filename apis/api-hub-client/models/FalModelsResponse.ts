/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FalModel } from './FalModel';
/**
 * Response format for FAL Platform model listing
 */
export type FalModelsResponse = {
    models: Array<FalModel>;
    /**
     * Whether more models are available
     */
    has_more?: boolean;
    /**
     * Cursor for next page
     */
    next_cursor?: string | null;
    /**
     * Total number of models available
     */
    total_count?: number;
};

