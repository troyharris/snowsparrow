export interface Tool {
    id: string;
    name: string;
    description: string;
    icon: string;
    href: string;
    sort_order: number;
    is_active: boolean;
    created_at: string | undefined;
    updated_at: string | undefined;
}