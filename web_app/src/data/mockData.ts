import { ValuationReport, FileNode, DashboardStats } from '../types';

export const mockReports: ValuationReport[] = [
  {
    id: '1',
    customerName: 'Aakash',
    bankName: 'Sount Indain Bank',
    propertyType: 'Residential',
    location: 'Mumbai, Maharashtra',
    status: 'approved',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    year: '2024',
    month: 'January',
    metadata: {
      year: { value: '2024', aiConfidence: 'high', needsReview: false },
      bankName: { value: 'Sount Indain Bank', aiConfidence: 'high', needsReview: false },
      month: { value: 'January', aiConfidence: 'high', needsReview: false },
      customerName: { value: 'Aakash', aiConfidence: 'high', needsReview: false },
      propertyType: { value: 'Residential', aiConfidence: 'medium', needsReview: true },
      location: { value: 'Mumbai, Maharashtra', aiConfidence: 'high', needsReview: false },
    },
    files: [
      { id: 'f1', name: 'original_document.pdf', type: 'original', size: '2.4 MB', uploadedAt: new Date('2024-01-15'), url: '#' },
      { id: 'f2', name: 'extracted_data.json', type: 'extracted', size: '45 KB', uploadedAt: new Date('2024-01-15'), url: '#' },
      { id: 'f3', name: 'draft_report.pdf', type: 'draft', size: '1.8 MB', uploadedAt: new Date('2024-01-16'), url: '#' },
      { id: 'f4', name: 'final_report.pdf', type: 'final', size: '2.1 MB', uploadedAt: new Date('2024-01-20'), url: '#' },
    ],
    content: {
      summary: 'This property valuation report provides a comprehensive assessment of a residential property located in Mumbai, Maharashtra. The property has been evaluated using the market comparison approach.',
      propertyDetails: 'Property Type: 3 BHK Apartment\nBuilt-up Area: 1,200 sq.ft.\nAge: 5 years\nCondition: Good\nAmenities: Parking, Security, Gym',
      valuationMethod: 'Market Comparison Approach: Analyzed 5 comparable properties in the vicinity sold within the last 6 months. Adjustments made for size, age, and amenities.',
      finalValuation: 'Fair Market Value: ₹85,00,000\nForced Sale Value: ₹72,25,000\nInsurance Value: ₹68,00,000',
    },
    comments: [
      { id: 'c1', user: 'Sarah Kumar', text: 'Valuation methodology looks sound', timestamp: new Date('2024-01-18'), resolved: true },
    ],
    auditTrail: [
      { id: 'a1', user: 'System', action: 'Report Created', timestamp: new Date('2024-01-15'), details: 'AI extracted metadata from PDF' },
      { id: 'a2', user: 'Rahul Sharma', action: 'Draft Generated', timestamp: new Date('2024-01-16'), details: 'AI draft report created' },
      { id: 'a3', user: 'Rahul Sharma', action: 'Edited', timestamp: new Date('2024-01-17'), details: 'Updated property details section' },
      { id: 'a4', user: 'Sarah Kumar', action: 'Approved', timestamp: new Date('2024-01-20'), details: 'Final approval granted' },
    ],
  },
  {
    id: '2',
    customerName: 'Priya Mehta',
    bankName: 'HDFC Bank',
    propertyType: 'Commercial',
    location: 'Bangalore, Karnataka',
    status: 'review',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-12'),
    year: '2024',
    month: 'February',
    metadata: {
      year: { value: '2024', aiConfidence: 'high', needsReview: false },
      bankName: { value: 'HDFC Bank', aiConfidence: 'high', needsReview: false },
      month: { value: 'February', aiConfidence: 'high', needsReview: false },
      customerName: { value: 'Priya Mehta', aiConfidence: 'medium', needsReview: true },
      propertyType: { value: 'Commercial', aiConfidence: 'high', needsReview: false },
      location: { value: 'Bangalore, Karnataka', aiConfidence: 'high', needsReview: false },
    },
    files: [
      { id: 'f5', name: 'original_document.pdf', type: 'original', size: '3.1 MB', uploadedAt: new Date('2024-02-10'), url: '#' },
      { id: 'f6', name: 'extracted_data.json', type: 'extracted', size: '52 KB', uploadedAt: new Date('2024-02-10'), url: '#' },
      { id: 'f7', name: 'draft_report.pdf', type: 'draft', size: '2.3 MB', uploadedAt: new Date('2024-02-11'), url: '#' },
    ],
    content: {
      summary: 'Commercial property valuation for a retail space in prime Bangalore location. Income capitalization method applied.',
      propertyDetails: 'Property Type: Retail Shop\nBuilt-up Area: 800 sq.ft.\nAge: 2 years\nCondition: Excellent\nLocation: MG Road',
      valuationMethod: 'Income Capitalization Approach: Based on current rental income of ₹80,000/month with a capitalization rate of 8%.',
      finalValuation: 'Fair Market Value: ₹1,20,00,000\nRental Yield: 8% p.a.',
    },
    comments: [
      { id: 'c2', user: 'Amit Singh', text: 'Please verify the capitalization rate used', timestamp: new Date('2024-02-12'), resolved: false },
    ],
    auditTrail: [
      { id: 'a5', user: 'System', action: 'Report Created', timestamp: new Date('2024-02-10'), details: 'AI extracted metadata from PDF' },
      { id: 'a6', user: 'Neha Gupta', action: 'Draft Generated', timestamp: new Date('2024-02-11'), details: 'AI draft report created' },
    ],
  },
  {
    id: '3',
    customerName: 'Rajesh Kumar',
    bankName: 'ICICI Bank',
    propertyType: 'Residential',
    location: 'Delhi, NCR',
    status: 'draft',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
    year: '2024',
    month: 'March',
    metadata: {
      year: { value: '2024', aiConfidence: 'high', needsReview: false },
      bankName: { value: 'ICICI Bank', aiConfidence: 'high', needsReview: false },
      month: { value: 'March', aiConfidence: 'high', needsReview: false },
      customerName: { value: 'Rajesh Kumar', aiConfidence: 'low', needsReview: true },
      propertyType: { value: 'Residential', aiConfidence: 'high', needsReview: false },
      location: { value: 'Delhi, NCR', aiConfidence: 'medium', needsReview: true },
    },
    files: [
      { id: 'f8', name: 'original_document.pdf', type: 'original', size: '1.9 MB', uploadedAt: new Date('2024-03-05'), url: '#' },
      { id: 'f9', name: 'extracted_data.json', type: 'extracted', size: '38 KB', uploadedAt: new Date('2024-03-05'), url: '#' },
    ],
    content: {
      summary: '',
      propertyDetails: '',
      valuationMethod: '',
      finalValuation: '',
    },
    comments: [],
    auditTrail: [
      { id: 'a7', user: 'System', action: 'Report Created', timestamp: new Date('2024-03-05'), details: 'AI extracted metadata from PDF' },
    ],
  },
];

