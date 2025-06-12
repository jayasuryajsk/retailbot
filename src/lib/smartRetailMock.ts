import mockData from '@/mocks/smartRetailDummy.json';

interface DepartmentSale {
  date: string;
  department: string;
  sales: number;
}

interface ItemSale {
  date: string;
  item: string;
  qty: number;
  revenue: number;
}

interface ItemStock {
  item: string;
  qoh: number;
}

interface ItemSpecial {
  item: string;
  desc: string;
  start: string;
  end: string;
}

export async function getDepartmentSales(date: string): Promise<DepartmentSale[] | null> {
  const sales = mockData.departmentSales.filter(sale => sale.date === date);
  return sales.length > 0 ? sales : null;
}

export async function getItemSales(date: string, item: string): Promise<ItemSale | null> {
  return mockData.itemSales.find(sale => sale.date === date && sale.item === item) || null;
}

export async function getItemStock(item: string): Promise<ItemStock | null> {
  return mockData.itemStock.find(stock => stock.item === item) || null;
}

export async function getItemSpecials(item: string): Promise<ItemSpecial | null> {
  return mockData.itemSpecials.find(special => special.item === item) || null;
}