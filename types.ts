
export interface CCLData {
  originalDateRange: string;
  endDate: string;
  indexValue: number;
}

export interface ParseResult {
  data: CCLData[];
  error?: string;
}
