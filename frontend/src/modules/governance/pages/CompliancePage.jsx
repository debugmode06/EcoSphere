import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Plus, RefreshCw, CheckCircle2,
  Clock, AlertCircle, Search, Flame, ShieldAlert
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { useAuth } from '../../../context/AuthContext';
import {
  getComplianceIssues,
  createComplianceIssue,
  resolveIssue,
} from '../../../api/governanceApi';

export default function CompliancePage() {
  return (
    <div className="card p-8 text-center text-slate-500 max-w-xl mx-auto mt-10">
      <h3 className="text-lg font-bold text-slate-700 mb-2">Compliance Issues</h3>
      <p className="text-sm mb-4 leading-normal text-slate-500">This module is under construction by another team member.</p>
      <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-400">
        TODO: Show compliance issues severity list table & Resolve actions
      </div>
    </div>
  );
}
