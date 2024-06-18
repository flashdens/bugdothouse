import {useState} from "react";
import Dialog from "@/components/Dialog";
import WebsiteInfoDialog from "@/components/global/WebsiteInfoDialog";

const InfoFloatingButton = () => {
   const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

   return (
       <>
        <button
            onClick={() => setIsInfoDialogOpen(true)}
            className="fixed bottom-8 right-8 bg-white text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none"
            aria-label="About the website"
        >
           ❓
        </button>
            <WebsiteInfoDialog
                isOpen={isInfoDialogOpen}
                onClose={() => setIsInfoDialogOpen(false)}
            />
       </>

   )
}

export default InfoFloatingButton;