import { useState, useCallback } from 'react';
import axiosClient from '../../../api/axiosClient';

export default function useSocialReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.department) params.department = filters.department;
      if (filters.employee) params.employee = filters.employee;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await axiosClient.get('/social/reports/social', { params });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch social report');
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReport = useCallback(async (format, filters = {}) => {
    try {
      const params = { format };
      if (filters.department) params.department = filters.department;
      if (filters.employee) params.employee = filters.employee;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await axiosClient.get('/social/reports/social/export', {
        params,
        responseType: 'blob',
      });

      // Create download link
      const ext = format === 'excel' ? 'xlsx' : format;
      const mimeMap = {
        csv: 'text/csv',
        pdf: 'application/pdf',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      const blob = new Blob([res.data], { type: mimeMap[format] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-report-${new Date().toISOString().split('T')[0]}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || err.message || `Failed to export ${format}`);
    }
  }, []);

  return {
    report,
    loading,
    error,
    fetchReport,
    exportReport,
  };
}
