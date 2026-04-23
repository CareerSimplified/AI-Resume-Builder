import { LucideIcon } from 'lucide-react'
import {
  Home,
  Plus,
  FileText,
  BarChart3,
  Settings,
  User,
  Users,
  FileSearch,
  LayoutDashboard,
  PieChart,
  Clock,
  CreditCard,
  Target,
  Upload,
  Briefcase,
} from 'lucide-react'

export interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
}

export const userSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Resume AI (Wizard)', href: '/wizard', icon: Plus },
  { label: 'Create JD', href: '/dashboard/create-jd', icon: Target },
  { label: 'Upload Resume', href: '/dashboard/upload-resume', icon: Upload },
  { label: 'My Resumes', href: '/dashboard/my-resumes', icon: FileSearch },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export const adminSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Job Descriptions', href: '/admin/job-descriptions', icon: Briefcase },
  { label: 'Resumes', href: '/admin/resumes', icon: FileText },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Pricing Plans', href: '/admin/plans', icon: CreditCard },
  { label: 'Analytics', href: '/admin/analytics', icon: PieChart },
  { label: 'Activity', href: '/admin/activity', icon: Clock },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]
