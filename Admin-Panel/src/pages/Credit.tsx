import { useState, Fragment, useEffect, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import Dropdown from '../components/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import { setPageTitle } from '../store/themeConfigSlice';
import { useAuth } from '../context/AuthContext';
import { Checkbox } from '@mantine/core';
type Group = {
    id: number;
    name: string;
    credit: number;
    selected: boolean;
};

type Student = {
    id: number;
    name: string;
    email: string;
    class_id: string;
    monthly_credit: number;
    selected: boolean;
};

const Credit = () => {
    const dispatch = useDispatch();
    const { user, email, role, subjects, logout } = useAuth();
    const [groupModal, setGroupModal] = useState<any>(false);
    const [studentModal, setStudentModal] = useState<any>(false);
    const [value, setValue] = useState<any>('list');
    const [groupList, setGroupList] = useState<Group[]>([]);
    const [search, setSearch] = useState<any>('');
    const [params, setParams] = useState<Group>({ id: 0, name: '', credit: 0, selected: false });
    const [studentList, setStudentList] = useState<Student[]>([]);
    const [studentCount, setStudentCount] = useState<{ [key: number]: number }>({});
    const [restCredit, setRestCredit] = useState<any>(0);
    const [classRestCredit, setClassRestCredit] = useState<any>(0);
    const [filteredGroup, setFilteredGroup] = useState<Group>({ id: 0, name: 'All', credit: 0, selected: false });
    const [filteredItems, setFilteredItems] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student>({ id: 0, name: '', email: '', class_id: '', monthly_credit: 0, selected: false });
    const [selectAll, setSelectAll] = useState<any>(false);
    const [selectGroupAll, setSelectGroupAll] = useState<any>(false);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    useEffect(() => {
        dispatch(setPageTitle('Groups'));
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/group/list`, {
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
                setGroupList(response.groups);
                setRestCredit(response.rest_credit);
                setFilteredGroup(response.groups[0]);
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/student/list`, {
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
                const updatedStudentList = response.map((student: Student) => ({
                    ...student,
                    selected: false, // Set selected to false
                }));
                setStudentList(updatedStudentList);
                setSelectAll(false);
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });
    }, []);

    useEffect(() => {
        const count: { [key: number]: number } = {};
        studentList.forEach((student) => {
            const classId = parseInt(student.class_id);
            if (count[classId]) {
                count[classId]++;
            } else {
                count[classId] = 1;
            }
        });
        setStudentCount(count);
        const total_credit = studentList
            .filter((student) => Number(student.class_id) === filteredGroup.id) // Filter students by class_id
            .reduce((total, student) => total + student.monthly_credit, 0);
        setClassRestCredit(filteredGroup.credit - total_credit);
    }, [studentList, filteredGroup]);

    useEffect(() => {
        setFilteredItems(() => {
            return studentList.filter((item: any) => {
                return (
                    (item.class_id == filteredGroup.id || filteredGroup.id == 0) && (item.name.toLowerCase().includes(search.toLowerCase()) || item.email.toLowerCase().includes(search.toLowerCase()))
                );
            });
        });
    }, [search, studentList, filteredGroup]);

    useEffect(() => {
        setStudentList(studentList.map((student) => ({ ...student, selected: false })));
        setSelectAll(false);
    }, [filteredGroup]);

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
        setParams({ ...params, [id]: value });
    };

    const changeStudent = (e: any) => {
        const { value, id } = e.target;
        setSelectedStudent({ ...selectedStudent, [id]: value });
    };
    const editGroup = async (group: Group) => {
        setParams(group);
        setGroupModal(true);
    };

    const editStudent = async (student: Student) => {
        setSelectedStudent(student);
        setStudentModal(true);
    };

    const saveGroup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(params.id == 0) {
            saveMultiGroup();
            return;
        }
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/group/allocate_credit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(params),
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
                const updatedGroup = response.group;
                setRestCredit(response.rest_credit);
                const updatedStudentList = response.students.map((student: Student) => ({
                    ...student,
                    selected: false, // Set selected to false
                }));
                setStudentList(updatedStudentList);
                setSelectAll(false);
                if (updatedGroup) {
                    showMessage(`Credit allocated successfully!`, 'success');
                    setGroupList((prevGroupList) => prevGroupList.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)));
                    setFilteredGroup(updatedGroup);
                    setGroupModal(false);
                    setParams({ id: 0, name: '', credit: 0, selected: false });
                } else {
                    showMessage(response.message, 'error');
                }
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    };

    const saveMultiGroup = () => {
        const selectedIds = groupList.filter((group) => group.selected == true).map((group) => group.id);
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/group/allocate_multicredit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ selectedIds: selectedIds, credit: params.credit}),
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
                const updatedGroups = response.groups;
                const updatedStudents = response.students;
                if (updatedGroups) {
                    const updatedGroup = updatedGroups.find((group: Group) => group.id == filteredGroup.id)
                    if(updatedGroup) {
                        setFilteredGroup(updatedGroup);
                    }
                    showMessage(`Credit allocated successfully!`, 'success');
                    setGroupList(updatedGroups.map((group: Group) => ({
                        ...group,
                        selected: false,
                    })));
                    setStudentList(updatedStudents.map((student: Student) => ({
                        ...student,
                        selected: false,
                    })));
                    setSelectGroupAll(false);
                    setSelectAll(false);
                    setGroupModal(false);
                    setParams({ id: 0, name: '', credit: 0, selected: false });
                } else {
                    showMessage(response.message, 'error');
                }
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    };

    const saveStudent = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedStudent.id == 0) {
            saveMultiStudent();
            return;
        }
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/student/allocate_credit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(selectedStudent),
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
                const updatedStudent = response.student;
                if (updatedStudent) {
                    showMessage(`Credit allocated successfully!`, 'success');
                    setStudentList((prevStudentList) => prevStudentList.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)));
                    setStudentModal(false);
                    setSelectedStudent({ id: 0, name: '', email: '', class_id: '', monthly_credit: 0, selected: false });
                } else {
                    showMessage(response.message, 'error');
                }
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    };

    const saveMultiStudent = () => {
        const selectedIds = studentList.filter((student) => student.selected == true).map((student) => student.id);
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/student/allocate_multicredit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ selectedIds: selectedIds, monthly_credit: selectedStudent.monthly_credit, class_id: filteredGroup.id }),
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
                const updatedStudents = response.students;
                if (updatedStudents) {
                    showMessage(`Credit allocated successfully!`, 'success');
                    setStudentList(updatedStudents);
                    setSelectAll(false);
                    setStudentModal(false);
                    setSelectedStudent({ id: 0, name: '', email: '', class_id: '', monthly_credit: 0, selected: false });
                } else {
                    showMessage(response.message, 'error');
                }
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    };

    const getClassNameById = (groupId: number): string => {
        const group = groupList.find((group) => group.id === groupId);
        return group ? group.name : 'Unknown';
    };

    const selectStudent = (student: Student) => {
        student.selected = !student.selected;
        setSelectAll(studentList.filter((student) => Number(student.class_id) === filteredGroup.id).every((student) => student.selected === true));
        setStudentList((prevStudentList) => prevStudentList.map((data) => (data.id === student.id ? student : data)));
    };

    const selectGroup = (group: Group) => {
        group.selected = !group.selected;
        setSelectGroupAll(groupList.every((group) => group.selected === true));
        setGroupList((prevgroupList) => prevgroupList.map((data) => (data.id === group.id ? group : data)));
    };

    const selectAllStudent = () => {
        if (selectAll) {
            setStudentList(studentList.map((student) => (Number(student.class_id) === filteredGroup.id ? { ...student, selected: false } : student)));
            setSelectAll(false);
        } else {
            setStudentList(studentList.map((student) => (Number(student.class_id) === filteredGroup.id ? { ...student, selected: true } : student)));
            setSelectAll(true);
        }
    };

    const selectAllGroup = () => {
        if (selectGroupAll) {
            setGroupList(groupList.map((group) => ({ ...group, selected: false })));
            setSelectGroupAll(false);
        } else {
            setGroupList(groupList.map((group) => ({ ...group, selected: true })));
            setSelectGroupAll(true);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className='flex items-center'>
                    <h2 className="text-xl mr-2">Classes</h2>
                    <button type="button" className="btn btn-primary btn-padding" onClick={() => editGroup({ id: 0, name: 'All', credit: 0, selected: false })}>
                        Group Allocation
                    </button>
                </div>
                <div className="flex items-center">
                    <h2 className="text-xl mr-2">Yearly Credits (Unspent): {restCredit}</h2>
                </div>
            </div>
            <p className="mt-2">You may select a class name as the filter for the next section</p>
            {value === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    {role == 1 && <th className='!pr-0 w-[36px]'><Checkbox onChange={() => selectAllGroup()} checked={selectGroupAll} /></th>}
                                    <th>Name</th>
                                    <th>Students</th>
                                    <th>Monthly Credits (Auto Restored for Every Month)</th>
                                    {role == 1 && <th className="!text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {groupList.map((group: any) => {
                                    return (
                                        <tr key={group.id} onClick={() => setFilteredGroup(group)}>
                                            {role == 1 && <td className='!pr-0 w-[36px]'><Checkbox onChange={() => selectGroup(group)} checked={group.selected} /></td>}
                                            <td>
                                                <div className="flex items-center">
                                                    {/* <div className="w-max">
                                                        <img src={`/assets/images/group-profile.png`} className="h-8 w-8 rounded-full object-cover ltr:mr-2 rtl:ml-2" alt="avatar" />
                                                    </div> */}
                                                    <div>{group.name}</div>
                                                </div>
                                            </td>
                                            <td>{studentCount[group.id] || 0}</td>
                                            <td>{group.credit}</td>
                                            {role == 1 && (
                                                <td>
                                                    <div className="flex gap-4 items-center justify-center">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editGroup(group)}>
                                                            Allocate
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
                <div className='flex items-center'>
                    <h2 className="text-xl mr-2">Students on Class {filteredGroup.name} (Filtered)</h2>
                    <button type="button" className="btn btn-primary btn-padding" onClick={() => editStudent({ id: 0, name: '', email: '', class_id: '', monthly_credit: 0, selected: false })}>
                        Group Allocation
                    </button>
                </div>
                <div className="flex items-center">
                    <h2 className="text-xl mr-2 whitespace-nowrap">Remaining Credits: {classRestCredit}</h2>
                    <input type="text" placeholder="Search Students" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer mr-2" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {value === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    {role == 1 && <th className='!pr-0 w-[36px]'><Checkbox onChange={() => selectAllStudent()} checked={selectAll} /></th>}
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Class</th>
                                    <th>Monthly Credit(Auto Restored)</th>
                                    {role == 1 && <th className="!text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((student: any) => {
                                    return (
                                        <tr key={student.id}>
                                            {role == 1 && <td className='!pr-0 w-[36px]'><Checkbox onChange={() => selectStudent(student)} checked={student.selected} /></td>}
                                            <td className="flex items-center">
                                                <div className="flex items-center w-max">
                                                    <div className="w-max">
                                                        <img src={`/assets/images/user-profile.png`} className="h-8 w-8 rounded-full object-cover ltr:mr-2 rtl:ml-2" alt="avatar" />
                                                    </div>
                                                    <div>{student.name}</div>
                                                </div>
                                            </td>
                                            <td>{student.email}</td>
                                            <td>{getClassNameById(student.class_id)}</td>
                                            <td>{student.monthly_credit}</td>
                                            {role == 1 && (
                                                <td>
                                                    <div className="flex gap-4 items-center justify-center">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editStudent(student)}>
                                                            Allocate
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <Transition appear show={groupModal} as={Fragment}>
                <Dialog as="div" open={groupModal} onClose={() => setGroupModal(false)} className="relative z-50">
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
                                        onClick={() => setGroupModal(false)}
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
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Allocate Class Credit</div>
                                    <div className="p-5">
                                        <form onSubmit={saveGroup}>
                                            <div className="mb-5">
                                                <label htmlFor="credit">Credit</label>
                                                <input id="credit" type="text" placeholder="Enter Credit" className="form-input" value={params.credit} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setGroupModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    Update
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
            <Transition appear show={studentModal} as={Fragment}>
                <Dialog as="div" open={studentModal} onClose={() => setStudentModal(false)} className="relative z-50">
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
                                        onClick={() => setStudentModal(false)}
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
                                        Allocate {selectedStudent.id == 0 ? 'selected students' : 'student'} credit
                                    </div>
                                    <div className="p-5">
                                        <form onSubmit={saveStudent}>
                                            <div className="mb-5">
                                                <label htmlFor="credit">Credit</label>
                                                <input
                                                    id="monthly_credit"
                                                    type="text"
                                                    placeholder="Enter Credit"
                                                    className="form-input"
                                                    value={selectedStudent.monthly_credit}
                                                    onChange={(e) => changeStudent(e)}
                                                />
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setStudentModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    Update
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
        </div>
    );
};

export default Credit;
