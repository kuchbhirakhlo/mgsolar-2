"use client";

import React, { useState, useEffect, useRef } from "react";
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { pdf, Document, Page, Text, View, StyleSheet, Image as PDFImage, DocumentProps } from '@react-pdf/renderer';

// Utility function
const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";

  const belowTwenty = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const helper = (n: number): string => {
    if (n < 20) return belowTwenty[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + belowTwenty[n % 10] : "");
    if (n < 1000) return belowTwenty[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + helper(n % 100) : "");
    if (n < 100000) return helper(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + helper(n % 1000) : "");
    if (n < 10000000) return helper(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + helper(n % 100000) : "");
    return helper(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + helper(n % 10000000) : "");
  };

  return helper(num);
};

interface Quotation {
  id: string;
  customerId: string;
  quotationNo: string;
  date: string;
  customerName: string;
  address: string;
  price: string;
  mobileNumber: string;
  batteryCompanyName: string;
  systemType: string;
  kilowatt: string;
  panelCompanyName: string;
  inverterCompanyName: string;
  referredBy: string;
  createdAt: string;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    marginBottom: 5,
  },
  table: {
    marginTop: 20,
    border: '1pt solid black',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    border: '1pt solid black',
    padding: 5,
    flex: 1,
  },
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImage: {
    width: '100%',
    height: 50,
  },
  footerImage: {
    width: '100%',
    height: 20,
  },
  quotationNo: {
    position: 'absolute',
    top: 40,
    right: 40,
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
});

