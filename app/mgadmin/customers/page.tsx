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
import { Plus, Eye, Edit2, Trash2, Loader2, Download } from 'lucide-react';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface Customer {
  id: string;
  systemType: string;
  customerName: string;
  address: string;
  pincode: string;
  aadharCard?: string;
  panCard: string;
  mobileNumber: string;
  electricityBillNumber: string;
  kilowatt: string;
  panelCompanyName: string;
  inverterCompanyName: string;
  referredBy: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankName: string;
  bankAddress: string;
  quotationPrice: string;
  dealPrice: string;
  acWireBrand?: string;
  dcWireBrand?: string;
  earthingWire?: string;
  createdBy?: string; // Employee ID who created this customer
}

const MIN_QUOTATION_PRICES: Record<string, Record<string, number>> = {
  'on grid': {
    '3kw': 175000,
    '4kw': 225000,
    '5kw': 270000,
    '6kw': 335000,
    '7kw': 360000,
    '8kw': 430000,
    '9kw': 470000,
    '10kw': 520000,
  },
  'hybrid': {
    '3kw': 245000,
    '4kw': 350000,
    '5kw': 375000,
    '6kw': 450000,
    '7kw': 525000,
    '8kw': 600000,
    '9kw': 675000,
    '10kw': 750000,
  },
};

