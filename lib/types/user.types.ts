export interface User {
    id: string;
    username: string | null;
    full_name: string | null;
    website: string | null;
    avatar_url: string | null;
    updated_at: string | null;
    is_admin: boolean;
}