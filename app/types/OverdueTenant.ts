
export type OverdueTenant = {
    id: number,
    name: string,
    room_number: number,
    last_laundry_date: string | null,
    last_kitchen_cleaning_date?: string | null,
    // A laundry reminder was already sent for the current overdue period
    reminded?: boolean
}
