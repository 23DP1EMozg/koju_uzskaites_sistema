
export type User = {
    id?: number,
    created_at?: number
    email?: string,
    password?: string,
    role?: string,
    course?: string,
    room_number?: number,
    last_laundry_date?: Date | null,
    next_kitchen_cleaning_date?: Date | null,
    weekend_stay_count?: number,
    social_security_number?: string,
    name?: string,
    phone_number?: string
}
