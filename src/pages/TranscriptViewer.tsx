import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, Download, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportData {
  id: string;
  reference_id: string;
  applicant_name: string;
  applicant_email: string;
  evaluation_type: string;
  report_file_url: string | null;
  expiry_date: string | null;
  status: string;
  created_at: string;
  shared_to_email: string | null;
}

const TranscriptViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid access link.");
      setLoading(false);
      return;
    }
    const fetchReport = async () => {
      const { data, error: fetchErr } = await (supabase as any)
        .from("evaluation_reports")
        .select("*")
        .eq("access_token", token)
        .single();

      if (fetchErr || !data) {
        setError("Report not found or link has expired.");
      } else {
        setReport(data as ReportData);
      }
      setLoading(false);
    };
    fetchReport();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">{error || "Report not found."}</p>
        </div>
      </div>
    );
  }

  const daysLeft = report.expiry_date
    ? Math.max(0, Math.ceil((new Date(report.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-[#2d2d2d]">
      {/* Top bar */}
      <div className="bg-[#333333] border-b border-[#444] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FileText size={20} className="text-white" />
          <span className="text-white font-medium">Transcript</span>
        </div>
        <Button
          onClick={() => report.report_file_url && window.open(report.report_file_url, "_blank")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-lg"
        >
          <Download size={16} /> Download
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Document preview area */}
        <div className="flex-1 p-8 flex items-start justify-center min-h-[80vh]">
          <div className="bg-white rounded shadow-2xl w-full max-w-[700px] min-h-[900px] p-12">
            {/* Mock document content styled like a transcript */}
            <div className="text-center mb-8">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-4">
                OFFICIAL EVALUATION REPORT
              </p>
              <div className="border-b border-gray-300 pb-4">
                <h2 className="text-lg font-bold text-gray-800">Institute of Foreign Credential Services (IFCS)</h2>
                <p className="text-xs text-gray-500 mt-1">New York, NY · www.ifcsevals.com</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <h3 className="font-bold text-gray-800 text-base">Evaluation Report</h3>

              <div className="grid grid-cols-2 gap-4 text-xs border-b border-gray-200 pb-4">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{report.applicant_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Reference #:</span>
                  <span className="ml-2 font-medium">{report.reference_id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Evaluation Type:</span>
                  <span className="ml-2 font-medium">{report.evaluation_type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-2 font-medium">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  This document certifies that the credentials of <strong>{report.applicant_name}</strong> have been evaluated
                  by the Institute of Foreign Credential Services (IFCS) and found to be equivalent to United States academic standards.
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The evaluation was conducted in accordance with the guidelines established by NACES and AICE member organizations.
                </p>
              </div>

              <div className="pt-8 border-t border-gray-200 mt-8">
                <p className="text-xs text-gray-400">
                  This report is valid for 5 years from the date of issuance. Verify at ifcsevals.com using reference #{report.reference_id}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-full lg:w-[380px] bg-white border-l border-gray-200 p-6 space-y-6">
          {/* Time sensitive notice */}
          {daysLeft !== null && (
            <div className="flex items-start gap-3">
              <Clock size={24} className="text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">
                <strong>TIME SENSITIVE:</strong> This download is only available for <strong className="text-2xl">{daysLeft}</strong> more days
              </p>
            </div>
          )}

          <hr className="border-border" />

          {/* IFCS branding */}
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-accent" />
            <span className="font-bold text-foreground">IFCS</span>
            <span className="text-xs text-muted-foreground">Credential Evaluation</span>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-bold text-foreground">Order Details</p>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
              <span className="text-muted-foreground">Order Placed By:</span>
              <span className="text-foreground">{report.applicant_name}</span>
              <span className="text-muted-foreground">Date Delivered:</span>
              <span className="text-foreground">{new Date(report.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <p className="font-bold text-foreground">FROM</p>
            <p className="text-xs text-foreground">Institute of Foreign Credential Services (IFCS)</p>
            <p className="text-xs text-muted-foreground">New York, NY</p>
          </div>

          {report.shared_to_email && (
            <div className="space-y-1 text-sm">
              <p className="font-bold text-foreground">TO</p>
              <p className="text-xs text-foreground">{report.shared_to_email}</p>
            </div>
          )}

          <hr className="border-border" />

          <div className="space-y-3">
            <p className="font-bold text-foreground text-sm">Documents in this delivery package</p>
            <div className="border-l-4 border-emerald-500 pl-4 py-2">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">PDF</p>
                  <p className="text-xs text-muted-foreground">{report.reference_id}.pdf</p>
                  <p className="text-xs text-muted-foreground">Delivery ID: <strong>{report.reference_id}</strong></p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => report.report_file_url && window.open(report.report_file_url, "_blank")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Download size={16} /> Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptViewer;
