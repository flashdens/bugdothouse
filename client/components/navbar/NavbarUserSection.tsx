import React, {useContext, useState} from "react";
import authContext from "@/context/AuthContext";
import Image from "next/image";
import logout from "@/public/logout.svg"
import LoginDialog from "@/components/navbar/dialog/LoginDialog";
import RegisterDialog from "@/components/navbar/dialog/RegisterDialog";

const NavbarUserSection = () => {

    const {user, logoutUser} = useContext(authContext);
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
    console.log(user);

    if (!authContext)
        return (<h3>waiting...</h3>)
    return(
        user ? (
            <>
                <h3>hello {user?.username} </h3>
                <button onClick={logoutUser} className={"hover:cursor-pointer"}>
                <Image className={"mx-2"} height={24} width={24} src={logout} alt={"logout"}></Image>
                </button>
            </>
            )
            :
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

    )
}

export default NavbarUserSection;