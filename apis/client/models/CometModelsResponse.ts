/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CometModelsResponse = {
    data?: Array<{
        id?: string;
        object?: string;
        created?: number;
        owned_by?: string;
        permission?: Array<{
            id?: string;
            object?: string;
            created?: number;
            allow_create_engine?: boolean;
            allow_sampling?: boolean;
            allow_logprobs?: boolean;
            allow_search_indices?: boolean;
            allow_view?: boolean;
            allow_fine_tuning?: boolean;
            organization?: string;
            group?: string | null;
            is_blocking?: boolean;
        }>;
        root?: string;
        parent?: string | null;
        supported_endpoint_types?: Array<string>;
        context_window?: number;
        input_price?: number;
        output_price?: number;
        description?: string;
    }>;
    success?: boolean;
};

