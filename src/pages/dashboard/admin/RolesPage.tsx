import AdminRoles from "@/components/admin/AdminRoles";
import { AdminLayout } from "@/components/layouts/AdminLayout";

const RolesPage = () => {
  return (
    <AdminLayout
      headerTitle="Role Management"
      headerDescription="Configure roles and permissions"
    >
      <AdminRoles />
    </AdminLayout>
  );
};

export default RolesPage;

