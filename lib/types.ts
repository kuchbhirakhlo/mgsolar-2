export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  capacity: string;
  image: string;
  date: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp?: any;
}

export interface CareerApplication {
  id?: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  resume: string;
  message: string;
  timestamp?: any;
}

export interface Employee {
  id?: string;
  mobileNumber: string;
  name: string;
  email?: string;
  password: string;
  empId: string;
  role: 'employee' | 'installer';
  isBlocked: boolean;
  firebaseUid?: string;
  createdAt?: any;
}

export interface Customer {
  id: string;
  systemType: string;
  customerName: string;
  address: string;
  pincode: string;
  aadharCard: string;
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
  wireType: string;
  acWireBrand?: string;
  dcWireBrand?: string;
  createdBy?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  projectCost: string;
  firstPayment: string;
  secondPayment: string;
  thirdPayment: string;
  modeOfPayment: string;
  transactionId: string;
  notes: string;
  createdAt: string;
}

export interface PaymentEntry {
  id: string;
  amount: string;
  paymentType: string; // e.g., 'salary', 'commission', 'bonus', 'advance'
  modeOfPayment: string;
  transactionId: string;
  notes: string;
  createdAt: string;
}

export interface EmployeePayment {
  id: string;
  employeeId: string;
  employeeName: string;
  payments: PaymentEntry[];
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
}
