/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FAL Platform creative model definition
 */
export type FalModel = {
    /**
     * Unique endpoint identifier
     */
    endpoint_id: string;
    metadata?: {
        /**
         * Human-readable model name
         */
        display_name?: string;
        /**
         * Model category/type
         */
        category?: FalModel.category;
        /**
         * Model description
         */
        description?: string;
        /**
         * Model availability status
         */
        status?: FalModel.status;
        /**
         * Associated tags
         */
        tags?: Array<string>;
    };
};
export namespace FalModel {
    /**
     * Model category/type
     */
    export enum category {
        IMAGE_TO_IMAGE = 'image-to-image',
        IMAGE_TO_VIDEO = 'image-to-video',
        TEXT_TO_IMAGE = 'text-to-image',
        TEXT_TO_VIDEO = 'text-to-video',
        VIDEO_TO_VIDEO = 'video-to-video',
        TEXT_TO_AUDIO = 'text-to-audio',
        VISION = 'vision',
        LLM = 'llm',
        IMAGE_TO_3D = 'image-to-3d',
        TEXT_TO_SPEECH = 'text-to-speech',
    }
    /**
     * Model availability status
     */
    export enum status {
        ACTIVE = 'active',
        DEPRECATED = 'deprecated',
        BETA = 'beta',
        EXPERIMENTAL = 'experimental',
    }
}

