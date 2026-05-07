'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit2, Trash2, Loader2, Shield } from 'lucide-react';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'employee';
  permissions: string[];
  createdAt: string;
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', permissions: ['all'] },
  { value: 'admin', label: 'Admin', permissions: ['customers', 'employees', 'projects', 'payments', 'messages', 'careers'] },
  { value: 'manager', label: 'Manager', permissions: ['customers', 'projects', 'payments', 'messages'] },
  { value: 'employee', label: 'Employee', permissions: ['customers_read', 'messages_read'] },
];

export default function AdminRolesPage() {
  const router = useRouter();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const { isLoading, submitForm } = useFormSubmit();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as AdminUser['role'],
    permissions: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const addSampleData = async () => {
    const sampleAdmins = [
      {
        name: 'Super Admin',
        email: 'superadmin@mgsolar.com',
        role: 'super_admin' as const,
        permissions: ['all'],
        createdAt: new Date().toISOString(),
      },
      {
        name: 'John Admin',
        email: 'admin@mgsolar.com',
        role: 'admin' as const,
        permissions: ['customers', 'employees', 'projects', 'payments', 'messages', 'careers'],
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Sarah Manager',
        email: 'manager@mgsolar.com',
        role: 'manager' as const,
        permissions: ['customers', 'projects', 'payments', 'messages'],
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Mike Employee',
        email: 'employee@mgsolar.com',
        role: 'employee' as const,
        permissions: ['customers_read', 'messages_read'],
        createdAt: new Date().toISOString(),
      },
    ];

    try {
      for (const adminData of sampleAdmins) {
        await addDoc(collection(db, 'adminUsers'), adminData);
      }
      alert('Sample admin users added successfully!');
    } catch (error) {
      console.error('Error adding sample data:', error);
      alert('Error adding sample data');
    }
  };

  useEffect(() => {
    // Load admin users from Firebase
    const adminUsersRef = collection(db, 'adminUsers');
    const unsubscribe = onSnapshot(adminUsersRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const adminUsersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminUser[];
      setAdminUsers(adminUsersData);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (role: AdminUser['role']) => {
    const roleData = ROLES.find(r => r.value === role);
    setFormData({
      ...formData,
      role,
      permissions: roleData ? roleData.permissions : [],
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      try {
        await deleteDoc(doc(db, 'adminUsers', id));
      } catch (error) {
        console.error('Error deleting admin user:', error);
        alert('Error deleting admin user');
      }
    }
  };

  const handleView = (user: AdminUser) => {
    setSelectedUser(user);
    setViewDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitUser = async () => {
      if (isEditing && selectedUser) {
        // Update existing user
        const userRef = doc(db, 'adminUsers', selectedUser.id);
        await updateDoc(userRef, formData);
      } else {
        // Add new user
        const newUserData = {
          ...formData,
          createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'adminUsers'), newUserData);
      }

      setFormData({
        name: '',
        email: '',
        role: 'employee',
        permissions: [],
      });
      setShowForm(false);
      setIsEditing(false);
      setSelectedUser(null);
      setErrors({});
    };

    if (validateForm()) {
      submitForm(submitUser, isEditing ? 'Admin user updated successfully!' : 'Admin user added successfully!');
    }
  };

  const getRoleLabel = (role: AdminUser['role']) => {
    return ROLES.find(r => r.value === role)?.label || role;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-primary mb-1 lg:mb-2">Admin Roles & Permissions</h1>
          <p className="text-foreground/70 text-sm lg:text-base">Manage admin users and their access permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={addSampleData}
            variant="outline"
            className="gap-2 justify-center bg-green-600 text-white hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Sample Data</span>
            <span className="sm:hidden">Sample</span>
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Admin User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Admin User' : 'New Admin User'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditing ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    isEditing ? 'Update User' : 'Save User'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setSelectedUser(null);
                    setErrors({});
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-muted">
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'manager' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.slice(0, 3).map(permission => (
                          <span key={permission} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {permission}
                          </span>
                        ))}
                        {user.permissions.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            +{user.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(user)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {adminUsers.map((user) => (
              <Card key={user.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{user.name}</h3>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleView(user)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p><span className="font-medium">Email:</span> {user.email}</p>
                      <p><span className="font-medium">Role:</span> {getRoleLabel(user.role)}</p>
                      <p><span className="font-medium">Permissions:</span> {user.permissions.join(', ')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div><strong>Name:</strong> {selectedUser.name}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Role:</strong> {getRoleLabel(selectedUser.role)}</div>
              <div><strong>Permissions:</strong></div>
              <div className="flex flex-wrap gap-2">
                {selectedUser.permissions.map(permission => (
                  <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {permission}
                  </span>
                ))}
              </div>
              <div><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}