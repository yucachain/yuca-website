"use client";

import React, { useRef } from "react";
import { Formik, Form } from "formik";
import { Printer, Download } from "lucide-react";
import FormInput from "@/app/components/ui/FormInput";
import {
  DispatchLogisticsSchema,
  dispatchLogisticsInitialValues,
  DispatchLogisticsValues,
} from "@/app/components/validation/schema";

export interface LogisticInfoFormProps {
  onConfirmDispatch: (values: DispatchLogisticsValues) => void | Promise<void>;
  onIssueReceipt: (values: DispatchLogisticsValues) => void | Promise<void>;
}

export default function LogisticInfoForm({
  onConfirmDispatch,
  onIssueReceipt,
}: LogisticInfoFormProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContent = receiptRef.current.innerHTML;
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Dispatch Receipt — Yucachain</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; }
            h2 { color: #226049; margin-bottom: 4px; }
            p { margin: 0 0 8px; font-size: 13px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { text-align: left; font-size: 11px; text-transform: uppercase;
                 letter-spacing: 0.05em; color: #888; padding: 8px 0; border-bottom: 1px solid #eee; }
            td { padding: 10px 0; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
            .label { color: #888; width: 40%; }
            .footer { margin-top: 48px; font-size: 11px; color: #aaa; text-align: center; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const handleDownloadPdf = async (values: DispatchLogisticsValues) => {
    // Dynamically import html2canvas + jsPDF only when needed (keeps bundle light)
    try {
      const [{ default: jsPDF }] = await Promise.all([
        import("jspdf"),
      ]);
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const green = "#226049";
      let y = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(green);
      doc.text("Yucachain — Dispatch Receipt", 20, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#555555");
      doc.text(`Printed: ${new Date().toLocaleString()}`, 20, y);
      y += 14;

      const rows: [string, string][] = [
        ["Vault Plate Number", values.vaultPlateNumber],
        ["Vault Number", values.vaultNumber],
        ["Driver Name", values.driverName],
        ["Delivery Date", values.deliveryDate],
        ["Delivery Time", values.deliveryTime],
        ["Additional Notes", values.additionalNotes || "—"],
      ];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor("#888888");
      doc.text("FIELD", 20, y);
      doc.text("DETAILS", 100, y);
      y += 6;

      doc.setDrawColor("#eeeeee");
      doc.line(20, y, 190, y);
      y += 6;

      rows.forEach(([label, value]) => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor("#888888");
        doc.text(label, 20, y);
        doc.setTextColor("#111111");
        doc.text(value, 100, y);
        y += 10;
      });

      doc.setFontSize(8);
      doc.setTextColor("#aaaaaa");
      doc.text("© Yucachain Aggregator System", 20, 285);

      doc.save(`dispatch-receipt-${Date.now()}.pdf`);
    } catch {
      // Fallback: trigger print dialog if jsPDF isn't available
      handlePrint();
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8">
      <h3 className="text-sm font-bold text-gray-900">Logistic Information</h3>
      <p className="mt-0.5 text-xs text-gray-400">
        Yucachain fleet details for this dispatch
      </p>

      <Formik
        initialValues={dispatchLogisticsInitialValues}
        validationSchema={DispatchLogisticsSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onConfirmDispatch(values);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, values, validateForm, setTouched }) => (
          <Form className="mt-5 space-y-5" noValidate>
            {/* Vault identification row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                name="vaultPlateNumber"
                label="Vault plate number"
                placeholder="e.g. YCA-401-KW"
              />
              <FormInput
                name="vaultNumber"
                label="Vault number"
                placeholder="e.g. YucaVault #1"
              />
            </div>

            <FormInput
              name="driverName"
              label="Driver name"
              placeholder="e.g. Tunde Adeyemi"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormInput
                name="deliveryDate"
                label="Delivery date"
                type="date"
              />
              <FormInput
                name="deliveryTime"
                label="Delivery time"
                type="time"
              />
            </div>

            <FormInput
              name="additionalNotes"
              label="Additional notes"
              placeholder="e.g. Handle with care, keep dry"
            />

            {/* Action buttons */}
            <div className="pt-2">
              {/* Confirm Dispatch */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl bg-[#226049] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a4336] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                {isSubmitting ? "Confirming..." : "Confirm Dispatch"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
