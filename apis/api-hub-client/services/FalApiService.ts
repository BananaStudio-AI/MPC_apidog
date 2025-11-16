/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FalAnalyticsResponse } from '../models/FalAnalyticsResponse';
import type { FalEstimateRequest } from '../models/FalEstimateRequest';
import type { FalEstimateResponse } from '../models/FalEstimateResponse';
import type { FalModelsResponse } from '../models/FalModelsResponse';
import type { FalPricingResponse } from '../models/FalPricingResponse';
import type { FalUsageResponse } from '../models/FalUsageResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FalApiService {
    /**
     * List FAL Creative Models
     * Retrieve list of 866 available creative AI models from FAL Platform for image generation (FLUX, Stable Diffusion), video generation, audio synthesis, and more
     * @param cursor Pagination cursor for next page
     * @param limit Number of models per page (default: 100, max: 500)
     * @param category Filter by model category
     * @returns FalModelsResponse Successfully retrieved FAL creative model list
     * @throws ApiError
     */
    public static listFalModels(
        cursor?: string,
        limit: number = 100,
        category?: 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video' | 'video-to-video' | 'text-to-audio' | 'text-to-speech' | 'image-to-3d' | 'llm' | 'vision',
    ): CancelablePromise<FalModelsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fal/models',
            query: {
                'cursor': cursor,
                'limit': limit,
                'category': category,
            },
            errors: {
                400: `Bad Request - Invalid or missing parameters`,
                401: `Unauthorized - Invalid or missing authentication`,
                404: `Not Found - Resource does not exist`,
            },
        });
    }
    /**
     * Get FAL Model Pricing
     * Retrieve pricing information for all FAL Platform models including unit prices and billing units
     * @param cursor Pagination cursor for retrieving next page of pricing data
     * @param limit Maximum number of pricing records to return
     * @returns FalPricingResponse Successfully retrieved pricing information
     * @throws ApiError
     */
    public static getFalModelPricing(
        cursor?: string | null,
        limit: number = 100,
    ): CancelablePromise<FalPricingResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fal/models/pricing',
            query: {
                'cursor': cursor,
                'limit': limit,
            },
            errors: {
                400: `Bad Request - Invalid or missing parameters`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Estimate FAL Model Cost
     * Calculate estimated cost for FAL Platform model usage based on expected quantity. Useful for budgeting and cost optimization.
     * @param requestBody Cost estimation request with model endpoints and quantities
     * @returns FalEstimateResponse Successfully calculated cost estimate
     * @throws ApiError
     */
    public static estimateFalModelCost(
        requestBody: FalEstimateRequest,
    ): CancelablePromise<FalEstimateResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/fal/models/pricing/estimate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request - Invalid or missing parameters`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Get FAL Usage Statistics
     * Retrieve historical usage statistics for FAL Platform models including request counts and costs
     * @param startDate Start date for usage period (ISO 8601 format: YYYY-MM-DD)
     * @param endDate End date for usage period (ISO 8601 format: YYYY-MM-DD)
     * @param endpointId Filter by specific model endpoint
     * @param limit Maximum number of usage records
     * @returns FalUsageResponse Successfully retrieved usage statistics
     * @throws ApiError
     */
    public static getFalModelUsage(
        startDate?: string,
        endDate?: string,
        endpointId?: string,
        limit: number = 100,
    ): CancelablePromise<FalUsageResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fal/models/usage',
            query: {
                'start_date': startDate,
                'end_date': endDate,
                'endpoint_id': endpointId,
                'limit': limit,
            },
            errors: {
                400: `Bad Request - Invalid or missing parameters`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
    /**
     * Get FAL Analytics Dashboard
     * Retrieve aggregated analytics including performance metrics, success rates, and trends for FAL Platform models
     * @param startDate Analytics period start date
     * @param endDate Analytics period end date
     * @param metrics Comma-separated list of metrics to include
     * @returns FalAnalyticsResponse Successfully retrieved analytics data
     * @throws ApiError
     */
    public static getFalModelAnalytics(
        startDate?: string,
        endDate?: string,
        metrics?: string,
    ): CancelablePromise<FalAnalyticsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fal/models/analytics',
            query: {
                'start_date': startDate,
                'end_date': endDate,
                'metrics': metrics,
            },
            errors: {
                400: `Bad Request - Invalid or missing parameters`,
                401: `Unauthorized - Invalid or missing authentication`,
            },
        });
    }
}
