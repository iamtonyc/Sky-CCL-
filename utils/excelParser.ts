
import * as XLSX from 'xlsx';
import { ParseResult, CCLData } from '../types';

/**
 * Parses a CCL Excel file.
 * Expects:
 * Column 1 aliases: "date range", "日期"
 * Column 2 aliases: "ccl index value", "中原城市領先指數", "ccl index"
 */
export const parseCCLExcel = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON (array of arrays for easier column indexing)
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

        if (rows.length < 2) {
          return resolve({ data: [], error: "upload file not correct: The file appears to be empty or missing data rows." });
        }

        const headers = rows[0].map(h => String(h).toLowerCase().trim());
        
        // Define aliases for the columns
        const dateRangeAliases = ['date range', '日期'];
        const indexValueAliases = ['ccl index value', '中原城市領先指數', 'ccl index'];

        const dateRangeIdx = headers.findIndex(h => dateRangeAliases.includes(h));
        const indexValueIdx = headers.findIndex(h => indexValueAliases.includes(h));

        if (dateRangeIdx === -1 || indexValueIdx === -1) {
          return resolve({ 
            data: [], 
            error: "upload file not correct: Missing required columns. Please ensure you have '日期' (Date Range) and '中原城市領先指數' (CCL Index)." 
          });
        }

        const parsedData: CCLData[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const rawDateRange = String(row[dateRangeIdx] || "").trim();
          const rawIndexValue = row[indexValueIdx];

          if (!rawDateRange) continue;

          // Attempt to extract the end date from a range like "2023-01-01 to 2023-01-07", "01/01/2023 - 07/01/2023", or just a single date
          let endDateStr = rawDateRange;
          const separators = [" to ", " - ", "–", "~"]; // Added common separators including Chinese-style dash
          
          for (const sep of separators) {
            if (rawDateRange.includes(sep)) {
              const parts = rawDateRange.split(sep);
              const lastPart = parts[parts.length - 1].trim();
              if (lastPart) {
                endDateStr = lastPart;
                break;
              }
            }
          }

          // Fallback check for simple dash if not matched by larger separators with spaces
          if (endDateStr === rawDateRange && rawDateRange.includes('-') && !rawDateRange.startsWith('-')) {
             const parts = rawDateRange.split('-');
             if (parts.length > 1) {
                // Check if it looks like a date range YYYY-MM-DD - YYYY-MM-DD
                // If it's just YYYY-MM-DD, the split might be tricky.
                // Usually, ranges are separated by space-dash-space or just dash.
                // If we have 3 dashes in 2023-01-01-2023-01-07, it's 2023, 01, 01, 2023, 01, 07
                if (parts.length >= 6) {
                    endDateStr = `${parts[3]}-${parts[4]}-${parts[5]}`;
                } else {
                    endDateStr = parts[parts.length - 1].trim();
                }
             }
          }

          // Validate date
          const date = new Date(endDateStr);
          if (isNaN(date.getTime())) {
            return resolve({ data: [], error: `upload file not correct: Invalid date format at row ${i + 1} ("${rawDateRange}"). Tried to parse "${endDateStr}" as the end date.` });
          }

          // Validate index value
          const indexValue = parseFloat(rawIndexValue);
          if (isNaN(indexValue)) {
            return resolve({ data: [], error: `upload file not correct: Invalid index value at row ${i + 1} ("${rawIndexValue}").` });
          }

          parsedData.push({
            originalDateRange: rawDateRange,
            endDate: date.toISOString().split('T')[0],
            indexValue: indexValue
          });
        }

        if (parsedData.length === 0) {
          return resolve({ data: [], error: "upload file not correct: No valid data rows found." });
        }

        // Sort data by end date
        parsedData.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

        resolve({ data: parsedData });
      } catch (err) {
        resolve({ data: [], error: "upload file not correct: Failed to parse the Excel file. Ensure it is a valid .xlsx file." });
      }
    };

    reader.onerror = () => {
      resolve({ data: [], error: "upload file not correct: Error reading the file." });
    };

    reader.readAsArrayBuffer(file);
  });
};
