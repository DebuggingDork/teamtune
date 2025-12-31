import AdminUsers from "@/components/admin/AdminUsers";
import { AdminLayout } from "@/components/layouts/AdminLayout";

const UsersPage = () => {
  return (
    <AdminLayout
      headerTitle="User Management"
      headerDescription="View, edit, and manage all user accounts"
    >
      <AdminUsers />
    </AdminLayout>
  );
};

export default UsersPage;

