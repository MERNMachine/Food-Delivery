import { useState, useEffect, useRef, ChangeEvent, Fragment, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import Dropdown from '../components/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_APP_BACKEND_URL}/uploads`, {
    transports: ['websocket'],
    // withCredentials: true, // Uncomment if needed for CORS
});

socket.on('connect', () => {
    console.log('Connected to WebSocket server');
});

type Document = {
    id: number;
    name: string;
    path: string;
    subject_id: number;
    created_at: Date;
    selected: boolean;
    isDeleting: boolean;
    isDownloading: boolean;
};

type uploadingDoc = {
    id: string;
    progress: number;
    stage: string;
};

type Subject = {
    id: number;
    name: string;
};
const Documents = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { user, email, role, subjects, logout } = useAuth();
    const [docList, setDoclist] = useState<Document[]>([]);
    const [subjectList, setSubjectList] = useState<Subject[]>([]);
    const [isDeleteDocModal, setIsDeleteDocModal] = useState<any>(false);
    const [isSelectSubjectModal, setIsSelectSubjectModal] = useState<any>(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject>({ id: 0, name: 'All' });
    const [filteredSubject, setFilteredSubject] = useState<Subject>({ id: 0, name: 'All' });
    const [deletedDoc, setDeletedDoc] = useState<number>(0);
    const [downloadDoc, setDownloadDoc] = useState<number>(0);
    const [uploadedFile, setUploadedFile] = useState<any>(false);
    const [uploadProgress, setUploadProgress] = useState<uploadingDoc[]>([]);
    const [selectAll, setSelectAll] = useState<any>(false);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Documents'));
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/document/list`, {
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
                setDoclist(response);
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });

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
                const filteredSubjects = response.filter((subject: Subject) => subjects.includes(subject.id));
                setSubjectList(filteredSubjects);
                if(filteredSubjects) {
                    setSelectedSubject(filteredSubjects[0]);
                }
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    }, [subjects]);

    const uploadDoc = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        const timestamp = `${Date.now()}`;
        formData.append('id', timestamp);
        formData.append('subject_id', String(selectedSubject.id));
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentCompleted = Math.round((event.loaded * 100) / event.total);
                fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/document/upload-progress`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        progress: percentCompleted,
                        fileId: timestamp, // Use a unique identifier if available
                    }),
                });
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                console.log('File upload completed');
            } else {
                console.error('File upload failed');
                showMessage('File upload failed!', 'error');
                setUploadProgress((prevProgress) => {
                    return prevProgress.filter((doc) => doc.id !== timestamp);
                });
            }
        });

        xhr.addEventListener('error', () => {
            console.error('Error during file upload');
            showMessage('File upload failed!', 'error');
            setUploadProgress((prevProgress) => {
                return prevProgress.filter((doc) => doc.id !== timestamp);
            });
        });

        xhr.open('POST', `${import.meta.env.VITE_APP_BACKEND_URL}/document/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
        xhr.send(formData);
    };
    const handleFileUpload = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!uploadedFile) return;

        setIsSelectSubjectModal(false);
        uploadDoc(uploadedFile);
    };

    const handleDivClick = () => {
        if (subjects.length == 0) {
            showMessage('You assigned no subject.', 'error');
        } else {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsSelectSubjectModal(true);
            setUploadedFile(file);
            event.target.value = '';
        }
    };
    const handleDelete = (id: number) => {
        setDeletedDoc(id);
        setIsDeleteDocModal(true);
    };
    const deleteDoc = async () => {
        setDoclist((prevDocList) => prevDocList.map((data) => (data.id === deletedDoc ? { ...data, isDeleting: true } : data)));
        setIsDeleteDocModal(false);
        if (deletedDoc == 0) {
            deleteMultiDoc();
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/document/delete/${deletedDoc}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                showMessage('Document deleted successfully!', 'success');
                setDoclist((prevDocList) => prevDocList.filter((doc) => doc.id !== deletedDoc));
            } else {
                if (response.status === 401) {
                    logout();
                }
                console.log(response);
                showMessage('Document deletion failed!', 'error');
                setDoclist((prevDocList) => prevDocList.map((doc) => (doc.id == deletedDoc ? { ...doc, isDeleting: false } : doc)));
            }
            setDeletedDoc(0);
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof Error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('An unexpected error occurred', 'error');
            }
            setDeletedDoc(0);
        }
    };

    const deleteMultiDoc = async () => {
        const deletedIds = docList.filter((doc) => doc.selected == true).map((doc) => doc.id);
        setDoclist((prevDocList) => prevDocList.map((data) => (data.selected ? { ...data, isDeleting: true } : data)));
        setIsDeleteDocModal(false);
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/document/delete_multi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ deletedIds: deletedIds }),
            });

            if (response.ok) {
                showMessage('Document deleted successfully!', 'success');
                setDoclist((prevDocList) => prevDocList.filter((doc) => !deletedIds.includes(doc.id)));
            } else {
                if (response.status === 401) {
                    logout();
                }
                else if (response.status === 404) {
                    const data = await response.json();
                    const errorMessage = data.message || 'Document deletion failed!';
                    showMessage(errorMessage, 'error');
                }
                else {
                    showMessage('Document deletion failed!', 'error');
                }
            }
            setDeletedDoc(0);
        } catch (error) {
            console.error('Error:', error);
            if (error instanceof Error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('An unexpected error occurred', 'error');
            }
            setDeletedDoc(0);
        }
    };

    const handleDownload = async (id: number, name: string) => {
        setDoclist((prevDocList) => prevDocList.map((doc) => (doc.id == id ? { ...doc, isDownloading: true } : doc)));
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/document/download/${id}`, {
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
            a.download = name; // you might want to extract the filename from the response or the document object
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setDownloadDoc(0);
            setDoclist((prevDocList) => prevDocList.map((doc) => (doc.id == id ? { ...doc, isDownloading: false } : doc)));
        } catch (error) {
            if (error instanceof Error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('An unexpected error occurred', 'error');
            }
            setDownloadDoc(0);
            setDoclist((prevDocList) => prevDocList.map((doc) => (doc.id == id ? { ...doc, isDownloading: false } : doc)));
        }
    };

    const downloadMultiDoc = async () => {
        const downloadDocs = docList.filter((doc) => doc.selected == true).map((doc) => doc.id);
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/document/download_multi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({docIds: downloadDocs})
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
            a.download = "Documents.zip"; // you might want to extract the filename from the response or the document object
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setDownloadDoc(0);
            setDoclist((prevDocList) => prevDocList.map((doc) => (downloadDocs.includes(doc.id) ? { ...doc, isDownloading: false } : doc)));
        } catch (error) {
            if (error instanceof Error) {
                showMessage(error.message, 'error');
            } else {
                showMessage('An unexpected error occurred', 'error');
            }
            setDownloadDoc(0);
            setDoclist((prevDocList) => prevDocList.map((doc) => (downloadDocs.includes(doc.id) ? { ...doc, isDownloading: false } : doc)));
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

    const changeValue = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectedId = parseInt(e.currentTarget.value);
        const selected = subjectList.find((subject) => subject.id === selectedId);
        if (selected) {
            setSelectedSubject(selected);
        }
    };

    const changeSubject = (e: React.MouseEvent<HTMLButtonElement>) => {
        const selectedId = parseInt(e.currentTarget.value);
        if (selectedId == 0) {
            setFilteredSubject({ id: 0, name: 'All' });
        } else {
            const selected = subjectList.find((subject) => subject.id === selectedId);
            if (selected) {
                setFilteredSubject(selected);
                setDoclist((prevDocList) => prevDocList.map((data) => ({ ...data, selected: false })));
            }
        }
    };

    useEffect(() => {
        socket.on('upload_progress', (data) => {
            setUploadProgress((prevProgress) => {
                if (data.progress === 'success' || data.progress === 'failed') {
                    return prevProgress.filter((doc) => doc.id !== data.id);
                }

                const existingIndex = prevProgress.findIndex((doc) => doc.id === data.id);
                if (existingIndex !== -1) {
                    const updatedProgress = [...prevProgress];
                    updatedProgress[existingIndex] = data;
                    return updatedProgress;
                } else {
                    const updatedProgress = [...prevProgress, data];
                    updatedProgress.sort((a, b) => String(a.id).localeCompare(String(b.id)));
                    return updatedProgress;
                }
            });
            if (data.progress == 'success') {
                showMessage('File uploaded successfully!', 'success');
                setDoclist((prevDocList) => [...prevDocList, data.doc]);
            }
            if (data.progress == 'failed') {
                showMessage('File upload failed!', 'error');
            }
        });
        return () => {
            socket.off('upload_progress'); // Clean up the event listener
        };
    }, []);

    const selectDocument = (document: Document) => {
        document.selected = !document.selected;
        setDoclist((prevDocList) => prevDocList.map((data) => (data.id === document.id ? document : data)));
        setSelectAll(docList.every((doc) => doc.selected === true || (doc.subject_id != filteredSubject.id && filteredSubject.id != 0)));
    };

    const selectAllDocument = () => {
        if (selectAll) {
            setDoclist((prevDocList) => prevDocList.map((data) => ({ ...data, selected: false })));
            setSelectAll(false);
        } else {
            setDoclist((prevDocList) => prevDocList.map((data) => ((data.subject_id != filteredSubject.id && filteredSubject.id != 0) ? data : { ...data, selected: true })));
            setSelectAll(true);
        }
    };
    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Documents</h2>
                <div className="flex">
                    <button type="button" className="btn btn-primary btn-padding mr-2" onClick={() => selectAllDocument()}>
                        {selectAll ? 'Remove' : 'Select'} All
                    </button>
                    <button type="button" className="btn btn-primary btn-padding mr-2" onClick={() => downloadMultiDoc()}>
                        Download
                    </button>
                    <button type="button" className="btn btn-primary btn-padding mr-2" onClick={() => handleDelete(0)}>
                        Delete
                    </button>
                    <div className="dropdown">
                        <Dropdown
                            placement={'bottom-end'}
                            btnClassName="btn btn-outline-primary dropdown-toggle"
                            button={
                                <>
                                    {filteredSubject.name}
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
                                    <button id="subject" type="button" value="0" onClick={changeSubject}>
                                        All
                                    </button>
                                </li>
                                {subjectList.map((subject) => (
                                    <li key={subject.id}>
                                        <button id="subject" type="button" value={subject.id.toString()} onClick={changeSubject}>
                                            {subject.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Dropdown>
                    </div>
                </div>
            </div>
            <div className="grid 2xl:grid-cols-7 lg:grid-cols-5 sm:grid-cols-4 mb:grid-cols-2 grid-cols-3 gap-5 mt-5">
                <div className="panel w-32 text-align-center px-0 py-2 pointer" onClick={handleDivClick}>
                    <div className="py-5">
                        <svg className="text-danger" width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                opacity="0.5"
                                d="M16 4.00195C18.175 4.01406 19.3529 4.11051 20.1213 4.87889C21 5.75757 21 7.17179 21 10.0002V16.0002C21 18.8286 21 20.2429 20.1213 21.1215C19.2426 22.0002 17.8284 22.0002 15 22.0002H9C6.17157 22.0002 4.75736 22.0002 3.87868 21.1215C3 20.2429 3 18.8286 3 16.0002V10.0002C3 7.17179 3 5.75757 3.87868 4.87889C4.64706 4.11051 5.82497 4.01406 8 4.00195"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path d="M8 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M7 10.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M9 17.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path
                                d="M8 3.5C8 2.67157 8.67157 2 9.5 2H14.5C15.3284 2 16 2.67157 16 3.5V4.5C16 5.32843 15.3284 6 14.5 6H9.5C8.67157 6 8 5.32843 8 4.5V3.5Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                        </svg>
                        <div>New</div>
                    </div>
                    <div className="border-t pt-2">Upload</div>
                </div>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                {docList
                    .filter((doc) => filteredSubject.id == 0 || doc.subject_id == filteredSubject.id)
                    .map((doc) => (
                        <div key={doc.id} className={`panel w-32 text-align-center px-0 py-2 pointer ${doc.selected ? 'bg-danger-light shadow-danger' : ''}`}>
                            <div className="py-0 h-28 mx-2 overflow-hidden" onClick={() => selectDocument(doc)}>{doc.name}</div>
                            <div className="border-t pt-2 px-5 flex items-center justify-between">
                                <button type="button" className="text-danger" onClick={() => handleDownload(doc.id, doc.name)}>
                                    {doc.isDownloading ? (
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="20"
                                            height="20"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="w-5 h-5 animate-[spin_2s_linear_infinite] align-middle"
                                        >
                                            <line x1="12" y1="2" x2="12" y2="6"></line>
                                            <line x1="12" y1="18" x2="12" y2="22"></line>
                                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                            <line x1="2" y1="12" x2="6" y2="12"></line>
                                            <line x1="18" y1="12" x2="22" y2="12"></line>
                                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
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
                                    )}
                                </button>
                                <button type="button" className="text-danger" onClick={() => handleDelete(doc.id)}>
                                    {doc.isDeleting ? (
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="20"
                                            height="20"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="w-5 h-5 animate-[spin_2s_linear_infinite] align-middle"
                                        >
                                            <line x1="12" y1="2" x2="12" y2="6"></line>
                                            <line x1="12" y1="18" x2="12" y2="22"></line>
                                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                            <line x1="2" y1="12" x2="6" y2="12"></line>
                                            <line x1="18" y1="12" x2="22" y2="12"></line>
                                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                {uploadProgress.map((upload) => (
                    <div className="panel w-32 text-align-center px-0 py-2 pointer place-content-center">
                        <span className="animate-spin border-4 border-danger border-l-transparent rounded-full w-10 h-10 inline-block align-middle m-auto mb-10"></span>
                        <div className="w-[90%] h-2 bg-[#ebedf2] dark:bg-dark/40 rounded-full text-align-left mb-2">
                            <div
                                className="bg-primary h-2 rounded-full animated-progress"
                                style={{
                                    width: `${upload.progress}%`,
                                    backgroundImage:
                                        'linear-gradient(45deg,hsla(0,0%,100%,.15) 25%,transparent 0,transparent 50%,hsla(0,0%,100%,.15) 0,hsla(0,0%,100%,.15) 75%,transparent 0,transparent)',
                                    backgroundSize: '1rem 1rem',
                                }}
                            ></div>
                        </div>
                        <div className="text-sm">
                            Uploading to {upload.stage == 'openai' ? 'openai' : 'backend'} {upload.progress}%
                        </div>
                    </div>
                ))}
            </div>
            <Transition appear show={isDeleteDocModal} as={Fragment}>
                <Dialog as="div" open={isDeleteDocModal} onClose={() => setIsDeleteDocModal(false)} className="relative z-50">
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
                                        onClick={() => setIsDeleteDocModal(false)}
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
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Delete Document</div>
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
                                        <div className="sm:w-3/4 mx-auto mt-5">Are you sure you want to delete Document?</div>

                                        <div className="flex justify-center items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setIsDeleteDocModal(false)}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={deleteDoc}>
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
            <Transition appear show={isSelectSubjectModal} as={Fragment}>
                <Dialog as="div" open={isSelectSubjectModal} onClose={() => setIsSelectSubjectModal(false)} className="relative z-50">
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
                                        onClick={() => setIsSelectSubjectModal(false)}
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
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Select Subject</div>
                                    <div className="p-5">
                                        <form onSubmit={(e) => handleFileUpload(e)}>
                                            <div className="flex items-center">
                                                <label htmlFor="subject" className="mb-0 align-self-center mr-5">
                                                    Subject
                                                </label>
                                                <div className="dropdown">
                                                    <Dropdown
                                                        placement={'bottom-end'}
                                                        btnClassName="btn btn-outline-primary dropdown-toggle"
                                                        button={
                                                            <>
                                                                {selectedSubject ? selectedSubject.name : ''}
                                                                <span>
                                                                    <svg className="w-4 h-4 ltr:ml-1 rtl:mr-1 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M19 9L12 15L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                </span>
                                                            </>
                                                        }
                                                    >
                                                        <ul className="!min-w-[170px]">
                                                            {subjectList.map((subject) => (
                                                                <li key={subject.id}>
                                                                    <button id="subject" type="button" value={subject.id.toString()} onClick={changeValue}>
                                                                        {subject.name}
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setIsSelectSubjectModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    Upload
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

export default Documents;
