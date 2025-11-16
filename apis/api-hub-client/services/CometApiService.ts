/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CometModelsResponse } from '../models/CometModelsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CometApiService {
    /**
     * List Comet LLM Models
     * Retrieve list of 568 available LLM models from Comet API gateway including GPT-4, Claude, Gemini, DeepSeek, Llama, and other language models
     * @returns CometModelsResponse Successfully retrieved Comet LLM model list
     * @throws ApiError
     */
    public static listCometModels(): CancelablePromise<CometModelsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/comet/models',
            errors: {
                400: `Bad Request - Invalid or missing parameters`,
                401: `Unauthorized - Invalid or missing authentication`,
                404: `Not Found - Resource does not exist`,
            },
        });
    }
}
