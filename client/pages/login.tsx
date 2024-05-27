import LoginPage from "@/components/auth/LoginPage";
import {AuthProvider} from "@/context/AuthContext";
import {ToastContainer} from "react-toastify";

const Login = () => {
    return(
        <>
            <ToastContainer/>
            <LoginPage/>
        </>
    )
}

export default Login;