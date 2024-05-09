import LoginPage from "@/components/auth/LoginPage";
import {AuthProvider} from "@/context/AuthContext";

const Login = () => {
    return(
        <AuthProvider>
            <LoginPage/>
        </AuthProvider>
    )
}

export default Login;