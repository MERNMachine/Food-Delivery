import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useEffect } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import axios from 'axios';

interface Credentials {
    email: string;
    password: string;
    code: string;
}
const PasswordReset = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState<Credentials>({ email: '', password: '', code: '' });
    const [status, setStatus] = useState<any>(false);
    const token = localStorage.getItem('token');
    useEffect(() => {
        dispatch(setPageTitle('Password Reset'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === 'dark' ? true : false;

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };
    const submitForm = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher/send_code`, credentials);
            setStatus(true);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data && error.response.data.message) {
                    showMessage(error.response.data.message, 'error');
                } else {
                    showMessage('Password reset failed', 'error');
                }
            }
        }
    };

    const resetPassword = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher/reset`, credentials);
            if(token) {
                navigate('/profile')
            }
            else {
                navigate('/auth/boxed-signin');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data && error.response.data.message) {
                    showMessage(error.response.data.message, 'error');
                } else {
                    showMessage('Password reset failed', 'error');
                }
            }
        }
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };
    return (
        <div className="flex justify-center items-center min-h-screen bg-cover bg-center bg-[url('/assets/images/map.svg')] dark:bg-[url('/assets/images/map-dark.svg')]">
            <div className="panel sm:w-[480px] m-6 max-w-lg w-full">
                <h2 className="font-bold text-2xl mb-3">Password Reset</h2>
                {!status && (
                    <form className="space-y-5" onSubmit={submitForm}>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" className="form-input" placeholder="Enter Email" name="email" onChange={handleInputChange} />
                        </div>
                        <div>
                            <label htmlFor="email">Password</label>
                            <input id="password" type="password" className="form-input" placeholder="Enter Password" name="password" onChange={handleInputChange} />
                        </div>
                        <button type="submit" className="btn btn-primary w-full">
                            Reset
                        </button>
                    </form>
                )}
                {status && (
                    <>
                        <div>
                            <p>
                                We&apos;ve sent a code to <span className="font-bold text-xl">{credentials.email}</span>. The code will be valid for a few minutes.
                            </p>
                            <input id="verification_code" type="text" className="form-input mt-[6px]" placeholder="Enter Verification Code" name="code" onChange={handleInputChange} />
                        </div>
                        <button className="btn btn-primary w-full mt-[20px]" onClick={resetPassword}>
                            Confirm
                        </button>
                    </>
                )}
                {!token && (<p className="text-center mt-[20px] text-xl">
                    Back to
                    <Link to="/auth/boxed-signin" className="font-bold text-primary hover:underline ltr:ml-1 rtl:mr-1">
                        Sign In
                    </Link>
                </p>)}
            </div>
        </div>
    );
};

export default PasswordReset;
