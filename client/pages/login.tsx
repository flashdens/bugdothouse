import LoginPage from "@/components/auth/LoginPage";
import {AuthProvider} from "@/context/AuthContext";
import {ToastContainer} from "react-toastify";

const Login = () => {
    return(
        <AuthProvider>
        <ToastContainer/>
            <LoginPage/>
        </AuthProvider>
    )
}

export default Login;