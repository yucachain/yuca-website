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
  sellerRole?: string;
  sellerIdNumber?: string;
  buyerName: string;
  buyerRole?: string;
  buyerIdNumber?: string;
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
  idNumber: string;
  name?: string;
  role?: string;
  address: string;
  status?: string;
  joinedDate?: string;
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
    { title: "#", x: marginX + 2, width: 8, align: "left" as const },
    { title: "Order Ref", x: marginX + 10, width: 26, align: "left" as const },
    { title: "Date & Time", x: marginX + 36, width: 44, align: "left" as const },
    { title: "Product / Variety", x: marginX + 80, width: 68, align: "left" as const },
    { title: "Quantity", x: marginX + 148, width: 24, align: "left" as const },
    { title: "Seller ID", x: marginX + 172, width: 34, align: "left" as const },
    { title: "Buyer ID", x: marginX + 206, width: 34, align: "left" as const },
    { title: "Amount (NGN)", x: marginX + 269, width: 29, align: "right" as const },
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

    // Product / Variety
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    let prodText = (tx.productTitle || "Cassava Roots").trim();
    if (prodText.toLowerCase().includes("fresh cassava roots")) {
      prodText = prodText
        .replace(/^Fresh Cassava Roots\s*\(/i, "")
        .replace(/\)\s*-\s*Lot.*$/i, "");
    }
    const prod = prodText.length > 48 ? prodText.substring(0, 47) + "…" : prodText;
    doc.text(prod, columns[3].x, textY);

    // Quantity
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    const qty = `${tx.quantity != null ? tx.quantity : 1} ${tx.unit || "Tonnes"}`;
    doc.text(qty, columns[4].x, textY);

    // Seller ID
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const sellerId = tx.sellerIdNumber || "—";
    doc.text(sellerId, columns[5].x, textY);

    // Buyer ID
    const buyerId = tx.buyerIdNumber || "—";
    doc.text(buyerId, columns[6].x, textY);

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
  // # (8mm), User ID Number (44mm), Role / Category (44mm), Location / Address (54mm), Status (30mm)
  const columns = [
    { title: "#", x: marginX + 2, width: 8, align: "left" as const },
    { title: "User ID Number", x: marginX + 10, width: 44, align: "left" as const },
    { title: "Role / Category", x: marginX + 54, width: 44, align: "left" as const },
    { title: "Location / Address", x: marginX + 98, width: 54, align: "left" as const },
    { title: "Status", x: marginX + 152, width: 30, align: "left" as const },
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

    // User ID Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(34, 96, 73);
    const idClean = u.idNumber || "—";
    doc.text(idClean, columns[1].x, textY);

    // Role / Category
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    const roleLabel =
      u.role === "processor"
        ? "Buyer / Processor"
        : u.role === "farmer"
        ? "Farmer"
        : u.role === "service-provider"
        ? "Service Provider"
        : u.role === "consumer"
        ? "Consumer"
        : u.role || "Member";
    doc.text(roleLabel, columns[2].x, textY);

    // Location / Address
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    const addr = u.address || "Location not specified";
    const addrClean = addr.length > 32 ? addr.substring(0, 31) + "…" : addr;
    doc.text(addrClean, columns[3].x, textY);

    // Status
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(34, 96, 73);
    doc.text(u.status || "Verified", columns[4].x, textY);

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
    `Order #: ${tx.orderNumber}   •   Date & Time: ${tx.date || new Date().toLocaleDateString()}   •   Verified Escrow Settlement`,
    pageWidth / 2,
    39,
    { align: "center" }
  );

  doc.setDrawColor(220, 225, 220);
  doc.setLineWidth(0.3);
  doc.line(marginX, 42, pageWidth - marginX, 42);

  let currentY = 47;

  // Participant ID Cards (Balanced 2-column layout)
  const cardGap = 8;
  const halfW = (contentWidth - cardGap) / 2;

  // Seller Card
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(220, 225, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, halfW, 26, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 96, 73);
  doc.text("SELLER INFORMATION", marginX + 5, currentY + 6.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 58, 42);
  const sellerIdText = tx.sellerIdNumber || "YC-FRM-0001";
  doc.text(`ID: ${sellerIdText}`, marginX + 5, currentY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Commodity Producer • Owode Hub", marginX + 5, currentY + 20);

  // Buyer Card
  const buyerX = marginX + halfW + cardGap;
  doc.setFillColor(248, 250, 248);
  doc.roundedRect(buyerX, currentY, halfW, 26, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 96, 73);
  doc.text("BUYER INFORMATION", buyerX + 5, currentY + 6.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 58, 42);
  const buyerIdText = tx.buyerIdNumber || "YC-PRS-0001";
  doc.text(`ID: ${buyerIdText}`, buyerX + 5, currentY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Industrial Processor • Owode Hub", buyerX + 5, currentY + 20);

  currentY += 33;

  // Table Header
  doc.setFillColor(240, 244, 241);
  doc.rect(marginX, currentY, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(26, 58, 42);
  doc.text("Product / Variety", marginX + 4, currentY + 5.5);
  doc.text("Quantity", marginX + 86, currentY + 5.5);
  doc.text("Rate (NGN/kg)", marginX + 124, currentY + 5.5);
  doc.text("Total Settled (NGN)", marginX + contentWidth - 4, currentY + 5.5, { align: "right" });

  currentY += 8;

  // Table Row
  doc.setFillColor(255, 255, 255);
  doc.rect(marginX, currentY, contentWidth, 11, "F");
  doc.setDrawColor(230, 235, 230);
  doc.setLineWidth(0.2);
  doc.line(marginX, currentY + 11, marginX + contentWidth, currentY + 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  let prodTitle = (tx.productTitle || "Cassava Roots").trim();
  if (prodTitle.toLowerCase().includes("fresh cassava roots")) {
    prodTitle = prodTitle
      .replace(/^Fresh Cassava Roots\s*\(/i, "")
      .replace(/\)\s*-\s*Lot.*$/i, "");
  }
  const cleanTitle = prodTitle.length > 55 ? prodTitle.substring(0, 54) + "…" : prodTitle;
  doc.text(cleanTitle, marginX + 4, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 70);
  const totalKg = Math.round((tx.quantity || 0) * 1000) || Math.round((tx.totalAmount || 0) / 2500);
  doc.text(`${tx.quantity != null ? tx.quantity : 1} ${tx.unit || "Tonnes"} (${totalKg} kg)`, marginX + 86, currentY + 7);

  doc.text("2,500 / kg", marginX + 124, currentY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(34, 96, 73);
  doc.text((tx.totalAmount || 0).toLocaleString(), marginX + contentWidth - 4, currentY + 7, {
    align: "right",
  });

  currentY += 20;

  // Summary & Transaction Details (Sits well across bottom half)
  const auditBoxW = 96;
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(220, 225, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, auditBoxW, 30, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(34, 96, 73);
  doc.text("TRANSACTION & ESCROW AUDIT", marginX + 4, currentY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 70);
  doc.text(`Timestamp: ${tx.date || "Recent"}`, marginX + 4, currentY + 12);
  doc.text(`Payment: Paid to YucaChain Escrow (Verified)`, marginX + 4, currentY + 17.5);
  doc.text(`Fulfillment: Direct Delivery (Owode Processing Facility)`, marginX + 4, currentY + 23);

  // Total Settled Box
  const summaryBoxW = 76;
  const summaryBoxX = marginX + contentWidth - summaryBoxW;
  doc.setFillColor(240, 244, 241);
  doc.setDrawColor(34, 96, 73);
  doc.setLineWidth(0.4);
  doc.roundedRect(summaryBoxX, currentY, summaryBoxW, 30, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(34, 96, 73);
  doc.text("TOTAL AMOUNT SETTLED:", summaryBoxX + 5, currentY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(26, 58, 42);
  doc.text(`NGN ${(tx.totalAmount || 0).toLocaleString()}`, summaryBoxX + 5, currentY + 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  doc.text("YucaChain Digital Escrow Clearing • 100% Guaranteed", summaryBoxX + 5, currentY + 24.5);

  // Footer
  const footerY = pageHeight - 12;
  doc.setDrawColor(220, 225, 220);
  doc.setLineWidth(0.3);
  doc.line(marginX, footerY - 2.5, pageWidth - marginX, footerY - 2.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 125);
  doc.text("YucaChain Agribusiness Platform • Official Transaction Receipt", marginX, footerY + 1);
  doc.text("Verified Commerce Record • Secure Digital Escrow", pageWidth - marginX, footerY + 1, { align: "right" });

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
