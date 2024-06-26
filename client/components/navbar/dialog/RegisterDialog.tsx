import React, {useState, FormEvent, useContext} from 'react';
import Dialog from "@/components/Dialog";
import AuthContext from "@/context/AuthContext";
import {toast} from "react-toastify";

interface RegisterDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const RegisterDialog: React.FC<RegisterDialogProps> = ({ isOpen, onClose }) => {
    const [formValues, setFormValues] = useState({
        username: '',
        email: '',
        password: '',
        repeatPassword: '',
        consent: false,
    });

    const {registerUser} = useContext(AuthContext)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormValues({
            ...formValues,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        registerUser(e)
            .then((result: any) => {
                if (!result.success) {
                    toast.error(result.message)
                    return;
                }
                else {
                    toast.success('Registered successfully! Now log in', {hideProgressBar: true, autoClose: 2000})
                    onClose();
                }
            })
            .catch((error: any) => {
                console.log(error.response.data.error);
                // @ts-ignore
                toast.error(error.username || Object.values(error.response.data.error)[0][0]);
            });

    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Register" animation="animate-in slide-in-from-bottom duration-300">
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col items-center">
                <div className="mb-4 w-full">
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter username"
                        value={formValues.username}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                        required
                    />
                </div>
                <div className="mb-4 w-full">
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formValues.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                        required
                    />
                </div>
                <div className="mb-4 w-full">
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        minLength={8}
                        value={formValues.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                        required
                    />
                </div>
                <div className="mb-4 w-full">
                    <input
                        type="password"
                        name="repeatPassword"
                        placeholder="Repeat password"
                        minLength={8}
                        value={formValues.repeatPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                        required
                    />
                </div>
                <div className="mb-4 w-full flex items-center">
                    <input
                        type="checkbox"
                        name="consent"
                        checked={formValues.consent}
                        onChange={handleChange}
                        className="mr-2"
                        required
                    />
                    <label htmlFor="consent" className="text-sm">I agree to the website rules</label>
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Register
                </button>
            </form>
        </Dialog>
    );
};

export default RegisterDialog;
