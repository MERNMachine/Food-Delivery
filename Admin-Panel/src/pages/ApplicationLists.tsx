import { useState, Fragment, useEffect, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import Dropdown from '../components/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import { setPageTitle } from '../store/themeConfigSlice';
import { useAuth } from '../context/AuthContext';
import { Checkbox } from '@mantine/core';

type Subject = {
    id: number;
    name: string;
    prompt: string;
    language: number;
};

type Teacher = {
    id: number;
    name: string;
    email: string;
    password: string;
    subject_ids: number[];
    role: number;
};

type TeacherSubject = {
    id: number;
    teacher_id: number;
    subject_id: number;
    selected: boolean;
}

const ApplicationLists = () => {
    const dispatch = useDispatch();
    const { user, email, role, subjects, logout } = useAuth();
    const [value, setValue] = useState<any>('list');
    const [isRejectModal, setIsRejectModal] = useState<any>(false);
    const [subjectList, setSubjectList] = useState<Subject[]>([]);
    const [teacherList, setTeacherList] = useState<Teacher[]>([]);
    const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
    const [rejectId, setRejectId] = useState<number>(-1);
    const [selectAll, setSelectAll] = useState<any>(false);

    useEffect(() => {
        dispatch(setPageTitle('Subjects'));
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/subject/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
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
                setSubjectList(response);
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
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
                setTeacherList(response);
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
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
                setTeacherList(response);
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });

        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher-subject/application-list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
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
                setTeacherSubjects(response);
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });
    }, []);

    const getSubjectName = (subjectId: number) => {
        const subject = subjectList.find(subject => subject.id == subjectId);
        return subject?.name;
    }

    const getTeacherName = (teacherId: number) => {
        const teacher = teacherList.find(teacher => teacher.id == teacherId);
        return teacher?.name;
    }

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

    const acceptApplication = async (id: number) => {
        if(id == 0) {
            acceptMultiApplication();
            return;
        }
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher-subject/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({id: id})
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
                setTeacherSubjects((prevList) => prevList.filter((item) => item.id !== response.id));
                showMessage('Application accepted successfully!', 'success');
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });
    }

    const acceptMultiApplication = async () => {
        const acceptedIds = teacherSubjects.filter((item) => item.selected == true).map((item) => item.id);
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher-subject/accept_multi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({acceptedIds: acceptedIds})
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
                setTeacherSubjects((prevItemList) => prevItemList.filter((item) => !acceptedIds.includes(item.id)));
                showMessage('Application accepted successfully!', 'success');
                setSelectAll(false);
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });
    }

    const rejectApplication = (id: number) => {
        setIsRejectModal(true);
        setRejectId(id);
    }

    const reject = async () => {
        if(rejectId == 0) {
            rejectMultiApplication();
            return;
        }
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher-subject/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({id: rejectId})
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
                setTeacherSubjects((prevList) => prevList.filter((item) => item.id !== response.id));
                showMessage('Application rejected successfully!', 'success');
                setRejectId(-1);
                setIsRejectModal(false);
            })
            .catch((error) => {
                showMessage(error.message, 'error');
                setIsRejectModal(false);
            });
    }
    
    const rejectMultiApplication = async () => {
        const rejectedIds = teacherSubjects.filter((item) => item.selected == true).map((item) => item.id);
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher-subject/reject_multi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({rejectedIds: rejectedIds})
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
                setTeacherSubjects((prevItemList) => prevItemList.filter((item) => !rejectedIds.includes(item.id)));
                showMessage('Application rejected successfully!', 'success');
                setSelectAll(false);
                setIsRejectModal(false);
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });
    }

    const selectTeacherSubject = (item: TeacherSubject) => {
        item.selected = !item.selected;
        setTeacherSubjects((prevItemList) => prevItemList.map((data) => (data.id === item.id ? item : data)));
        setSelectAll(teacherSubjects.every((item) => item.selected === true));
    };

    const selectAllTeacherSubject = () => {
        if (selectAll) {
            setTeacherSubjects((prevItemList) => prevItemList.map((data) => ({ ...data, selected: false })));
            setSelectAll(false);
        } else {
            setTeacherSubjects((prevItemList) => prevItemList.map((data) => ({ ...data, selected: true })));
            setSelectAll(true);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Applications</h2>
                <div className="flex">
                    <div className='flex gap-3'>
                        <button type="button" className="btn btn-primary" onClick={() => acceptApplication(0)}>
                            Accept
                        </button>
                        <button type="button" className="btn btn-primary btn-padding" onClick={() => rejectApplication(0)}>
                            Reject
                        </button>
                    </div>
                </div>
            </div>
            {value === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    {role == 1 && <th className='!pr-0 w-[36px]'><Checkbox onChange={() => selectAllTeacherSubject()} checked={selectAll} /></th>}
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teacherSubjects.map((item: any) => {
                                    return (
                                        <tr key={item.id}>
                                            {role == 1 && <td className='!pr-0 w-[36px]'><Checkbox onChange={() => selectTeacherSubject(item)} checked={item.selected} /></td>}
                                            <td>
                                                <div className="flex items-center">
                                                    {/* <div className="w-max">
                                                        <img src={`/assets/images/subject-profile.png`} className="h-8 w-8 rounded-full object-cover ltr:mr-2 rtl:ml-2" alt="avatar" />
                                                    </div> */}
                                                    <div>{getSubjectName(item.subject_id)}</div>
                                                </div>
                                            </td>
                                            <td>{getTeacherName(item.teacher_id)}</td>
                                            <td>
                                                <div className="flex gap-4 items-center justify-center">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => acceptApplication(item.id)}>
                                                        Accept
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => rejectApplication(item.id)}>
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Transition appear show={isRejectModal} as={Fragment}>
                <Dialog as="div" open={isRejectModal} onClose={() => setIsRejectModal(false)} className="relative z-50">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setIsRejectModal(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Reject Application</div>
                                    <div className="p-5 text-center">
                                        <div className="text-white bg-danger ring-4 ring-danger/30 p-4 rounded-full w-fit mx-auto">
                                            <svg className="mx-auto" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    opacity="0.5"
                                                    d="M9.17065 4C9.58249 2.83481 10.6937 2 11.9999 2C13.3062 2 14.4174 2.83481 14.8292 4"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                                <path d="M20.5001 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path
                                                    d="M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                                <path opacity="0.5" d="M9.5 11L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path opacity="0.5" d="M14.5 11L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <div className="sm:w-3/4 mx-auto mt-5">
                                            <p>Are you sure you want to reject Application?</p>
                                        </div>

                                        <div className="flex justify-center items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setIsRejectModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => reject()}>
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ApplicationLists;
