/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * GET Models Pricing
     * @returns any
     * @throws ApiError
     */
    public static get(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }
    /**
     * GET Model search
     * @returns any
     * @throws ApiError
     */
    public static getModels(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/models',
        });
    }
}
