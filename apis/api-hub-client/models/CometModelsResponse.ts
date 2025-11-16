/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CometModel } from './CometModel';
/**
 * Response format for Comet API model listing
 */
export type CometModelsResponse = {
    object: CometModelsResponse.object;
    data: Array<CometModel>;
};
export namespace CometModelsResponse {
    export enum object {
        LIST = 'list',
    }
}

