import { useState, useEffect, useMemo } from "react";
import { User, Mail, Globe, Bell, Loader2, Save, Edit2, X, Calendar, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";

// Common timezone options
const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

export interface ProfileData {
  id?: string;
  user_code?: string;
  full_name: string;
  email: string;
  role?: string;
  avatar_url?: string | null;
  timezone?: string;
  notification_preferences?: {
    email?: boolean;
    in_app?: boolean;
    [key: string]: any;
  };
  created_at?: string;
}

export interface ProfileFormProps {
  profile: ProfileData | null | undefined;
  isLoading?: boolean;
  onUpdate: (data: {
    full_name?: string;
    timezone?: string;
    notification_preferences?: {
      email?: boolean;
      in_app?: boolean;
      [key: string]: any;
    };
  }) => Promise<void>;
  isUpdating?: boolean;
  showTimezone?: boolean;
  showNotifications?: boolean;
}

export const ProfileForm = ({
  profile,
  isLoading = false,
  onUpdate,
  isUpdating = false,
  showTimezone = true,
  showNotifications = true,
}: ProfileFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  // Initialize form when profile loads
  useEffect(() => {
    if (profile && !isEditing) {
      setFullName(profile.full_name || "");
      setTimezone(profile.timezone || "UTC");
      setEmailNotifications(profile.notification_preferences?.email ?? true);
      setInAppNotifications(profile.notification_preferences?.in_app ?? true);
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await onUpdate({
        full_name: fullName,
        timezone: timezone,
        notification_preferences: {
          email: emailNotifications,
          in_app: inAppNotifications,
        },
      });
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (profile) {
      setFullName(profile.full_name || "");
      setTimezone(profile.timezone || "UTC");
      setEmailNotifications(profile.notification_preferences?.email ?? true);
      setInAppNotifications(profile.notification_preferences?.in_app ?? true);
    }
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate days together
  const daysTogether = useMemo(() => {
    if (!profile?.created_at) return null;
    try {
      const joinDate = new Date(profile.created_at);
      const today = new Date();
      return differenceInDays(today, joinDate);
    } catch {
      return null;
    }
  }, [profile?.created_at]);

  const getDaysMessage = (days: number) => {
    if (days === 0) return "Today is the beginning of our journey! 🎉";
    if (days === 1) return "1 day since we're together! 🌟";
    if (days < 7) return `${days} days since we're together! ✨`;
    if (days < 30) return `${days} days of amazing collaboration! 🚀`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''} and ${days % 30} days together! 💪`;
    }
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    return `${years} year${years > 1 ? 's' : ''} and ${remainingDays} days of excellence! 🎯`;
  };

  const formattedJoinDate = useMemo(() => {
    if (!profile?.created_at) return null;
    try {
      return format(new Date(profile.created_at), "MMMM d, yyyy");
    } catch {
      return null;
    }
  }, [profile?.created_at]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No profile data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Cool Header Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-background via-background to-accent/5">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-yellow-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl" />
          
          <CardContent className="relative p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar Section */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-full blur-lg opacity-50 animate-pulse" />
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl relative z-10">
                    <AvatarImage src={profile.avatar_url || undefined} alt={fullName || profile.full_name} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 text-white font-bold">
                      {getInitials(fullName || profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {profile.role && (
                  <Badge 
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white border-0 shadow-lg"
                    variant="default"
                  >
                    {profile.role.toUpperCase()}
                  </Badge>
                )}
              </motion.div>

              {/* Info Section */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                    {fullName || profile.full_name}
                  </h2>
                  <p className="text-muted-foreground mt-1">{profile.email}</p>
                </motion.div>

                {/* Days Together Section */}
                {daysTogether !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 border border-orange-500/20">
                      <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                      <span className="text-sm font-semibold text-foreground">
                        {getDaysMessage(daysTogether)}
                      </span>
                    </div>
                    {formattedJoinDate && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-border">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Joined {formattedJoinDate}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Stats Row */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2"
                >
                  {profile.user_code && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                      <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs font-mono text-muted-foreground">
                        {profile.user_code}
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          {profile.role && (
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={profile.role}
                disabled
                className="bg-muted capitalize"
              />
            </div>
          )}
          {profile.user_code && (
            <div className="grid gap-2">
              <Label htmlFor="user_code">User Code</Label>
              <Input
                id="user_code"
                value={profile.user_code}
                disabled
                className="bg-muted"
              />
            </div>
          )}
          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timezone Settings */}
      {showTimezone && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Timezone Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={timezone}
                onValueChange={setTimezone}
                disabled={!isEditing}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your timezone is used for displaying dates and times
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      {showNotifications && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email_notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={!isEditing}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="in_app_notifications">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications within the application
                </p>
              </div>
              <Switch
                id="in_app_notifications"
                checked={inAppNotifications}
                onCheckedChange={setInAppNotifications}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

