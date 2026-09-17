export const isDateInRange = (startDate: string, endDate: string): boolean => {
  const now = new Date();
  const start = new Date(startDate)
  const end = new Date(endDate)

  return now >= start && now <= end
}

export const isDateBefore = (endDate: string): boolean => {
  const now = new Date()
  const end = new Date(endDate)
  return now >= end
}

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

export const getDateRange = (): [string, string] => {
  const currentDate = new Date()
  const nextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
  
  const year = nextMonth.getFullYear()
  const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
  const day = String(nextMonth.getDate()).padStart(2, '0')
  
  return [`${year - 1}-01-01`, `${year}-${month}-${day}`]
}