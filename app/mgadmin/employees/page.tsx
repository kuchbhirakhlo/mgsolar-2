'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Plus, Ban, CheckCircle, Edit, Eye, Key, EyeOff } from 'lucide-react';
import { addEmployee, getEmployees, blockEmployee, updateEmployee, getEmployeeByEmpId } from '@/lib/firebase-service';
import type { Employee } from '@/lib/types';

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<(Employee & { id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mobileNumber: '',
    name: '',
    password: '',
    empId: '',
    role: 'employee' as 'employee' | 'installer',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  const [editingEmployee, setEditingEmployee] = useState<(Employee & { id: string }) | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<(Employee & { id: string }) | null>(null);
  const [editData, setEditData] = useState({ empId: '', role: 'employee' as 'employee' | 'installer', mobileNumber: '', name: '', password: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const employeeData = sessionStorage.getItem('employeeData');
    if (employeeData) {
      router.push('/mgadmin');
      return;
    }
    loadEmployees();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Check if employee ID already exists
      const existingEmployee = await getEmployeeByEmpId(formData.empId);
      if (existingEmployee) {
        setSubmitError('Employee ID already exists. Please choose a different ID.');
        return;
      }

      await addEmployee({
        ...formData,
        isBlocked: false,
      });
       setFormData({ mobileNumber: '', name: '', password: '', empId: '', role: 'employee' });
      setShowForm(false);
      // Reload data after creation
      loadEmployees(0);
    } catch (error: any) {
      console.error('Error adding employee:', error);
      // Don't show error for aborted requests (user navigated away)
      if (error.name !== 'AbortError') {
        setSubmitError(error.message || 'Failed to create employee. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const loadEmployees = async (retryCount = 0) => {
    console.log('loadEmployees called, retryCount:', retryCount)
    if (loading) return; // Prevent concurrent calls
    setLoading(true);
    setError(null);
    console.log('Starting to fetch employees...')

    const abortController = new AbortController();

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );

      const dataPromise = getEmployees(abortController.signal);
      const data = await Promise.race([dataPromise, timeoutPromise]) as (Employee & { id: string })[];

      setEmployees(data);
    } catch (error: any) {
      console.error('Error loading employees:', error);

      // Don't show error for aborted requests
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }

      if ((error.message === 'Request timeout' || error.message === 'Request aborted') && retryCount < 2) {
        // Retry once more on timeout or abort
        setTimeout(() => loadEmployees(retryCount + 1), 1000);
        return;
      }

      setError(error.message === 'Request timeout' || error.message === 'Request aborted'
        ? 'Connection timeout. Please check your internet connection.'
        : 'Failed to load employees. Please try refreshing the page.'
      );
    } finally {
      setLoading(false);
    }
  };



  const handleBlockToggle = async (id: string, currentStatus: boolean) => {
    try {
      await blockEmployee(id, !currentStatus);
      // Reload data after update
      loadEmployees(0);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleEdit = (employee: Employee & { id: string }) => {
    setEditingEmployee(employee);
    setEditData({ empId: employee.empId, role: employee.role, mobileNumber: employee.mobileNumber, name: employee.name, password: employee.password });
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      // Check if employee ID already exists (only if it changed)
      if (editData.empId !== editingEmployee.empId) {
        const existingEmployee = await getEmployeeByEmpId(editData.empId);
        if (existingEmployee) {
          setEditError('Employee ID already exists. Please choose a different ID.');
          return;
        }
      }

      await updateEmployee(editingEmployee.id, {
        empId: editData.empId,
        role: editData.role,
        mobileNumber: editData.mobileNumber,
        name: editData.name,
        password: editData.password
      });
      setEditingEmployee(null);
      loadEmployees(0);
    } catch (error: any) {
      console.error('Error updating employee:', error);
      setEditError(error.message || 'Failed to update employee.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleView = (employee: Employee & { id: string }) => {
    setViewingEmployee(employee);
  };

  const closeEditModal = () => {
    setEditingEmployee(null);
    setEditError(null);
  };

  const closeViewModal = () => {
    setViewingEmployee(null);
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Employees</h1>
          <p className="text-foreground/70">Manage employee accounts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {showForm && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>Add New Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile Number</label>
                  <Input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employee Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter employee name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employee ID</label>
                  <Input
                    type="text"
                    value={formData.empId}
                    onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                    placeholder="Enter employee ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <Select value={formData.role} onValueChange={(value: 'employee' | 'installer') => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="installer">Installer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {submitError && (
                <p className="text-red-500 text-sm">{submitError}</p>
              )}
              <div className="flex gap-2">
                 <Button type="submit" disabled={submitting}>
                   {submitting ? 'Creating...' : 'Create Employee'}
                 </Button>
                 <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                   Cancel
                 </Button>
               </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employee List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading employees...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => loadEmployees(0)} variant="outline">
                Try Again
              </Button>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-foreground/70">No employees found</div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {employees.map((emp) => (
                  <Card key={emp.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{emp.name}</h3>
                          <div className="flex gap-2">
                            {emp.isBlocked ? (
                              <Badge variant="destructive">Blocked</Badge>
                            ) : (
                              <Badge className="bg-green-500">Active</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p><span className="font-medium">ID:</span> {emp.empId}</p>
                          <p><span className="font-medium">Mobile:</span> {emp.mobileNumber}</p>
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(emp)}
                            className="flex-1 min-w-0"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(emp)}
                            className="flex-1 min-w-0"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>

                          <Button
                            size="sm"
                            variant={emp.isBlocked ? 'default' : 'destructive'}
                            onClick={() => handleBlockToggle(emp.id, emp.isBlocked)}
                            className="flex-1 min-w-0"
                          >
                            {emp.isBlocked ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Unblock
                              </>
                            ) : (
                              <>
                                <Ban className="w-3 h-3 mr-1" />
                                Block
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Employee ID</th>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Mobile Number</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{emp.empId}</td>
                        <td className="py-3 px-4">{emp.name}</td>
                        <td className="py-3 px-4">{emp.mobileNumber}</td>
                        <td className="py-3 px-4">
                          {emp.isBlocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge className="bg-green-500">Active</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(emp)}
                              title="Edit"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(emp)}
                              title="View"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant={emp.isBlocked ? 'default' : 'destructive'}
                              onClick={() => handleBlockToggle(emp.id, emp.isBlocked)}
                              className="flex items-center gap-1"
                              title={emp.isBlocked ? 'Unblock' : 'Block'}
                            >
                              {emp.isBlocked ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Unblock
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3 h-3" />
                                  Block
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Modal */}
      <Dialog open={!!editingEmployee} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee Details</DialogTitle>
            <DialogDescription>Update the employee information below.</DialogDescription>
          </DialogHeader>
          {editingEmployee && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">Employee ID</label>
                   <Input
                     value={editData.empId}
                     onChange={(e) => setEditData({ ...editData, empId: e.target.value })}
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Role</label>
                    <Select value={editData.role} onValueChange={(value: 'employee' | 'installer') => setEditData({ ...editData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="installer">Installer</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Name</label>
                   <Input
                     value={editData.name}
                     onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Mobile Number</label>
                   <Input
                     type="tel"
                     value={editData.mobileNumber}
                     onChange={(e) => setEditData({ ...editData, mobileNumber: e.target.value })}
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Password</label>
                   <Input
                     type="password"
                     value={editData.password}
                     onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                     required
                   />
                 </div>
               </div>
              {editError && (
                <p className="text-red-500 text-sm">{editError}</p>
              )}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={closeEditModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editSubmitting}>
                  {editSubmitting ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Employee Modal */}
      <Dialog open={!!viewingEmployee} onOpenChange={(open) => !open && closeViewModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>View the employee information below.</DialogDescription>
          </DialogHeader>
          {viewingEmployee && (
             <div className="space-y-2">
               <p><strong>ID:</strong> {viewingEmployee.id}</p>
               <p><strong>Name:</strong> {viewingEmployee.name}</p>
               <p><strong>Mobile Number:</strong> {viewingEmployee.mobileNumber}</p>
               <p><strong>Employee ID:</strong> {viewingEmployee.empId}</p>
               <p><strong>Role:</strong> {viewingEmployee.role}</p>
               <p><strong>Status:</strong> {viewingEmployee.isBlocked ? 'Blocked' : 'Active'}</p>
               <p><strong>Firebase UID:</strong> {viewingEmployee.firebaseUid || 'N/A'}</p>
               <p><strong>Created At:</strong> {viewingEmployee.createdAt ? new Date(viewingEmployee.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
             </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
