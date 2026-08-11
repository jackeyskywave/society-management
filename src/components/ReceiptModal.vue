<template>
  <div class="receipt-modal-backdrop" @click.self="$emit('close')">
    <div class="receipt-modal">
      <div class="modal-actions">
        <h3>Maintenance Receipt Preview</h3>
        <div class="btn-group">
          <button class="btn btn-secondary" @click="printReceipt">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Print Receipt</span>
          </button>
          <button class="btn btn-primary" @click="downloadPdf">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download PDF</span>
          </button>
          <button class="btn btn-close" @click="$emit('close')" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Exact PDF Template Container -->
      <div class="receipt-paper-wrapper">
        <div ref="receiptContainer" class="receipt-paper" :class="{ 'exporting-pdf': isExportingPdf }">
          <!-- Header Logo & Title -->
          <div class="receipt-header">
            <div class="logo-box">
              <img src="/main_logo.png" alt="ARISTO BLISS" class="exact-logo-img" />
            </div>

            <div class="society-title-block">
              <h1 class="society-name">ARISTO BLISS CO. OP. HOU. SOCIETY</h1>
              <p class="society-tagline">We Care, We Share, We Build Better Living</p>
              <p class="society-address">Aristo Bliss Society, Near saral residency, GOTA 382481.</p>
            </div>

            <div class="date-block">
              <strong>DATE :&nbsp;</strong> 
              <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.date }}</span>
              <input v-else v-model="editableData.date" class="edit-input-inline bold-val" />
            </div>
          </div>

          <!-- Section Banner -->
          <div class="section-banner">
            MAINTENANCE PAYMENT RECEIPT
          </div>

          <!-- Details Grid -->
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Flat / Shop No. :</span>
              <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.flatNumber }}</span>
              <input v-else v-model="editableData.flatNumber" class="edit-input bold-val" />
            </div>
            <div class="detail-item">
              <span class="label">Maintenance Period :</span>
              <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.period }}</span>
              <input v-else v-model="editableData.period" class="edit-input bold-val" />
            </div>

            <div class="detail-item">
              <span class="label">Member Name :</span>
              <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.name }}</span>
              <input v-else v-model="editableData.name" class="edit-input bold-val" />
            </div>
            <div class="detail-item">
              <span class="label">Property Type :</span>
              <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.propertyType }}</span>
              <input v-else v-model="editableData.propertyType" class="edit-input bold-val" />
            </div>

            <div class="detail-item">
              <span class="label">Mobile No. :</span>
              <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.mobile }}</span>
              <input v-else v-model="editableData.mobile" class="edit-input bold-val" />
            </div>
            <div class="detail-item">
              <span class="label">Owner / Tenant :</span>
              <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.ownerOrResident }}</span>
              <input v-else v-model="editableData.ownerOrResident" class="edit-input bold-val" />
            </div>

            <div class="detail-item">
              <span class="label">Payment Mode :</span>
              <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.paymentMode }}</span>
              <input v-else v-model="editableData.paymentMode" class="edit-input bold-val" />
            </div>
            <div class="detail-item">
              <span class="label">Bank Detail :</span>
              <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.bankDetail }}</span>
              <input v-else v-model="editableData.bankDetail" class="edit-input bold-val" placeholder="-" />
            </div>

            <div class="detail-item full-row">
              <span class="label">Cheque (No. ) :</span>
              <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.chequeNo }}</span>
              <input v-else v-model="editableData.chequeNo" class="edit-input bold-val" />
            </div>
          </div>

          <!-- Table -->
          <table class="receipt-table">
            <thead>
              <tr>
                <th style="width: 10%;">SR. NO.</th>
                <th style="width: 65%;">PARTICULARS</th>
                <th style="width: 25%; text-align: right;">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Maintenance Charges</td>
                <td style="text-align: right;">
                  <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.baseAmount }}</span>
                  <input v-else v-model.number="editableData.baseAmount" type="number" class="edit-input-num bold-val" />
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>Arrears (If Any)</td>
                <td style="text-align: right;">
                  <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.arrears }}</span>
                  <input v-else v-model.number="editableData.arrears" type="number" class="edit-input-num bold-val" />
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>Late Payment Charges</td>
                <td style="text-align: right;">
                  <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.lateCharges }}</span>
                  <input v-else v-model.number="editableData.lateCharges" type="number" class="edit-input-num bold-val" />
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>Other Charges (If Any)</td>
                <td style="text-align: right;">
                  <span v-if="isExportingPdf" class="pdf-export-val bold-val">{{ editableData.otherCharges }}</span>
                  <input v-else v-model.number="editableData.otherCharges" type="number" class="edit-input-num bold-val" />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2" style="text-align: right;" class="bold-val">TOTAL AMOUNT</td>
                <td style="text-align: right;" class="bold-val">₹ {{ totalAmount }}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Amount in Words -->
          <div class="amount-words-block">
            <strong>Amount in Words :</strong> <span class="words">{{ amountInWords }}</span>
          </div>

          <!-- Footer Note & Signatures -->
          <div class="receipt-footer">
            <div class="note-box">
              <div class="note-title">NOTE</div>
              <ul>
                <li>• Maintenance is to be paid by the 15th of every month.</li>
                <li>• Rs.10 per day will be charged as late fee after the due date.</li>
                <li>• Please collect receipt for every payment.</li>
              </ul>
              <div class="thank-you">Thank you for your timely payment.</div>
            </div>

            <div class="signatures-box">
              <div class="sig-line">
                <span class="line"></span>
                <span class="sig-label">Received By</span>
              </div>
              <div class="sig-line">
                <span class="line"></span>
                <span class="sig-label">Authorised Signatory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import html2pdf from 'html2pdf.js';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  autoDownload: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);

