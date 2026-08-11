<template>
  <div class="receipt-modal-backdrop" @click.self="$emit('close')">
    <div class="receipt-modal">
      <div class="modal-actions">
        <h3>Maintenance Receipt Preview</h3>
        <div class="btn-group">
          <button class="btn btn-primary" @click="downloadPdf">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download PDF</span>
          </button>
          <button class="btn btn-close" @click="$emit('close')">✕</button>
        </div>
      </div>

      <!-- Exact PDF Template Container -->
      <div class="receipt-paper-wrapper">
        <div ref="receiptContainer" class="receipt-paper">
          <!-- Header Logo & Title -->
          <div class="receipt-header">
            <div class="logo-box">
              <div class="logo-circle">
                <span class="logo-symbol">A</span>
              </div>
              <div class="logo-text-brand">ARISTO<br /><span class="logo-subtext">BLISS</span></div>
            </div>

            <div class="society-title-block">
              <h1 class="society-name">ARISTO BLISS CO. OP. HOU. SOCIETY</h1>
              <p class="society-tagline">We Care, We Share, We Build Better Living</p>
              <p class="society-address">Aristo Bliss Society, Near saral residency, GOTA 382481.</p>
            </div>

            <div class="date-block">
              <strong>DATE :</strong> {{ data.date || '15/04/2026' }}
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
              <span class="value">{{ data.flatNumber || 'A-101' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Maintenance Period :</span>
              <span class="value bold-val">{{ data.period || 'APRIL 2026 TO JUNE 2026 (Q1)' }}</span>
            </div>

            <div class="detail-item">
              <span class="label">Member Name :</span>
              <span class="value">{{ data.name || 'Umangbhai Suthar' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Property Type :</span>
              <span class="value">FLAT</span>
            </div>

            <div class="detail-item">
              <span class="label">Mobile No. :</span>
              <span class="value">{{ data.mobile || '98987 04977' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Owner / Tenant :</span>
              <span class="value">{{ data.ownerOrResident || 'OWNER' }}</span>
            </div>

            <div class="detail-item">
              <span class="label">Payment Mode :</span>
              <span class="value">{{ data.bankDetail ? 'BANK' : (data.cashReceiver ? 'CASH' : 'BANK') }}</span>
            </div>
            <div class="detail-item"></div>

            <div class="detail-item full-row">
              <span class="label">Cheque (No. ) :</span>
              <span class="value"></span>
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
                <td style="text-align: right;" class="bold-val">{{ data.amount || '5700' }}</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Arrears (If Any)</td>
                <td style="text-align: right;">0</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Late Payment Charges</td>
                <td style="text-align: right;">0</td>
              </tr>
              <tr>
                <td>4</td>
                <td>Other Charges (If Any)</td>
                <td style="text-align: right;">0</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2" style="text-align: right;" class="bold-val">TOTAL AMOUNT</td>
                <td style="text-align: right;" class="bold-val">₹ {{ data.amount || '5700' }}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Amount in Words -->
          <div class="amount-words-block">
            <strong>Amount in Words :</strong> <span class="words">Rupees Five Thousand Seven Hundred Only</span>
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
import { ref } from 'vue';
import html2pdf from 'html2pdf.js';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['close']);

const receiptContainer = ref(null);

const downloadPdf = () => {
  const element = receiptContainer.value;
  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: `Receipt_${props.data.flatNumber || 'A-101'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
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

.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: #0f172a;
  border-bottom: 1px solid #334155;
  color: #fff;
}

.btn-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
}

.btn-close:hover {
  color: #fff;
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
  width: 100%;
  max-width: 800px;
  background-color: #ffffff;
  color: #000000;
  font-family: Arial, Helvetica, sans-serif;
  padding: 25px;
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
  gap: 8px;
  border: 1px solid #d4af37;
  padding: 6px 12px;
}

.logo-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #c59b27;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #c59b27;
}

.logo-text-brand {
  font-size: 13px;
  font-weight: 800;
  line-height: 1.1;
  color: #333;
}

.logo-subtext {
  font-size: 10px;
  color: #c59b27;
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
  font-weight: 600;
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
}

.detail-item .label {
  width: 140px;
  color: #333;
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
  border: 1.5 solid #c59b27;
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
</style>
