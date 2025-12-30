import { MemberLayout } from "@/components/layouts/MemberLayout";
import { ProfileForm, type ProfileData } from "@/components/profile/ProfileForm";
import { useMyProfile, useUpdateMyProfile } from "@/hooks/useEmployee";
import { useAuth } from "@/hooks/useAuth";

const ProfilePage = () => {
  const { data: profile, isLoading } = useMyProfile();
  const { user } = useAuth();
  const updateProfileMutation = useUpdateMyProfile();

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
        username: profile.username,
      }
    : null;

  return (
    <MemberLayout
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
        showUsername={true}
      />
    </MemberLayout>
  );
};

export default ProfilePage;



