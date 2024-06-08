import React from "react";
import Dialog from "@/components/Dialog";

interface WebsiteInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const WebsiteInfoDialog: React.FC<WebsiteInfoDialogProps> = ({ isOpen, onClose }) => {
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="About the website" animation={"animate-in slide-in-from-bottom duration-300"}>
            <div>
                <p>
                    The author of this service is Lorem Ipsum.
                    This service constitutes an integral part of a bachelor&apos;s thesis (field: electronic information processing),
                    prepared under the supervision of Dr. Boom at the Faculty of Management and Social Communication of the Jagiellonian University.
                </p>
            </div>

            <div className={"mt-4"}>
                <p>
                    Autorem niniejszego serwisu jest Lorem Ipsum.
                    Serwis ten stanowi integralną część pracy licencjackiej (kierunek: elektroniczne przetwarzanie informacji),
                    przygotowanej pod kierunkiem dr Huka na Wydziale Zarządzania i Komunikacji Społecznej Uniwersytetu Jagiellońskiego.
                </p>
            </div>
        </Dialog>
    );
}

export default WebsiteInfoDialog;
