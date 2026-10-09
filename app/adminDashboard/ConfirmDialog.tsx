"use client"

import AdminModal from "./AdminModal"

type Props = {
    isOpen: boolean,
    title: string,
    message: string,
    confirmLabel: string,
    pending: boolean,
    onConfirm: () => void,
    onCancel: () => void,
}

export default function ConfirmDialog({ isOpen, title, message, confirmLabel, pending, onConfirm, onCancel }: Props) {
    return (
        <AdminModal isOpen={isOpen} onClose={onCancel} title={title}>
            <p className="text-lg text-white/75">{message}</p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="cursor-pointer rounded-full border border-white/80 py-4 text-lg transition hover:bg-white/10"
                >
                    Atcelt
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={pending}
                    className="cursor-pointer rounded-full bg-[#a23a32] py-4 text-lg text-white transition hover:bg-[#8a2f29] disabled:opacity-60"
                >
                    {pending ? "Notiek..." : confirmLabel}
                </button>
            </div>
        </AdminModal>
    )
}
