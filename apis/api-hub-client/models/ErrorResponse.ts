/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Standard error response format
 */
export type ErrorResponse = {
    error: {
        /**
         * Human-readable error message
         */
        message: string;
        /**
         * Error type identifier
         */
        type: string;
        /**
         * HTTP status code
         */
        code?: string;
        /**
         * Invalid parameter name (if applicable)
         */
        param?: string;
    };
};

