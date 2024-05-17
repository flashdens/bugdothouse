// Dialog.tsx
import React, { ReactNode } from 'react';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    animation?: string;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children, animation }) => {
    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center`}>
            <div className="fixed inset-0 bg-gray-900 opacity-50"></div>
            <div className={`relative bg-white p-4 md:p-8 rounded-lg shadow-lg ${animation}`}>
                <div className="flex justify-between items-center mb-2 md:mb-4">
                    <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
                    <button
                        className="text-gray-600 hover:text-gray-800 focus:outline-none"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
                <div className="dialog-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Dialog;
