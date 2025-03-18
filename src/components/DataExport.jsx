    // src/components/DataExport.jsx
    import React from 'react';

    const DataExport = ({ audit, damageRecords }) => {

      const convertToCSV = (auditData, damageData) => {
        if (!auditData) {
          console.error("Audit data is missing.");
          alert("Error: Audit data is missing."); // Provide user feedback
          return null; // Return null to indicate failure
        }
        damageData = damageData || []; // Ensure damageData is at least an empty array

        // --- Audit Data ---
        const auditHeaders = Object.keys(auditData).filter(key => key !== 'id' && key !== 'status'); // Exclude id and status
        const auditRow = auditHeaders.map(header => {
          let value = auditData[header];
          // Format date if necessary
          if (header === 'audit_date' && value) {
            value = new Date(value).toLocaleDateString();
          }
          // Properly escape double quotes AND enclose in double quotes.
          return `"${String(value).replace(/"/g, '""')}"`;
        });

        // --- Damage Records Data ---
        const damageHeaders = damageData.length > 0 ? Object.keys(damageData[0]).filter(key => key !== 'id' && key !== 'audit_id') : [];
        const damageRows = damageData.map(record =>
          damageHeaders.map(header => {
            let value = record[header];
            // Format photo_url to "Photo Attached" if it exists, otherwise leave it empty
            if (header === 'photo_url') {
              value = value ? "Photo Attached" : "";
            }
            // Properly escape double quotes AND enclose in double quotes.
            return `"${String(value).replace(/"/g, '""')}"`;
          })
        );

        // --- Combine into CSV ---
        // Create a single header row, combining audit and damage headers.
        // We'll prefix damage record headers to avoid collisions.
        const prefixedDamageHeaders = damageHeaders.map(header => `damage_${header}`);
        const csvHeaders = [...auditHeaders, ...prefixedDamageHeaders].join(',') + '\n';

        // Create CSV rows.  Each row will contain the audit data, followed by ONE damage record.
        // If there are multiple damage records, there will be multiple rows with the same audit data.
        let csvRows = '';
        if (damageRows.length === 0) {
          // If no damage records, just include the audit data
          csvRows = `${auditRow.join(',')}\n`;
        } else {
          damageRows.forEach(damageRow => {
            csvRows += `${auditRow.join(',')},${damageRow.join(',')}\n`;
          });
        }

        return csvHeaders + csvRows;
      };


      const handleExport = () => {
        const csvContent = convertToCSV(audit, damageRecords);
        if (!csvContent) {
          return; // Exit if convertToCSV failed
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit_data_${audit.reference_number}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
      };

      return (
        <button onClick={handleExport} disabled={!audit} className="export-btn">
          Export to CSV
        </button>
      );
    };

    export default DataExport;
