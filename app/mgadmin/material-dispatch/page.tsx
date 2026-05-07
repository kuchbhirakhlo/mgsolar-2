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
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface Customer {
  id: string;
  customerName: string;
  address: string;
  mobileNumber: string;
}

interface MaterialDispatch {
  id: string;
  customerId: string;
  billNumber: string;
  data: { name: string; quantity: string; price: string }[];
  createdAt: string;
}

export default function AdminMaterialDispatchPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dispatches, setDispatches] = useState<MaterialDispatch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState<MaterialDispatch | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const { isLoading, submitForm } = useFormSubmit();
  const [mobileNumber, setMobileNumber] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [billNumber, setBillNumber] = useState('');
  const materials = [
    'Rufter',
    'Perlin',
    'Base plate',
    'Fasstner',
    'Cable trey',
    'Nut bolt',
    'Pipe',
    'Clip',
    'Elbow',
    'Acdb',
    'Dcdb',
    'Cbr',
    'L A',
    'Chemicsl bag',
    'MC4 connector',
    'Universal clamp',
    'cable tie',
    'inverter',
    'panel',
    'wire ac',
    'wire dc',
    'wire earthing',
    'tape'
  ];
  const fixedCount = materials.length;
  const emptyCount = 5;
  const [data, setData] = useState<{name: string, quantity: string, price: string}[]>([
    ...materials.map(name => ({name, quantity: '', price: ''})),
    ...Array(emptyCount).fill({name: '', quantity: '', price: ''})
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});



  useEffect(() => {
    // Load customers from Firebase
    const customersRef = collection(db, 'customers');
    const unsubscribeCustomers = onSnapshot(customersRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      setCustomers(customersData);
    });

    // Load material dispatches from Firebase
    const dispatchesRef = collection(db, 'materialDispatches');
    const unsubscribeDispatches = onSnapshot(dispatchesRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const dispatchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaterialDispatch[];
      setDispatches(dispatchesData);
    });

    return () => {
      unsubscribeCustomers();
      unsubscribeDispatches();
    };
  }, []);

  const fetchCustomer = () => {
    if (!mobileNumber.trim()) {
      setErrors({ mobile: 'Mobile number is required' });
      return;
    }
    const found = customers.find(c => c.mobileNumber === mobileNumber);
    if (found) {
      setCustomer(found);
      setErrors({});
    } else {
      setErrors({ mobile: 'Customer not found' });
      setCustomer(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!billNumber.trim()) newErrors.billNumber = 'Bill number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (dispatch: MaterialDispatch) => {
    const cust = customers.find(c => c.id === dispatch.customerId);
    setCustomer(cust || null);
    setSelectedDispatch(dispatch);
    setBillNumber(dispatch.billNumber);
    setData(dispatch.data);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dispatch?')) {
      await deleteDoc(doc(db, 'materialDispatches', id));
    }
  };

  const handleView = (dispatch: MaterialDispatch) => {
    setSelectedDispatch(dispatch);
    setViewDialog(true);
  };

  const updateData = (index: number, updatedItem: {name: string, quantity: string, price: string}) => {
    const newData = [...data];
    newData[index] = updatedItem;
    setData(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitDispatch = async () => {
      if (isEditing && selectedDispatch) {
        await updateDoc(doc(db, 'materialDispatches', selectedDispatch.id), {
          billNumber,
          data,
        });
      } else {
        await addDoc(collection(db, 'materialDispatches'), {
          customerId: customer!.id,
          billNumber,
          data,
          createdAt: new Date().toISOString(),
        });
      }

                        setData([
                          ...materials.map(name => ({name, quantity: '', price: ''})),
                          ...Array(emptyCount).fill({name: '', quantity: '', price: ''})
                        ]);
      setCustomer(null);
      setMobileNumber('');
      setBillNumber('');
      setShowForm(false);
      setIsEditing(false);
      setSelectedDispatch(null);
      setErrors({});
    };

    if (!customer) {
      setErrors({ general: 'Customer must be fetched first' });
      return;
    }

    if (validateForm()) {
      submitForm(
        submitDispatch,
        isEditing ? 'Dispatch updated successfully!' : 'Dispatch added successfully!'
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-primary mb-1 lg:mb-2">Material Dispatch</h1>
          <p className="text-foreground/70 text-sm lg:text-base">Manage material dispatch records</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Dispatch
        </Button>
      </div>

      {showForm && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Dispatch' : 'New Dispatch'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="mobileNumber">Customer Mobile Number *</Label>
                <div className="flex gap-2">
                  <Input
                    id="mobileNumber"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className={errors.mobile ? 'border-red-500' : ''}
                  />
                  <Button type="button" onClick={fetchCustomer} variant="outline">
                    Fetch Customer
                  </Button>
                </div>
                {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
              </div>

              {customer && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={customer.customerName} readOnly />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input value={customer.address} readOnly />
                    </div>
                    <div>
                      <Label>Bill Number *</Label>
                      <Input
                        value={billNumber}
                        onChange={(e) => setBillNumber(e.target.value)}
                        className={errors.billNumber ? 'border-red-500' : ''}
                      />
                      {errors.billNumber && <p className="text-red-500 text-sm">{errors.billNumber}</p>}
                    </div>
                  </div>
                </div>
              )}

              {customer && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Dispatch Data</h3>
                    <div className="space-y-4">
                      {data.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`name-${index}`}>Material Name</Label>
                            <Input
                              id={`name-${index}`}
                              placeholder="Material Name"
                              value={item.name}
                              onChange={(e) => updateData(index, { ...item, name: e.target.value })}
                              readOnly={index < fixedCount}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                            <Input
                              id={`quantity-${index}`}
                              value={item.quantity}
                              onChange={(e) => updateData(index, { ...item, quantity: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`price-${index}`}>Price</Label>
                            <Input
                              id={`price-${index}`}
                              type="number"
                              value={item.price}
                              onChange={(e) => updateData(index, { ...item, price: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-md font-semibold mb-2">Total Price: ₹{data.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0).toFixed(2)}</h4>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditing ? 'Updating...' : 'Submitting...'}
                        </>
                      ) : (
                        isEditing ? 'Update Dispatch' : 'Submit Dispatch'
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setIsEditing(false);
                        setSelectedDispatch(null);
                        setCustomer(null);
                        setMobileNumber('');
                        setBillNumber('');
      setData([
        ...materials.map(name => ({name, quantity: '', price: ''})),
        ...Array(emptyCount).fill({name: '', quantity: '', price: ''})
      ]);
                        setErrors({});
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-muted">
        <CardHeader>
          <CardTitle>Dispatch List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {dispatches.map((dispatch) => {
              const cust = customers.find(c => c.id === dispatch.customerId);
              return (
                <Card key={dispatch.id} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{cust?.customerName || 'Unknown'}</h3>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleView(dispatch)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(dispatch)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(dispatch.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><span className="font-medium">Bill Number:</span> {dispatch.billNumber}</p>
                        <p><span className="font-medium">Date:</span> {new Date(dispatch.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dispatches.map((dispatch) => {
                  const cust = customers.find(c => c.id === dispatch.customerId);
                  return (
                    <TableRow key={dispatch.id}>
                      <TableCell>{cust?.customerName || 'Unknown'}</TableCell>
                      <TableCell>{dispatch.billNumber}</TableCell>
                      <TableCell>{new Date(dispatch.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleView(dispatch)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(dispatch)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(dispatch.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispatch Details</DialogTitle>
          </DialogHeader>
          {selectedDispatch && (
            <div className="space-y-4">
              <div><strong>Customer:</strong> {customers.find(c => c.id === selectedDispatch.customerId)?.customerName}</div>
              <div><strong>Bill Number:</strong> {selectedDispatch.billNumber}</div>
              <div><strong>Data:</strong></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedDispatch.data.map((item, index) => (
                  <div key={index} className="text-sm">
                    <strong>{item.name}:</strong> Qty: {item.quantity}, Price: ₹{item.price}
                  </div>
                ))}
              </div>
              <div><strong>Total Price:</strong> ₹{selectedDispatch.data.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0).toFixed(2)}</div>
              <div><strong>Date:</strong> {new Date(selectedDispatch.createdAt).toLocaleDateString()}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}