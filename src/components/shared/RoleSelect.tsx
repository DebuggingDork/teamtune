import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { UserRole } from "@/api/types/index";

export interface RoleSelectProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  allowedRoles?: UserRole[];
  placeholder?: string;
  disabled?: boolean;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "team_lead", label: "Team Lead" },
  { value: "project_manager", label: "Project Manager" },
  { value: "admin", label: "Admin" },
];

/**
 * RoleSelect Component
 *
 * Reusable role selector dropdown. Eliminates duplication across
 * AdminDashboard, TeamLeadDashboard, and other forms.
 *
 * @example
 * ```tsx
 * <RoleSelect
 *   value={selectedRole}
 *   onChange={setSelectedRole}
 *   size="sm"
 *   allowedRoles={["employee", "team_lead"]}
 * />
 * ```
 */
export const RoleSelect = ({
  value,
  onChange,
  className,
  size = "md",
  allowedRoles = ["employee", "team_lead", "project_manager", "admin"],
  placeholder = "Select role",
  disabled = false,
}: RoleSelectProps) => {
  const sizeClasses = {
    sm: "w-[140px] h-8 text-xs",
    md: "w-full",
    lg: "w-full h-12 text-base",
  };

  const filteredOptions = ROLE_OPTIONS.filter((opt) =>
    allowedRoles.includes(opt.value)
  );

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn(sizeClasses[size], className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
