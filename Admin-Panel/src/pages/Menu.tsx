import { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories,
} from "../API/APIs";
import { DataTable } from "mantine-datatable";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ImageUploading, { ImageListType } from "react-images-uploading";

interface Menu {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image?: string;
}

interface Category {
  _id: string;
  name: string; // Update from 'main' to 'name'
  sub?: {
    _id: string;
    name: string;
  }[]; // Optional property to include nested subcategories
}
const PAGE_SIZES = [10, 20, 30, 50, 100];

const Menu = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState<Menu[]>([]);
  const [recordsData, setRecordsData] = useState<Menu[]>(initialRecords);
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [image, setImage] = useState<ImageListType>([]);
  const MySwal = withReactContent(Swal);

  const fetchMenuData = async (search: string, categories: string[]) => {
    try {
      const data = await getMenuItems(search, categories);
      setMenus(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
      setSelectedCategories(data.map((cat: Category) => cat._id)); // Select all initially
    } catch (err) {
      setLoading(false);
    }
  };

  // const handleSearch = () => {
  //   fetchMenuData(search, selectedCategories);
  // };

  // const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === "Enter") {
  //     handleSearch();
  //   }
  // };

  const handleCategoryChange = (id: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) {
        return prev.filter((catId) => catId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const openEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setImage(menu.image ? [{ dataURL: menu.image }] : []);
    setEditModal(true);
  };

  const openAdd = () => {
    setSelectedMenu(null);
    setImage([]);
    setAddModal(true);
  };

  const saveMenu = async () => {
    const formData = new FormData();
    if (image.length > 0) formData.append("image", image[0].file!);
    Object.entries(selectedMenu || {}).forEach(([key, value]) =>
      formData.append(key, value as string)
    );

    const response = selectedMenu?._id
      ? await updateMenuItem(selectedMenu._id, formData)
      : await addMenuItem(formData);

    if (response) {
      MySwal.fire({
        title: `Menu ${selectedMenu?._id ? "updated" : "added"} successfully!`,
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      fetchMenuData("", selectedCategories);
    } else {
      MySwal.fire({
        title: "Failed to save menu!",
        icon: "error",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
    setAddModal(false);
    setEditModal(false);
  };

  const deleteHandle = async (id: string) => {
    const response = await deleteMenuItem(id);
    if (response) {
      MySwal.fire({
        title: "Menu deleted successfully!",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      fetchMenuData("", selectedCategories);
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

  useEffect(() => {
    fetchCategories();
    fetchMenuData("", []);
  }, []);

  useEffect(() => {
    setInitialRecords(menus);
  }, [menus]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);
  /*
    useEffect(() => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);
  */
  useEffect(() => {
    const filteredData = initialRecords.filter((menu) =>
      menu.name.toLowerCase().includes(search.toLowerCase()) ||
      menu.description.toLowerCase().includes(search.toLowerCase()) ||
      menu.price.toString().includes(search)
    );
    setRecordsData(filteredData.slice((page - 1) * pageSize, page * pageSize));
  }, [initialRecords, search, page, pageSize]);

  useEffect(() => {
    fetchMenuData(search, selectedCategories);
  }, [selectedCategories]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="w-1/4 p-4">
        <h5 className="font-semibold text-lg dark:text-white-light mb-4">Categories</h5>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedCategories.length === categories.length}
              onChange={() =>
                setSelectedCategories((prev) =>
                  prev.length === categories.length ? [] : categories.map((cat) => cat._id)
                )
              }
            />
            <span className="ml-2">Select All</span>
          </label>
          {categories.map((category) => (
            <label key={category._id} className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category._id)}
                onChange={() => handleCategoryChange(category._id)}
              />
              <span className="ml-2">{category.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="w-3/4">
        <div className="panel">
          <div className="flex items-center justify-between mb-5">
            <h5 className="font-semibold text-lg dark:text-white-light">Menus</h5>
            <div className="flex items-center gap-4">
              <button className="btn btn-primary" onClick={openAdd}>
                Add Menu
              </button>
              <div className="relative flex items-center w-[200px]">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                { accessor: "name", title: "Name" },
                { accessor: "description", title: "Description" },
                { accessor: "price", title: "Price" },
                {
                  accessor: "image",
                  title: "Image",
                  render: (menu) => (
                    <img
                      src={`${import.meta.env.VITE_APP_BACKEND_URL}/uploads/${menu.image}`}
                      alt={menu.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ),
                },
                {
                  accessor: "action",
                  title: "Action",
                  render: (menu) => (
                    <div className="text-center">
                      <Tippy content="Edit">
                        <button type="button" onClick={() => openEdit(menu)}>
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
                        <button type="button" onClick={() => deleteHandle(menu._id!)}>
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
            />
          </div>
          {/* Modals for Add/Edit */}
          <Transition appear show={addModal || editModal} as={Fragment}>
            <Dialog as="div" open={addModal || editModal} onClose={() => {
              setAddModal(false);
              setEditModal(false);
            }}>
              <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        {editModal ? "Edit Menu" : "Add Menu"}
                      </Dialog.Title>
                      <div className="mt-2">
                        <form>
                          <label htmlFor="name">Name</label>
                          <input
                            id="name"
                            type="text"
                            className="form-input mb-4"
                            value={selectedMenu?.name || ""}
                            onChange={(e) =>
                              setSelectedMenu({
                                ...selectedMenu!,
                                name: e.target.value,
                              })
                            }
                          />
                          <label htmlFor="description">Description</label>
                          <input
                            id="description"
                            type="text"
                            className="form-input mb-4"
                            value={selectedMenu?.description || ""}
                            onChange={(e) =>
                              setSelectedMenu({
                                ...selectedMenu!,
                                description: e.target.value,
                              })
                            }
                          />
                          <label htmlFor="price">Price</label>
                          <input
                            id="price"
                            type="number"
                            className="form-input mb-4"
                            value={selectedMenu?.price || 0}
                            onChange={(e) =>
                              setSelectedMenu({
                                ...selectedMenu!,
                                price: Number(e.target.value),
                              })
                            }
                          />
                          <label htmlFor="category">Category</label>
                          <select
                            id="category"
                            className="form-select mb-4"
                            value={selectedMenu?.category_id || ""}
                            onChange={(e) =>
                              setSelectedMenu({
                                ...selectedMenu!,
                                category_id: e.target.value,
                              })
                            }
                          >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          <label>Image</label>
                          <ImageUploading
                            value={image}
                            onChange={(imageList) => setImage(imageList)}
                            maxNumber={1}
                            dataURLKey="dataURL"
                          >
                            {({ imageList, onImageUpload, onImageRemove }) => (
                              <div>
                                <button
                                  type="button"
                                  onClick={onImageUpload}
                                  className="btn btn-primary"
                                >
                                  Upload Image
                                </button>
                                <div className="mt-2">
                                  {imageList.map((image, index) => (
                                    <div key={index}>
                                      <img src={image.dataURL} alt="" className="w-full h-32 object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => onImageRemove(index)}
                                        className="btn btn-danger mt-2"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </ImageUploading>
                        </form>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setAddModal(false);
                            setEditModal(false);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary ml-2"
                          onClick={saveMenu}
                        >
                          Save
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </div>
      </div>
    </div >
  );
};

export default Menu;
