import AdminUsers from "@/components/admin/AdminUsers";
import { AdminLayout } from "@/components/layouts/AdminLayout";

const UsersPage = () => {
  return (
    <AdminLayout
      headerTitle="User Management"
    >
      <AdminUsers />
    </AdminLayout>
  );
};

export default UsersPage;



