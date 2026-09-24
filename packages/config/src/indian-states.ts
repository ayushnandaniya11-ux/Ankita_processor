// ============================================
// Indian States for address forms / GST
// ============================================

export interface IndianState {
  name: string
  code: string
  gstCode: string
}

export const INDIAN_STATES: IndianState[] = [
  { name: 'Andhra Pradesh', code: 'AP', gstCode: '37' },
  { name: 'Arunachal Pradesh', code: 'AR', gstCode: '12' },
  { name: 'Assam', code: 'AS', gstCode: '18' },
  { name: 'Bihar', code: 'BR', gstCode: '10' },
  { name: 'Chhattisgarh', code: 'CT', gstCode: '22' },
  { name: 'Goa', code: 'GA', gstCode: '30' },
  { name: 'Gujarat', code: 'GJ', gstCode: '24' },
  { name: 'Haryana', code: 'HR', gstCode: '06' },
  { name: 'Himachal Pradesh', code: 'HP', gstCode: '02' },
  { name: 'Jharkhand', code: 'JH', gstCode: '20' },
  { name: 'Karnataka', code: 'KA', gstCode: '29' },
  { name: 'Kerala', code: 'KL', gstCode: '32' },
  { name: 'Madhya Pradesh', code: 'MP', gstCode: '23' },
  { name: 'Maharashtra', code: 'MH', gstCode: '27' },
  { name: 'Manipur', code: 'MN', gstCode: '14' },
  { name: 'Meghalaya', code: 'ML', gstCode: '17' },
  { name: 'Mizoram', code: 'MZ', gstCode: '15' },
  { name: 'Nagaland', code: 'NL', gstCode: '13' },
  { name: 'Odisha', code: 'OR', gstCode: '21' },
  { name: 'Punjab', code: 'PB', gstCode: '03' },
  { name: 'Rajasthan', code: 'RJ', gstCode: '08' },
  { name: 'Sikkim', code: 'SK', gstCode: '11' },
  { name: 'Tamil Nadu', code: 'TN', gstCode: '33' },
  { name: 'Telangana', code: 'TG', gstCode: '36' },
  { name: 'Tripura', code: 'TR', gstCode: '16' },
  { name: 'Uttar Pradesh', code: 'UP', gstCode: '09' },
  { name: 'Uttarakhand', code: 'UK', gstCode: '05' },
  { name: 'West Bengal', code: 'WB', gstCode: '19' },
  { name: 'Delhi', code: 'DL', gstCode: '07' },
  { name: 'Jammu & Kashmir', code: 'JK', gstCode: '01' },
  { name: 'Ladakh', code: 'LA', gstCode: '38' },
  { name: 'Chandigarh', code: 'CH', gstCode: '04' },
  { name: 'Puducherry', code: 'PY', gstCode: '34' },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', code: 'DN', gstCode: '26' },
  { name: 'Lakshadweep', code: 'LD', gstCode: '31' },
  { name: 'Andaman & Nicobar Islands', code: 'AN', gstCode: '35' },
]

export const STATE_OPTIONS = INDIAN_STATES.map((s) => ({
  label: s.name,
  value: s.name,
}))