export const mockDashboardStats: DashboardStats = {
  totalReports: 24,
  draftReports: 5,
  reviewReports: 8,
  approvedReports: 11,
  recentUploads: 3,
};

export const buildFileTree = (reports: ValuationReport[]): FileNode[] => {
  const tree: FileNode[] = [];
  const yearMap = new Map<string, FileNode>();

  reports.forEach((report) => {
    let yearNode = yearMap.get(report.year);
    if (!yearNode) {
      yearNode = {
        id: `year-${report.year}`,
        name: report.year,
        type: 'folder',
        children: [],
      };
      yearMap.set(report.year, yearNode);
      tree.push(yearNode);
    }

    let bankNode = yearNode.children?.find((n) => n.name === report.bankName);
    if (!bankNode) {
      bankNode = {
        id: `bank-${report.year}-${report.bankName}`,
        name: report.bankName,
        type: 'folder',
        children: [],
      };
      yearNode.children?.push(bankNode);
    }

    let monthNode = bankNode.children?.find((n) => n.name === report.month);
    if (!monthNode) {
      monthNode = {
        id: `month-${report.year}-${report.bankName}-${report.month}`,
        name: report.month,
        type: 'folder',
        children: [],
      };
      bankNode.children?.push(monthNode);
    }

    const customerNode: FileNode = {
      id: `customer-${report.id}`,
      name: report.customerName,
      type: 'folder',
      children: report.files.map((file) => ({
        id: file.id,
        name: file.name,
        type: 'file',
        reportId: report.id,
        fileType: file.type,
      })),
    };
    monthNode.children?.push(customerNode);
  });

  return tree;
};
