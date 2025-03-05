import { useState, Fragment, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import { setPageTitle } from '../store/themeConfigSlice';
import { useAuth } from '../context/AuthContext';
import MultiSelect from '../components/MultiSelect';
import Swal from 'sweetalert2';

interface Credentials {
    name: string;
    email: string;
    password: string;
    subject_ids: number[];
    role: number;
}

interface Subject {
    value: string;
    label: string;
}

const Profile = () => {
    const { myId, user, email, role, subjects, logout, fetchUser } = useAuth();
    const [credentials, setCredentials] = useState<Credentials>({ name: '', email: '', password: '', subject_ids: [], role: 2 });
    const [selectedOptions, setSelectedOptions] = useState<Subject[]>([]);
    const [options, setOptions] = useState<Subject[]>([]);
    const [isAlertModal, setIsAlertModal] = useState<any>(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(setPageTitle('Profile'));
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/subject/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                // Check if the response is OK (status code 200-299)
                return response.json();
            })
            .then((response) => {
                const options = response.map((subject: any) => ({
                    value: subject.id,
                    label: subject.name,
                }));
                setOptions(options);
                const selected = options.filter((option: Subject) => subjects.includes(Number(option.value)));
                setSelectedOptions(selected);
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    }, []);

    useEffect(() => {
        setCredentials({ name: user, email: email, password: '', subject_ids: subjects, role: role });
    }, [user]);

    useEffect(() => {
        const selected = options.filter((option: Subject) => subjects.includes(Number(option.value)));
        setSelectedOptions(selected);
    }, [options, subjects]);

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setCredentials({ ...credentials, [id]: value });
    };

    const handleChange = (selected: Subject[]) => {
        setSelectedOptions(selected);
    };
    const saveProfile = () => {
        const selectedSubjectIds = selectedOptions.map((subject) => subject.value);
        const removedSubjectIds = subjects.filter((id) => !selectedSubjectIds.some((subject_id) => id == Number(subject_id)));
        const addedSubjectIds = selectedSubjectIds.filter((id) => !subjects.some((subject_id) => Number(id) == subject_id));
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ id: myId, ...credentials, removedIds: removedSubjectIds, addedIds: addedSubjectIds }),
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        logout();
                        throw new Error('Token expired');
                    }
                }
                return response.json();
            })
            .then((response) => {
                const updatedTeacher = response.teacher;
                if (updatedTeacher) {
                    const selected = options.filter((option: Subject) => updatedTeacher.subject_ids.includes(Number(option.value)));
                    setSelectedOptions(selected);
                    setCredentials({ ...credentials, subject_ids: updatedTeacher.subject_ids });
                    showMessage(`Profile saved successfully!`, 'success');
                } else {
                    showMessage(response.message, 'error');
                }
                console.log(addedSubjectIds)
                if(addedSubjectIds.length > 0) {
                    showAlert(2);
                }
                fetchUser();
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });
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

    const showAlert = async (type: number) => {
        if (type === 2) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Permission request have been sent correctly!',
                padding: '2em',
                customClass: 'sweet-alerts',
            });
        }
    }

    return (
        <div>
            <h2 className="text-xl">Profile</h2>
            <form className="border border-[#ebedf2] dark:border-[#191e3a] rounded-md p-4 mb-5 bg-white dark:bg-black mt-5">
                <h6 className="text-lg font-bold mb-5">General Information</h6>
                <div className="flex flex-col sm:flex-row">
                    <div className="ltr:sm:mr-4 rtl:sm:ml-4 w-full sm:w-2/12 mb-5">
                        <img src="/assets/images/user-profile.png" alt="img" className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover mx-auto" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="name">Name</label>
                            <input id="name" type="text" placeholder="Enter name" className="form-input" value={credentials.name} onChange={changeValue}/>
                        </div>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" placeholder="Enter email" className="form-input" value={credentials.email} onChange={changeValue}/>
                        </div>
                        {role == 2 && (
                            <div>
                                <label htmlFor="email">Subjects</label>
                                <MultiSelect options={options} selectedOptions={selectedOptions} onChange={handleChange} />
                            </div>
                        )}
                        {role == 2 && <div></div>}
                        <div>
                            <button type="button" className="btn btn-primary" onClick={saveProfile}>
                                Save
                            </button>
                        </div>
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => navigate('/auth/password-reset')}>
                                Change password
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Profile;
