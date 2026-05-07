export interface Item {
  name: string;
  details: string;
  make: string;
  qty: number;
}

export interface QuotationData {
  serialNumber: string;
  date: string;
  clientName: string;
  projectAddress: string;
  contactInfo: string;
  capacityKW: number;
  systemType: string;
  items: Item[];
  subtotal: number;
  panelDetails: string;
  inverterDetails: string;
  structureDetails: string;
  area: string;
  load: string;
  battery: string;
}