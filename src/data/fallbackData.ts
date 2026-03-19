export const fallbackCategories = [
  { id: '1', name: 'Home & Repair Services' },
  { id: '2', name: 'Vehicle Services' },
  { id: '3', name: 'Construction & Labor' },
  { id: '4', name: 'Personal Services' },
  { id: '5', name: 'Professional Services' },
  { id: '6', name: 'Emergency Services' }
];

export const fallbackServices = [
  // Home & Repair Services
  { id: '101', category_id: '1', title: 'Plumbing', description: 'Expert plumbing services for all your home needs.', image_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800', categories: { name: 'Home & Repair Services' } },
  { id: '102', category_id: '1', title: 'Electricians', description: 'Professional electrical repair and installation.', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800', categories: { name: 'Home & Repair Services' } },
  { id: '103', category_id: '1', title: 'Carpenters', description: 'Custom carpentry and furniture repair.', image_url: 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&q=80&w=800', categories: { name: 'Home & Repair Services' } },
  { id: '104', category_id: '1', title: 'Painters', description: 'Interior and exterior painting services.', image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800', categories: { name: 'Home & Repair Services' } },
  { id: '105', category_id: '1', title: 'AC / Fridge / Washing Machine repair', description: 'Appliance repair and maintenance.', image_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800', categories: { name: 'Home & Repair Services' } },
  { id: '106', category_id: '1', title: 'Pest control', description: 'Effective pest control solutions.', image_url: 'https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&q=80&w=800', categories: { name: 'Home & Repair Services' } },
  { id: '107', category_id: '1', title: 'House cleaning', description: 'Deep cleaning services for your home.', image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800', categories: { name: 'Home & Repair Services' } },

  // Vehicle Services
  { id: '201', category_id: '2', title: 'Bike mechanics', description: 'Two-wheeler repair and servicing.', image_url: 'https://images.unsplash.com/photo-1581513283064-194c0f160b15?auto=format&fit=crop&q=80&w=800', categories: { name: 'Vehicle Services' } },
  { id: '202', category_id: '2', title: 'Car mechanics', description: 'Complete car repair and maintenance.', image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800', categories: { name: 'Vehicle Services' } },
  { id: '203', category_id: '2', title: 'Car wash / Bike wash', description: 'Professional vehicle cleaning and detailing.', image_url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800', categories: { name: 'Vehicle Services' } },
  { id: '204', category_id: '2', title: 'Towing services', description: '24/7 towing for breakdowns.', image_url: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=800', categories: { name: 'Vehicle Services' } },

  // Construction & Labor
  { id: '301', category_id: '3', title: 'Masons', description: 'Expert masonry and brickwork.', image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356f12?auto=format&fit=crop&q=80&w=800', categories: { name: 'Construction & Labor' } },
  { id: '302', category_id: '3', title: 'Constructors / Contractors', description: 'Full-scale construction and contracting.', image_url: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=800', categories: { name: 'Construction & Labor' } },
  { id: '303', category_id: '3', title: 'Daily wage labor', description: 'Reliable daily wage workers.', image_url: 'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&q=80&w=800', categories: { name: 'Construction & Labor' } },
  { id: '304', category_id: '3', title: 'Interior designers', description: 'Creative interior design solutions.', image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800', categories: { name: 'Construction & Labor' } },

  // Personal Services
  { id: '401', category_id: '4', title: 'Tailors', description: 'Custom tailoring and alterations.', image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800', categories: { name: 'Personal Services' } },
  { id: '402', category_id: '4', title: 'Beauticians / Makeup artists', description: 'Professional beauty and makeup services.', image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800', categories: { name: 'Personal Services' } },
  { id: '403', category_id: '4', title: 'Fitness trainers / Yoga trainers', description: 'Personal fitness and yoga instruction.', image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800', categories: { name: 'Personal Services' } },
  { id: '404', category_id: '4', title: 'Home tutors', description: 'Expert home tutoring for all subjects.', image_url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800', categories: { name: 'Personal Services' } },
  { id: '405', category_id: '4', title: 'Babysitters / Caretakers', description: 'Reliable childcare and caretaking.', image_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800', categories: { name: 'Personal Services' } },
  { id: '406', category_id: '4', title: 'Pet groomers / Pet trainers', description: 'Professional pet grooming and training.', image_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800', categories: { name: 'Personal Services' } },

  // Professional Services
  { id: '501', category_id: '5', title: 'Photographers / Videographers', description: 'Professional photography and videography.', image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800', categories: { name: 'Professional Services' } },
  { id: '502', category_id: '5', title: 'Event managers', description: 'Expert event planning and management.', image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800', categories: { name: 'Professional Services' } },
  { id: '503', category_id: '5', title: 'Catering services', description: 'Delicious catering for all occasions.', image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800', categories: { name: 'Professional Services' } },
  { id: '504', category_id: '5', title: 'Movers & Packers', description: 'Safe and efficient moving services.', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', categories: { name: 'Professional Services' } },
  { id: '505', category_id: '5', title: 'Accountants / Tax consultants', description: 'Professional accounting and tax services.', image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800', categories: { name: 'Professional Services' } },

  // Emergency Services
  { id: '601', category_id: '6', title: 'Ambulance booking', description: 'Quick and reliable ambulance services.', image_url: 'https://images.unsplash.com/photo-1587559070757-f72a388edbba?auto=format&fit=crop&q=80&w=800', categories: { name: 'Emergency Services' } },
  { id: '602', category_id: '6', title: 'Doctor at home / Telemedicine', description: 'Medical consultation at your doorstep.', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800', categories: { name: 'Emergency Services' } },
  { id: '603', category_id: '6', title: 'Locksmiths', description: 'Emergency locksmith services.', image_url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800', categories: { name: 'Emergency Services' } },
  { id: '604', category_id: '6', title: '24x7 roadside assistance', description: 'Round-the-clock roadside help.', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', categories: { name: 'Emergency Services' } }
];