const receiptContainer = ref(null);

// Reactive state for editable fields inside receipt template
const editableData = ref({
  date: props.data.date || '15/04/2026',
  flatNumber: props.data.flatNumber || 'A-101',
  period: props.data.period || 'APRIL 2026 TO JUNE 2026 (Q1)',
  name: props.data.name || 'Umangbhai Suthar',
  propertyType: 'FLAT',
  mobile: props.data.mobile || '98987 04977',
  ownerOrResident: props.data.ownerOrResident || 'OWNER',
  paymentMode: props.data.paymentMode || (props.data.cashReceiver && props.data.cashReceiver.trim() ? 'CASH' : (props.data.bankDetail ? 'BANK' : 'CASH')),
  bankDetail: props.data.bankDetail || '',
  cashReceiver: props.data.cashReceiver || '',
  chequeNo: '',
  baseAmount: Number(props.data.amount) || 5700,
  arrears: 0,
  lateDays: Number(props.data.lateDays) || 0,
  lateCharges: (Number(props.data.lateDays) || 0) * 10,
  otherCharges: 0
});

onMounted(() => {
  if (props.autoDownload) {
    setTimeout(() => {
      downloadPdf();
    }, 300);
  }
});

// Dynamic calculations based on editable state
const baseAmount = computed(() => {
  const amt = Number(editableData.value.baseAmount);
  return isNaN(amt) ? 0 : amt;
});

const totalAmount = computed(() => {
  const arrears = Number(editableData.value.arrears) || 0;
  const late = Number(editableData.value.lateCharges) || 0;
  const other = Number(editableData.value.otherCharges) || 0;
  return baseAmount.value + late + arrears + other;
});

// Helper function to convert numeric amount to words
const numberToWords = (num) => {
  if (!num || isNaN(num)) return 'Zero';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if ((num = num.toString()).length > 9) return 'Overflow';
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim();
};

const amountInWords = computed(() => {
  return `Rupees ${numberToWords(totalAmount.value)} Only`;
});

const isExportingPdf = ref(false);

