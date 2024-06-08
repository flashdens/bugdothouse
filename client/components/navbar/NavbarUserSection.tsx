import React, {useContext, useEffect, useState} from "react";
import AuthContext from "@/context/AuthContext";
import Image from "next/image";
import logout from "@/public/logout.svg";
import LoginDialog from "@/components/navbar/dialog/LoginDialog";
import RegisterDialog from "@/components/navbar/dialog/RegisterDialog";

const NavbarUserSection = () => {
    const {user, logoutUser} = useContext(AuthContext);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null; // user relies on localStorage values, so it's a workaround
    }

    return (
        <>
            {user?.user_id ? (
                <>
                    <h3>hello {user.username ? user.username : 'guest'}</h3>
                    <button onClick={logoutUser} className={"hover:cursor-pointer"}>
                        <Image className={"mx-2"} height={24} width={24} src={logout} alt={"logout"} />
                    </button>
                </>
            ) : (
                <>
                    <button
                        className={"mx-2 p-1 hover:bg-gray-400 rounded-lg"}
                        onClick={() => setIsLoginDialogOpen(true)}
                    >
                        login
                    </button>
                    <LoginDialog
                        isOpen={isLoginDialogOpen}
                        onClose={() => setIsLoginDialogOpen(false)}
                    />

                    <button
                        className={"mx-2 p-1 hover:bg-gray-400 rounded-lg"}
                        onClick={() => setIsRegisterDialogOpen(true)}
                    >
                        register
                    </button>
                    <RegisterDialog
                        isOpen={isRegisterDialogOpen}
                        onClose={() => setIsRegisterDialogOpen(false)}
                    />
                </>
            )}
        </>
    );
};

export default NavbarUserSection;
