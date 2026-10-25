
export type OverdueTenant = {
    id: number,
    name: string,
    room_number: number,
    last_laundry_date: string | null,
    last_kitchen_cleaning_date?: string | null,
    // Latest laundry reminder sent since the last laundry change
    reminded_at?: string | null
}
