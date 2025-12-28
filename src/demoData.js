// Demo data for testing appointment booking system
// This file provides sample employees and schedules

export const demoEmployees = [
  {
    id: 'emp-001',
    name: 'Dr. Ahmet Yılmaz',
    position: 'Doktor'
    , username: 'emp1', password: '1234'
  },
  {
    id: 'emp-002',
    name: 'Hemşire Ayşe Kaya',
    position: 'Hemşire'
    , username: 'emp2', password: '1234'
  },
  {
    id: 'emp-003',
    name: 'Diş Hekimi Mehmet Özkan',
    position: 'Diş Hekimi'
    , username: 'emp3', password: '1234'
  }
];

export const demoSchedules = {
  'emp-001': [
    { id: 'sch-001', dayOfWeek: 'Pazartesi', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
    { id: 'sch-002', dayOfWeek: 'Salı', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
    { id: 'sch-003', dayOfWeek: 'Çarşamba', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
    { id: 'sch-004', dayOfWeek: 'Perşembe', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
    { id: 'sch-005', dayOfWeek: 'Cuma', startTime: '09:00', endTime: '16:00', slotDuration: 30 }
  ],
  'emp-002': [
    { id: 'sch-006', dayOfWeek: 'Pazartesi', startTime: '08:00', endTime: '16:00', slotDuration: 20 },
    { id: 'sch-007', dayOfWeek: 'Çarşamba', startTime: '08:00', endTime: '16:00', slotDuration: 20 },
    { id: 'sch-008', dayOfWeek: 'Cuma', startTime: '08:00', endTime: '16:00', slotDuration: 20 }
  ],
  'emp-003': [
    { id: 'sch-009', dayOfWeek: 'Pazartesi', startTime: '10:00', endTime: '18:00', slotDuration: 45 },
    { id: 'sch-010', dayOfWeek: 'Salı', startTime: '10:00', endTime: '18:00', slotDuration: 45 },
    { id: 'sch-011', dayOfWeek: 'Perşembe', startTime: '10:00', endTime: '18:00', slotDuration: 45 },
    { id: 'sch-012', dayOfWeek: 'Cuma', startTime: '10:00', endTime: '18:00', slotDuration: 45 }
  ]
};

/**
 * Initialize localStorage with demo data
 */
export const initializeDemoData = () => {
  // Demo data is deprecated/removed. Clearing any demo keys to avoid accidental reloading.
  localStorage.removeItem('employees');
  localStorage.removeItem('employeeSchedules');
  localStorage.removeItem('appointments');
  console.log('Demo data cleared from localStorage');
};

/**
 * Clear all appointment and schedule data from localStorage
 */
export const clearAllData = () => {
  if (window.confirm('Tüm veriyi (randevu, personel, çalışma saatleri) silmek istediğinizden emin misiniz?')) {
    localStorage.removeItem('employees');
    localStorage.removeItem('employeeSchedules');
    localStorage.removeItem('appointments');
    console.log('All data cleared from localStorage');
    window.location.reload();
  }
};
