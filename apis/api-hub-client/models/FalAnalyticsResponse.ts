/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FalAnalyticsRecord } from './FalAnalyticsRecord';
/**
 * FAL Platform analytics dashboard response
 */
export type FalAnalyticsResponse = {
    analytics: Array<FalAnalyticsRecord>;
    period?: {
        start?: string;
        end?: string;
    };
};

