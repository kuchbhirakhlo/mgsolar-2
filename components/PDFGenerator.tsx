"use client";

import React from 'react';

interface PDFGeneratorProps {
  quotationData?: any;
  form: any;
}

export default function PDFGenerator({ quotationData, form }: PDFGeneratorProps) {
  const generatePDF = async () => {
    // Dynamically import jsPDF and html2canvas to avoid SSR issues
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const element = document.getElementById("pdf-content");
    if (!element) {
      alert("Print content not found");
      return;
    }

    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // Add CSS for better rendering
    const styleOverride = document.createElement('style');
    styleOverride.textContent = `
      * {
        background-color: #ffffff !important;
        color: #000000 !important;
        border-color: #000000 !important;
        font-family: Arial, sans-serif !important;
      }
      p {
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1.4 !important;
      }
      body { margin: 0; padding: 0; }
      img { max-width: 100%; height: auto; }
    `;
    clonedElement.insertBefore(styleOverride, clonedElement.firstChild);

    // Temporarily append to body for rendering
    document.body.appendChild(clonedElement);
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageElements = clonedElement.children;

      for (let i = 0; i < pageElements.length; i++) {
        const pageElement = pageElements[i] as HTMLElement;
        if (pageElement.tagName.toLowerCase() === 'div') {
          const canvas = await html2canvas(pageElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (i > 0) {
            pdf.addPage();
          }

          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
      }

      // Generate filename
      const fileName = quotationData ? `quotation_${quotationData.quotationNo}.pdf` : 'quotation.pdf';
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // Remove the cloned element
      document.body.removeChild(clonedElement);
    }
  };

  React.useEffect(() => {
    generatePDF();
  }, [quotationData, form]);

  return null; // This component doesn't render anything
}