// PDF Component
const QuotationPDF = ({ form }: { form: any }) => (
  <Document>
    {/* Page 1 */}
    <Page size="A4" style={styles.page}>
      <View style={styles.watermark}>
        <PDFImage src="/mgsolarlogo.png" style={{ width: 200, height: 200 }} />
      </View>
      <PDFImage src="/mgsolarheader.png" style={styles.headerImage} />
      <Text style={styles.quotationNo}>Quotation No: {form.quotationNo}</Text>
      <View style={{ marginTop: 40 }}>
        <Text style={styles.text}>To,</Text>
        <Text style={styles.text}>Customer Name: <Text style={{ fontWeight: 'bold' }}>{form.customerName}</Text></Text>
        <Text style={styles.text}>Address: {form.address}</Text>
        <Text style={styles.text}>Subject: {form.kilowatt} KW Solar Quotation for Supply & Installation of Rooftop System</Text>
        <Text style={styles.text}>Dear Sir/Madam,</Text>
        <Text style={styles.text}>
          With reference to your requirement, we are pleased to submit our quotation for Supply,
          Installation, Testing & Commissioning of a {form.kilowatt} KW Grid-Connected Solar Rooftop System at your premises.
        </Text>
        <Text style={styles.header}>SYSTEM DETAILS</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>S.No.</Text>
            <Text style={styles.tableCell}>Particulars</Text>
            <Text style={styles.tableCell}>Description</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>1</Text>
            <Text style={styles.tableCell}>System Capacity</Text>
            <Text style={styles.tableCell}>{form.kilowatt} KW ({form.systemType})</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>2</Text>
            <Text style={styles.tableCell}>Solar Panels</Text>
            <Text style={styles.tableCell}>{form.panelCompanyName}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>3</Text>
            <Text style={styles.tableCell}>Inverter</Text>
            <Text style={styles.tableCell}>{form.inverterCompanyName}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>4</Text>
            <Text style={styles.tableCell}>Structure</Text>
            <Text style={styles.tableCell}>GI / Aluminium Rooftop</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>5</Text>
            <Text style={styles.tableCell}>Generation</Text>
            <Text style={styles.tableCell}>{form.kilowatt ? (() => {
              const kw = parseFloat(form.kilowatt.replace(/[^\d.]/g, '')) || 0;
              const min = kw * 4;
              const max = kw * 5;
              return `${min}–${max} Units per Day`;
            })() : "Units per Day"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>6</Text>
            <Text style={styles.tableCell}>ACDB & DCDB</Text>
            <Text style={styles.tableCell}>Polycab / Havells</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>7</Text>
            <Text style={styles.tableCell}>Wire</Text>
            <Text style={styles.tableCell}>Polycab (4 sq mm)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>8</Text>
            <Text style={styles.tableCell}>Earthing</Text>
            <Text style={styles.tableCell}>Green (4 sq mm)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>9</Text>
            <Text style={styles.tableCell}>Warranty</Text>
            <Text style={styles.tableCell}>Panel: 25+ Years, Inverter: 5–10 Years</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>10</Text>
            <Text style={styles.tableCell}>Battery</Text>
            <Text style={styles.tableCell}>{form.batteryCompanyName}</Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <PDFImage src="/mgsolarfooter.png" style={styles.footerImage} />
      </View>
    </Page>
    {/* Page 2 */}
    <Page size="A4" style={styles.page}>
      <View style={styles.watermark}>
        <PDFImage src="/mgsolarlogo.png" style={{ width: 200, height: 200 }} />
      </View>
      <PDFImage src="/mgsolarheader.png" style={styles.headerImage} />
      <View style={{ marginTop: 40 }}>
        <Text style={styles.header}>PRICE BREAKUP</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{form.kilowatt} KW Solar Rooftop System</Text>
            <Text style={styles.tableCell}>₹ {form.price}/-</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Installation & Commissioning</Text>
            <Text style={styles.tableCell}>Included</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Transportation</Text>
            <Text style={styles.tableCell}>Not Included</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Net Metering Assistance</Text>
            <Text style={styles.tableCell}>Included</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>GST</Text>
            <Text style={styles.tableCell}>Included</Text>
          </View>
          <View style={[styles.tableRow, { fontWeight: 'bold' }]}>
            <Text style={styles.tableCell}>Total Amount Payable</Text>
            <Text style={styles.tableCell}>₹ {form.price}/-</Text>
          </View>
        </View>
        <Text style={styles.text}>(Amount in words: Rupees {numberToWords(parseInt(form.price || '0'))} Only)</Text>
        <Text style={styles.header}>TERMS & CONDITIONS</Text>
        <Text style={styles.text}>Validity of quotation: 15 days</Text>
        <Text style={styles.text}>Installation Timeline: 15–25 Working Days</Text>
        <Text style={styles.text}>Net metering subject to DISCOM approval.</Text>
        <Text style={styles.text}>System generation depends on sunlight & site conditions.</Text>
        <Text style={styles.text}>Payment Terms: 70% Advance, 20% Before Installation, 10% After Commissioning</Text>
        <Text style={styles.text}>Operation & maintenance charges are not included in this price.</Text>
        <Text style={styles.header}>Company Bank Details</Text>
        <Text style={styles.text}>Bank Name: Punjab National Bank</Text>
        <Text style={styles.text}>Account No.: 6193002100003379</Text>
        <Text style={styles.text}>IFSC: PUNB0619300</Text>
        <Text style={styles.text}>Branch: Vibhuti Khand, Gomti Nagar, Lucknow</Text>
        <Text style={styles.header}>DECLARATION</Text>
        <Text style={styles.text}>We hereby declare that the above quotation is true and correct.</Text>
        <Text style={styles.text}>All materials supplied will be new and of standard quality.</Text>
        <Text style={styles.text}>Installation will be carried out as per site conditions and applicable norms.</Text>
        <Text style={styles.text}>Warranties shall be as per manufacturer terms.</Text>
        <Text style={styles.text}>Prices and approvals are subject to applicable rules and regulations.</Text>
        <Text style={styles.text}>Consumer Name: {form.customerName}</Text>
        <PDFImage src="/mohar.png" style={{ width: 100, height: 50, marginTop: 10, alignSelf: 'flex-end' }} />
        <Text style={styles.text}>Authorized Signatory M.G. ENTERPRISES</Text>
       </View>
       <View style={styles.footer}>
         <PDFImage src="/mgsolarfooter.png" style={styles.footerImage} />
       </View>
     </Page>
  </Document>
);

export default function QuotationPage() {
  const [isEmployee, setIsEmployee] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const [form, setForm] = useState({
    quotationNo: "",
    date: "",
    customerId: "",
    customerName: "",
    address: "",
    price: "",
    mobileNumber: "",
    batteryCompanyName: "",
    systemType: "",
    kilowatt: "",
    panelCompanyName: "",
    inverterCompanyName: "",
    referredBy: "",
  });



  const { isLoading, submitForm } = useFormSubmit();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const employeeDataStr = sessionStorage.getItem('employeeData');
    if (employeeDataStr) {
      setIsEmployee(true);
      setEmployeeData(JSON.parse(employeeDataStr));
    }

    // Load quotations from Firestore
    let unsubscribe: (() => void) | undefined;

    const loadQuotations = async () => {
      const quotationsRef = collection(db, 'quotations');
      unsubscribe = onSnapshot(quotationsRef, async (snapshot: QuerySnapshot<DocumentData>) => {
        const quotationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Quotation[];

        // Filter quotations based on employee permissions
        let filteredQuotations = quotationsData;

        // Check if user is employee by reading sessionStorage directly
        const employeeDataStr = sessionStorage.getItem('employeeData');
        if (employeeDataStr) {
          const empData = JSON.parse(employeeDataStr);
          // For employees, only show quotations for customers they created
          const customersRef = collection(db, 'customers');
          const customersSnapshot = await getDocs(query(customersRef, where('createdBy', '==', empData.empId)));
          const employeeCustomerIds = customersSnapshot.docs.map(doc => doc.id);

          filteredQuotations = quotationsData.filter(quotation =>
            employeeCustomerIds.includes(quotation.customerId)
          );
        }

        if (mountedRef.current) {
          setQuotations(filteredQuotations.sort((a, b) => a.customerName.localeCompare(b.customerName)));

          // Compute next quotation number
          let nextNumber = 201;
          if (filteredQuotations.length > 0) {
            const numbers = filteredQuotations.map(q => {
              const match = q.quotationNo.match(/^MGE(\d+)$/);
              return match ? parseInt(match[1]) : 200;
            });
            const maxNumber = Math.max(...numbers);
            nextNumber = maxNumber + 1;
          }

          const today = new Date();
          const dateStr = today.toLocaleDateString('en-GB'); // DD/MM/YYYY
          const quotationNo = `MGE${nextNumber}`;
          setForm(prev => ({ ...prev, date: dateStr, quotationNo }));
        }
      });
    };

    loadQuotations().catch(console.error);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchCustomer = async () => {
    if (form.mobileNumber.length === 10) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      try {
        // Build URL with employee ID if user is an employee
        const url = employeeData
          ? `/api/customers/${form.mobileNumber}?employeeId=${employeeData.empId}`
          : `/api/customers/${form.mobileNumber}`;

        const response = await fetch(url, { signal: abortControllerRef.current.signal });
        const data = await response.json();
        if (data.success) {
          const customer = data.customer;
          // Extract only numbers from kilowatt (remove 'kw' text)
          const kilowattValue = customer.kilowatt ? customer.kilowatt.toString().replace(/[^\d.]/g, '') : "";
          if (mountedRef.current) {
            setForm(prev => ({
              ...prev,
              customerId: customer.id,
              customerName: customer.customerName || "",
              address: customer.address || "",
              batteryCompanyName: customer.batteryCompanyName || "",
              systemType: customer.systemType || "",
              kilowatt: kilowattValue,
              panelCompanyName: customer.panelCompanyName || "",
              inverterCompanyName: customer.inverterCompanyName || "",
              referredBy: customer.referredBy || "",
              price: customer.quotationPrice || "",
            }));
          }
        } else {
          alert("Customer not found");
          // Reset if not found
          if (mountedRef.current) {
            setForm(prev => ({
              ...prev,
              customerId: "",
              customerName: "",
              address: "",
              batteryCompanyName: "",
              systemType: "",
              kilowatt: "",
              panelCompanyName: "",
              inverterCompanyName: "",
              referredBy: "",
              price: "",
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
        if (!(error instanceof Error) || error.name !== 'AbortError') {
          alert("Error fetching customer");
        }
      }
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };



  const handleEdit = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setForm({
      quotationNo: quotation.quotationNo,
      date: quotation.date,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      address: quotation.address,
      price: quotation.price,
      mobileNumber: quotation.mobileNumber,
      batteryCompanyName: quotation.batteryCompanyName,
      systemType: quotation.systemType,
      kilowatt: quotation.kilowatt,
      panelCompanyName: quotation.panelCompanyName,
      inverterCompanyName: quotation.inverterCompanyName,
      referredBy: quotation.referredBy,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await deleteDoc(doc(db, 'quotations', id));
        // Firestore onSnapshot will update the state automatically
      } catch (error) {
        console.error('Error deleting quotation:', error);
        alert('Error deleting quotation');
      }
    }
  };

  const handleSubmit = async () => {
    const submitQuotation = async () => {
      // Check if quotation already exists for this mobile number (only for new quotations)
      if (!isEditing) {
        const normalizedMobile = form.mobileNumber.replace(/\D/g, '');
        const existingQuotation = await getDocs(query(collection(db, 'quotations'), where('mobileNumber', '==', normalizedMobile)));
        if (!existingQuotation.empty) {
          throw new Error('A quotation already exists for this mobile number.');
        }
      }

      const quotationData = {
        ...form,
        mobileNumber: form.mobileNumber.replace(/\D/g, ''),
        createdAt: isEditing && selectedQuotation ? selectedQuotation.createdAt : new Date().toISOString(),
      };

      if (isEditing && selectedQuotation) {
        // Update existing quotation
        const quotationRef = doc(db, 'quotations', selectedQuotation.id);
        await updateDoc(quotationRef, quotationData);
      } else {
        // Add new quotation
        await addDoc(collection(db, 'quotations'), quotationData);
      }
    };

    if (validateForm()) {
      submitForm(
        submitQuotation,
        isEditing ? 'Quotation updated successfully!' : 'Quotation saved successfully!'
      ).then(() => {
        setIsEditing(false);
        setSelectedQuotation(null);
        // Reset form for new quotation (quotationNo and date will be updated by useEffect)
        setForm(prev => ({ ...prev, customerId: "", customerName: "", address: "", batteryCompanyName: "", systemType: "", kilowatt: "", panelCompanyName: "", inverterCompanyName: "", referredBy: "", price: "" }));
      });
    }
  };

  const validateForm = () => {
    if (!form.customerName.trim()) {
      alert('Customer name is required');
      return false;
    }
    if (!form.mobileNumber.trim()) {
      alert('Mobile number is required');
      return false;
    }
    if (!form.price.trim()) {
      alert('Price is required');
      return false;
    }
    return true;
  };

  const printQuotation = (quotationData?: Quotation) => {
    if (isPrinting) return;
    setIsPrinting(true);

    const element = document.getElementById("pdf-content");

    if (!element) {
      alert("Print content not found");
      setIsPrinting(false);
      return;
    }

    const isMobile = window.innerWidth < 768;
    const dataToUse = quotationData || form;

    if (isMobile) {
      generatePDF(dataToUse);
    } else {
      // For desktop, still update form for HTML print
      const originalForm = { ...form };
      if (quotationData) {
        setForm(quotationData);
        setTimeout(() => performPrint(element, originalForm), 500);
        return;
      }
      performPrint(element, originalForm);
    }

    async function generatePDF(data: any) {
      try {
        const pdfBlob = await pdf(React.createElement(QuotationPDF, { form: data }) as React.ReactElement<DocumentProps>).toBlob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF');
      } finally {
        setIsPrinting(false);
      }
    }

    function performPrint(printElement: HTMLElement, originalForm: any) {
      // Clone the element to avoid modifying the original
      const clonedElement = printElement.cloneNode(true) as HTMLElement;

      // Add print CSS
      const styleOverride = document.createElement('style');
      styleOverride.textContent = `
        @media print {
          * {
            background-color: #ffffff !important;
            color: #000000 !important;
            border-color: #000000 !important;
            font-family: Arial, sans-serif !important;
            page-break-inside: avoid !important;
          }
          p {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.4 !important;
          }
          .watermark {
            display: block !important;
          }
          .watermark img {
            opacity: 0.1 !important;
          }
          @page { size: auto; margin: 0; }
        }
      `;
      clonedElement.insertBefore(styleOverride, clonedElement.firstChild);

      // Store original body content
      const originalBody = document.body.innerHTML;

      // Replace body with print content
      document.body.innerHTML = clonedElement.outerHTML;

      // Print
      window.print();

      // Restore original body
      document.body.innerHTML = originalBody;

      // Restore original form data
      if (quotationData) {
        setForm(originalForm);
      }
      setIsPrinting(false);
    }
  };

  return (
    <div className="bg-gray-200 p-6">

      {/* 🔧 FORM - Only visible to admins */}
      {!isEmployee && (
        <div className="max-w-4xl mx-auto bg-white p-4 mb-6 shadow text-sm">
          <h2 className="font-bold mb-3">{isEditing ? 'Edit Quotation' : 'Create New Quotation'}</h2>

        <div className="grid grid-cols-2 gap-2">
          <input name="quotationNo" value={form.quotationNo} onChange={handleChange} className="border p-2" disabled placeholder="Quotation No"/>
          <input name="date" value={form.date} onChange={handleChange} className="border p-2" disabled placeholder="Date"/>
          <div className="col-span-2 flex gap-2">
            <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} placeholder="Mobile Number" className="border p-2 flex-1"/>
            <button onClick={fetchCustomer} className="bg-blue-500 text-white px-4 py-2">Fetch Customer</button>
          </div>
          <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Customer Name" className="border p-2"/>
          <input name="batteryCompanyName" value={form.batteryCompanyName} onChange={handleChange} placeholder="Battery Company" className="border p-2"/>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="border p-2"/>
          <input name="kilowatt" value={form.kilowatt} onChange={handleChange} placeholder="Kilowatt" className="border p-2"/>
          <input name="systemType" value={form.systemType} onChange={handleChange} placeholder="System Type" className="border p-2"/>
          <input name="panelCompanyName" value={form.panelCompanyName} onChange={handleChange} placeholder="Panel Company" className="border p-2"/>
          <input name="inverterCompanyName" value={form.inverterCompanyName} onChange={handleChange} placeholder="Inverter Company" className="border p-2"/>
          <input name="referredBy" value={form.referredBy} onChange={handleChange} placeholder="Referred By" className="border p-2"/>
          <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="border p-2"/>
        </div>

        <div className="flex gap-4 mt-3">
          <button onClick={() => printQuotation()} className="bg-black text-white px-4 py-2" disabled={isPrinting}>
            {isPrinting ? 'Printing...' : 'Print'}
          </button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2" disabled={isLoading}>
            {isLoading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Quotation' : 'Save Quotation')}
          </button>
        </div>
      </div>
      )}

      {/* 📄 PDF - Always rendered but hidden for employees */}
      <div className={`flex justify-center ${isEmployee ? 'hidden' : ''}`}>
        <div id="pdf-content" className="bg-white">

          {/* ================= PAGE 1 ================= */}
          <div className="w-[794px] h-[1123px] p-6 relative">

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 watermark">
              <img src="/mgsolarlogo.png" alt="logo" width={400} height={400}/>
            </div>

            {/* Header Image */}
            <div className="relative z-10">
              <img src="/mgsolarheader.png" alt="header" width={754} height={50} className="w-full"/>
            </div>

            {/* Quotation Number */}
            <div className="absolute top-6 right-6 text-sm font-bold z-20">
              Quotation No: {form.quotationNo}
            </div>

            {/* TO SECTION */}
            <div className="mt-6 text-sm space-y-1">
              <p>To,</p>
              <p>Customer Name: <strong>{form.customerName}</strong></p>
              <p>Address: {form.address}</p>
               <p>
                 Subject: {form.kilowatt} KW Solar Quotation for Supply & Installation of Rooftop System
               </p>
              <p>Dear Sir/Madam,</p>
            </div>

            {/* BODY TEXT */}
            <p className="mt-4 text-sm">
              With reference to your requirement, we are pleased to submit our quotation for Supply,
              Installation, Testing & Commissioning of a {form.kilowatt} KW Grid-Connected Solar Rooftop System at your premises.
            </p>

            {/* SYSTEM DETAILS */}
            <div className="mt-6 text-sm">
              <h2 className="font-semibold mb-2">SYSTEM DETAILS</h2>

              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border p-2">S.No.</th>
                    <th className="border p-2">Particulars</th>
                    <th className="border p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-2">1</td><td className="border p-2">System Capacity</td><td className="border p-2">{form.kilowatt} KW ({form.systemType})</td></tr>
                  <tr><td className="border p-2">2</td><td className="border p-2">Solar Panels</td><td className="border p-2">{form.panelCompanyName} </td></tr>
                  <tr><td className="border p-2">3</td><td className="border p-2">Inverter</td><td className="border p-2">{form.inverterCompanyName}</td></tr>
                  <tr><td className="border p-2">4</td><td className="border p-2">Structure</td><td className="border p-2">GI / Aluminium Rooftop</td></tr>
                  <tr><td className="border p-2">5</td><td className="border p-2">Generation</td><td className="border p-2">{form.kilowatt ? (() => {
                    const kw = parseFloat(form.kilowatt.replace(/[^\d.]/g, '')) || 0;
                    const min = kw * 4;
                    const max = kw * 5;
                    return `${min}–${max} Units per Day`;
                  })() : "Units per Day"}</td></tr>
                  <tr><td className="border p-2">6</td><td className="border p-2">ACDB & DCDB</td><td className="border p-2">Polycab / Havells</td></tr>
                  <tr><td className="border p-2">7</td><td className="border p-2">Wire</td><td className="border p-2">Polycab (4 sq mm)</td></tr>
                  <tr><td className="border p-2">8</td><td className="border p-2">Earthing</td><td className="border p-2">Green (4 sq mm)</td></tr>
                  <tr><td className="border p-2">9</td><td className="border p-2">Warranty</td><td className="border p-2">Panel: 25+ Years, Inverter: 5–10 Years</td></tr>
                  <tr><td className="border p-2">10</td><td className="border p-2">Battery</td><td className="border p-2">{form.batteryCompanyName}</td></tr>
                </tbody>
              </table>
            </div>

            {/* FOOTER PAGE 1 */}
            <div className="absolute bottom-6 left-10 right-10">
              <img src="/mgsolarfooter.png" alt="footer" width={754} height={20} className="w-full"/>
            </div>
          </div>

          {/* ================= PAGE 2 ================= */}
          <div className="w-[794px] h-[1123px] p-6 relative">

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 watermark">
              <img src="/mgsolarlogo.png" alt="logo" width={400} height={400}/>
            </div>

             {/* Header Image */}
             <div className="relative z-10 mb-6">
               <img src="/mgsolarheader.png" alt="header" width={754} height={50} className="w-full"/>
             </div>

            {/* PRICE BREAKUP */}
            <div className="text-sm">
              <h2 className="font-semibold mb-2">PRICE BREAKUP</h2>

              <table className="w-full border">
                <tbody>
                  <tr><td className="border p-2">{form.kilowatt} KW Solar Rooftop System</td><td className="border p-2">₹ {form.price}/-</td></tr>
                  <tr><td className="border p-2">Installation & Commissioning</td><td className="border p-2">Included</td></tr>
                  <tr><td className="border p-2">Transportation</td><td className="border p-2">Not Included</td></tr>
                  <tr><td className="border p-2">Net Metering Assistance</td><td className="border p-2">Included</td></tr>
                  <tr><td className="border p-2">GST</td><td className="border p-2">Included</td></tr>
                  <tr className="font-bold"><td className="border p-2">Total Amount Payable</td><td className="border p-2">₹ {form.price}/-</td></tr>
                </tbody>
              </table>

              <p className="mt-2">
                (Amount in words: Rupees {numberToWords(parseInt(form.price || '0'))} Only)
              </p>
            </div>

            {/* TERMS AND BANK SIDE BY SIDE */}
            <div className="flex gap-4">
              <div className="flex-1 text-sm">
                <h2 className="font-semibold">TERMS & CONDITIONS</h2>
                <p>Validity of quotation: 15 days</p>
                <p>Installation Timeline: 15–25 Working Days</p>
                <p>Net metering subject to DISCOM approval.</p>
                <p>System generation depends on sunlight & site conditions.</p>
                <p>Payment Terms: 70% Advance, 20% Before Installation, 10% After Commissioning</p>
                <p>Operation & maintenance charges are not included in this price.</p>
              </div>

              <div className="flex-1 text-sm border border-gray-300 p-2 bg-gray-50">
                <h2 className="font-bold">Company Bank Details</h2>
                <p>Bank Name: Punjab National Bank</p>
                <p>Account No.: 6193002100003379</p>
                <p>IFSC: PUNB0619300</p>
                <p>Branch: Vibhuti Khand, Gomti Nagar, Lucknow</p>
              </div>
            </div>

            {/* DECLARATION */}
            <div className="mt-2 text-[10px]">
              <h2 className="font-semibold">DECLARATION</h2>
              <p>We hereby declare that the above quotation is true and correct.</p>
              <p>All materials supplied will be new and of standard quality.</p>
              <p>Installation will be carried out as per site conditions and applicable norms.</p>
              <p>Warranties shall be as per manufacturer terms.</p>
              <p>Prices and approvals are subject to applicable rules and regulations.</p>
            </div>

            {/* SIGNATURE */}
            <div className="mt-2 flex justify-between text-sm">
              <div>
                <p>Consumer Name: {form.customerName}</p>
                <p>Signature:</p>
              </div>

              <div className=" text-right">
                <img src="/mohar.png" alt="signature" width={100} height={50} className="mb-2" />
                <p>Authorized Signatory</p>
                <p className="font-semibold">M.G. ENTERPRISES</p>
              </div>
            </div>

            {/* FOOTER PAGE 2 */}
            <div className="absolute bottom-6 left-10 right-10">
              <img src="/mgsolarfooter.png" alt="footer" width={754} height={20} className="w-full"/>
            </div>
          </div>

          {!isEmployee && (
          <>
          {/* ================= PAGE 3 - ANNEXURE 2 ================= */}
          <div className="w-[794px] h-[1123px] p-6 relative">

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 watermark">
              <img src="/mgsolarlogo.png" alt="logo" width={400} height={400}/>
            </div>

            {/* Header Image */}
            <div className="relative z-10 mb-6">
              <img src="/mgsolarheader.png" alt="header" width={754} height={50} className="w-full"/>
            </div>

            {/* ANNEXURE 2 TITLE */}
            <div className="text-center text-sm font-bold mb-4">
              ANNEXURE 2
            </div>

            {/* AGREEMENT TITLE */}
            <div className="text-center text-sm font-semibold mb-4">
              Model Draft Agreement between Consumer & Vendor for installation of grid connected rooftop solar (RTS) project under PM – Surya Ghar: Muft Bijli Yojana
            </div>

            {/* AGREEMENT CONTENT */}
            <div className="text-sm space-y-2">
               <p>This agreement is executed on {form.date} for design, supply, installation, commissioning and 5-year comprehensive maintenance of RTS project/system along with warranty under PM Surya Ghar: Muft Bijli Yojana.</p>

               <p><strong>Between</strong></p>
               <p><strong>{form.customerName}</strong> address {form.address}, (hereinafter referred to as first Party i.e.)</p>

              <p><strong>And</strong></p>
              <p>M.G. ENTERPRISES having registered office at D - 62, 2nd Floor Vibhuti khand gomti nagar, Lucknow U.P. 226010, Phone :- +91- 8736915465, 9415336145.</p>

              <p><strong>Whereas</strong></p>
              <p>First Party wishes to installation Grid Connected Rooftop Solar Plant on the rooftop of the residential building of the Consumer under PM Surya Ghar: Muft Bijli Yojana.</p>

              <p><strong>And whereas</strong></p>
              <p>Second Party has verified availability of appropriate roof and found it feasible to install a Grid Connected Roof Top Solar plant and that the second party is willing to design, supply, install, test, commission and carry out Operation & Maintenance of the Rooftop Solar plant for 5 year period On this day, the First Party and Second Party agree to the following:</p>

              <p><strong>The First Party here by undertakes to perform the following activities:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Submission of online application at National Portal for installation of RTS project/system, Submission of application for net-metering and system inspection and upload of the relevant documents on the National Portal of the scheme.</li>
                <li>Provide secure storage of the material of the RTS plant delivered at the premises till handover of the system.</li>
                <li>Provide access to the Roof Top during installation of the plant, operation & maintenance, testing of the plant and equipment and for meter reading from solar meter, inverter etc.</li>
                <li>Provide electricity during plant installation and water for cleaning of the panels.</li>
                <li>Report any malfunctioning of the plant to the Vendor during the warranty period.</li>
                <li>Pay the amount as per the payment schedule as mutually agreed with the vendor, including any additional amount to the second party for any additional work</li>
              </ol>
            </div>

            {/* FOOTER PAGE 3 */}
            <div className="absolute bottom-6 left-10 right-10">
              <img src="/mgsolarfooter.png" alt="footer" width={754} height={20} className="w-full"/>
            </div>
          </div>

          {/* ================= PAGE 4 - ANNEXURE 2 CONTINUATION ================= */}
          <div className="w-[794px] h-[1123px] p-6 relative">

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 watermark">
              <img src="/mgsolarlogo.png" alt="logo" width={400} height={400}/>
            </div>

            {/* Header Image */}
            <div className="relative z-10 mb-6">
              <img src="/mgsolarheader.png" alt="header" width={754} height={50} className="w-full"/>
            </div>

            {/* AGREEMENT CONTENT CONTINUATION */}
            <div className="text-sm space-y-2">
              <p>/customization required depending upon the building condition</p>

              <p><strong>The Second Party hereby undertakes to perform the following activities:</strong></p>

              <ol className="list-decimal list-inside space-y-2">
                <li>The Vendor must follow all the standards and safety guidelines prescribed under state regulations and technical standards prescribed by MNRE for RTS projects, failing which the vendor is liable for blacklisting from participation in the govt. project/ scheme and other penal actions in accordance with the law. The responsibility of supply, installation and commissioning of the rooftop solar project/system in complete compliance with MNRE scheme guidelines lies with the Vendor.</li>
                <li>Site Survey: Site visit, survey and development of detailed project report for installation of RTS system. This also includes, feasibility study of roof, strength of roof and shadow free area. If any additional work or customization is involved for the plant installation as per site condition and requirement of the consumer building, the Vendor shall prepare an estimate and can raise separate invoice including GST in addition to the amount towards standard plant cost. The consumer shall pay the amount for such additional work directly to the Vendor.</li>
                <li>Design & Engineering: Design of plant along with drawings and selection of components as per standard provided by the DISCOM/SERC/MNRE for best performance and safety of the plant.</li>
                <li>Module and Inverter: The solar modules, including the solar cells, should be manufactured in India. Both the solar modules and inverters shall conform to the relevant standards and specifications prescribed by MNRE. Any other requirement, viz. star labeling (solar modules), quality control orders and standards & labeling (inverters) etc., shall also be complied.</li>
                <li>Procurement & Supply: Procurement of complete system as per BIS/IS/IEC standard (whatever applicable) & safety guidelines for installation of rooftop solar plants. The supplied materials should comply with all MNRE standards for release of subsidy.</li>
                <li>Installation & Civil work: Complete civil work, structure work and electrical work (including drawings) following all the safety and relevant BIS standards.</li>
                <li>Documentation (Technical Catalogues/Warranty Certificates/BIS certificates/other test reports etc): All such documents shall be provided to the consumer for online uploading and submission of technical specifications, IEC/BIS report, Sr. Nos, Warranty card of Solar Panel & Inverter, Layout & Electrical SLD, Structure Design and Drawing,</li>
              </ol>
            </div>

            {/* FOOTER PAGE 4 */}
            <div className="absolute bottom-6 left-10 right-10">
              <img src="/mgsolarfooter.png" alt="footer" width={754} height={20} className="w-full"/>
            </div>
          </div>

          {/* ================= PAGE 5 - ANNEXURE 2 CONTINUATION ================= */}
          <div className="w-[794px] h-[1123px] p-6 relative">

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 watermark">
              <img src="/mgsolarlogo.png" alt="logo" width={400} height={400}/>
            </div>

            {/* Header Image */}
            <div className="relative z-10 mb-6">
              <img src="/mgsolarheader.png" alt="header" width={754} height={50} className="w-full"/>
            </div>

            {/* AGREEMENT CONTENT CONTINUATION */}
            <div className="text-sm space-y-2">
              <ol className="list-decimal list-inside space-y-1" start={7}>
                <li>Cable and other detailed documents.</li>
                <li>Project completion report (PCR): Assisting the consumer in filling and uploading of signed documents (Consumer & Vendor) on the national portal.</li>
                <li>Warranty: System warranty certificates should be provided to the consumer. The complete system should be warranted for 5 years from the date of commissioning by DISCOM. Individual component warranty documents provided by the manufacturer shall be provided to the consumer and all possible assistance should be extended to the consumer for claiming the warranty from the manufacturer.</li>
                <li>NET meter & Grid Connectivity: Net meter supply/procurement, testing and approvals shall be in the scope of vendor. Grid connection of the plant shall be in the scope of the vendor.</li>
                <li>Testing and Commissioning: The vendor shall be present at the time of testing and commissioning by the DISCOM. Operation & Maintenance: Five (5) years Comprehensive Operation and Maintenance including overhauling, wear and tear and regular checking of healthiness of system at proper interval shall be in the scope of vendor. The vendor shall also educate the consumer on best practices for cleaning of the modules and system maintenance.</li>
                <li>Insurance: Any insurance cost pertaining to material transfer/storage before commissioning of the system shall be in the scope of the vendor.</li>
                <li>Applicable Standard: The system must meet the technical standards and specifications notified by MNRE. The vendor is solely responsible to supply component and service which meets the technical standards and specification prescribed by MNRE and State DISCOMs.</li>
                <li>Project/system cost & payment terms: The cost of the plant and payment schedule should be mutually discussed and decided between the vendor and consumer. The consumer may opt for milestone-based payment to the vendor and the same shall be included in the agreement</li>
                <li>Dispute: In-case of any dispute between consumer and vendor (in supply/installation/maintenance of system or payment terms), both parties must settle the same mutually or as per law. MNRE/DISCOM shall not be liable for, and would not be a party to any dispute arising between vendor and consumer.</li>
                <li>Subsidy / Project Related Documents: Vendor must provide all the documents to consumer and help in uploading the same to National Portal for smooth release of subsidy.</li>
              </ol>
            </div>

            {/* FOOTER PAGE 5 */}
            <div className="absolute bottom-6 left-10 right-10">
              <img src="/mgsolarfooter.png" alt="footer" width={754} height={20} className="w-full"/>
            </div>
          </div>

          {/* ================= PAGE 6 - ANNEXURE 2 CONTINUATION ================= */}
          <div className="w-[794px] h-[1123px] p-6 relative">

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 watermark">
              <img src="/mgsolarlogo.png" alt="logo" width={400} height={400}/>
            </div>

            {/* Header Image */}
            <div className="relative z-10 mb-6">
              <img src="/mgsolarheader.png" alt="header" width={754} height={50} className="w-full"/>
            </div>

            {/* AGREEMENT CONTENT CONTINUATION */}
            <div className="text-sm space-y-2">
              <ol className="list-decimal list-inside space-y-1" start={11}>
                <li>Performance of Plant: The Performance Ratio (PR) of Plant must be 75% at the time of commissioning of the project by DISCOM or its authorized agency. Vendor must provide (returnable basis) radiation sensor with valid calibration certificate of any NABL/International laboratory at the time of commissioning/testing of the plant. Vendor must maintain the PR of the plant till warranty of project i.e. 5 years from the date of commissioning.</li>
              </ol>

              <h2 className="text-blue-600 font-semibold">19. Mutually Agreed Terms of Pay</h2>

              <p>Total system cost: ₹ {form.price}/- (to be filled based on invoice)</p>
              <p>Payment Schedule: 100% advance payment before installation.</p>

               <div className="flex justify-between mt-4">
                 <div className="text-center">
                   <p><strong>First Party</strong></p>
                   <p><strong>{form.customerName}</strong></p>
                   <p className="mt-4">Sign:</p>
                   <p>___________________________</p>
                 </div>
                <div className="text-center">
                  <p><strong>Second Party</strong></p>
                  <p>M.G. ENTERPRISES</p>
                  <img src="/mohar.png" alt="Authorised Signatory MG Enterprises" width={100} height={50} className="mt-2" />
                  <p className="mt-4">Sign:</p>
                  <p>___________________________</p>
                </div>
              </div>
            </div>

            {/* FOOTER PAGE 6 */}
            <div className="absolute bottom-4 left-10 right-10">
              <img src="/mgsolarfooter.png" alt="footer" width={754} height={20} className="w-full"/>
            </div>
          </div>
          </>
          )}
        </div>
      </div>

      {/* QUOTATIONS TABLE - Visible to both admins and employees */}
      <div className="max-w-7xl mx-auto bg-white p-6 shadow mt-6">
        <h2 className="text-2xl font-bold mb-4">Saved Quotations</h2>

        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {quotations.map((quotation, index) => (
            <div key={quotation.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  <h3 className="font-semibold">{quotation.customerName}</h3>
                  <p className="text-sm text-gray-600">{quotation.quotationNo}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => printQuotation(quotation)}
                    className="bg-blue-500 text-white px-3 py-1 text-sm rounded"
                    disabled={isPrinting}
                  >
                    {isPrinting ? 'Printing...' : 'Print'}
                  </button>
                  {!isEmployee && (
                    <>
                      <button
                        onClick={() => handleEdit(quotation)}
                        className="bg-green-500 text-white px-3 py-1 text-sm rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(quotation.id)}
                        className="bg-red-500 text-white px-3 py-1 text-sm rounded"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Mobile:</span> {quotation.mobileNumber}</p>
                <p><span className="font-medium">System:</span> {quotation.kilowatt} KW</p>
                <p><span className="font-medium">Price:</span> ₹{quotation.price}</p>
                <p><span className="font-medium">Date:</span> {new Date(quotation.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No.</TableHead>
                <TableHead>Quotation No</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation, index) => (
                <TableRow key={quotation.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{quotation.quotationNo}</TableCell>
                  <TableCell>{quotation.customerName}</TableCell>
                  <TableCell>{quotation.mobileNumber}</TableCell>
                  <TableCell>{quotation.kilowatt} KW</TableCell>
                  <TableCell>₹{quotation.price}</TableCell>
                  <TableCell>{new Date(quotation.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          printQuotation(quotation);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        disabled={isPrinting}
                      >
                        {isPrinting ? 'Printing...' : 'Print'}
                      </button>
                      {!isEmployee && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleEdit(quotation);
                            }}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(quotation.id);
                            }}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {quotations.length === 0 && (
          <p className="text-center text-gray-500 py-8">No quotations saved yet.</p>
        )}
      </div>
    </div>
  );
}