export default function AdminCustomersPage() {
  const router = useRouter();
  const [isEmployee, setIsEmployee] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const { isLoading, submitForm } = useFormSubmit();
  const [formData, setFormData] = useState({
    systemType: '',
    customerName: '',
    address: '',
    pincode: '',
    aadharCard: '',
    panCard: '',
    mobileNumber: '',
    electricityBillNumber: '',
    kilowatt: '',
    panelCompanyName: '',
    inverterCompanyName: '',
    referredBy: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankName: '',
    bankAddress: '',
    quotationPrice: '',
    dealPrice: '',
    acWireBrand: '',
    dcWireBrand: '',
    earthingWire: '',
    assignedEmployee: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});



  useEffect(() => {
    const employeeDataStr = sessionStorage.getItem('employeeData');
    if (employeeDataStr) {
      const empData = JSON.parse(employeeDataStr);
      setIsEmployee(true);
      setEmployeeData(empData);
    }

    // Load employees for admin dropdown
    const loadEmployees = async () => {
      try {
        const employeesRef = collection(db, 'employees');
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesData = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as any)).filter((emp: any) => emp.role === 'employee' && emp.isBlocked !== true);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    };

    loadEmployees();

    // Load customers based on role
    let unsubscribe: () => void;

    if (!employeeDataStr) {
      // Admin: load all customers
      const customersRef = collection(db, 'customers');
      unsubscribe = onSnapshot(customersRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const customersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Customer[];
        setCustomers(customersData.sort((a, b) => a.customerName.localeCompare(b.customerName)));
      });
    } else {
      // Employee: load only customers created by this employee
      const empData = JSON.parse(employeeDataStr);
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('createdBy', '==', empData.empId));
      unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const customersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Customer[];
        setCustomers(customersData.sort((a, b) => a.customerName.localeCompare(b.customerName)));
      });
    }

    return () => unsubscribe();
  }, []);

  const filteredCustomers = isEmployee ? customers : (selectedEmployeeFilter !== 'all' ? customers.filter(c => c.createdBy === selectedEmployeeFilter) : customers);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'mobileNumber') {
      // Only allow digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: digitsOnly,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      'systemType', 'customerName', 'address', 'pincode', 'mobileNumber', 'electricityBillNumber', 'kilowatt', 'panelCompanyName', 'inverterCompanyName', 'referredBy', 'quotationPrice', 'dealPrice'
    ];

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Special validation for mobile number
    if (formData.mobileNumber && formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    }

    // Check minimum quotation price if system type and KW are selected
    if (formData.systemType && formData.kilowatt && formData.quotationPrice) {
      const minPrice = MIN_QUOTATION_PRICES[formData.systemType]?.[formData.kilowatt];
      if (minPrice && parseFloat(formData.quotationPrice) < minPrice) {
        newErrors.quotationPrice = `Quotation price must be at least ₹${minPrice.toLocaleString()}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      systemType: customer.systemType || '',
      customerName: customer.customerName,
      address: customer.address,
      pincode: customer.pincode || '',
      aadharCard: customer.aadharCard || '',
      panCard: customer.panCard || '',
      mobileNumber: customer.mobileNumber,
      electricityBillNumber: customer.electricityBillNumber,
      kilowatt: customer.kilowatt,
      panelCompanyName: customer.panelCompanyName,
      inverterCompanyName: customer.inverterCompanyName,
      referredBy: customer.referredBy,
      bankAccountNumber: customer.bankAccountNumber || '',
      bankIfscCode: customer.bankIfscCode || '',
      bankName: customer.bankName || '',
      bankAddress: customer.bankAddress || '',
      quotationPrice: customer.quotationPrice || '',
      dealPrice: customer.dealPrice || '',
      acWireBrand: customer.acWireBrand || '',
      dcWireBrand: customer.dcWireBrand || '',
      earthingWire: customer.earthingWire || '',
      assignedEmployee: customer.createdBy || '',
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteDoc(doc(db, 'customers', id));
        // Firestore onSnapshot will update the state automatically
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer');
      }
    }
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewDialog(true);
  };



  const downloadCustomersData = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Data Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .header-info { text-align: center; margin-bottom: 20px; }
            .header-info p { margin: 5px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header-info">
            <h1>MG Solar - Customer Data Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Customers: ${filteredCustomers.length}</p>
          </div>

            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>System Type</th>
                  <th>Customer Name</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>Pincode</th>
                  <th>Kilowatt</th>
                  <th>Panel Company</th>
                  <th>Inverter Company</th>
                  <th>Quotation Price</th>
                  <th>Deal Price</th>
                </tr>
              </thead>
              <tbody>
                ${filteredCustomers.map((customer, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${customer.systemType || ''}</td>
                    <td>${customer.customerName || ''}</td>
                    <td>${customer.mobileNumber || ''}</td>
                    <td>${customer.address || ''}</td>
                    <td>${customer.pincode || ''}</td>
                    <td>${customer.kilowatt || ''} kW</td>
                    <td>${customer.panelCompanyName || ''}</td>
                    <td>${customer.inverterCompanyName || ''}</td>
                    <td>${customer.quotationPrice ? '₹' + customer.quotationPrice : ''}</td>
                    <td>${customer.dealPrice ? '₹' + customer.dealPrice : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
        </body>
      </html>
    `;

    // Create blob and download as HTML file (user can print to PDF)
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers_data.html');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Optionally open print dialog for PDF generation
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Form data:', formData);

    // Check validation first
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    console.log('Validation errors:', errors);

    if (!isValid) {
      console.log('Form validation failed, not submitting');
      return;
    }

    const submitCustomer = async () => {
      try {
        console.log('Starting customer submission...');

        // Normalize mobile number (keep only digits)
        const normalizedFormData = {
          ...formData,
          mobileNumber: formData.mobileNumber.replace(/\D/g, ''),
        };

        if (isEditing && selectedCustomer) {
          console.log('Updating existing customer:', selectedCustomer.id);
          // Update existing customer
          const customerRef = doc(db, 'customers', selectedCustomer.id);
          await updateDoc(customerRef, normalizedFormData);
          console.log('Customer updated successfully');
        } else {
          console.log('Adding new customer');
          // Check if customer with this mobile number already exists
          const q = query(collection(db, 'customers'), where('mobileNumber', '==', normalizedFormData.mobileNumber));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            throw new Error('A customer with this mobile number already exists. Please use a different mobile number.');
          }

          // Add new customer
          const { assignedEmployee, ...customerData } = normalizedFormData;
          const newCustomerData = {
            ...customerData,
            ...(assignedEmployee && assignedEmployee !== 'admin' && { createdBy: assignedEmployee }),
            ...(!assignedEmployee && employeeData?.empId && { createdBy: employeeData.empId }),
          };
          console.log('New customer data:', newCustomerData);
          const docRef = await addDoc(collection(db, 'customers'), newCustomerData);
          console.log('Customer added successfully with ID:', docRef.id);
        }

        // Reset form
        setFormData({
          systemType: '',
          customerName: '',
          address: '',
          pincode: '',
          aadharCard: '',
          panCard: '',
          mobileNumber: '',
          electricityBillNumber: '',
          kilowatt: '',
          panelCompanyName: '',
          inverterCompanyName: '',
          referredBy: '',
          bankAccountNumber: '',
          bankIfscCode: '',
          bankName: '',
          bankAddress: '',
          quotationPrice: '',
          dealPrice: '',
          acWireBrand: '',
          dcWireBrand: '',
          earthingWire: '',
          assignedEmployee: '',
        });
        setShowForm(false);
        setIsEditing(false);
        setSelectedCustomer(null);
        setErrors({});
        console.log('Form reset completed');
      } catch (error) {
        console.error('Error in submitCustomer:', error);
        throw error; // Re-throw to be caught by useFormSubmit
      }
    };

    console.log('Calling submitForm...');
    submitForm(
      submitCustomer,
      isEditing ? 'Customer updated successfully!' : 'Customer added successfully!'
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-primary mb-1 lg:mb-2">Customers</h1>
          <p className="text-foreground/70 text-sm lg:text-base">Manage customer information</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={downloadCustomersData}
            variant="outline"
            className="gap-2 justify-center"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Report</span>
            <span className="sm:hidden">Report</span>
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Customer' : 'New Customer'}</CardTitle>
          </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4">System Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="systemType">System Type <span className="text-red-500">*</span></Label>
                      <Select value={formData.systemType} onValueChange={(value) => handleSelectChange('systemType', value)}>
                        <SelectTrigger className={errors.systemType ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select system type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on grid">On Grid</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.systemType && <p className="text-red-500 text-sm">{errors.systemType}</p>}
                    </div>
                    <div>
                      <Label htmlFor="kilowatt">Kilowatt (kW) <span className="text-red-500">*</span></Label>
                      <Select value={formData.kilowatt} onValueChange={(value) => handleSelectChange('kilowatt', value)} disabled={!formData.systemType}>
                        <SelectTrigger className={errors.kilowatt ? 'border-red-500' : ''}>
                          <SelectValue placeholder={formData.systemType ? "Select KW" : "Select system type first"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2kw">2kw</SelectItem>
                          <SelectItem value="3kw">3kw</SelectItem>
                          <SelectItem value="4kw">4kw</SelectItem>
                          <SelectItem value="5kw">5kw</SelectItem>
                          <SelectItem value="6kw">6kw</SelectItem>
                          <SelectItem value="7kw">7kw</SelectItem>
                          <SelectItem value="8kw">8kw</SelectItem>
                          <SelectItem value="9kw">9kw</SelectItem>
                          <SelectItem value="10kw">10kw</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.kilowatt && <p className="text-red-500 text-sm">{errors.kilowatt}</p>}
                    </div>
                    <div>
                      <Label htmlFor="panelCompanyName">Panel Company Name <span className="text-red-500">*</span></Label>
                      <Select value={formData.panelCompanyName} onValueChange={(value) => handleSelectChange('panelCompanyName', value)} disabled={!formData.systemType}>
                        <SelectTrigger className={errors.panelCompanyName ? 'border-red-500' : ''}>
                          <SelectValue placeholder={formData.systemType ? "Select panel company" : "Select system type first"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Premier Energies">Premier</SelectItem>
                          <SelectItem value="Adani">Adani</SelectItem>
                          <SelectItem value="Utl Fujiyama">Utl Fujiyama</SelectItem>
                          <SelectItem value="Vikram Solar">Vikram Solar</SelectItem>
                          <SelectItem value="Waaree">Waaree</SelectItem>
                          <SelectItem value="Tata">Tata</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.panelCompanyName && <p className="text-red-500 text-sm">{errors.panelCompanyName}</p>}
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className={errors.customerName ? 'border-red-500' : ''}
                  />
                  {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName}</p>}
                </div>
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    className={errors.mobileNumber ? 'border-red-500' : ''}
                  />
                  {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode <span className="text-red-500">*</span></Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={errors.pincode ? 'border-red-500' : ''}
                  />
                  {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}
                </div>
                <div>
                  <Label htmlFor="aadharCard">Aadhar Card</Label>
                  <Input
                    id="aadharCard"
                    name="aadharCard"
                    value={formData.aadharCard}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="panCard">PAN Card</Label>
                  <Input
                    id="panCard"
                    name="panCard"
                    value={formData.panCard}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="electricityBillNumber">Electricity Bill Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="electricityBillNumber"
                    name="electricityBillNumber"
                    value={formData.electricityBillNumber}
                    onChange={handleChange}
                    className={errors.electricityBillNumber ? 'border-red-500' : ''}
                  />
                  {errors.electricityBillNumber && <p className="text-red-500 text-sm">{errors.electricityBillNumber}</p>}
                </div>

                 <div>
                   <Label htmlFor="referredBy">Referred By <span className="text-red-500">*</span></Label>
                   <Input
                     id="referredBy"
                     name="referredBy"
                     value={formData.referredBy}
                     onChange={handleChange}
                     className={errors.referredBy ? 'border-red-500' : ''}
                   />
                   {errors.referredBy && <p className="text-red-500 text-sm">{errors.referredBy}</p>}
                 </div>

                 {!employeeData && (
                   <div>
                     <Label htmlFor="assignedEmployee">Assign to Employee</Label>
                     <Select value={formData.assignedEmployee} onValueChange={(value) => handleSelectChange('assignedEmployee', value)}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select employee (optional)" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="admin">Admin only</SelectItem>
                         {employees.map((emp) => (
                           <SelectItem key={emp.id} value={emp.empId}>
                             {emp.name} ({emp.empId})
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                 )}
                 </div>
                 </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Solar System Details</h3>
                  <div>
                    <Label htmlFor="inverterCompanyName">Inverter Company Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="inverterCompanyName"
                      name="inverterCompanyName"
                      value={formData.inverterCompanyName}
                      onChange={handleChange}
                      className={errors.inverterCompanyName ? 'border-red-500' : ''}
                    />
                    {errors.inverterCompanyName && <p className="text-red-500 text-sm">{errors.inverterCompanyName}</p>}
                  </div>
                </div>

                <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankIfscCode">IFSC Code</Label>
                    <Input
                      id="bankIfscCode"
                      name="bankIfscCode"
                      value={formData.bankIfscCode}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAddress">Bank Address</Label>
                    <Input
                      id="bankAddress"
                      name="bankAddress"
                      value={formData.bankAddress}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Solar Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quotationPrice">Quotation Price <span className="text-red-500">*</span></Label>
                    <Input
                      id="quotationPrice"
                      name="quotationPrice"
                      type="number"
                      value={formData.quotationPrice}
                      onChange={handleChange}
                      className={errors.quotationPrice ? 'border-red-500' : ''}
                    />
                    {errors.quotationPrice && <p className="text-red-500 text-sm">{errors.quotationPrice}</p>}
                  </div>
                  <div>
                    <Label htmlFor="dealPrice">Deal Price <span className="text-red-500">*</span></Label>
                    <Input
                      id="dealPrice"
                      name="dealPrice"
                      type="number"
                      value={formData.dealPrice}
                      onChange={handleChange}
                      className={errors.dealPrice ? 'border-red-500' : ''}
                    />
                    {errors.dealPrice && <p className="text-red-500 text-sm">{errors.dealPrice}</p>}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Wire Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="acWireBrand">AC Wire Brand</Label>
                    <Select value={formData.acWireBrand} onValueChange={(value) => handleSelectChange('acWireBrand', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AC wire brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="havels">Havels</SelectItem>
                        <SelectItem value="polycab">Polycab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dcWireBrand">DC Wire Brand</Label>
                    <Select value={formData.dcWireBrand} onValueChange={(value) => handleSelectChange('dcWireBrand', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select DC wire brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="havels">Havels</SelectItem>
                        <SelectItem value="polycab">Polycab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="earthingWire">Earthing Wire</Label>
                    <Input
                      id="earthingWire"
                      name="earthingWire"
                      value={formData.earthingWire}
                      onChange={handleChange}
                      placeholder="Enter earthing wire details"
                    />
                  </div>
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
                    isEditing ? 'Update Customer' : 'Save Customer'
                  )}
                </Button>
                <Button
                  type="button"
                   onClick={() => {
                     setShowForm(false);
                     setIsEditing(false);
                     setSelectedCustomer(null);
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

      {!isEmployee && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>Filter Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1 max-w-xs">
                <Label htmlFor="employeeFilter">Filter by Employee</Label>
                <Select value={selectedEmployeeFilter} onValueChange={setSelectedEmployeeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.empId}>
                        {emp.name} ({emp.empId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-muted">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {filteredCustomers.map((customer, index) => (
              <Card key={customer.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">#{index + 1}</span>
                        <h3 className="font-semibold">{customer.customerName}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleView(customer)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(customer)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {!isEmployee && (
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(customer.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p><span className="font-medium">System Type:</span> {customer.systemType}</p>
                      <p><span className="font-medium">Mobile:</span> {customer.mobileNumber}</p>
                      <p><span className="font-medium">Address:</span> {customer.address}</p>
                      <p><span className="font-medium">Pincode:</span> {customer.pincode}</p>
                      <p><span className="font-medium">Aadhar:</span> {customer.aadharCard}</p>
                      <p><span className="font-medium">PAN:</span> {customer.panCard}</p>
                      <p><span className="font-medium">Panel:</span> {customer.panelCompanyName}</p>
                      <p><span className="font-medium">Inverter:</span> {customer.inverterCompanyName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No.</TableHead>
                  <TableHead>System Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Panel Company</TableHead>
                  <TableHead>Inverter Company</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow key={customer.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{customer.systemType}</TableCell>
                    <TableCell>{customer.customerName}</TableCell>
                    <TableCell>{customer.mobileNumber}</TableCell>
                    <TableCell>{customer.panelCompanyName}</TableCell>
                    <TableCell>{customer.inverterCompanyName}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(customer)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(customer)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {!isEmployee && (
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(customer.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div><strong>System Type:</strong> {selectedCustomer.systemType}</div>
              <div><strong>Name:</strong> {selectedCustomer.customerName}</div>
              <div><strong>Address:</strong> {selectedCustomer.address}</div>
              <div><strong>Pincode:</strong> {selectedCustomer.pincode}</div>
              <div><strong>Aadhar Card:</strong> {selectedCustomer.aadharCard}</div>
              <div><strong>PAN Card:</strong> {selectedCustomer.panCard}</div>
              <div><strong>Mobile:</strong> {selectedCustomer.mobileNumber}</div>
              <div><strong>Electricity Bill Number:</strong> {selectedCustomer.electricityBillNumber}</div>
              <div><strong>Kilowatt:</strong> {selectedCustomer.kilowatt} kW</div>
              <div><strong>Panel Company:</strong> {selectedCustomer.panelCompanyName}</div>
              <div><strong>Inverter Company:</strong> {selectedCustomer.inverterCompanyName}</div>
              <div><strong>Referred By:</strong> {selectedCustomer.referredBy}</div>
              <div><strong>Bank Account:</strong> {selectedCustomer.bankAccountNumber}</div>
              <div><strong>IFSC:</strong> {selectedCustomer.bankIfscCode}</div>
              <div><strong>Bank Name:</strong> {selectedCustomer.bankName}</div>
              <div><strong>Bank Address:</strong> {selectedCustomer.bankAddress}</div>
               <div><strong>Quotation Price:</strong> {selectedCustomer.quotationPrice}</div>
               <div><strong>Deal Price:</strong> {selectedCustomer.dealPrice}</div>
               <div><strong>AC Wire Brand:</strong> {selectedCustomer.acWireBrand}</div>
               <div><strong>DC Wire Brand:</strong> {selectedCustomer.dcWireBrand}</div>
               <div><strong>Earthing Wire:</strong> {selectedCustomer.earthingWire}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}