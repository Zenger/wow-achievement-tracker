export interface TokenResponse {
    accessToken: string;
    token_type: string;
    expires_in: number;
    sub: string;
}

export interface AchievementMedia {
    id: number,
    assets?: {
        key?: string,
        value?: string,
        file_data_id?: number
    }[]
}

export interface Achievement {
    id: number;
    name: string;
    description?: string;
    is_account_wide?: boolean;
    criteria?: CriteriaObject;
    media?: AchievementMedia;
    is_completed?: boolean;
    completed_timestamp?: number;
}

export interface CriteriaObject {
    id: number;
    description: string;
    amount: number;
    completed_timestamp?: number;
    child_criteria?: Criteria[];
    is_completed?: boolean;
}

export interface Criteria extends CriteriaObject {
    achievement?: AchievementCondensed | Achievement;
}

interface AchievementCondensed {
    id: number;
    name: string;
    media?: AchievementMedia;
}


export default {};