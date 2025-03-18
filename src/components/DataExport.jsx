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
            // Keep photo_url, but provide a user-friendly representation for mail merge *and* include the raw URL
            if (header === 'photo_url') {
              value = value ? "Photo Attached" : ""; // Keep this for display in Word
            }
            // Properly escape double quotes AND enclose in double quotes.
            return `"${String(value).replace(/"/g, '""')}"`;
          })
        );

        // --- Combine into CSV ---
        // Create a single header row, combining audit and damage headers.
        // We'll prefix damage record headers to avoid collisions.
        const prefixedDamageHeaders = damageHeaders.map(header => `damage_${header}`);
        // Add a *new* header for the raw photo URL
        const csvHeaders = [...auditHeaders, ...prefixedDamageHeaders, 'damage_photo_url_raw'].join(',') + '\n';

        let csvRows = '';
        if (damageRows.length === 0) {
          // If no damage records, just include the audit data
          csvRows = `${auditRow.join(',')}\n`;
        } else {
          damageRows.forEach((damageRow, index) => {
            // Get the *raw* photo URL for this damage record
            const rawPhotoUrl = damageData[index].photo_url || ''; // Get the original URL
            // Add the raw URL to the row
            csvRows += `${auditRow.join(',')},${damageRow.join(',')},"${rawPhotoUrl.replace(/"/g, '""')}"\n`;
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
