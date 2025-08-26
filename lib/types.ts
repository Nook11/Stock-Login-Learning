export interface Course {
  name: string
  items: StockItem[]
}

export interface StockItem {
  id: number
  name: string
  image: string
  category: string
  required: number
  inStock: number
}

export interface Center {
  name: string
}

export interface CenterStock {
  [centerName: string]: StockItem[]
}

export const STORAGE_KEYS = {
  COURSES: "allCoursesData",
  CENTERS: "dist_centers_list",
  CENTER_STOCK: "centerStockData",
  CATEGORIES: "productCategories",
} as const
