import { Product, StockAdjustment, PartsIssue } from '../types/inventory';
import { MOCK_POS_PRODUCTS } from './posData'; // Reuse product data

export const MOCK_INVENTORY_PRODUCTS: Product[] = MOCK_POS_PRODUCTS;
export const MOCK_STOCK_ADJUSTMENTS: StockAdjustment[] = [];
export const MOCK_PARTS_ISSUES: PartsIssue[] = [];
