
// LoginPage.js
import React, { useContext, useState } from 'react';
import AuthContext from "@/context/AuthContext";
import Dialog from "@/components/Dialog";

interface LoginPageProps {
    isOpen: boolean,
    onClose: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ isOpen, onClose }) => {
    const authContext = useContext(AuthContext);
    const [formValues, setFormValues] = useState({ username: '', password: '' });

    if (!authContext) {
        return <div>Loading...</div>;
    }

    const { loginUser } = authContext;

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        void loginUser(e);
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Login" animation="animate-in slide-in-from-bottom duration-300">
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col items-center">
                <div className="mb-4 w-full">
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter username"
                        value={formValues.username}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
                <div className="mb-4 w-full">
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={formValues.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Login
                </button>
            </form>
        </Dialog>
    );
};

export default LoginPage;
