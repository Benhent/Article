import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { FiSearch, FiUser, FiMail, FiLink, FiGlobe } from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";

const roles = ['user', 'admin', 'author', 'reviewer', 'editor', 'submitter'];
const roleColors = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  author: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  reviewer: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  editor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  submitter: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100'
};

export default function UserManage() {
  const { users = [], fetchUsers, updateUserRole, deleteUser, isLoading } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-10"
            />
          </div>
          
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FiMail className="text-gray-500" />
                <span>{user.email}</span>
              </div>
              {user.link && (
                <div className="flex items-center gap-2 text-sm">
                  <FiLink className="text-gray-500" />
                  <a href={user.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {user.link}
                  </a>
                </div>
              )}
              {user.national && (
                <div className="flex items-center gap-2 text-sm">
                  <FiGlobe className="text-gray-500" />
                  <span>{user.national}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7">
                    <Badge className={`${roleColors[user.role as keyof typeof roleColors]}`}>
                      {user.role}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {roles.map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onSelect={() => handleRoleChange(user._id, role)}
                    >
                      {role}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Badge variant={user.isVerified ? "default" : "destructive"}>
                {user.isVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full">
                  Delete User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteUser(user._id)}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7">
                        <Badge className={`${roleColors[user.role as keyof typeof roleColors]}`}>
                          {user.role}
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {roles.map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onSelect={() => handleRoleChange(user._id, role)}
                        >
                          {role}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isVerified ? "default" : "destructive"}>
                    {user.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the user account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(user._id)}>
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No users found matching your criteria
        </div>
      )}
    </div>
  );
}