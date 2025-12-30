import { AdminLayout } from "@/components/layouts/AdminLayout";
import { ProfileForm, type ProfileData } from "@/components/profile/ProfileForm";
import { useAdminProfile, useUpdateAdminProfile } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";

const AdminProfilePage = () => {
  const { data: profile, isLoading } = useAdminProfile();
  const { user } = useAuth();
  const updateProfileMutation = useUpdateAdminProfile();

  const handleUpdate = async (data: {
    full_name?: string;
    timezone?: string;
    notification_preferences?: {
      email?: boolean;
      in_app?: boolean;
      [key: string]: any;
    };
  }) => {
    await updateProfileMutation.mutateAsync(data);
  };

  // Transform profile data to match ProfileForm interface
  // Use created_at from profile if available, otherwise fallback to user context
  const profileData: ProfileData | null = profile
    ? {
        id: profile.id,
        user_code: profile.user_code,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
        avatar_url: profile.avatar_url,
        timezone: profile.timezone,
        notification_preferences: profile.notification_preferences,
        created_at: profile.created_at || user?.created_at,
      }
    : null;

  return (
    <AdminLayout
      headerTitle="Profile"
      headerDescription="Manage your profile and account settings"
    >
      <ProfileForm
        profile={profileData}
        isLoading={isLoading}
        onUpdate={handleUpdate}
        isUpdating={updateProfileMutation.isPending}
        showTimezone={true}
        showNotifications={true}
      />
    </AdminLayout>
  );
};

export default AdminProfilePage;
