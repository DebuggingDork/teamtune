import AdminSettings from "@/components/admin/AdminSettings";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { motion } from "framer-motion";

const SettingsPage = () => {
  return (
    <AdminLayout
      headerTitle="Settings"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AdminSettings />
      </motion.div>
    </AdminLayout>
  );
};

export default SettingsPage;

