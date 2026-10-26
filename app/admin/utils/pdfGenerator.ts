import jsPDF from "jspdf";
import { YUCACHAIN_LOGO_BASE64 } from "./logoBase64";

export interface TransactionPDFItem {
  id: string;
  orderNumber: string;
  date: string;
  productTitle: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  sellerName: string;
  sellerRole: string;
  buyerName: string;
  buyerRole?: string;
  paymentMethod?: string;
}

export interface StatementPDFOptions {
  transactions: TransactionPDFItem[];
  filterRoleLabel?: string;
  filterTabLabel?: string;
  searchQuery?: string;
  generatedBy?: string;
}

export interface UserPDFItem {
  id: string;
  name: string;
  role: string;
  address: string;
}

export interface UsersPDFOptions {
  users: UserPDFItem[];
  filterRoleLabel?: string;
}

/**
 * Generates a simple, classic Landscape PDF of all marketplace transactions/orders.
 *
 * Requirements:
 * - Centered YucaChain logo.
 * - Centered 1-line short note of what the company does.
 * - Centered title of what the PDF is all about ("ORDERS & TRANSACTIONS REPORT").
 * - Clean, classic table underneath (NO payout status anywhere).
 * - Multi-page pagination support.
 */
export function generateTransactionsReportPDF(options: StatementPDFOptions): void {
  const { transactions } = options;

  // Landscape A4: 297mm x 210mm
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 269mm

  const totalCount = transactions.length;
  const totalGMV = transactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Table columns for 269mm width:
  const columns = [
    { title: "#", x: marginX + 2, width: 10, align: "left" as const },
    { title: "Order Ref", x: marginX + 12, width: 34, align: "left" as const },
    { title: "Date", x: marginX + 46, width: 24, align: "left" as const },
    { title: "Product / Item", x: marginX + 70, width: 64, align: "left" as const },
    { title: "Quantity", x: marginX + 134, width: 24, align: "left" as const },
    { title: "Seller", x: marginX + 158, width: 42, align: "left" as const },
    { title: "Buyer", x: marginX + 200, width: 41, align: "left" as const },
    { title: "Amount (NGN)", x: marginX + 267, width: 28, align: "right" as const },
  ];

  const drawPageHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      // 1. Centered YucaChain Logo (32mm x 15.8mm)
      const logoW = 32;
      const logoH = 15.8;
      const logoX = (pageWidth - logoW) / 2;
      try {
        doc.addImage(YUCACHAIN_LOGO_BASE64, "PNG", logoX, 9, logoW, logoH);
      } catch {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(34, 96, 73);
        doc.text("YUCACHAIN", pageWidth / 2, 17, { align: "center" });
      }

      // 2. Centered 1-line subtopic of what company does
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(90, 90, 90);
      doc.text(
        "Decentralized Agricultural Trade, Commodity Processing & Digital Escrow Network",
        pageWidth / 2,
        28.5,
        { align: "center" }
      );

      // 3. Centered title of what the PDF is all about
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(34, 96, 73);
      doc.text("ORDERS & TRANSACTIONS REPORT", pageWidth / 2, 34, { align: "center" });

      // 4. Centered short meta line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Date: ${formattedDate}   •   Total: ${totalCount} Orders   •   Sales Volume: NGN ${totalGMV.toLocaleString()}`,
        pageWidth / 2,
        39,
        { align: "center" }
      );

      // Subtle divider line
      doc.setDrawColor(220, 225, 220);
      doc.setLineWidth(0.3);
      doc.line(marginX, 42, pageWidth - marginX, 42);
    } else {
      // Compact continuation header for Page 2+
      const logoW = 20;
      const logoH = 9.9;
      const logoX = (pageWidth - logoW) / 2;
      try {
        doc.addImage(YUCACHAIN_LOGO_BASE64, "PNG", logoX, 6, logoW, logoH);
      } catch {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(34, 96, 73);
        doc.text("YUCACHAIN", pageWidth / 2, 12, { align: "center" });
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(34, 96, 73);
      doc.text("ORDERS & TRANSACTIONS REPORT (Cont.)", pageWidth / 2, 19, { align: "center" });

      doc.setDrawColor(220, 225, 220);
      doc.setLineWidth(0.3);
      doc.line(marginX, 22, pageWidth - marginX, 22);
    }
  };

  const drawTableHeader = (startY: number) => {
    const h = 7.5;
    doc.setFillColor(240, 244, 241);
    doc.rect(marginX, startY, contentWidth, h, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(26, 58, 42);

    columns.forEach((c) => {
      doc.text(c.title, c.x, startY + 5.2, { align: c.align });
    });

    return startY + h;
  };

  const drawPageFooter = (currentPage: number, totalPages: number) => {
    const footerY = pageHeight - 8;
    doc.setDrawColor(220, 225, 220);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 2.5, pageWidth - marginX, footerY - 2.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 130, 125);
    doc.text("YucaChain Agribusiness Platform • Orders & Transactions", marginX, footerY + 1);
    doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - marginX, footerY + 1, {
      align: "right",
    });
  };

  // --- DRAW CONTENT ---
  let currentPage = 1;
  drawPageHeader(true);

  let currentY = drawTableHeader(45);
  const rowHeight = 7;
  const maxContentY = pageHeight - 16;

  transactions.forEach((tx, idx) => {
    if (currentY + rowHeight > maxContentY) {
      doc.addPage("a4", "landscape");
      currentPage++;
      drawPageHeader(false);
      currentY = drawTableHeader(24);
    }

    // Alternating soft zebra shading
    if (idx % 2 === 1) {
      doc.setFillColor(250, 252, 250);
      doc.rect(marginX, currentY, contentWidth, rowHeight, "F");
    }

    doc.setDrawColor(240, 243, 240);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + rowHeight, marginX + contentWidth, currentY + rowHeight);

    const textY = currentY + 4.8;

    // #
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(String(idx + 1), columns[0].x, textY);

    // Order Ref
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(40, 40, 40);
    const ref = tx.orderNumber.length > 18 ? tx.orderNumber.substring(0, 17) + "…" : tx.orderNumber;
    doc.text(ref, columns[1].x, textY);

    // Date
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(tx.date || "Recent", columns[2].x, textY);

    // Product
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    const prod = tx.productTitle.length > 38 ? tx.productTitle.substring(0, 37) + "…" : tx.productTitle;
    doc.text(prod, columns[3].x, textY);

    // Quantity
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    const qty = `${(tx.quantity || 1).toLocaleString()} ${tx.unit || "kg"}`;
    doc.text(qty, columns[4].x, textY);

    // Seller
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const seller = `${tx.sellerName} (${tx.sellerRole || "Seller"})`;
    const sellerClean = seller.length > 25 ? seller.substring(0, 24) + "…" : seller;
    doc.text(sellerClean, columns[5].x, textY);

    // Buyer
    const buyer = tx.buyerName.length > 22 ? tx.buyerName.substring(0, 21) + "…" : tx.buyerName;
    doc.text(buyer, columns[6].x, textY);

    // Amount (NGN) - Right aligned
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 96, 73);
    doc.text(
      (tx.totalAmount || 0).toLocaleString(),
      columns[7].x,
      textY,
      { align: "right" }
    );

    currentY += rowHeight;
  });

  // Grand Total Row
  if (currentY + 9 > maxContentY) {
    doc.addPage("a4", "landscape");
    currentPage++;
    drawPageHeader(false);
    currentY = 24;
  }

  doc.setFillColor(240, 246, 242);
  doc.setDrawColor(200, 220, 210);
  doc.rect(marginX, currentY + 1, contentWidth, 8, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(26, 58, 42);
  doc.text(`Total Sales Revenue (${totalCount} Orders)`, columns[1].x, currentY + 6.3);

  doc.setFontSize(8.5);
  doc.text(
    `NGN ${totalGMV.toLocaleString()}`,
    columns[7].x,
    currentY + 6.3,
    { align: "right" }
  );

  // Footers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(p, totalPages);
  }

  doc.save(`YucaChain_Transactions_Report_${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Generates a simple, classic Portrait PDF of Registered Users.
 *
 * Requirements:
 * - Centered YucaChain logo.
 * - Centered 1-line short note of what the company does.
 * - Centered title of what the PDF is all about ("REGISTERED USERS DIRECTORY").
 * - Clean table underneath with just: Name, Role, Location/Address.
 * - Multi-page pagination support.
 */
export function generateUsersReportPDF(options: UsersPDFOptions): void {
  const { users, filterRoleLabel = "All Roles" } = options;

  // Portrait A4: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  const totalCount = users.length;
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Columns for 182mm width:
  // # (12mm), Name (60mm), Role (44mm), Location / Address (66mm)
  const columns = [
    { title: "#", x: marginX + 2, width: 12, align: "left" as const },
    { title: "Name", x: marginX + 14, width: 60, align: "left" as const },
    { title: "Role", x: marginX + 74, width: 44, align: "left" as const },
    { title: "Location / Address", x: marginX + 118, width: 64, align: "left" as const },
  ];

  const drawPageHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      // 1. Centered YucaChain Logo (32mm x 15.8mm)
      const logoW = 32;
      const logoH = 15.8;
      const logoX = (pageWidth - logoW) / 2;
      try {
        doc.addImage(YUCACHAIN_LOGO_BASE64, "PNG", logoX, 9, logoW, logoH);
      } catch {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(34, 96, 73);
        doc.text("YUCACHAIN", pageWidth / 2, 17, { align: "center" });
      }

      // 2. Centered 1-line subtopic of what company does
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(90, 90, 90);
      doc.text(
        "Decentralized Agricultural Trade, Commodity Processing & Digital Escrow Network",
        pageWidth / 2,
        28.5,
        { align: "center" }
      );

      // 3. Centered title of what the PDF is all about
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(34, 96, 73);
      doc.text("REGISTERED USERS DIRECTORY", pageWidth / 2, 34, { align: "center" });

      // 4. Centered short meta line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Date: ${formattedDate}   •   Scope: ${filterRoleLabel}   •   Total: ${totalCount} Users`,
        pageWidth / 2,
        39,
        { align: "center" }
      );

      // Subtle divider line
      doc.setDrawColor(220, 225, 220);
      doc.setLineWidth(0.3);
      doc.line(marginX, 42, pageWidth - marginX, 42);
    } else {
      // Compact continuation header for Page 2+
      const logoW = 20;
      const logoH = 9.9;
      const logoX = (pageWidth - logoW) / 2;
      try {
        doc.addImage(YUCACHAIN_LOGO_BASE64, "PNG", logoX, 6, logoW, logoH);
      } catch {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(34, 96, 73);
        doc.text("YUCACHAIN", pageWidth / 2, 12, { align: "center" });
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(34, 96, 73);
      doc.text("REGISTERED USERS DIRECTORY (Cont.)", pageWidth / 2, 19, { align: "center" });

      doc.setDrawColor(220, 225, 220);
      doc.setLineWidth(0.3);
      doc.line(marginX, 22, pageWidth - marginX, 22);
    }
  };

  const drawTableHeader = (startY: number) => {
    const h = 7.5;
    doc.setFillColor(240, 244, 241);
    doc.rect(marginX, startY, contentWidth, h, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(26, 58, 42);

    columns.forEach((c) => {
      doc.text(c.title, c.x, startY + 5.2, { align: c.align });
    });

    return startY + h;
  };

  const drawPageFooter = (currentPage: number, totalPages: number) => {
    const footerY = pageHeight - 8;
    doc.setDrawColor(220, 225, 220);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 2.5, pageWidth - marginX, footerY - 2.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 130, 125);
    doc.text("YucaChain Agribusiness Platform • User Directory", marginX, footerY + 1);
    doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - marginX, footerY + 1, {
      align: "right",
    });
  };

  // --- DRAW CONTENT ---
  let currentPage = 1;
  drawPageHeader(true);

  let currentY = drawTableHeader(45);
  const rowHeight = 7.5;
  const maxContentY = pageHeight - 16;

  users.forEach((u, idx) => {
    if (currentY + rowHeight > maxContentY) {
      doc.addPage("a4", "portrait");
      currentPage++;
      drawPageHeader(false);
      currentY = drawTableHeader(24);
    }

    // Alternating soft zebra shading
    if (idx % 2 === 1) {
      doc.setFillColor(250, 252, 250);
      doc.rect(marginX, currentY, contentWidth, rowHeight, "F");
    }

    doc.setDrawColor(240, 243, 240);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + rowHeight, marginX + contentWidth, currentY + rowHeight);

    const textY = currentY + 5.1;

    // #
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(String(idx + 1), columns[0].x, textY);

    // Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    const nameClean = u.name.length > 30 ? u.name.substring(0, 29) + "…" : u.name;
    doc.text(nameClean, columns[1].x, textY);

    // Role
    doc.setFont("helvetica", "normal");
    doc.setTextColor(34, 96, 73);
    const roleMap: Record<string, string> = {
      farmer: "Farmer",
      processor: "Buyer / Processor",
      "service-provider": "Service Provider",
      consumer: "Consumer",
    };
    const roleClean = roleMap[u.role] || u.role || "User";
    doc.text(roleClean, columns[2].x, textY);

    // Location / Address
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    const addr = u.address || "Location not specified";
    const addrClean = addr.length > 38 ? addr.substring(0, 37) + "…" : addr;
    doc.text(addrClean, columns[3].x, textY);

    currentY += rowHeight;
  });

  // Footers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(p, totalPages);
  }

  doc.save(`YucaChain_Users_Directory_${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Generates a simple, classic Portrait PDF for an individual transaction receipt.
 *
 * Requirements:
 * - Centered YucaChain logo.
 * - Centered 1-line subtopic of what company does.
 * - Centered title ("TRANSACTION RECEIPT").
 * - Receipt details, seller, buyer, product, quantity, amount.
 * - NO payout status.
 */
export function generateSingleTransactionReceiptPDF(tx: TransactionPDFItem): void {
  // Portrait A4: 210mm x 297mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178mm

  // 1. Centered YucaChain Logo
  const logoW = 32;
  const logoH = 15.8;
  const logoX = (pageWidth - logoW) / 2;
  try {
    doc.addImage(YUCACHAIN_LOGO_BASE64, "PNG", logoX, 9, logoW, logoH);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(34, 96, 73);
    doc.text("YUCACHAIN", pageWidth / 2, 17, { align: "center" });
  }

  // 2. Centered 1-line subtopic
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(
    "Decentralized Agricultural Trade, Commodity Processing & Digital Escrow Network",
    pageWidth / 2,
    28.5,
    { align: "center" }
  );

  // 3. Centered title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(34, 96, 73);
  doc.text("OFFICIAL TRANSACTION RECEIPT", pageWidth / 2, 34, { align: "center" });

  // 4. Centered meta line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Order #: ${tx.orderNumber}   •   Date: ${tx.date || new Date().toLocaleDateString()}`,
    pageWidth / 2,
    39,
    { align: "center" }
  );

  doc.setDrawColor(220, 225, 220);
  doc.setLineWidth(0.3);
  doc.line(marginX, 42, pageWidth - marginX, 42);

  let currentY = 46;

  // Participant Cards (Simple & Classic)
  const halfW = (contentWidth - 6) / 2;

  // Seller
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(220, 225, 220);
  doc.roundedRect(marginX, currentY, halfW, 26, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 96, 73);
  doc.text("SELLER INFORMATION", marginX + 4, currentY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(tx.sellerName, marginX + 4, currentY + 12.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Role: ${tx.sellerRole || "Farmer"}`, marginX + 4, currentY + 17.5);
  doc.text(`Platform Verified Seller`, marginX + 4, currentY + 22);

  // Buyer
  const buyerX = marginX + halfW + 6;
  doc.setFillColor(248, 250, 248);
  doc.roundedRect(buyerX, currentY, halfW, 26, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 96, 73);
  doc.text("BUYER INFORMATION", buyerX + 4, currentY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(tx.buyerName, buyerX + 4, currentY + 12.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Role: ${tx.buyerRole || "Buyer / Processor"}`, buyerX + 4, currentY + 17.5);
  doc.text(`Platform Verified Buyer`, buyerX + 4, currentY + 22);

  currentY += 32;

  // Table Header
  doc.setFillColor(240, 244, 241);
  doc.rect(marginX, currentY, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(26, 58, 42);
  doc.text("Product Description", marginX + 4, currentY + 5.5);
  doc.text("Quantity", marginX + 90, currentY + 5.5);
  doc.text("Unit Price (NGN)", marginX + 120, currentY + 5.5);
  doc.text("Total (NGN)", marginX + contentWidth - 4, currentY + 5.5, { align: "right" });

  currentY += 8;

  // Table Row
  doc.setFillColor(255, 255, 255);
  doc.rect(marginX, currentY, contentWidth, 10, "F");
  doc.setDrawColor(230, 235, 230);
  doc.line(marginX, currentY + 10, marginX + contentWidth, currentY + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(tx.productTitle, marginX + 4, currentY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text(`${(tx.quantity || 1).toLocaleString()} ${tx.unit || "kg"}`, marginX + 90, currentY + 6.5);

  const unitRate = tx.quantity && tx.quantity > 0 ? Math.round(tx.totalAmount / tx.quantity) : tx.totalAmount;
  doc.text(unitRate.toLocaleString(), marginX + 120, currentY + 6.5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 96, 73);
  doc.text((tx.totalAmount || 0).toLocaleString(), marginX + contentWidth - 4, currentY + 6.5, {
    align: "right",
  });

  currentY += 16;

  // Total Summary Box
  const summaryBoxW = 75;
  const summaryBoxX = pageWidth - marginX - summaryBoxW;
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(220, 225, 220);
  doc.roundedRect(summaryBoxX, currentY, summaryBoxW, 19, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Total Amount Settled:", summaryBoxX + 4, currentY + 6.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(34, 96, 73);
  doc.text(`NGN ${(tx.totalAmount || 0).toLocaleString()}`, summaryBoxX + 4, currentY + 14);

  // Footer
  const footerY = pageHeight - 12;
  doc.setDrawColor(220, 225, 220);
  doc.line(marginX, footerY - 2.5, pageWidth - marginX, footerY - 2.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 125);
  doc.text("YucaChain Agribusiness Platform • Official Transaction Receipt", marginX, footerY + 1);
  doc.text("Verified Commerce Record", pageWidth - marginX, footerY + 1, { align: "right" });

  doc.save(`YucaChain_Receipt_${tx.orderNumber}.pdf`);
}

export interface DispatchReceiptPDFData {
  orderNumber: string;
  lotCode: string;
  product: string;
  weightKg: number;
  date: string;
  dispatchedTime?: string;
  dispatchedBy?: string;
  storageLabel?: string;
  pickupHub?: string;
  invoiceNo?: string;
  storageFee?: number;
  logisticFee?: number;
  otherCharges?: number;
  agreedPriceTotal: number;
  carrier?: string;
  trackingNumber?: string;
}

/**
 * Generates a simple, classic Portrait PDF for consolidated dispatch orders & dispatch receipts.
 *
 * Requirements:
 * - Centered YucaChain logo.
 * - Centered 1-line subtopic of what company does.
 * - Centered title ("DISPATCH RECEIPT").
 * - Clean details and charges table.
 * - NO payout status.
 */
export function generateDispatchReceiptPDF(data: DispatchReceiptPDFData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178mm

  // 1. Centered YucaChain Logo
  const logoW = 32;
  const logoH = 15.8;
  const logoX = (pageWidth - logoW) / 2;
  try {
    doc.addImage(YUCACHAIN_LOGO_BASE64, "PNG", logoX, 9, logoW, logoH);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(34, 96, 73);
    doc.text("YUCACHAIN", pageWidth / 2, 17, { align: "center" });
  }

  // 2. Centered 1-line subtopic
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(
    "Decentralized Agricultural Trade, Commodity Processing & Digital Escrow Network",
    pageWidth / 2,
    28.5,
    { align: "center" }
  );

  // 3. Centered title
  const invoiceNo =
    data.invoiceNo ||
    `AGG-2026-${data.orderNumber.replace(/[^0-9]/g, "").slice(-4) || "1001"}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(34, 96, 73);
  doc.text("OFFICIAL DISPATCH RECEIPT", pageWidth / 2, 34, { align: "center" });

  // 4. Centered meta line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Invoice #: ${invoiceNo}   •   Date: ${data.date || new Date().toLocaleDateString()}`,
    pageWidth / 2,
    39,
    { align: "center" }
  );

  doc.setDrawColor(220, 225, 220);
  doc.setLineWidth(0.3);
  doc.line(marginX, 42, pageWidth - marginX, 42);

  let currentY = 46;

  // Dual Info Panels
  const halfW = (contentWidth - 6) / 2;

  // Left: Order Info
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(220, 225, 220);
  doc.roundedRect(marginX, currentY, halfW, 32, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 96, 73);
  doc.text("ORDER & CONSOLIDATION", marginX + 4, currentY + 5.5);

  const leftFields = [
    { label: "Order ID:", val: data.orderNumber },
    { label: "Lot Code:", val: data.lotCode || "CONSOL-LOT-01" },
    { label: "Product:", val: data.product || "Cassava Roots" },
    { label: "Weight:", val: `${(data.weightKg || 0).toLocaleString()} kg` },
  ];

  let lY = currentY + 11.5;
  leftFields.forEach((f) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 90);
    doc.text(f.label, marginX + 4, lY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(f.val, marginX + 34, lY);
    lY += 5;
  });

  // Right: Dispatch Info
  const rightX = marginX + halfW + 6;
  doc.setFillColor(248, 250, 248);
  doc.roundedRect(rightX, currentY, halfW, 32, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 96, 73);
  doc.text("DISPATCH & LOGISTICS", rightX + 4, currentY + 5.5);

  const rightFields = [
    { label: "Dispatched Time:", val: data.dispatchedTime || "03:45 PM" },
    { label: "Storage Unit:", val: data.storageLabel || "YucaVault Central" },
    { label: "Pickup Hub:", val: data.pickupHub || "Ibadan Hub" },
    { label: "Carrier / Tracking:", val: data.carrier || data.trackingNumber || "Assigned Carrier" },
  ];

  let rY = currentY + 11.5;
  rightFields.forEach((f) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 90);
    doc.text(f.label, rightX + 4, rY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(f.val, rightX + 34, rY);
    rY += 5;
  });

  currentY += 38;

  // Financial Breakdown
  const storageFee = data.storageFee ?? 5000;
  const logisticFee = data.logisticFee ?? 10000;
  const otherCharges = data.otherCharges ?? 1000;
  const subtotal = data.agreedPriceTotal;
  const total = subtotal + storageFee + logisticFee + otherCharges;

  doc.setFillColor(240, 244, 241);
  doc.rect(marginX, currentY, contentWidth, 7.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(26, 58, 42);
  doc.text("Item / Charge Description", marginX + 4, currentY + 5.2);
  doc.text("Amount (NGN)", marginX + contentWidth - 4, currentY + 5.2, { align: "right" });

  currentY += 7.5;

  const charges = [
    { label: "Commodity Agreed Subtotal", val: subtotal.toLocaleString() },
    { label: "Storage Unit Fee", val: storageFee.toLocaleString() },
    { label: "Logistics & Transport Fee", val: logisticFee.toLocaleString() },
    { label: "Administrative / Inspection Charge", val: otherCharges.toLocaleString() },
  ];

  charges.forEach((c) => {
    doc.setDrawColor(240, 243, 240);
    doc.line(marginX, currentY + 6.5, marginX + contentWidth, currentY + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text(c.label, marginX + 4, currentY + 4.8);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(c.val, marginX + contentWidth - 4, currentY + 4.8, { align: "right" });

    currentY += 6.5;
  });

  // Total Row
  doc.setFillColor(240, 246, 242);
  doc.setDrawColor(200, 220, 210);
  doc.rect(marginX, currentY + 1.5, contentWidth, 8, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(34, 96, 73);
  doc.text("Total Dispatch Settlement", marginX + 4, currentY + 6.8);
  doc.text(`NGN ${total.toLocaleString()}`, marginX + contentWidth - 4, currentY + 6.8, {
    align: "right",
  });

  // Footer
  const footerY = pageHeight - 12;
  doc.setDrawColor(220, 225, 220);
  doc.line(marginX, footerY - 2.5, pageWidth - marginX, footerY - 2.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 125);
  doc.text("YucaChain Agribusiness Platform • Dispatch & Logistics Receipt", marginX, footerY + 1);
  doc.text("Official Operations Record", pageWidth - marginX, footerY + 1, { align: "right" });

  doc.save(`YucaChain_Dispatch_Receipt_${data.orderNumber}.pdf`);
}
