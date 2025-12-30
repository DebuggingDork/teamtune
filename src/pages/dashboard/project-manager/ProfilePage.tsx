import { ProjectManagerLayout } from "@/components/layouts/ProjectManagerLayout";
import { ProfileForm, type ProfileData } from "@/components/profile/ProfileForm";
import { useProjectManagerProfile, useUpdateProjectManagerProfile } from "@/hooks/useProjectManager";
import { useAuth } from "@/hooks/useAuth";

const ProjectManagerProfilePage = () => {
  const { data: profile, isLoading } = useProjectManagerProfile();
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProjectManagerProfile();

  const handleUpdate = async (data: {
    full_name?: string;
    username?: string;
  }) => {
    await updateProfileMutation.mutateAsync(data);
  };

  // Transform profile data to match ProfileForm interface
  const profileData: ProfileData | null = profile
    ? {
        id: profile.id,
        user_code: profile.user_code,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
        created_at: user?.created_at,
      }
    : null;

  return (
    <ProjectManagerLayout
      headerTitle="Profile"
      headerDescription="Manage your profile and account settings"
    >
      <ProfileForm
        profile={profileData}
        isLoading={isLoading}
        onUpdate={handleUpdate}
        isUpdating={updateProfileMutation.isPending}
        showTimezone={false}
        showNotifications={false}
        showUsername={false}
      />
    </ProjectManagerLayout>
  );
};

export default ProjectManagerProfilePage;