const printReceipt = async () => {
  isExportingPdf.value = true;
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const element = receiptContainer.value;
  const printWindow = window.open('', '_blank', 'width=850,height=1100');
  
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${editableData.value.flatNumber}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { margin: 0; padding: 20px; background: #ffffff !important; color: #000000 !important; font-family: Arial, Helvetica, sans-serif !important; }
            .receipt-paper { width: 790px; margin: 0 auto; background-color: #ffffff !important; color: #000000 !important; font-family: Arial, Helvetica, sans-serif; padding: 30px 35px; border: 2px solid #c59b27 !important; box-sizing: border-box; }
            .receipt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
            .logo-box { display: flex; align-items: center; justify-content: center; border: 1px solid #d4af37 !important; padding: 2px; background-color: #ffffff !important; width: 90px; height: 90px; }
            .exact-logo-img { width: 100%; height: 100%; object-fit: contain; }
            .society-title-block { text-align: center; }
            .society-name { font-size: 18px; font-weight: 800; margin: 0; color: #111111 !important; }
            .society-tagline { font-size: 11px; font-style: italic; margin: 2px 0; color: #444444 !important; }
            .society-address { font-size: 10px; margin: 0; color: #555555 !important; }
            .date-block { font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; }
            .section-banner { background-color: #c59b27 !important; color: #ffffff !important; text-align: center; font-weight: 800; font-size: 14px; padding: 6px; letter-spacing: 1px; margin-bottom: 15px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; row-gap: 8px; column-gap: 20px; font-size: 11px; margin-bottom: 15px; }
            .detail-item { display: flex; align-items: center; min-height: 22px; }
            .detail-item .label { width: 145px; color: #000000 !important; font-weight: 800; flex-shrink: 0; }
            .bold-val { font-weight: 800; }
            .receipt-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px; }
            .receipt-table th { background-color: #c59b27 !important; color: #ffffff !important; padding: 6px 10px; font-weight: 800; border: 1px solid #b38a1f !important; }
            .receipt-table td { padding: 6px 10px; border: 1px solid #e2e8f0 !important; color: #000000 !important; }
            .total-row { background-color: #f7f3e8 !important; }
            .total-row td { border-top: 2px solid #c59b27 !important; font-size: 12px; }
            .amount-words-block { font-size: 11px; margin-bottom: 20px; }
            .receipt-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px; }
            .note-box { border: 1.5px solid #c59b27 !important; padding: 8px 12px; width: 55%; font-size: 10px; color: #222222 !important; }
            .note-title { font-weight: 800; margin-bottom: 4px; }
            .note-box ul { list-style: none; padding: 0; margin: 0; }
            .thank-you { margin-top: 8px; font-weight: 700; }
            .signatures-box { display: flex; gap: 30px; }
            .sig-line { display: flex; flex-direction: column; align-items: center; width: 130px; }
            .sig-line .line { width: 100%; border-bottom: 1px solid #444444; margin-bottom: 4px; }
            .sig-label { font-size: 10px; color: #333333 !important; }
            input, select { border: none !important; outline: none !important; background: transparent !important; font-family: Arial, Helvetica, sans-serif !important; font-weight: 700 !important; font-size: 11px !important; color: #000000 !important; }
            input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }
  
  isExportingPdf.value = false;
};

const downloadPdf = async () => {
  isExportingPdf.value = true;
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const element = receiptContainer.value;
  const opt = {
    margin: 0,
    filename: `Receipt_${props.data.flatNumber || 'A-101'}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { 
      scale: 3, 
      useCORS: true,
      letterRendering: true,
      scrollX: 0,
      scrollY: 0,
      logging: false
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    isExportingPdf.value = false;
  }
};
</script>

<style scoped>
.receipt-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.receipt-modal {
  background-color: #1e293b;
  border-radius: var(--radius-md);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.btn-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem;
  background-color: #0f172a;
  border-bottom: 1px solid #334155;
  color: #fff;
  z-index: 10;
}

.modal-actions .btn-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.modal-actions .btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.modal-actions .btn-primary {
  background-color: #6366f1;
  color: #ffffff !important;
  border: 1px solid #4f46e5;
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.modal-actions .btn-primary:hover {
  background-color: #4f46e5;
}

.btn-close {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  color: #f1f5f9;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-close:hover {
  background-color: var(--danger);
  border-color: var(--danger);
  color: #ffffff;
}

.receipt-paper-wrapper {
  padding: 1.5rem;
  overflow-y: auto;
  background-color: #334155;
  display: flex;
  justify-content: center;
}

/* Exact Printable Receipt Layout matching image styling */
.receipt-paper {
  width: 790px;
  margin: 0 auto;
  background-color: #ffffff;
  color: #000000;
  font-family: Arial, Helvetica, sans-serif;
  padding: 30px 35px;
  border: 2px solid #c59b27; /* Gold border line */
  box-sizing: border-box;
}

.receipt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d4af37;
  padding: 2px;
  background-color: #ffffff;
  width: 90px;
  height: 90px;
}

.exact-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.society-title-block {
  text-align: center;
}

.society-name {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: #111;
}

.society-tagline {
  font-size: 11px;
  font-style: italic;
  margin: 2px 0;
  color: #444;
}

.society-address {
  font-size: 10px;
  margin: 0;
  color: #555;
}

.date-block {
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.section-banner {
  background-color: #c59b27;
  color: #ffffff;
  text-align: center;
  font-weight: 800;
  font-size: 14px;
  padding: 6px;
  letter-spacing: 1px;
  margin-bottom: 15px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 8px;
  column-gap: 20px;
  font-size: 11px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  min-height: 22px;
}

.detail-item .label {
  width: 145px;
  color: #000000;
  font-weight: 800;
  flex-shrink: 0;
}

.detail-item .value {
  color: #000;
}

.bold-val {
  font-weight: 800;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-bottom: 12px;
}

.receipt-table th {
  background-color: #c59b27;
  color: #ffffff;
  padding: 6px 10px;
  font-weight: 800;
  border: 1px solid #b38a1f;
}

.receipt-table td {
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  color: #000;
}

.total-row {
  background-color: #f7f3e8;
}

.total-row td {
  border-top: 2px solid #c59b27;
  font-size: 12px;
}

.amount-words-block {
  font-size: 11px;
  margin-bottom: 20px;
}

.receipt-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 15px;
}

.note-box {
  border: 1.5px solid #c59b27;
  padding: 8px 12px;
  width: 55%;
  font-size: 10px;
  color: #222;
}

.note-title {
  font-weight: 800;
  margin-bottom: 4px;
}

.note-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.thank-you {
  margin-top: 8px;
  font-weight: 700;
}

.signatures-box {
  display: flex;
  gap: 30px;
}

.sig-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 130px;
}

.sig-line .line {
  width: 100%;
  border-bottom: 1px solid #444;
  margin-bottom: 4px;
}

.sig-label {
  font-size: 10px;
  color: #333;
}

/* Editable Template Input Styles */
.edit-input, .edit-input-inline, .edit-input-num, .edit-input-days {
  background: transparent;
  border: 1px dashed #cbd5e1;
  border-radius: 3px;
  color: #000000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  font-weight: 700;
  height: 20px;
  line-height: 20px;
  padding: 0 4px;
  box-sizing: border-box;
  vertical-align: middle;
  transition: border-color 0.2s ease;
}

.edit-input:hover, .edit-input-inline:hover, .edit-input-num:hover, .edit-input-days:hover {
  border-color: #c59b27;
  background-color: #fffdf5;
}

.edit-input:focus, .edit-input-inline:focus, .edit-input-num:focus, .edit-input-days:focus {
  outline: none;
  border: 1px solid #c59b27;
  background-color: #ffffff;
}

.edit-input {
  width: calc(100% - 145px);
}

.edit-input-inline {
  width: 90px;
}

.edit-input-num {
  width: 80px;
  text-align: right;
}

.edit-input-days {
  width: 45px;
  text-align: center;
}

.pdf-export-val {
  color: #000000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 1.2;
  display: inline-block;
  vertical-align: middle;
}

/* Hide input dashed borders completely when exporting PDF */
.receipt-paper.exporting-pdf .edit-input,
.receipt-paper.exporting-pdf .edit-input-inline,
.receipt-paper.exporting-pdf .edit-input-num,
.receipt-paper.exporting-pdf .edit-input-days {
  border: none !important;
  outline: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  height: 20px !important;
  line-height: 20px !important;
  font-weight: 700 !important;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 5mm;
  }
  
  /* Hide everything outside modal */
  .admin-layout,
  .modal-actions {
    display: none !important;
  }
  
  .receipt-modal-backdrop {
    position: static !important;
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
  }

  .receipt-modal {
    background: #ffffff !important;
    box-shadow: none !important;
    border: none !important;
    width: 100% !important;
    max-width: 100% !important;
    max-height: none !important;
    overflow: visible !important;
  }

  .receipt-paper-wrapper {
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
    overflow: visible !important;
  }

  .receipt-paper {
    width: 100% !important;
    max-width: 790px !important;
    margin: 0 auto !important;
    box-shadow: none !important;
    border: 2px solid #c59b27 !important;
  }
}
</style>
