"use client"

import { ReactNode } from "react"
import Modal from "react-modal"

type Props = {
    isOpen: boolean,
    onClose: () => void,
    title: string,
    children: ReactNode,
}

export default function AdminModal({ isOpen, onClose, title, children }: Props) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel={title}
            overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            className="max-h-[90dvh] w-full max-w-[640px] overflow-y-auto rounded-[28px] border border-[#a23a32]/40 bg-[linear-gradient(155deg,#141414_0%,#151111_50%,#3a1210_85%,#a23a32_120%)] p-6 text-white outline-none lg:p-10"
        >
            <div className="mb-8 flex items-start justify-between gap-4">
                <h2 className="text-3xl font-extrabold italic tracking-tight lg:text-4xl">{title}</h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Aizvērt"
                    className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-white/60 transition hover:bg-white/10"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4">
                        <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                </button>
            </div>
            {children}
        </Modal>
    )
}
