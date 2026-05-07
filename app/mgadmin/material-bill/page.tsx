'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface MaterialBill {
  id: string;
  date: string;
  billNumber: string;
  companyName: string;
  amount: string;
  pdfUrl: string;
  createdAt: string;
}

export default function AdminMaterialBillPage() {
  const router = useRouter();
  const [bills, setBills] = useState<MaterialBill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MaterialBill | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const { isLoading, submitForm } = useFormSubmit();
  const [formData, setFormData] = useState({
    date: '',
    billNumber: '',
    companyName: '',
    amount: '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'materialBills'));
      const billsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaterialBill));
      setBills(billsData);
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date.trim()) newErrors.date = 'Date is required';
    if (!formData.billNumber.trim()) newErrors.billNumber = 'Bill number is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.amount.trim()) newErrors.amount = 'Amount is required';
    if (!pdfFile && !isEditing) newErrors.pdf = 'PDF file is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (bill: MaterialBill) => {
    setSelectedBill(bill);
    setFormData({
      date: bill.date,
      billNumber: bill.billNumber,
      companyName: bill.companyName,
      amount: bill.amount,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await deleteDoc(doc(db, 'materialBills', id));
        loadBills();
      } catch (error) {
        console.error('Error deleting bill:', error);
      }
    }
  };

  const handleView = (bill: MaterialBill) => {
    setSelectedBill(bill);
    setViewDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      setErrors({ pdf: 'Please select a valid PDF file' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitBill = async () => {
      let pdfUrl = selectedBill?.pdfUrl || '';

      if (pdfFile) {
        try {
          const storageRef = ref(storage, `materialBills/${Date.now()}_${pdfFile.name}`);
          await uploadBytes(storageRef, pdfFile);
          pdfUrl = await getDownloadURL(storageRef);
        } catch (error) {
          console.error('Error uploading PDF:', error);
          throw new Error('Failed to upload PDF');
        }
      }

      try {
        if (isEditing && selectedBill) {
          await updateDoc(doc(db, 'materialBills', selectedBill.id), {
            ...formData,
            pdfUrl,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await addDoc(collection(db, 'materialBills'), {
            ...formData,
            pdfUrl,
            createdAt: new Date().toISOString(),
          });
        }

        setFormData({
          date: '',
          billNumber: '',
          companyName: '',
          amount: '',
        });
        setPdfFile(null);
        setShowForm(false);
        setIsEditing(false);
        setSelectedBill(null);
        setErrors({});
        loadBills();
      } catch (error) {
        console.error('Error saving bill:', error);
      }
    };

    if (validateForm()) {
      submitForm(submitBill, isEditing ? 'Bill updated successfully!' : 'Bill added successfully!');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Material Bills</h1>
          <p className="text-foreground/70">Manage material bill records</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Bill
        </Button>
      </div>

      {showForm && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Bill' : 'New Bill'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                </div>
                <div>
                  <Label htmlFor="billNumber">Bill Number *</Label>
                  <Input
                    id="billNumber"
                    value={formData.billNumber}
                    onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                    className={errors.billNumber ? 'border-red-500' : ''}
                  />
                  {errors.billNumber && <p className="text-red-500 text-sm">{errors.billNumber}</p>}
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className={errors.companyName ? 'border-red-500' : ''}
                  />
                  {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="pdf">PDF Bill Upload {!isEditing && '*'}</Label>
                <Input
                  id="pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className={errors.pdf ? 'border-red-500' : ''}
                />
                {errors.pdf && <p className="text-red-500 text-sm">{errors.pdf}</p>}
                {pdfFile && <p className="text-sm text-muted-foreground">Selected: {pdfFile.name}</p>}
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditing ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    isEditing ? 'Update Bill' : 'Submit Bill'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setIsEditing(false);
                    setSelectedBill(null);
                    setFormData({
                      date: '',
                      billNumber: '',
                      companyName: '',
                      amount: '',
                    });
                    setPdfFile(null);
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
          <CardTitle>Bill List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {bills.map((bill) => (
              <Card key={bill.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{bill.companyName}</h3>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleView(bill)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(bill)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(bill.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p><span className="font-medium">Bill Number:</span> {bill.billNumber}</p>
                      <p><span className="font-medium">Amount:</span> ₹{bill.amount}</p>
                      <p><span className="font-medium">Date:</span> {new Date(bill.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{bill.companyName}</TableCell>
                    <TableCell>{bill.billNumber}</TableCell>
                    <TableCell>₹{bill.amount}</TableCell>
                    <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(bill)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(bill)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(bill.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div><strong>Company Name:</strong> {selectedBill.companyName}</div>
              <div><strong>Bill Number:</strong> {selectedBill.billNumber}</div>
              <div><strong>Amount:</strong> ₹{selectedBill.amount}</div>
              <div><strong>Date:</strong> {new Date(selectedBill.date).toLocaleDateString()}</div>
              <div><strong>PDF:</strong> <a href={selectedBill.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View PDF</a></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}