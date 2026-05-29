export interface AuthUser {
    id: string;
    email: string;
    name: string;
}

export interface AuthState {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
}
