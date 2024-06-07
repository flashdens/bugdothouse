import React, { ReactNode } from 'react';
import close from '@/public/close.svg';
import Image from 'next/image';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-900 opacity-50"></div>
            <div className="w-full md:max-w-3xl">
                <div className={`relative bg-white p-4 md:p-8 rounded-lg shadow-lg ${animation}`}>
                    <button
                        className="absolute top-0 right-0 m-3 text-gray-600 hover:text-gray-800 focus:outline-none"
                        onClick={onClose}
                    >
                        <Image src={close} alt="close" width={24} height={24} />
                    </button>
                    <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
                    <div className="dialog-content mt-2 md:mt-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dialog;
