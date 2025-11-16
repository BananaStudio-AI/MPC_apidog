/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CometModel = {
    /**
     * Unique model identifier
     */
    id: string;
    /**
     * Object type
     */
    object: CometModel.object;
    /**
     * Unix timestamp of model creation
     */
    created?: number;
    /**
     * Organization that owns the model
     */
    owned_by: string;
    /**
     * Types of endpoints this model supports
     */
    supported_endpoint_types?: Array<'chat' | 'completion' | 'embedding' | 'moderation'>;
};
export namespace CometModel {
    /**
     * Object type
     */
    export enum object {
        MODEL = 'model',
    }
}

