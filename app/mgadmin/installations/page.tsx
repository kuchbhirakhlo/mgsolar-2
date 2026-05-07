'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Eye, Edit2, Trash2, Loader2, Download } from 'lucide-react';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getEmployees } from '@/lib/firebase-service';
import type { Employee } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Customer {
  id: string;
  customerName: string;
  address: string;
  mobileNumber: string;
  panelCompanyName: string;
  inverterCompanyName: string;
  // other fields
}

interface Installation {
  id: string;
  customerId: string;
  installerName: string;
  inverterSerialNumber: string;
  acWireUsed: string;
  dcWireUsed: string;
  earthingWireUsed: string;
  panelSerialNumbers: string[];
  frontLegHeight: string;
  backLegHeight: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  specialNotes: string;
  createdAt: string;
}

export default function AdminInstallationsPage() {
  const router = useRouter();
  const [isEmployee, setIsEmployee] = useState(false);
  const [isInstaller, setIsInstaller] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [installers, setInstallers] = useState<(Employee & { id: string })[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    installerName: '',
    inverterSerialNumber: '',
    acWireUsed: '',
    dcWireUsed: '',
    earthingWireUsed: '',
    panelSerialNumbers: [''],
    frontLegHeight: '',
    backLegHeight: '',
    specialNotes: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mountedRef = useRef(true);
  const { isLoading, submitForm } = useFormSubmit();

  useEffect(() => {
    const employeeDataStr = sessionStorage.getItem('employeeData');
    if (employeeDataStr) {
      const empData = JSON.parse(employeeDataStr);
      if (empData.role === 'installer') {
        setIsInstaller(true);
      } else {
        setIsEmployee(true);
      }
      setEmployeeData(empData);
    }
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Load customers and installations from Firestore
    const customersRef = collection(db, 'customers');
    const unsubscribeCustomers = onSnapshot(customersRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      if (mountedRef.current) {
        setCustomers(customersData);
      }
    });

    const installationsRef = collection(db, 'installations');
    const unsubscribeInstallations = onSnapshot(installationsRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const installationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Installation[];

      // Filter installations based on user role
      let filteredData = installationsData;
      if (isInstaller && employeeData) {
        filteredData = installationsData.filter(inst => inst.installerName === employeeData.name);
      }

      if (mountedRef.current) {
        setInstallations(filteredData);
      }
    });

    // Load installers for admin dropdown
    const loadInstallers = async () => {
      try {
        const employeesData = await getEmployees();
        const installerEmployees = employeesData.filter(emp => emp.role === 'installer' && !emp.isBlocked);
        setInstallers(installerEmployees);
      } catch (error) {
        console.error('Error loading installers:', error);
      }
    };
    loadInstallers();

    return () => {
      unsubscribeCustomers();
      unsubscribeInstallations();
    };
  }, [isInstaller, employeeData]);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      // Get geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          },
          (err) => {
            console.error('Geolocation error:', err);
            // Try with different options if first attempt fails
            if (err.code === err.PERMISSION_DENIED) {
              alert('Location permission is required to geotag the photo. Please enable location access and try again.');
            } else {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                },
                (fallbackErr) => {
                  console.error('Fallback geolocation error:', fallbackErr);
                  alert('Unable to get location. Please ensure location services are enabled.');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
              );
            }
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    }
  };

  const addSerialNumber = () => {
    if (formData.panelSerialNumbers.length < 10) {
      setFormData({
        ...formData,
        panelSerialNumbers: [...formData.panelSerialNumbers, ''],
      });
    }
  };

  const removeSerialNumber = (index: number) => {
    if (formData.panelSerialNumbers.length > 1) {
      setFormData({
        ...formData,
        panelSerialNumbers: formData.panelSerialNumbers.filter((_, i) => i !== index),
      });
    }
  };

  const updateSerialNumber = (index: number, value: string) => {
    const newSerials = [...formData.panelSerialNumbers];
    newSerials[index] = value;
    setFormData({ ...formData, panelSerialNumbers: newSerials });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Only require installer name for admins (not for installers since it's auto-filled)
    if (!isInstaller && !formData.installerName.trim()) newErrors.installerName = 'Installer name is required';
    if (formData.panelSerialNumbers.some(s => !s.trim())) newErrors.serials = 'All serial numbers must be filled';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (installation: Installation) => {
    const cust = customers.find(c => c.id === installation.customerId);
    setCustomer(cust || null);
    setSelectedInstallation(installation);
    setFormData({
      installerName: installation.installerName,
      inverterSerialNumber: installation.inverterSerialNumber || '',
      acWireUsed: installation.acWireUsed || '',
      dcWireUsed: installation.dcWireUsed || '',
      earthingWireUsed: installation.earthingWireUsed || '',
      panelSerialNumbers: installation.panelSerialNumbers,
      frontLegHeight: installation.frontLegHeight || '',
      backLegHeight: installation.backLegHeight || '',
      specialNotes: installation.specialNotes,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this installation?')) {
      try {
        await deleteDoc(doc(db, 'installations', id));
        // Firestore onSnapshot will update the state automatically
      } catch (error) {
        console.error('Error deleting installation:', error);
        alert('Error deleting installation');
      }
    }
  };

  const handleView = (installation: Installation) => {
    setSelectedInstallation(installation);
    setViewDialog(true);
  };

  const handleDownloadPhoto = (photoUrl: string) => {
    window.open(photoUrl, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitInstallation = async () => {
      // Auto-fill installer name for installers
      const installerName = isInstaller && employeeData ? employeeData.name : formData.installerName;
      let photoUrl: string | undefined;

      if (photo) {
        const storageRef = ref(storage, `installations/${Date.now()}_${photo.name}`);
        const snapshot = await uploadBytes(storageRef, photo);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      if (isEditing && selectedInstallation) {
        // Update existing installation
        const installationRef = doc(db, 'installations', selectedInstallation.id);
        const updatedData: any = {
          installerName: installerName,
          inverterSerialNumber: formData.inverterSerialNumber,
          acWireUsed: formData.acWireUsed,
          dcWireUsed: formData.dcWireUsed,
          earthingWireUsed: formData.earthingWireUsed,
          panelSerialNumbers: formData.panelSerialNumbers.filter(s => s.trim()),
          frontLegHeight: formData.frontLegHeight,
          backLegHeight: formData.backLegHeight,
          specialNotes: formData.specialNotes,
        };
        if (photoUrl !== undefined || selectedInstallation.photoUrl !== undefined) {
          updatedData.photoUrl = photoUrl || selectedInstallation.photoUrl;
        }
        if (location?.latitude !== undefined || selectedInstallation.latitude !== undefined) {
          updatedData.latitude = location?.latitude || selectedInstallation.latitude;
        }
        if (location?.longitude !== undefined || selectedInstallation.longitude !== undefined) {
          updatedData.longitude = location?.longitude || selectedInstallation.longitude;
        }
        await updateDoc(installationRef, updatedData);
        // Firestore onSnapshot will update the state automatically
      } else {
        // Add new installation
        const newInstallationData: any = {
          customerId: customer!.id,
          installerName: installerName,
          inverterSerialNumber: formData.inverterSerialNumber,
          acWireUsed: formData.acWireUsed,
          dcWireUsed: formData.dcWireUsed,
          earthingWireUsed: formData.earthingWireUsed,
          panelSerialNumbers: formData.panelSerialNumbers.filter(s => s.trim()),
          frontLegHeight: formData.frontLegHeight,
          backLegHeight: formData.backLegHeight,
          specialNotes: formData.specialNotes,
          createdAt: new Date().toISOString(),
        };
        if (photoUrl !== undefined) {
          newInstallationData.photoUrl = photoUrl;
        }
        if (location?.latitude !== undefined) {
          newInstallationData.latitude = location.latitude;
        }
        if (location?.longitude !== undefined) {
          newInstallationData.longitude = location.longitude;
        }
        await addDoc(collection(db, 'installations'), newInstallationData);
        // Firestore onSnapshot will update the state automatically
      }

                           setFormData({
                             installerName: isInstaller && employeeData ? employeeData.name : '',
                             inverterSerialNumber: '',
                             acWireUsed: '',
                             dcWireUsed: '',
                             earthingWireUsed: '',
                             panelSerialNumbers: [''],
                             frontLegHeight: '',
                             backLegHeight: '',
                             specialNotes: '',
                           });
      setPhoto(null);
      setLocation(null);
      setCustomer(null);
      setMobileNumber('');
      setShowForm(false);
      setIsEditing(false);
      setSelectedInstallation(null);
    };

    if (!customer) {
      setErrors({ general: 'Customer must be fetched first' });
      return;
    }

    if (validateForm()) {
      submitForm(
        submitInstallation,
        isEditing ? 'Installation updated successfully!' : 'Installation added successfully!'
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Installations</h1>
          <p className="text-foreground/70">Manage installation records</p>
        </div>
        {(!isEmployee || isInstaller) && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Installation
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Installation' : 'New Installation'}</CardTitle>
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
                      <Label>Mobile</Label>
                      <Input value={customer.mobileNumber} readOnly />
                    </div>
                    <div>
                      <Label>Panel Company</Label>
                      <Input value={customer.panelCompanyName} readOnly />
                    </div>
                    <div>
                      <Label>Inverter Company</Label>
                      <Input value={customer.inverterCompanyName} readOnly />
                    </div>
                  </div>
                </div>
              )}

              {customer && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Installation Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <Label htmlFor="installerName">Installer Name *</Label>
                         {isInstaller ? (
                           <Input
                             id="installerName"
                             value={employeeData?.name || ''}
                             readOnly
                             className="bg-muted"
                           />
                         ) : (
                           <Select
                             value={formData.installerName}
                             onValueChange={(value) => setFormData({ ...formData, installerName: value })}
                           >
                             <SelectTrigger className={errors.installerName ? 'border-red-500' : ''}>
                               <SelectValue placeholder="Select installer" />
                             </SelectTrigger>
                             <SelectContent>
                               {installers.map((installer) => (
                                 <SelectItem key={installer.id} value={installer.name}>
                                   {installer.name}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         )}
                         {errors.installerName && <p className="text-red-500 text-sm">{errors.installerName}</p>}
                       </div>
                      <div>
                        <Label htmlFor="inverterSerialNumber">Inverter Serial Number</Label>
                        <Input
                          id="inverterSerialNumber"
                          value={formData.inverterSerialNumber}
                          onChange={(e) => setFormData({ ...formData, inverterSerialNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="acWireUsed">AC Wire Used</Label>
                        <Input
                          id="acWireUsed"
                          value={formData.acWireUsed}
                          onChange={(e) => setFormData({ ...formData, acWireUsed: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dcWireUsed">DC Wire Used</Label>
                        <Input
                          id="dcWireUsed"
                          value={formData.dcWireUsed}
                          onChange={(e) => setFormData({ ...formData, dcWireUsed: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="earthingWireUsed">Earthing Wire Used</Label>
                        <Input
                          id="earthingWireUsed"
                          value={formData.earthingWireUsed}
                          onChange={(e) => setFormData({ ...formData, earthingWireUsed: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="frontLegHeight">Front Leg Height</Label>
                        <Input
                          id="frontLegHeight"
                          value={formData.frontLegHeight}
                          onChange={(e) => setFormData({ ...formData, frontLegHeight: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="backLegHeight">Back Leg Height</Label>
                        <Input
                          id="backLegHeight"
                          value={formData.backLegHeight}
                          onChange={(e) => setFormData({ ...formData, backLegHeight: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Panel Serial Numbers *</h3>
                    {formData.panelSerialNumbers.map((serial, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={serial}
                          onChange={(e) => updateSerialNumber(index, e.target.value)}
                          placeholder={`Serial ${index + 1}`}
                        />
                        {formData.panelSerialNumbers.length > 1 && (
                          <Button type="button" onClick={() => removeSerialNumber(index)} variant="outline" size="sm">
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {formData.panelSerialNumbers.length < 10 && (
                      <Button type="button" onClick={addSerialNumber} variant="outline" size="sm">
                        <Plus className="w-4 h-4" /> Add Serial Number
                      </Button>
                    )}
                    {errors.serials && <p className="text-red-500 text-sm">{errors.serials}</p>}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Geotagged Photo</h3>
                    <Input type="file" accept="image/*" onChange={handlePhotoChange} />
                    {location && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Location: {location.latitude}, {location.longitude}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="specialNotes">Special Notes</Label>
                    <Textarea
                      id="specialNotes"
                      value={formData.specialNotes}
                      onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditing ? 'Updating...' : 'Submitting...'}
                        </>
                      ) : (
                        isEditing ? 'Update Installation' : 'Submit Installation'
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setIsEditing(false);
                        setSelectedInstallation(null);
                        setCustomer(null);
                         setMobileNumber('');
       setFormData({
        installerName: isInstaller && employeeData ? employeeData.name : '',
        inverterSerialNumber: '',
        acWireUsed: '',
        dcWireUsed: '',
        earthingWireUsed: '',
        panelSerialNumbers: [''],
        frontLegHeight: '',
        backLegHeight: '',
        specialNotes: '',
      });
                        setPhoto(null);
                        setLocation(null);
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
          <CardTitle>Installation List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {installations.map((inst) => {
              const cust = customers.find(c => c.id === inst.customerId);
              return (
                <Card key={inst.id} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{cust?.customerName || 'Unknown'}</h3>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleView(inst)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {inst.photoUrl && (
                              <Button size="sm" variant="outline" onClick={() => handleDownloadPhoto(inst.photoUrl!)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleEdit(inst)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                           {!isEmployee && !isInstaller && (
                             <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(inst.id)}>
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           )}
                         </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><span className="font-medium">Installer:</span> {inst.installerName}</p>
                        <p><span className="font-medium">Panels:</span> {inst.panelSerialNumbers.length} serials</p>
                        <p><span className="font-medium">Date:</span> {new Date(inst.createdAt).toLocaleDateString()}</p>
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
                  <TableHead>Installer Name</TableHead>
                  <TableHead>Panel Serials</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installations.map((inst) => {
                  const cust = customers.find(c => c.id === inst.customerId);
                  return (
                    <TableRow key={inst.id}>
                      <TableCell>{cust?.customerName || 'Unknown'}</TableCell>
                      <TableCell>{inst.installerName}</TableCell>
                      <TableCell>{inst.panelSerialNumbers.length}</TableCell>
                      <TableCell>{new Date(inst.createdAt).toLocaleDateString()}</TableCell>
                       <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(inst)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {inst.photoUrl && (
                              <Button size="sm" variant="outline" onClick={() => handleDownloadPhoto(inst.photoUrl!)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleEdit(inst)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                           {!isEmployee && !isInstaller && (
                             <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(inst.id)}>
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           )}
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
            <DialogTitle>Installation Details</DialogTitle>
          </DialogHeader>
          {selectedInstallation && (
            <div className="space-y-4">
              <div><strong>Customer:</strong> {customers.find(c => c.id === selectedInstallation.customerId)?.customerName}</div>
              <div><strong>Installer:</strong> {selectedInstallation.installerName}</div>
              <div><strong>Inverter Serial:</strong> {selectedInstallation.inverterSerialNumber}</div>
              <div><strong>AC Wire Used:</strong> {selectedInstallation.acWireUsed}</div>
              <div><strong>DC Wire Used:</strong> {selectedInstallation.dcWireUsed}</div>
              <div><strong>Earthing Wire Used:</strong> {selectedInstallation.earthingWireUsed}</div>
              <div><strong>Front Leg Height:</strong> {selectedInstallation.frontLegHeight}</div>
              <div><strong>Back Leg Height:</strong> {selectedInstallation.backLegHeight}</div>
              <div><strong>Panel Serials:</strong> {selectedInstallation.panelSerialNumbers.join(', ')}</div>
              <div><strong>Special Notes:</strong> {selectedInstallation.specialNotes}</div>
              <div><strong>Date:</strong> {new Date(selectedInstallation.createdAt).toLocaleDateString()}</div>
              {selectedInstallation.latitude && <div><strong>Location:</strong> {selectedInstallation.latitude}, {selectedInstallation.longitude}</div>}
                {selectedInstallation.photoUrl && (
                  <div>
                    <strong>Photo:</strong>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPhoto(selectedInstallation.photoUrl!)}
                      className="flex items-center gap-2 ml-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}