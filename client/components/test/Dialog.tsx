import React from "react";

interface DialogProps {
  isOpen: boolean;
  isClosable?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> =  ({ isOpen, isClosable, onClose, children }) => {
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
                    <div className="bg-black opacity-50 absolute inset-0"></div>
                    <div className="bg-white p-8 rounded-lg relative z-50">
                        {isClosable && (
                            <button className="absolute top-0 right-0 px-3 py-1" onClick={handleClose}>
                                Close
                            </button>
                        )}
                        {children}
                    </div>
                </div>
            )}
        </>
    );
};

export default Dialog;
