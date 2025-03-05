import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

interface ChatProps {
    studentId: number;
    backToStudent: () => void;
}

interface Chat {
    id: number;
    student_id: number;
    question: string;
    answer: string;
}
const ChatHistory: React.FC<ChatProps> = ({ studentId, backToStudent }) => {
    const [chatList, setChatList] = useState<Chat[]>([]);
    const { user, email, role, subjects, logout } = useAuth();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/chat-history/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({student_id: studentId})
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
                setChatList(response);
            })
            .catch((error) => {
                // Handle network error
                showMessage(error.message, 'error');
            });
    }, [studentId]);

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
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Chat History</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex mb:justify-between mb:gap-0 gap-3">
                        <button type="button" className="btn btn-primary btn-padding" onClick={backToStudent}>
                            Back
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-5 p-0 border-0 overflow-hidden max-w-[712px] mx-auto text-xl">
                {chatList.map((chat: any) => {
                    return (
                        <>
                            <div className='flex justify-end'>
                                <div className="panel mb-5 inline-block max-w-[75%]">{chat.question}</div>
                            </div>
                            <p className='mb-5 whitespace-pre-line'>{chat.answer}</p>
                        </>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatHistory;
