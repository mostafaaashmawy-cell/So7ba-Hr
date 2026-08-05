/**
 * Utility function to export JSON datasets to UTF-8 CSV with Excel compatibility (BOM)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCSV(data: Record<string, any>[], fileName: string) {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Format rows
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const val = row[header];
        // Clean values, escape double quotes, wrap in quotes
        let strVal = val === null || val === undefined ? '' : String(val);
        strVal = strVal.replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...csvRows].join('\n');

  // Prepended UTF-8 BOM so Excel opens Arabic correctly
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
