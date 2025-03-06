export interface AIModel {
    id: string;
    display_name: string;
    api_string: string;
    description: string;
    supports_vision: boolean;
    supports_thinking: boolean;
}