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
    created_by: number;
    selected: boolean;
};

type Teacher = {
    id: number;
    name: string;
    email: string;
    password: string;
    role: number;
};

type TeacherSubject = {
    teacher_id: number;
    subject_id: number;
};

const Subjects = () => {
    const dispatch = useDispatch();
    const { myId, user, email, role, subjects, logout } = useAuth();
    const [addSubjectModal, setAddSubjectModal] = useState<any>(false);
    const [isDeleteSubjectModal, setIsDeleteSubjectModal] = useState<any>(false);
    const [transferSubjectModal, setTransferSubjectModal] = useState<any>(false);
    const [value, setValue] = useState<any>('list');
    const [subjectList, setSubjectList] = useState<Subject[]>([]);
    const [search, setSearch] = useState<any>('');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher>({ id: 0, name: '', email: '', password: '', role: 2 });
    const [selectedSubject, setSelectedSubject] = useState<Subject>({ id: 0, name: '', prompt: '', language: 1, created_by: 1, selected: false });
    const [deletedSubject, setDeletedSubject] = useState<Subject>({ id: 0, name: '', prompt: '', language: 1, created_by: 1, selected: false });
    const [teacherList, setTeacherList] = useState<Teacher[]>([]);
    const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
    const [language, setLanguage] = useState<number>(1);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
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
                setSelectedTeacher(response[0]);
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });

        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher-subject/list`, {
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

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setSelectedSubject({ ...selectedSubject, [id]: value });
    };

    const editSubject = async (subject: Subject) => {
        setSelectedSubject(subject);
        setAddSubjectModal(true);
    };

    const transferSubject = async (subject: Subject) => {
        setSelectedSubject(subject);
        setTransferSubjectModal(true);
    };

    const addSubject = () => {
        setSelectedSubject({ id: 0, name: '', prompt: '', language: 1, created_by: 1, selected: false });
        setAddSubjectModal(true);
    };

    const saveSubject = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/subject/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(selectedSubject),
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
                const updatedSubject = response.subject;
                if (updatedSubject) {
                    showMessage(`Subject saved successfully!`, 'success');
                    if (selectedSubject.id) {
                        setSubjectList((prevSubjectList) => prevSubjectList.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)));
                    } else {
                        setSubjectList((prevSubjectList) => [...prevSubjectList, updatedSubject]);
                    }
                    setAddSubjectModal(false);
                    setSelectedSubject({ id: 0, name: '', prompt: '', language: 1, created_by: 1, selected: false });
                    if(response.teachersubjects) {
                        setTeacherSubjects(response.teachersubjects)
                    }
                } else {
                    showMessage(response.message, 'error');
                }
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    };

    const transfer = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/subject/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(selectedSubject),
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
                const updatedSubject = response.subject;
                if (updatedSubject) {
                    showMessage(`Subject transfered successfully!`, 'success');
                    if (selectedSubject.id) {
                        setSubjectList((prevSubjectList) => prevSubjectList.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)));
                    } else {
                        setSubjectList((prevSubjectList) => [...prevSubjectList, updatedSubject]);
                    }
                    setTransferSubjectModal(false);
                    setSelectedSubject({ id: 0, name: '', prompt: '', language: 1, created_by: 1, selected: false });
                } else {
                    showMessage(response.message, 'error');
                }
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    };

    const handleDelete = (subject: Subject) => {
        setDeletedSubject(subject);
        setIsDeleteSubjectModal(true);
    };

    const deleteSubject = async () => {
        if (deletedSubject.id == 0) {
            deleteMultiSubject();
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/subject/delete/${deletedSubject.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                showMessage(`Subject deleted successfully!`, 'success');
                setSubjectList((prevSubjectList) => prevSubjectList.filter((subject) => subject.id !== deletedSubject.id));
            } else {
                if (response.status === 401) {
                    logout();
                }
                showMessage(`Subject deletion failed!`, 'error');
            }
            setIsDeleteSubjectModal(false);
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof Error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('An unexpected error occurred', 'error');
            }
            setIsDeleteSubjectModal(false);
        }
    };

    const deleteMultiSubject = async () => {
        const deletedIds = subjectList.filter((subject) => subject.selected == true).map((subject) => subject.id);
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/subject/delete_multi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ deletedIds: deletedIds }),
            });

            if (response.ok) {
                showMessage(`Subject deleted successfully!`, 'success');
                setSubjectList((prevSubjectList) => prevSubjectList.filter((subject) => !deletedIds.includes(subject.id)));
            } else {
                if (response.status === 401) {
                    logout();
                }
                showMessage(`Subject deletion failed!`, 'error');
            }
            setIsDeleteSubjectModal(false);
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof Error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('An unexpected error occurred', 'error');
            }
            setIsDeleteSubjectModal(false);
        }
    };

    const getTeacherList = (subjectId: number): string => {
        const filteredSubjects = teacherSubjects.filter((subject) => subject.subject_id == subjectId);
        const teacherNames = filteredSubjects
            .map((ts) => {
                const teacher = teacherList.find((teacher) => teacher.id === ts.teacher_id);
                return teacher ? teacher.name : null;
            })
            .filter((name) => name !== null); // Remove any null values

        return teacherNames.join(', ');
    };

    const checkPermission = (subject: Subject) => {
        const teacher = teacherList.filter((teacher) => teacher.email == email);
        if (teacher.length > 0) {
            const subjects = teacherSubjects.filter((sub) => sub.subject_id == subject.id && sub.teacher_id == teacher[0].id);
            if (subjects.length > 0) return true;
        }
        return false;
    };

    const getTeacherName = (id: Number) => {
        const teacher = teacherList.find((teacher) => teacher.id == id);
        if (teacher) {
            return teacher?.name;
        } else {
            return 'Admin';
        }
    };

    const selectSubject = (subject: Subject) => {
        subject.selected = !subject.selected;
        setSubjectList((prevSubjectList) => prevSubjectList.map((data) => (data.id === subject.id ? subject : data)));
        setSelectAll(subjectList.every((subject) => subject.selected === true));
    };

    const selectAllSubject = () => {
        if (selectAll) {
            setSubjectList((prevSubjectList) => prevSubjectList.map((data) => ({ ...data, selected: false })));
            setSelectAll(false);
        } else {
            setSubjectList((prevSubjectList) => prevSubjectList.map((data) => ({ ...data, selected: true })));
            setSelectAll(true);
        }
    };

    const changeTeacher = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectedId = parseInt(e.currentTarget.value);
        const selected = teacherList.find((teacher) => teacher.id === selectedId);
        if (selected) {
            setSelectedTeacher(selected);
            setSelectedSubject({ ...selectedSubject, created_by: selectedId })
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Subjects</h2>
                <div className="flex">
                    <div className="flex gap-3">
                        <button type="button" className="btn btn-primary" onClick={addSubject}>
                            <svg className="ltr:mr-2 rtl:ml-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                                <path
                                    opacity="0.5"
                                    d="M18 17.5C18 19.9853 18 22 10 22C2 22 2 19.9853 2 17.5C2 15.0147 5.58172 13 10 13C14.4183 13 18 15.0147 18 17.5Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                />
                                <path d="M21 10H19M19 10H17M19 10L19 8M19 10L19 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Add Subject
                        </button>
                        <button type="button" className="btn btn-primary btn-padding" onClick={() => handleDelete({ id: 0, name: '', prompt: '', language: 1, created_by: 1, selected: false })}>
                            <svg className="ltr:mr-2 rtl:ml-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    opacity="0.5"
                                    d="M11.5956 22.0001H12.4044C15.1871 22.0001 16.5785 22.0001 17.4831 21.1142C18.3878 20.2283 18.4803 18.7751 18.6654 15.8686L18.9321 11.6807C19.0326 10.1037 19.0828 9.31524 18.6289 8.81558C18.1751 8.31592 17.4087 8.31592 15.876 8.31592H8.12405C6.59127 8.31592 5.82488 8.31592 5.37105 8.81558C4.91722 9.31524 4.96744 10.1037 5.06788 11.6807L5.33459 15.8686C5.5197 18.7751 5.61225 20.2283 6.51689 21.1142C7.42153 22.0001 8.81289 22.0001 11.5956 22.0001Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M3 6.38597C3 5.90152 3.34538 5.50879 3.77143 5.50879L6.43567 5.50832C6.96502 5.49306 7.43202 5.11033 7.61214 4.54412C7.61688 4.52923 7.62232 4.51087 7.64185 4.44424L7.75665 4.05256C7.8269 3.81241 7.8881 3.60318 7.97375 3.41617C8.31209 2.67736 8.93808 2.16432 9.66147 2.03297C9.84457 1.99972 10.0385 1.99986 10.2611 2.00002H13.7391C13.9617 1.99986 14.1556 1.99972 14.3387 2.03297C15.0621 2.16432 15.6881 2.67736 16.0264 3.41617C16.1121 3.60318 16.1733 3.81241 16.2435 4.05256L16.3583 4.44424C16.3778 4.51087 16.3833 4.52923 16.388 4.54412C16.5682 5.11033 17.1278 5.49353 17.6571 5.50879H20.2286C20.6546 5.50879 21 5.90152 21 6.38597C21 6.87043 20.6546 7.26316 20.2286 7.26316H3.77143C3.34538 7.26316 3 6.87043 3 6.38597Z"
                                    fill="currentColor"
                                />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9.42543 11.4815C9.83759 11.4381 10.2051 11.7547 10.2463 12.1885L10.7463 17.4517C10.7875 17.8855 10.4868 18.2724 10.0747 18.3158C9.66253 18.3592 9.29499 18.0426 9.25378 17.6088L8.75378 12.3456C8.71256 11.9118 9.01327 11.5249 9.42543 11.4815Z"
                                    fill="currentColor"
                                />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M14.5747 11.4815C14.9868 11.5249 15.2875 11.9118 15.2463 12.3456L14.7463 17.6088C14.7051 18.0426 14.3376 18.3592 13.9254 18.3158C13.5133 18.2724 13.2126 17.8855 13.2538 17.4517L13.7538 12.1885C13.795 11.7547 14.1625 11.4381 14.5747 11.4815Z"
                                    fill="currentColor"
                                />
                            </svg>
                            Delete
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
                                    {role == 1 && <th className='!pr-0 w-[36px]'><Checkbox onChange={() => selectAllSubject()} checked={selectAll} /></th>}
                                    <th>Name</th>
                                    <th>Teachers</th>
                                    <th>Language</th>
                                    <th>Created by</th>
                                    <th className='max-w-[250px]'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjectList.map((subject: any) => {
                                    return (
                                        <tr key={subject.id}>
                                            {role == 1 && <td className='!pr-0 w-[36px]'><Checkbox onChange={() => selectSubject(subject)} checked={subject.selected} /></td>}
                                            <td>
                                                <div className="flex items-center">
                                                    {/* <div className="w-max">
                                                        <img src={`/assets/images/subject-profile.png`} className="h-8 w-8 rounded-full object-cover ltr:mr-2 rtl:ml-2" alt="avatar" />
                                                    </div> */}
                                                    <div>{subject.name}</div>
                                                </div>
                                            </td>
                                            <td>{getTeacherList(subject.id)}</td>
                                            <td>{subject.language == 1 ? 'Cantonese' : 'English'}</td>
                                            <td>{getTeacherName(subject.created_by)}</td>
                                            <td className='max-w-[250px]'>
                                                <div className="flex gap-4 items-center">
                                                    {(checkPermission(subject) || role == 1) && (
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editSubject(subject)}>
                                                            Edit
                                                        </button>
                                                    )}
                                                    {(subject.created_by == myId) && (
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => transferSubject(subject)}>
                                                            Transfer
                                                        </button>
                                                    )}
                                                    {role == 1 && (
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(subject)}>
                                                            Delete
                                                        </button>
                                                    )}
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

            <Transition appear show={addSubjectModal} as={Fragment}>
                <Dialog as="div" open={addSubjectModal} onClose={() => setAddSubjectModal(false)} className="relative z-50">
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
                                        onClick={() => setAddSubjectModal(false)}
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
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {selectedSubject.id > 0 ? 'Edit Subject' : 'Add Subject'}
                                    </div>
                                    <div className="p-5">
                                        <form onSubmit={saveSubject}>
                                            <div className="mb-5">
                                                <label htmlFor="name">Name</label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Enter Name"
                                                    className="form-input"
                                                    value={selectedSubject.name}
                                                    onChange={(e) => changeValue(e)}
                                                />{' '}
                                                <label htmlFor="prompt">Prompt</label>
                                                <textarea
                                                    id="prompt"
                                                    name="prompt"
                                                    className="form-textarea min-h-[130px]"
                                                    placeholder="Enter Prompt"
                                                    value={selectedSubject.prompt || ''}
                                                    onChange={(e) => changeValue(e)}
                                                ></textarea>
                                                <div className="flex items-center">
                                                    <label htmlFor="language" className="mr-5">
                                                        Language
                                                    </label>
                                                    <div className="dropdown">
                                                        <Dropdown
                                                            placement={'top-start'}
                                                            btnClassName="btn btn-outline-primary dropdown-toggle"
                                                            button={
                                                                <>
                                                                    {selectedSubject.language == 1 ? 'Cantonese' : 'English'}
                                                                    <span>
                                                                        <svg className="w-4 h-4 ltr:ml-1 rtl:mr-1 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M19 9L12 15L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                    </span>
                                                                </>
                                                            }
                                                        >
                                                            <ul className="!min-w-[170px]">
                                                                <li key="1">
                                                                    <button id="language" type="button" value="1" onClick={(e) => changeValue(e)}>
                                                                        Cantonese
                                                                    </button>
                                                                </li>
                                                                <li key="2">
                                                                    <button id="language" type="button" value="2" onClick={(e) => changeValue(e)}>
                                                                        English
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </Dropdown>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddSubjectModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    {selectedSubject.id > 0 ? 'Update' : 'Add'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={transferSubjectModal} as={Fragment}>
                <Dialog as="div" open={transferSubjectModal} onClose={() => setTransferSubjectModal(false)} className="relative z-50">
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
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg w-full max-w-lg text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setTransferSubjectModal(false)}
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
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Transfer Subject</div>
                                    <div className="p-5">
                                        <form onSubmit={transfer}>
                                            <div className="mb-5">
                                                <div className="mb-5 flex">
                                                    <label htmlFor="name" className="mb-0 align-self-center mr-5">Teacher</label>
                                                    <div className="dropdown">
                                                        <Dropdown
                                                            placement={'down-start'}
                                                            btnClassName="btn btn-outline-primary dropdown-toggle"
                                                            button={
                                                                <>
                                                                    {selectedTeacher.name}
                                                                    <span>
                                                                        <svg className="w-4 h-4 ltr:ml-1 rtl:mr-1 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M19 9L12 15L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        </svg>
                                                                    </span>
                                                                </>
                                                            }
                                                        >
                                                            <ul className="!min-w-[170px] max-h-[200px] overflow-y-auto">
                                                                {teacherList.map((teacher) => (
                                                                    <li key={teacher.id}>
                                                                        <button id="teacher" type="button" value={teacher.id.toString()} onClick={changeTeacher}>
                                                                            {teacher.name}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </Dropdown>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setTransferSubjectModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    Transfer
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={isDeleteSubjectModal} as={Fragment}>
                <Dialog as="div" open={isDeleteSubjectModal} onClose={() => setIsDeleteSubjectModal(false)} className="relative z-50">
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
                                        onClick={() => setIsDeleteSubjectModal(false)}
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
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Delete Subject</div>
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
                                            <p>Are you sure you want to delete Subject?</p>
                                            <p>All uploaded documents will be deleted.</p>
                                            <p>Do you agree?</p>
                                        </div>

                                        <div className="flex justify-center items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setIsDeleteSubjectModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={deleteSubject}>
                                                Delete
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

export default Subjects;
