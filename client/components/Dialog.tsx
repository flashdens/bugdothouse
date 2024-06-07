import React, { ReactNode, useEffect, useRef } from 'react';
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
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-900 opacity-50"></div>
            <div className="md:max-w-3xl" ref={dialogRef}>
                <div className={`relative bg-white p-4 md:p-8 rounded-lg shadow-lg ${animation}`}>
                    <button
                        className="absolute top-0 right-0 m-3 text-gray-600 hover:text-gray-800 focus:outline-none"
                        onClick={onClose}
                    >
                        <Image src={close} alt="close" width={24} height={24} />
                    </button>
                    <h2 className="text-lg md:text-xl font-semibold text-center">{title}</h2>
                    <div className="dialog-content mt-2 md:mt-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dialog;
