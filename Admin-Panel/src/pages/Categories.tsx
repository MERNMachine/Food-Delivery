import { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import {
    getCategories,
    deleteCategory,
} from "../API/APIs";

import { DataTable } from "mantine-datatable";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface Category {
    _id: string;
    name: string; // Update from 'main' to 'name'
    sub?: {
        _id: string;
        name: string;
    }[]; // Optional property to include nested subcategories
}
const PAGE_SIZES = [10, 20, 30, 50, 100];

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setloading] = useState(true);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<Category[]>([]);
    const [recordsData, setRecordsData] = useState<Category[]>(initialRecords);
    const MySwal = withReactContent(Swal);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [editModal, setEditModal] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [submenus, setsubmenus] = useState<string[]>([]);
    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(Array.isArray(data) ? data : []);
            setloading(false);
        } catch (err) {
            setloading(false);
        }

        // setSelectedCategories(data.map((cat: Category) => cat._id)); // Select all initially
    };
    const deleteHandle = async (id: string) => {
        const response = await deleteCategory(id);
        if (response) {
            MySwal.fire({
                title: "Category deleted successfully!",
                icon: "success",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
            });
            fetchCategories();
        } else {
            MySwal.fire({
                title: "Failed to delete menu!",
                icon: "error",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
            });
        }
    };
    const handleAddSub = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent form submission
            const value = event.currentTarget.value.trim();
            if (value && !submenus.includes(value)) {
                setsubmenus([...submenus, value]); // Add tag if it's unique
            }
            event.currentTarget.value = ""; // Clear input
        }
    };
    const handleRemoveSub = (tagToRemove: string) => {
        setsubmenus(submenus.filter((submenu) => submenu !== tagToRemove)); // Remove the clicked tag
    };

    const openEdit = (category: Category) => {
        setSelectedCategory(category);
        const subMenuNames = category.sub?.map((sub) => sub.name) || [];
        setsubmenus(subMenuNames);
        setEditModal(true);
    };

    const openAdd = () => {
        setSelectedCategory(null);
        setAddModal(true);
    };
    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setInitialRecords(categories);
    }, [categories]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        console.log(initialRecords);
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);
    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
            </div>
        );
    }
    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Categories</h5>
                <div className="flex items-center gap-4">
                    <button className="btn btn-primary" onClick={(e) => { e.preventDefault(); openAdd(); }}>
                        Add Category
                    </button>
                    <div className="relative flex items-center w-[200px]">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="form-input w-full p-2 pl-9 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>
            <div className="table-responsive mb-5">
                <DataTable
                    striped
                    highlightOnHover
                    className="whitespace-nowrap table-striped table-hover"
                    records={recordsData}
                    columns={[
                        { accessor: 'name', title: 'Main Menu' },
                        {
                            accessor: '_id',
                            title: 'Sub Menu',
                            render: (category) => (
                                <div>
                                    {category.sub && category.sub.length > 0 ? (
                                        category.sub.map((subItem) => (
                                            <span key={subItem._id} className="block">
                                                {subItem.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span>No Sub Menus</span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            accessor: 'action',
                            title: 'Action',
                            render: (category) => (
                                <div className="text-center">
                                    <Tippy content="Edit">
                                        <button type="button" onClick={() => openEdit(category)}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2">
                                                <path
                                                    d="M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999L5.83881 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844L7.47919 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    opacity="0.5"
                                                    d="M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </button>
                                    </Tippy>
                                    <Tippy content="Delete">
                                        <button type="button" onClick={() => deleteHandle(category._id!)}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                                                <path d="M20.5001 6H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path
                                                    d="M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                                <path opacity="0.5" d="M9.5 11L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path opacity="0.5" d="M14.5 11L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path
                                                    opacity="0.5"
                                                    d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </button>
                                    </Tippy>
                                </div>
                            ),
                        },
                    ]}
                    totalRecords={initialRecords.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                />
            </div>
            <Transition appear show={addModal || editModal} as={Fragment}>
                <Dialog as="div" open={addModal || editModal} onClose={() => { setEditModal(false); setAddModal(false); }}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
                        <div className="flex items-start justify-center min-h-screen px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <div className="text-lg font-bold">Edit Category</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => { setEditModal(false); setAddModal(false); }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 m-auto">
                                                <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                                <path d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <label htmlFor="main">Main Menu</label>
                                            <input
                                                id="main"
                                                type="text"
                                                className="form-input mb-4"
                                                value={selectedCategory?.name || ""}
                                                onChange={(e) =>
                                                    setSelectedCategory({
                                                        ...selectedCategory!,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                            <label htmlFor="category">Sub Menu</label>
                                            <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-800 rounded-md mb-4">
                                                {submenus.map((submenu, index) => (
                                                    <span
                                                        key={index}
                                                        className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded-full"
                                                    >
                                                        {submenu}
                                                        <button
                                                            type="button"
                                                            className="text-gray-400 hover:text-white"
                                                            onClick={() => handleRemoveSub(submenu)}
                                                        >
                                                            &times;
                                                        </button>
                                                    </span>
                                                ))}
                                                <input
                                                    type="text"
                                                    placeholder="Add an submenu..."
                                                    className="bg-gray-700 text-white px-3 py-1 rounded-md outline-none"
                                                    onKeyDown={handleAddSub}
                                                />
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => { setEditModal(false); setAddModal(false); }}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4">
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


export default Categories;