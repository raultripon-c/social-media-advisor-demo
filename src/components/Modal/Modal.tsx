import React from 'react'
import closeIcon from '../../assets/svg/cross.svg'
import './Modal.css'

interface ModalProps {
    title?: React.ReactNode
    isOpen: boolean
    onClose: () => void
    children?: React.ReactNode
    footer?: React.ReactNode
    isCloseOutside?: boolean
    txeModalClassName?: string
}

const Modal = ({ title, isOpen, onClose, children, footer, isCloseOutside = false, txeModalClassName = '' }: ModalProps) => {
    if (!isOpen) return null

    return (
        <div
            className="txe-modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget && isCloseOutside) {
                    onClose()
                }
            }}
            role="dialog"
            aria-modal="true"
        >
            <div className={`txe-modal-content ${txeModalClassName}`} onClick={(e) => e.stopPropagation()}>
                <div className="txe-modal-header">
                    {title && (
                        <>{title}</>
                    )}
                    <div className="txe-modal-header-actions">
                        <button
                            type="button"
                            className="txe-modal-close"
                            onClick={(e) => {
                                e.stopPropagation()
                                onClose()
                            }}
                        >
                            <img src={closeIcon} alt="close-icon" />
                        </button>
                    </div>
                </div>

                <div className="txe-modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="txe-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Modal
