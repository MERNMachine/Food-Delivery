import { useState, Fragment, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import Dropdown from '../components/Dropdown';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import { useAuth } from '../context/AuthContext';
import { Checkbox } from '@mantine/core';
import MultiSelect from '../components/MultiSelect';
import ChatHistory from './ChatHistory';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type Student = {
    id: number;
    name: string;
    email: string;
    password: string;
    class_id: number;
    credit: number;
    role: number;
    selected: boolean;
};

type Teacher = {
    id: number;
    name: string;
    email: string;
    password: string;
    subject_ids: number[];
    role: number;
};

type Group = {
    id: number;
    name: string;
};

type Invitation = {
    id: number;
    teacher_id: number;
    subject_id: number;
    student_id: number;
};

interface Subject {
    value: string;
    label: string;
}

interface StudentsProps {
    teacherId: number;
    onCancelChange: () => void;
}
const Students: React.FC<StudentsProps> = ({ teacherId, onCancelChange }) => {
    const dispatch = useDispatch();
    const { user, email, role, subjects, logout } = useAuth();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [addStudentModal, setAddStudentModal] = useState<any>(false);
    const [inviteModal, setInviteModal] = useState<any>(false);
    const [creditModal, setCreditModal] = useState<any>(false);
    const [value, setValue] = useState<any>('list');
    const [studentList, setStudentList] = useState<Student[]>([]);
    const [studentId, setStudentId] = useState<number>(0);
    const [search, setSearch] = useState<any>('');
    const [params, setParams] = useState<Student>({ id: 0, name: '', email: '', password: '', class_id: 0, credit: 0, role: 3, selected: false });
    const [isDeleteStudentModal, setIsDeleteStudentModal] = useState<any>(false);
    const [deletedStudent, setDeletedStudent] = useState<Student>({ id: 0, name: '', email: '', password: '', class_id: 0, credit: 0, role: 3, selected: false });
    const [groupList, setGroupList] = useState<Group[]>([]);
    const [invitationList, setInvitationList] = useState<Invitation[]>([]);
    const [allList, setAllList] = useState<Invitation[]>([]);
    const [changedList, setChangedList] = useState<Invitation[]>([]);
    const [changed, setChanged] = useState<boolean>(false);
    const [loading, setLoading] = useState<any>(false);
    const [teacherImported, setTeacherImported] = useState<any>(false);
    const [studentImported, setStudentImported] = useState<any>(false);
    const [options, setOptions] = useState<Subject[]>([]);
    const [subjectList, setSubjectList] = useState<Subject[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<Subject[]>([]);
    const [invitedStudent, setInvitedStudent] = useState<Student>({ id: 0, name: '', email: '', password: '', class_id: 0, credit: 0, role: 3, selected: false });
    const [inviteTeacher, setInviteTeacher] = useState<Teacher>();
    const [selectedGroup, setSelectedGroup] = useState<Group>({ id: 0, name: '' });
    const [filteredGroup, setFilteredGroup] = useState<Group>({ id: 0, name: 'All' });
    const [filteredItems, setFilteredItems] = useState<Student[]>([]);
    const [selectAll, setSelectAll] = useState<any>(false);
    const [updatedCredit, setUpdatedCredit] = useState<any>(0);

    useEffect(() => {
        dispatch(setPageTitle('Students'));
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
                setStudentList(response);
                setFilteredItems(response);
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/group/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
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
                if (response.groups.length > 0) {
                    setSelectedGroup(response.groups[0]);
                }
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/invitation/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ email: role == 2 ? email : 'admin', teacher_id: teacherId }),
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
                setInvitationList(response.filter);
                setChangedList(response.filter);
                setAllList(response.all);
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
        if (teacherId != 0) {
            fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher/${teacherId}`, {
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
                    setInviteTeacher(response.teacher);
                    getOptions(response.teacher.subject_ids);
                })
                .catch((error) => {
                    // Handle network error
                    showMessage(error.message, 'error');
                });
        } else {
            getOptions(subjects);
        }
    }, []);

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
        if (teacherImported && studentImported) {
            showMessage('Data imported successfully!', 'success');
            setTeacherImported(false);
            setStudentImported(false);
            setLoading(false);
        }
    }, [teacherImported, studentImported]);

    const getOptions = (subject_ids: number[]) => {
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
                const all_subject = response.map((subject: any) => ({
                    value: subject.id,
                    label: subject.name,
                }));
                const options = response
                    .filter((subject: any) => subject_ids.includes(subject.id))
                    .map((subject: any) => ({
                        value: subject.id,
                        label: subject.name,
                    }));
                setSubjectList(all_subject);
                setOptions(options);
            })
            .catch((error) => {
                // Handle network error
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

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const changeGroup = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectedId = parseInt(e.currentTarget.value);
        const selected = groupList.find((group) => group.id === selectedId);
        if (selected) {
            setSelectedGroup(selected);
            setParams({ ...params, class_id: selectedId });
        }
    };

    const changeFilteredGroup = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectedId = parseInt(e.currentTarget.value);
        const selected = groupList.find((group) => group.id === selectedId);
        if (selectedId == 0) {
            setFilteredGroup({ id: 0, name: 'All' });
        } else if (selected) {
            setFilteredGroup(selected);
        }
    };

    const editStudent = async (student: Student) => {
        setParams(student);
        setAddStudentModal(true);
        const selected = groupList.find((group) => group.id === student.class_id);
        if (selected) {
            setSelectedGroup(selected);
        } else {
            setSelectedGroup(groupList[0]);
            setParams({ ...student, class_id: groupList[0].id });
        }
    };
    const addStudent = () => {
        setParams({ id: 0, name: '', email: '', password: '', class_id: groupList[0].id, credit: 0, role: 3, selected: false });
        setSelectedGroup(groupList[0]);
        setAddStudentModal(true);
    };
    const saveStudent = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/student/edit`, {
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
                const updatedStudent = response.student;
                if (updatedStudent) {
                    showMessage(`Student saved successfully!`, 'success');
                    if (params.id) {
                        setStudentList((prevStudentList) => prevStudentList.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)));
                    } else {
                        setStudentList((prevStudentList) => [...prevStudentList, updatedStudent]);
                    }
                    setAddStudentModal(false);
                    setParams({ id: 0, name: '', email: '', password: '', class_id: 0, credit: 0, role: 3, selected: false });
                } else {
                    showMessage(response.message, 'error');
                }
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    };
    const handleDelete = (student: Student) => {
        setDeletedStudent(student);
        setIsDeleteStudentModal(true);
    };
    const deleteStudent = async () => {
        if (deletedStudent.id == 0) {
            deleteMultiStudent();
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/student/delete/${deletedStudent.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                showMessage(`Student deleted successfully!`, 'success');
                setStudentList((prevStudentList) => prevStudentList.filter((student) => student.id !== deletedStudent.id));
            } else {
                if (response.status === 401) {
                    logout();
                }
                showMessage(`Student deletion failed!`, 'error');
            }
            setIsDeleteStudentModal(false);
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof Error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('An unexpected error occurred', 'error');
            }
            setIsDeleteStudentModal(false);
        }
    };

    const deleteMultiStudent = async () => {
        const deletedIds = studentList.filter((student) => student.selected == true).map((student) => student.id);
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/student/delete_multi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ deletedIds: deletedIds }),
            });

            if (response.ok) {
                showMessage(`Student deleted successfully!`, 'success');
                setStudentList((prevStudentList) => prevStudentList.filter((student) => !deletedIds.includes(student.id)));
            } else {
                if (response.status === 401) {
                    logout();
                }
                showMessage(`Student deletion failed!`, 'error');
            }
            setIsDeleteStudentModal(false);
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof Error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('An unexpected error occurred', 'error');
            }
            setIsDeleteStudentModal(false);
        }
    };

    const getClassNameById = (groupId: number): string => {
        const group = groupList.find((group) => group.id === groupId);
        return group ? group.name : 'Unknown';
    };
    const exportToExcel = () => {
        // Prepare data for export (remove sensitive fields like password if needed)
        const dataForExport = studentList.map((student, index) => ({
            UserID: index + 1,
            Name: student.name,
            Email: student.email,
            Password: '',
            Role: 'student',
            Subject: '',
            Class: getClassNameById(student.class_id),
            Credit: student.credit,
        }));

        // Create a new workbook and a worksheet
        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers');

        // Convert the workbook to a binary array
        const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Save the file using file-saver
        const blob = new Blob([workbookBinary], { type: 'application/octet-stream' });
        saveAs(blob, 'StudentList.xlsx');
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (fileExtension === 'csv') {
                parseCSV(file);
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                parseExcel(file);
            } else {
                showMessage('Unsupported file type', 'error');
            }
        }
    };

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                const parsedData = results.data;
                processParsedData(parsedData);
            },
        });
    };

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const headers = parsedData[0] as string[];
            const rows = parsedData.slice(1);

            // Filter out empty rows
            const formattedData = rows
                .filter((row: any) => row.some((cell: any) => cell !== null && cell !== undefined && cell !== ''))
                .map((row: any) =>
                    headers.reduce((acc, header, index) => {
                        acc[header] = row[index];
                        return acc;
                    }, {} as any)
                );

            processParsedData(formattedData);
        };
        reader.readAsArrayBuffer(file);
    };

    const processParsedData = (parsedData: any) => {
        const teachers = parsedData.filter((person: any) => person.Role === 'teacher');
        const students = parsedData.filter((person: any) => person.Role === 'student');
        setLoading(true);
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/student/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(students),
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
                setStudentList(response.students);
                setGroupList(response.groups);
                setStudentImported(true);
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });

        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/teacher/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(teachers),
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
            .then(() => {
                setTeacherImported(true);
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });
    };
    const handleDivClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/document/download-excel`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    throw new Error('Token expired');
                }
                if (response.statusText == 'NOT FOUND') throw new Error('File not exist!');
                throw new Error(response.statusText);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'format.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (error instanceof Error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('An unexpected error occurred', 'error');
            }
        }
    };

    const cancelChanges = () => {
        onCancelChange();
    };

    const saveChanges = (updated: Invitation[]) => {
        const deletedInvitations = invitationList
            .filter((invitation) => !updated.some((changed) => changed.student_id == invitation.student_id && changed.subject_id == invitation.subject_id))
            .map((invitation) => invitation.id);
        const newInvitations = updated.filter((changed) => !invitationList.some((invitation) => changed.student_id == invitation.student_id && changed.subject_id == invitation.subject_id));
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/invitation/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ teacher: role == 1 ? inviteTeacher?.email : email, deleted_ids: deletedInvitations, invited_ids: newInvitations }),
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
                setInvitationList(response.invitations);
                setChangedList(response.invitations);
                setAllList(response.all);
                setChanged(false);
                showMessage('Saved Successfully!', 'success');
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    };

    const showInviteModal = (student: Student) => {
        setInviteModal(true);
        setInvitedStudent(student);
        setSelectedOptions(options.filter((option) => invitationList.some((invitation) => invitation.subject_id == parseInt(option.value) && invitation.student_id == student.id)));
    };

    const optionChange = (selected: Subject[]) => {
        setSelectedOptions(selected);
    };

    const inviteStudent = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        setChanged(true);
        if (invitedStudent.id == 0) {
            const updated = [...invitationList];
            selectedOptions.forEach((subject) => {
                filteredItems.forEach((student) => {
                    if (!updated.some((invitation) => invitation.subject_id == parseInt(subject.value) && invitation.student_id == student.id)) {
                        updated.push({ id: 0, teacher_id: 0, subject_id: parseInt(subject.value), student_id: student.id });
                    }
                });
            });
            setInviteModal(false);
            saveChanges(updated);
        } else {
            const updated = invitationList.filter((invitation) => invitation.student_id !== invitedStudent.id);
            selectedOptions.forEach((subject) => {
                updated.push({ id: 0, teacher_id: 0, subject_id: parseInt(subject.value), student_id: invitedStudent.id });
            });
            setInviteModal(false);
            saveChanges(updated);
        }
    };

    const inviteAll = () => {
        setInviteModal(true);
        setInvitedStudent({ id: 0, name: 'All', email: '', password: '', class_id: 0, credit: 0, role: 3, selected: false });
        setSelectedOptions([]);
    };

    const getSubjectNamesById = (student_id: number): string => {
        const subject_ids = allList.filter((invitation) => invitation.student_id == student_id).map((invitation) => invitation.subject_id);
        const selected = subjectList.filter((subject) => subject_ids.includes(Number(subject.value)));
        return selected.map((option) => option.label).join(', ');
    };

    const selectStudent = (student: Student) => {
        student.selected = !student.selected;
        setStudentList((prevStudentList) => prevStudentList.map((data) => (data.id === student.id ? student : data)));
        setSelectAll(studentList.every((student) => student.selected === true));
    };

    const selectAllStudent = () => {
        if (selectAll) {
            setStudentList((prevStudentList) => prevStudentList.map((data) => ({ ...data, selected: false })));
            setSelectAll(false);
        } else {
            setStudentList((prevStudentList) => prevStudentList.map((data) => ({ ...data, selected: true })));
            setSelectAll(true);
        }
    };

    const updateCredit = async () => {
        const selectedIds = studentList.filter((student) => student.selected == true).map((student) => student.id);
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/student/update_credit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({selectedIds: selectedIds, credit: updatedCredit}),
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
                const updatedStudent = response.students;
                if (updatedStudent) {
                    showMessage(`Students' credit updated successfully!`, 'success');
                    setCreditModal(false);
                    setStudentList(updatedStudent);
                } else {
                    showMessage(response.message, 'error');
                }
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    }
    return (
        <div>
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent border-solid rounded-full animate-spin mt-4"></div>
                </div>
            )}
            {studentId == 0 && <div className="flex items-center justify-between flex-wrap gap-4">
                {teacherId == 0 && <h2 className="text-xl">Students</h2>}
                {teacherId != 0 && <h2 className="text-xl">Teacher / {inviteTeacher?.name}</h2>}
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div className="dropdown">
                            <Dropdown
                                placement={'bottom-start'}
                                btnClassName="btn btn-outline-primary dropdown-toggle w-20"
                                button={
                                    <>
                                        {filteredGroup.name}
                                        <span>
                                            <svg className="w-4 h-4 ltr:ml-1 rtl:mr-1 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19 9L12 15L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </>
                                }
                            >
                                <ul className="!min-w-[170px]">
                                    <li key="0">
                                        <button id="group" type="button" value="0" onClick={changeFilteredGroup}>
                                            All
                                        </button>
                                    </li>
                                    {groupList.map((group) => (
                                        <li key={group.id}>
                                            <button id="group" type="button" value={group.id.toString()} onClick={changeFilteredGroup}>
                                                {group.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </Dropdown>
                        </div>
                        <div className="relative">
                            <input type="text" placeholder="Search Students" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                            <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="11.5" cy="11.5" r="9.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5"></circle>
                                    <path d="M18.5 18.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    {role == 1 && teacherId == 0 && (
                        <div className="flex mb:justify-between mb:gap-0 gap-3">
                            <button type="button" className="btn btn-primary btn-padding" onClick={addStudent}>
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
                                Add
                            </button>
                            <button type="button" className="btn btn-primary btn-padding" onClick={handleDivClick}>
                                <svg className="ltr:mr-2 rtl:ml-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path d="M12 16V3M12 3L16 7.375M12 3L8 7.375" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Import
                            </button>
                            <button type="button" className="btn btn-primary btn-padding" onClick={exportToExcel}>
                                <svg className="ltr:mr-2 rtl:ml-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        opacity="0.5"
                                        d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ></path>
                                    <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                                Export
                            </button>
                            <button type="button" className="btn btn-primary btn-padding" onClick={handleDownload}>
                                <svg className="ltr:mr-2 rtl:ml-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        opacity="0.5"
                                        d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ></path>
                                    <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                                Format
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-padding"
                                onClick={() => handleDelete({ id: 0, name: '', email: '', password: '', class_id: 0, credit: 0, role: 3, selected: false })}
                            >
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
                            <button
                                type="button"
                                className="btn btn-primary btn-padding"
                                onClick={() => setCreditModal(true)}
                            >
                                Credit
                            </button>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
                        </div>
                    )}
                    {(role == 2 || teacherId != 0) && (
                        <button type="button" className="btn btn-primary btn-padding" onClick={inviteAll}>
                            Invite All
                        </button>
                    )}
                </div>
            </div>}
            {studentId > 0 && <ChatHistory studentId={studentId} backToStudent={() => setStudentId(0)}></ChatHistory>}
            {value === 'list' && studentId == 0 && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th className='!pr-0 w-[36px]'><Checkbox onChange={() => selectAllStudent()} checked={selectAll} /></th>
                                    <th>Name</th>
                                    {teacherId == 0 && <th>Email</th>}
                                    <th>Subjects</th>
                                    <th>Class</th>
                                    {teacherId == 0 && <th>Current Credits</th>}
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((student: any) => {
                                    return (
                                        <tr key={student.id}>
                                            <td className='!pr-0 w-[36px]'><Checkbox onChange={() => selectStudent(student)} checked={student.selected} /></td>
                                            <td>
                                                <div className="flex items-center">
                                                    <div className="w-max">
                                                        <img src={`/assets/images/user-profile.png`} className="h-8 w-8 rounded-full object-cover ltr:mr-2 rtl:ml-2" alt="avatar" />
                                                    </div>
                                                    <div>{student.name}</div>
                                                </div>
                                            </td>
                                            {teacherId == 0 && <td>{student.email}</td>}
                                            <td>{getSubjectNamesById(student.id)}</td>
                                            <td>{getClassNameById(student.class_id)}</td>
                                            {teacherId == 0 && <td>{student.credit}</td>}
                                            <td>
                                                <div className="flex gap-4 items-center justify-center">
                                                    {(role == 2 || teacherId != 0) && (
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => showInviteModal(student)}>
                                                            Invite
                                                        </button>
                                                    )}
                                                    {role == 1 && teacherId == 0 && (
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editStudent(student)}>
                                                            Edit
                                                        </button>
                                                    )}
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setStudentId(student.id)}>
                                                        Chat
                                                    </button>
                                                    {role == 1 && teacherId == 0 && (
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(student)}>
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
            {teacherId != 0 && (
                <div className="flex justify-end items-center mt-8">
                    <button type="button" className="btn btn-outline-danger" onClick={() => cancelChanges()}>
                        Cancel
                    </button>
                </div>
            )}
            <Transition appear show={inviteModal} as={Fragment}>
                <Dialog as="div" open={inviteModal} onClose={() => setInviteModal(false)} className="relative z-50">
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
                                        onClick={() => setInviteModal(false)}
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
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Invite Student({invitedStudent.name})</div>
                                    <div className="p-5">
                                        <form onSubmit={inviteStudent}>
                                            <div className="mb-5 flex items-center">
                                                <label htmlFor="name" className="mr-5">
                                                    Subject
                                                </label>
                                                <MultiSelect options={options} selectedOptions={selectedOptions} onChange={optionChange} />
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddStudentModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    Invite
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
            <Transition appear show={addStudentModal} as={Fragment}>
                <Dialog as="div" open={addStudentModal} onClose={() => setAddStudentModal(false)} className="relative z-50">
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
                                        onClick={() => setAddStudentModal(false)}
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
                                        {params.id > 0 ? 'Edit Student' : 'Add Student'}
                                    </div>
                                    <div className="p-5">
                                        <form onSubmit={saveStudent}>
                                            <div className="mb-5">
                                                <label htmlFor="name">Name</label>
                                                <input id="name" type="text" placeholder="Enter Name" className="form-input" value={params.name} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="email">Email</label>
                                                <input id="email" type="email" placeholder="Enter Email" className="form-input" value={params.email} onChange={(e) => changeValue(e)} />
                                            </div>
                                            {params.id > 0 && (
                                                <div className="mb-5">
                                                    <label htmlFor="password">Credit</label>
                                                    <input id="credit" type="text" placeholder="Enter credit number" className="form-input" value={params.credit} onChange={(e) => changeValue(e)} />
                                                </div>
                                            )}
                                            <div className="mb-5">
                                                <label htmlFor="password">Password</label>
                                                <input id="password" type="password" placeholder="Enter Password" className="form-input" value={params.password} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5 flex">
                                                <label htmlFor="group" className="mb-0 align-self-center mr-5">
                                                    Class
                                                </label>
                                                <div className="dropdown">
                                                    <Dropdown
                                                        placement={'top-start'}
                                                        btnClassName="btn btn-outline-primary dropdown-toggle"
                                                        button={
                                                            <>
                                                                {selectedGroup.name}
                                                                <span>
                                                                    <svg className="w-4 h-4 ltr:ml-1 rtl:mr-1 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M19 9L12 15L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </span>
                                                            </>
                                                        }
                                                    >
                                                        <ul className="!min-w-[170px]">
                                                            {groupList.map((group) => (
                                                                <li key={group.id}>
                                                                    <button id="group" type="button" value={group.id.toString()} onClick={changeGroup}>
                                                                        {group.name}
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddStudentModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    {params.id > 0 ? 'Update' : 'Add'}
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
            <Transition appear show={isDeleteStudentModal} as={Fragment}>
                <Dialog as="div" open={isDeleteStudentModal} onClose={() => setIsDeleteStudentModal(false)} className="relative z-50">
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
                                        onClick={() => setIsDeleteStudentModal(false)}
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
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Delete Student</div>
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
                                        <div className="sm:w-3/4 mx-auto mt-5">Are you sure you want to delete student?</div>

                                        <div className="flex justify-center items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setIsDeleteStudentModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={deleteStudent}>
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
            <Transition appear show={creditModal} as={Fragment}>
                <Dialog as="div" open={creditModal} onClose={() => setCreditModal(false)} className="relative z-50">
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
                                        onClick={() => setCreditModal(false)}
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
                                        Update selected students credit
                                    </div>
                                    <div className="p-5">
                                        <form onSubmit={updateCredit}>
                                            <div className="mb-5">
                                                <label htmlFor="credit">Credit</label>
                                                <input
                                                    id="monthly_credit"
                                                    type="text"
                                                    placeholder="Enter Credit"
                                                    className="form-input"
                                                    value={updatedCredit}
                                                    onChange={(e) => setUpdatedCredit(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setCreditModal(false)}>
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

export default Students;
