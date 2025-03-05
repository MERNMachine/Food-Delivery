import { useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "../API/APIs";
import { DataTable } from "mantine-datatable";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

interface Order {
  _id: string;
  user: { email: string; firstName: string; lastName: string };
  order_items: { menu_item_id: { name: string }; quantity: number; price: number }[];
  total_price: number;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = ["None", "pending", "accept", "delivering", "complete", "canceled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("None");
  const MySwal = withReactContent(Swal);

  const fetchOrders = async () => {
    const data = await getAdminOrders(search, status === "None" ? "" : status);
    setOrders(Array.isArray(data) ? data : []);
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const response = await updateOrderStatus(id, newStatus);
    if (response) {
      MySwal.fire({
        title: "Order status updated successfully!",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      fetchOrders();
    } else {
      MySwal.fire({
        title: "Failed to update order status!",
        icon: "error",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, status]);

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by email"
            className="form-input py-2 px-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select py-2 px-3"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-responsive">
        <DataTable
          striped
          highlightOnHover
          records={orders}
          columns={[
            { accessor: "user.email", title: "User Email" },
            { accessor: "total_price", title: "Total Price" },
            { accessor: "status", title: "Status" },
            {
              accessor: "action",
              title: "Action",
              render: (order) => (
                <div className="flex gap-2">
                  <select
                    className="form-select py-1 px-2"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.filter((opt) => opt !== "None").map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default AdminOrders;
