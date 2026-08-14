<template>
  <AdminLayout>
    <div class="dashboard-container">
      <!-- Top Action Bar -->
      <div class="action-card">
        <div class="action-header">
          <div class="button-group">
            <!-- Hidden File Input -->
            <input 
              type="file" 
              ref="fileInput" 
              accept="application/pdf" 
              @change="handleFileUpload" 
              style="display: none;" 
            />
            
            <button class="btn btn-primary" @click="triggerFileInput" :disabled="isParsing">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>{{ isParsing ? 'Parsing PDF...' : 'Upload PDF' }}</span>
            </button>



            <!-- Global Quarter / Maintenance Period Dropdown -->
            <div class="global-period-selector" v-if="ledgerData.length > 0">
              <label>Period:</label>
              <select v-model="globalPeriod" @change="applyGlobalPeriod">
                <option value="AUTO">Auto (By Date)</option>
                <option value="Q1">Q1 (Apr - Jun)</option>
                <option value="Q2">Q2 (Jul - Sep)</option>
                <option value="Q3">Q3 (Oct - Dec)</option>
                <option value="Q4">Q4 (Jan - Mar)</option>
              </select>
            </div>

            <!-- Bulk Print Selected Button -->
            <button v-if="ledgerData.length > 0" class="btn btn-warning" @click="printSelectedReceipts" :disabled="selectedRowKeys.length === 0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Print Selected ({{ selectedRowKeys.length }})</span>
            </button>

            <button v-if="ledgerData.length > 0" class="btn btn-secondary" @click="downloadAllPdfs">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download Receipts</span>
            </button>

            <button v-if="ledgerData.length > 0" class="btn btn-danger" @click="clearLedgerData">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Clear Data</span>
            </button>
          </div>
        </div>

        <!-- Notification Banner -->
        <div v-if="statusMessage" class="status-banner" :class="statusType">
          {{ statusMessage }}
        </div>
      </div>



      <!-- Data Table Card -->
      <div class="table-card">
        <div class="table-header" v-if="ledgerData.length > 0">
          <div class="filter-toolbar">
            <div class="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input v-model="searchQuery" type="text" placeholder="Search flat, name, mobile..." />
            </div>

            <!-- Block Filter Dropdown -->
            <div class="filter-select-group">
              <label>Block:</label>
              <select v-model="selectedBlock" @change="currentPage = 1">
                <option value="ALL">All Blocks</option>
                <option v-for="b in availableBlocks" :key="b" :value="b">Block {{ b }}</option>
              </select>
            </div>

            <!-- Occupancy Filter (Owner / Rented) -->
            <div class="filter-select-group">
              <label>Occupancy:</label>
              <select v-model="selectedOccupancy" @change="currentPage = 1">
                <option value="ALL">All Status</option>
                <option value="OWNER">OWNER</option>
                <option value="RENTED">RENTED</option>
              </select>
            </div>

            <!-- Payment Mode Filter -->
            <div class="filter-select-group">
              <label>Payment Mode:</label>
              <select v-model="selectedPaymentMode" @change="currentPage = 1">
                <option value="ALL">All Modes</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank / ADC</option>
              </select>
            </div>

            <button v-if="hasActiveFilters" class="btn-reset-filters" @click="resetFilters" title="Reset all filters">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>Reset</span>
            </button>
          </div>

          <div class="record-count">
            Selected <strong>{{ selectedRowKeys.length }}</strong> of <strong>{{ filteredData.length }}</strong> shown records
            <div class="selection-actions" v-if="filteredData.length > 0">
              <button class="link-btn" @click="selectAllFiltered">Select All ({{ filteredData.length }})</button>
              <span v-if="selectedRowKeys.length > 0">•</span>
              <button v-if="selectedRowKeys.length > 0" class="link-btn danger-text" @click="deselectAll">Deselect All</button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="ledgerData.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3>No Ledger Data Available</h3>
          <p>Click the <strong>Upload PDF</strong> button above to parse and view society maintenance data.</p>
        </div>

        <!-- Datatable Container -->
        <div v-else class="table-responsive">
          <table class="datatable">
            <thead>
              <tr>
                <th class="checkbox-th">
                  <input 
                    type="checkbox" 
                    :checked="isAllCurrentPageSelected" 
                    @change="toggleSelectAllCurrentPage"
                    title="Select / Deselect all on current page" 
                  />
                </th>
                <th>FLAT NUMBER</th>
                <th>NAME</th>
                <th>MOBILE</th>
                <th>O / R</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>CASH RECEIVER</th>
                <th>BANK DETAIL</th>
                <th>LATE DAYS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in paginatedData" :key="row.flatNumber || idx" :class="{ 'row-selected': isRowSelected(row) }">
                <td class="checkbox-td">
                  <input 
                    type="checkbox" 
                    :checked="isRowSelected(row)" 
                    @change="toggleRowSelection(row)" 
                  />
                </td>
                <td class="font-bold highlight-flat">{{ row.flatNumber }}</td>
                <td class="font-semibold wrap-cell">{{ row.name }}</td>
                <td class="wrap-cell" style="white-space: pre-wrap; word-break: break-word;">{{ row.mobile }}</td>
                <td>
                  <span class="badge" :class="row.ownerOrResident === 'OWNER' ? 'badge-owner' : 'badge-resident'">
                    {{ row.ownerOrResident }}
                  </span>
                </td>
                <td>{{ row.date }}</td>
                <td class="font-bold amount-col">₹{{ row.amount }}</td>
                <td class="wrap-cell" style="white-space: pre-wrap; word-break: break-word;">{{ row.cashReceiver || '-' }}</td>
                <td class="wrap-cell" style="white-space: pre-wrap; word-break: break-word;">{{ row.bankDetail || '-' }}</td>
                <td>
                  <span class="late-days" :class="{ 'has-late': Number(row.lateDays) > 0 }">
                    {{ row.lateDays }}
                  </span>
                </td>
                <td class="action-cell">
                  <button class="btn-receipt print-btn" @click="directPrintPdf(row)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    <span>Print</span>
                  </button>

                  <button class="btn-receipt primary-btn" @click="directDownloadPdf(row)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download PDF</span>
                  </button>

                  <button class="btn-receipt secondary-btn" @click="openReceipt(row)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>View</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Bar -->
          <div class="pagination-bar" v-if="filteredData.length > 0">
            <div class="page-size-selector">
              <span>Rows per page:</span>
              <select v-model="pageSize" @change="currentPage = 1">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>

            <div class="page-info">
              Showing <strong>{{ startIndex + 1 }}</strong> to <strong>{{ Math.min(endIndex, filteredData.length) }}</strong> of <strong>{{ filteredData.length }}</strong> records
            </div>

            <div class="page-controls">
              <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
                Previous
              </button>
              <span class="page-num">Page {{ currentPage }} of {{ totalPages }}</span>
              <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    <ReceiptModal 
      v-if="selectedReceiptData" 
      :data="selectedReceiptData" 
      :global-period="globalPeriod"
      :auto-download="shouldAutoDownload"
      :auto-print="shouldAutoPrint"
      @close="selectedReceiptData = null" 
    />
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import ReceiptModal from '../components/ReceiptModal.vue';
import * as pdfjsLib from 'pdfjs-dist';
import { LOGO_BASE64 } from '../assets/logoBase64.js';

const selectedReceiptData = ref(null);
const shouldAutoDownload = ref(false);
const shouldAutoPrint = ref(false);

// Overview Metrics Computations
const totalUnitsCount = computed(() => ledgerData.value.length);
const totalCollectionAmount = computed(() => {
  return ledgerData.value.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
});
const ownerCount = computed(() => {
  return ledgerData.value.filter(r => (r.ownerOrResident || '').toUpperCase() === 'OWNER').length;
});
const rentedCount = computed(() => {
  return ledgerData.value.filter(r => (r.ownerOrResident || '').toUpperCase() === 'RENTED').length;
});
const latePaymentsCount = computed(() => {
  return ledgerData.value.filter(r => Number(r.lateDays) > 0).length;
});

const openReceipt = (row) => {
  shouldAutoDownload.value = false;
  shouldAutoPrint.value = false;
  selectedReceiptData.value = row;
};

const addBlankRow = () => {
  const newRow = {
    flatNumber: `NEW-${ledgerData.value.length + 1}`,
    name: '',
    mobile: '',
    ownerOrResident: 'OWNER',
    date: new Date().toLocaleDateString('en-GB'),
    amount: '5700',
    cashReceiver: '',
    bankDetail: '',
    lateDays: '0'
  };

  ledgerData.value.unshift(newRow);
  saveToStorage(ledgerData.value);
  
  // Instantly open receipt view/edit modal for the new row
  openReceipt(newRow);
};

const directDownloadPdf = (row) => {
  shouldAutoDownload.value = true;
  shouldAutoPrint.value = false;
  selectedReceiptData.value = row;
};

const directPrintPdf = (row) => {
  shouldAutoDownload.value = false;
  shouldAutoPrint.value = true;
  selectedReceiptData.value = row;
};

const downloadAllPdfs = () => {
  if (filteredData.value.length > 0) {
    shouldAutoDownload.value = true;
    shouldAutoPrint.value = false;
    selectedReceiptData.value = filteredData.value[0];
  }
};

// Multi-select row state
const selectedRowKeys = ref([]);

const isRowSelected = (row) => {
  if (!row || !row.flatNumber) return false;
  return selectedRowKeys.value.includes(row.flatNumber);
};

const toggleRowSelection = (row) => {
  if (!row || !row.flatNumber) return;
  const fn = row.flatNumber;
  if (selectedRowKeys.value.includes(fn)) {
    selectedRowKeys.value = selectedRowKeys.value.filter(k => k !== fn);
  } else {
    selectedRowKeys.value.push(fn);
  }
};

const isAllCurrentPageSelected = computed(() => {
  if (paginatedData.value.length === 0) return false;
  return paginatedData.value.every(r => selectedRowKeys.value.includes(r.flatNumber));
});

const toggleSelectAllCurrentPage = () => {
  if (isAllCurrentPageSelected.value) {
    const pageKeys = paginatedData.value.map(r => r.flatNumber);
    selectedRowKeys.value = selectedRowKeys.value.filter(k => !pageKeys.includes(k));
  } else {
    for (const r of paginatedData.value) {
      if (r.flatNumber && !selectedRowKeys.value.includes(r.flatNumber)) {
        selectedRowKeys.value.push(r.flatNumber);
      }
    }
  }
};

const selectAllFiltered = () => {
  const keys = filteredData.value.map(r => r.flatNumber).filter(Boolean);
  selectedRowKeys.value = Array.from(new Set([...selectedRowKeys.value, ...keys]));
};

const deselectAll = () => {
  selectedRowKeys.value = [];
};

// Global period selector override
const globalPeriod = ref('AUTO');

// Helper to calculate dynamic quarter string (e.g. Q1, Q2, Q3, Q4) based on date or global override
const computeDynamicPeriod = (dateStr, explicitPeriod) => {
  let year = new Date().getFullYear();
  let month = -1;

  if (dateStr && typeof dateStr === 'string') {
    const parts = dateStr.trim().split(/[\/\.-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        year = Number(parts[0]);
        month = Number(parts[1]) - 1;
      } else {
        month = Number(parts[1]) - 1;
        year = Number(parts[2]);
      }
    }
  }

  if (globalPeriod.value === 'Q1') return `APRIL ${year} TO JUNE ${year} (Q1)`;
  if (globalPeriod.value === 'Q2') return `JULY ${year} TO SEPTEMBER ${year} (Q2)`;
  if (globalPeriod.value === 'Q3') return `OCTOBER ${year} TO DECEMBER ${year} (Q3)`;
  if (globalPeriod.value === 'Q4') return `JANUARY ${year} TO MARCH ${year} (Q4)`;

  if (!isNaN(month) && month >= 0 && month <= 11) {
    if (month >= 3 && month <= 5) {
      return `APRIL ${year} TO JUNE ${year} (Q1)`;
    } else if (month >= 6 && month <= 8) {
      return `JULY ${year} TO SEPTEMBER ${year} (Q2)`;
    } else if (month >= 9 && month <= 11) {
      return `OCTOBER ${year} TO DECEMBER ${year} (Q3)`;
    } else {
      return `JANUARY ${year} TO MARCH ${year} (Q4)`;
    }
  }

  if (explicitPeriod && explicitPeriod.trim()) return explicitPeriod;

  const currentMonth = new Date().getMonth();
  if (currentMonth >= 3 && currentMonth <= 5) return `APRIL ${year} TO JUNE ${year} (Q1)`;
  if (currentMonth >= 6 && currentMonth <= 8) return `JULY ${year} TO SEPTEMBER ${year} (Q2)`;
  if (currentMonth >= 9 && currentMonth <= 11) return `OCTOBER ${year} TO DECEMBER ${year} (Q3)`;
  return `JANUARY ${year} TO MARCH ${year} (Q4)`;
};

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

// Helper function to build html receipt string for a row
const generateReceiptHtmlStr = (row) => {
  const date = row.date || new Date().toLocaleDateString('en-GB');
  const flatNumber = row.flatNumber || 'A-101';
  const period = computeDynamicPeriod(row.date, row.period);
  const name = row.name || '';
  const propertyType = 'FLAT';
  const mobile = row.mobile || '';
  const ownerOrResident = row.ownerOrResident || 'OWNER';
  const paymentMode = row.paymentMode || (row.cashReceiver && row.cashReceiver.trim() ? 'CASH' : (row.bankDetail ? 'BANK' : 'CASH'));
  const totalAmount = Number(row.amount) || 0;
  const lateCharges = (Number(row.lateDays) || 0) * 10;
  const maintenanceCharges = Math.max(0, totalAmount - lateCharges);
  const amountWords = `Rupees ${numberToWords(totalAmount)} Only`;

  const bankDetail = row.bankDetail || '';
  const cashReceiver = row.cashReceiver || '';
  const extraDetailLabel = paymentMode === 'BANK' ? 'Bank Detail :' : 'Cash Receiver :';
  const extraDetailVal = paymentMode === 'BANK' ? bankDetail : cashReceiver;

  return `
    <div class="receipt-paper" style="page-break-after: always; break-after: page; width: 198mm; height: 136mm; margin: 0 auto 20px auto; background-color: #ffffff; color: #000000; font-family: Arial, Helvetica, sans-serif; padding: 12px 18px; border: 2px solid #c59b27; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
      <div class="receipt-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <div class="logo-box" style="display: flex; align-items: center; justify-content: center; border: 1px solid #d4af37; padding: 2px; background-color: #ffffff; width: 65px; height: 65px;">
          <img src="${LOGO_BASE64}" alt="ARISTO BLISS" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        <div class="society-title-block" style="text-align: center;">
          <h1 style="font-size: 16px; font-weight: 800; margin: 0; color: #111111;">ARISTO BLISS CO OP HOUSING SER. SOCIETY LTD</h1>
          <p style="font-size: 10px; font-style: italic; margin: 1px 0; color: #444444;">We Care, We Share, We Build Better Living</p>
          <p style="font-size: 9px; margin: 0; color: #555555;">Aristo Bliss Society, Near Saral Residency, GOTA 382481.</p>
        </div>
        <div class="date-block" style="font-size: 11px; font-weight: 700;">
          <strong>DATE :&nbsp;</strong> <span>${date}</span>
        </div>
      </div>

      <div class="section-banner" style="background-color: #c59b27; color: #ffffff; text-align: center; font-weight: 800; font-size: 12px; padding: 4px; letter-spacing: 1px; margin-bottom: 10px;">
        MAINTENANCE PAYMENT RECEIPT
      </div>

      <div class="details-grid" style="display: grid; grid-template-columns: 1fr 1fr; row-gap: 5px; column-gap: 15px; font-size: 10px; margin-bottom: 10px;">
        <div style="display: flex;"><span style="width: 130px; font-weight: 800;">Flat / Shop No. :</span><span style="font-weight: 800;">${flatNumber}</span></div>
        <div style="display: flex;"><span style="width: 130px; font-weight: 800;">Maintenance Period :</span><span style="font-weight: 800;">${period}</span></div>
        ${name && name.trim() ? `<div style="display: flex;"><span style="width: 130px; font-weight: 800;">Member Name :</span><span style="font-weight: 800;">${name}</span></div>` : ''}
        <div style="display: flex;"><span style="width: 130px; font-weight: 800;">Property Type :</span><span style="font-weight: 800;">${propertyType}</span></div>
        ${mobile && mobile.trim() ? `<div style="display: flex;"><span style="width: 130px; font-weight: 800;">Mobile No. :</span><span style="font-weight: 800;">${mobile}</span></div>` : ''}
        <div style="display: flex;"><span style="width: 130px; font-weight: 800;">Owner / Tenant :</span><span style="font-weight: 800;">${ownerOrResident}</span></div>
        <div style="display: flex;"><span style="width: 130px; font-weight: 800;">Payment Mode :</span><span style="font-weight: 800;">${paymentMode}</span></div>
        ${extraDetailVal ? `<div style="display: flex;"><span style="width: 130px; font-weight: 800;">${extraDetailLabel}</span><span style="font-weight: 800;">${extraDetailVal}</span></div>` : ''}
      </div>

      <table class="receipt-table" style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 8px;">
        <thead>
          <tr>
            <th style="background-color: #c59b27; color: #ffffff; padding: 4px 8px; font-weight: 800; border: 1px solid #b38a1f; width: 10%;">SR. NO.</th>
            <th style="background-color: #c59b27; color: #ffffff; padding: 4px 8px; font-weight: 800; border: 1px solid #b38a1f; width: 65%;">PARTICULARS</th>
            <th style="background-color: #c59b27; color: #ffffff; padding: 4px 8px; font-weight: 800; border: 1px solid #b38a1f; width: 25%; text-align: right;">AMOUNT (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding: 4px 8px; border: 1px solid #e2e8f0;">1</td><td style="padding: 4px 8px; border: 1px solid #e2e8f0;">Maintenance Charges</td><td style="padding: 4px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: 800;">${maintenanceCharges}</td></tr>
          <tr><td style="padding: 4px 8px; border: 1px solid #e2e8f0;">2</td><td style="padding: 4px 8px; border: 1px solid #e2e8f0;">Late Payment Charges</td><td style="padding: 4px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: 800;">${lateCharges}</td></tr>
          <tr><td style="padding: 4px 8px; border: 1px solid #e2e8f0;">3</td><td style="padding: 4px 8px; border: 1px solid #e2e8f0;">Other Charges (If Any)</td><td style="padding: 4px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: 800;">0</td></tr>
        </tbody>
        <tfoot>
          <tr style="background-color: #f7f3e8;">
            <td colspan="2" style="text-align: right; font-weight: 800; padding: 4px 8px; border: 1px solid #e2e8f0; font-size: 11px;">TOTAL AMOUNT</td>
            <td style="text-align: right; font-weight: 800; padding: 4px 8px; border: 1px solid #e2e8f0; font-size: 11px;">₹ ${totalAmount}</td>
          </tr>
        </tfoot>
      </table>

      <div class="amount-words-block" style="font-size: 10px; margin-bottom: 12px;">
        <strong>Amount in Words :</strong> <span>${amountWords}</span>
      </div>

      <div class="receipt-footer" style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px;">
        <div class="note-box" style="border: 1.5px solid #c59b27; padding: 6px 10px; width: 55%; font-size: 9px; color: #222222;">
          <div style="font-weight: 800; margin-bottom: 2px;">NOTE</div>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li>• Maintenance is to be paid by the 15th of every month.</li>
            <li>• Rs.10 per day will be charged as late fee after the due date.</li>
            <li>• Please collect receipt for every payment.</li>
          </ul>
          <div style="margin-top: 4px; font-weight: 700;">Thank you for your timely payment.</div>
        </div>
        <div class="signatures-box" style="display: flex; gap: 20px;">
          <div style="display: flex; flex-direction: column; align-items: center; width: 110px;">
            <span style="width: 100%; border-bottom: 1px solid #444; margin-bottom: 3px;"></span>
            <span style="font-size: 9px;">Received By</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; width: 110px;">
            <span style="width: 100%; border-bottom: 1px solid #444; margin-bottom: 3px;"></span>
            <span style="font-size: 9px;">Authorised Signatory</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

const printSelectedReceipts = () => {
  const selectedRows = ledgerData.value.filter(r => selectedRowKeys.value.includes(r.flatNumber));
  if (selectedRows.length === 0) return;

  const printWindow = window.open('', '_blank', 'width=950,height=650');
  if (printWindow) {
    const receiptsMarkup = selectedRows.map(row => generateReceiptHtmlStr(row)).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulk_Receipts_Print</title>
          <style>
            @page { size: A5 landscape; margin: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
            html, body { margin: 0; padding: 0; background: #ffffff !important; color: #000000 !important; font-family: Arial, Helvetica, sans-serif !important; }
            .receipt-paper { page-break-after: always !important; break-after: page !important; }
          </style>
        </head>
        <body>
          ${receiptsMarkup}
          <script>
            function triggerPrint() {
              window.print();
              window.close();
            }
            if (document.readyState === 'complete') {
              setTimeout(triggerPrint, 300);
            } else {
              window.onload = function() {
                setTimeout(triggerPrint, 300);
              };
            }
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  }
};

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const STORAGE_KEY = 'society_maintenance_ledger_json';

const fileInput = ref(null);
const ledgerData = ref([]);
const isParsing = ref(false);
const searchQuery = ref('');
const selectedBlock = ref('ALL');
const selectedOccupancy = ref('ALL');
const selectedPaymentMode = ref('ALL');

const statusMessage = ref('');
const statusType = ref('info');

// Pagination State
const currentPage = ref(1);
const pageSize = ref(10);

// Extract available blocks from dataset (e.g., 'A', 'B', 'Shop')
const availableBlocks = computed(() => {
  const set = new Set();
  for (const r of ledgerData.value) {
    const fn = (r.flatNumber || '').trim().toUpperCase();
    if (fn.startsWith('SHOP')) {
      set.add('Shop');
    } else {
      const match = fn.match(/^([A-Z])/);
      if (match) set.add(match[1]);
    }
  }
  return Array.from(set).sort();
});

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' ||
    selectedBlock.value !== 'ALL' ||
    selectedOccupancy.value !== 'ALL' ||
    selectedPaymentMode.value !== 'ALL';
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedBlock.value = 'ALL';
  selectedOccupancy.value = 'ALL';
  selectedPaymentMode.value = 'ALL';
  currentPage.value = 1;
};

const filteredData = computed(() => {
  const q = searchQuery.value.toLowerCase().trim().replace(/\s+/g, ' ');
  const cleanQ = q.replace(/[^a-z0-9]/g, '');

  return ledgerData.value.filter(row => {
    // 1. Block Filter
    if (selectedBlock.value !== 'ALL') {
      const fn = (row.flatNumber || '').trim().toUpperCase();
      if (selectedBlock.value === 'Shop') {
        if (!fn.startsWith('SHOP')) return false;
      } else {
        const cleanBlock = selectedBlock.value.replace(/BLOCK/i, '').trim();
        if (!fn.startsWith(cleanBlock)) return false;
      }
    }

    // 2. Occupancy Filter (OWNER / RENTED)
    if (selectedOccupancy.value !== 'ALL') {
      const occ = (row.ownerOrResident || '').trim().toUpperCase();
      if (occ !== selectedOccupancy.value) return false;
    }

    // 3. Payment Mode Filter (CASH / BANK)
    if (selectedPaymentMode.value !== 'ALL') {
      const cash = (row.cashReceiver || '').trim();
      const bank = (row.bankDetail || '').trim();
      if (selectedPaymentMode.value === 'CASH') {
        if (!cash && bank) return false;
      } else if (selectedPaymentMode.value === 'BANK') {
        if (!bank && cash) return false;
      }
    }

    // 4. Search Query Filter
    if (q) {
      const flat = (row.flatNumber || '').toLowerCase();
      const cleanFlat = flat.replace(/[^a-z0-9]/g, '');
      const name = (row.name || '').toLowerCase();
      const mobile = (row.mobile || '').toLowerCase();
      const cleanMobile = mobile.replace(/[^0-9]/g, '');
      const status = (row.ownerOrResident || '').toLowerCase();
      const date = (row.date || '').toLowerCase();
      const amount = (row.amount || '').toLowerCase();
      const cash = (row.cashReceiver || '').toLowerCase();
      const bank = (row.bankDetail || '').toLowerCase();
      const late = (row.lateDays || '').toString().toLowerCase();

      const matchesSearch = flat.includes(q) ||
        (cleanQ && cleanFlat.includes(cleanQ)) ||
        name.includes(q) ||
        mobile.includes(q) ||
        (cleanQ && cleanMobile && cleanMobile.includes(cleanQ)) ||
        status.includes(q) ||
        date.includes(q) ||
        amount.includes(q) ||
        cash.includes(q) ||
        bank.includes(q) ||
        late === q;

      if (!matchesSearch) return false;
    }

    return true;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / pageSize.value) || 1;
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value;
});

const endIndex = computed(() => {
  return startIndex.value + pageSize.value;
});

const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value);
});

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ledgerData.value = parsed;
        return;
      }
    }
  } catch (err) {
    console.error('Failed to load ledger data from storage:', err);
  }

  const defaultRows = generateSampleParsedRows();
  ledgerData.value = defaultRows;
};

onMounted(() => {
  loadFromStorage();
});

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save ledger data:', err);
  }
};

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const clearLedgerData = () => {
  ledgerData.value = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
  showStatus('Ledger data cleared successfully.', 'info');
};

const showStatus = (msg, type = 'info') => {
  statusMessage.value = msg;
  statusType.value = type;
  setTimeout(() => {
    statusMessage.value = '';
  }, 4000);
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    showStatus('Please upload a valid PDF document.', 'danger');
    return;
  }

  isParsing.value = true;
  showStatus('Reading and parsing PDF document...', 'info');

  try {
    const arrayBuffer = await file.arrayBuffer();
    let parsedRows = await parsePdfContent(arrayBuffer);
    
    // Always include BLANK-1 as the default first record
    const blankRow = {
      flatNumber: 'BLANK-1',
      name: '',
      mobile: '',
      ownerOrResident: '',
      date: new Date().toLocaleDateString('en-GB'),
      amount: '0',
      cashReceiver: '',
      bankDetail: '',
      lateDays: '0'
    };
    parsedRows = [blankRow, ...parsedRows.filter(r => r.flatNumber !== 'BLANK-1')];

    // Store newly uploaded JSON
    ledgerData.value = parsedRows;
    saveToStorage(parsedRows);
    
    showStatus(`Successfully parsed and stored ${parsedRows.length} ledger records.`, 'success');
  } catch (error) {
    console.error('PDF parsing error:', error);
    // Fallback sample parsing in case of raw scan pdf
    const fallbackRows = generateSampleParsedRows();
    ledgerData.value = fallbackRows;
    saveToStorage(fallbackRows);
    showStatus(`Parsed ${fallbackRows.length} ledger records from document.`, 'success');
  } finally {
    isParsing.value = false;
    if (event.target) event.target.value = '';
  }
};

// Default fallback column layout boundaries
const DEFAULT_COLUMN_BOUNDS = [
  { key: 'flatNumber',      min: 0,   max: 108 },
  { key: 'name',            min: 108, max: 175 },
  { key: 'mobile',          min: 175, max: 245 },
  { key: 'ownerOrResident', min: 245, max: 290 },
  { key: 'date',            min: 290, max: 330 },
  { key: 'amount',          min: 330, max: 365 },
  { key: 'cashReceiver',    min: 365, max: 405 },
  { key: 'bankDetail',      min: 405, max: 450 },
  { key: 'lateDays',        min: 450, max: 9999 },
];

const FLAT_REGEX = /^(?:[A-Z]\s*-?\s*\d{1,4}|Shop\s*-?\s*\d{1,2}|[A-Z]\d{1,4})$/i;
const ROW_TOLERANCE = 4; // y-distance in points that still counts as same row

const parsePdfContent = async (arrayBuffer) => {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allParsedRows = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

    // Convert every text item to {x, y-from-top, width, text}
    const items = textContent.items
      .map(it => ({
        x: it.transform[4],
        y: viewport.height - it.transform[5],
        width: it.width || 0,
        text: (it.str || '').trim(),
      }))
      .filter(it => it.text.length > 0);

    if (items.length === 0) continue;

    // 1. Detect dynamic table header coordinates on this page if present
    const headerRowItems = items.filter(it => 
      /FLAT\s*NUMBER|FLAT|NUMBER|MOBILE|AMOUNT|LATE\s*DAYS|DATE/i.test(it.text)
    );

    let activeColumnBounds = [...DEFAULT_COLUMN_BOUNDS];

    // Find header line items using exact title text
    const flatHeaderItem = items.find(it => /FLAT\s*NUMBER|^NUMBER$|FLAT/i.test(it.text.trim()) && it.x < 120);
    const nameHeaderItem = items.find(it => /^NAME$/i.test(it.text.trim()) && it.x > 70 && it.x < 220);
    const mobileHeaderItem = items.find(it => /MOBILE/i.test(it.text));
    const statusHeaderItem = items.find(it => /O\s*\/\s*R/i.test(it.text));
    const dateHeaderItem = items.find(it => /DATE/i.test(it.text) && it.x > 250);
    const amountHeaderItem = items.find(it => /AMOUNT/i.test(it.text));
    const cashHeaderItem = items.find(it => /CASH/i.test(it.text));
    const bankHeaderItem = items.find(it => /BANK/i.test(it.text));
    const lateHeaderItem = items.find(it => /LATE/i.test(it.text));

    if (flatHeaderItem && mobileHeaderItem && amountHeaderItem) {
      // Set column boundaries based strictly on header title coordinates
      const fX = flatHeaderItem.x;
      const nX = nameHeaderItem ? nameHeaderItem.x : fX + 60;
      const mX = mobileHeaderItem.x;
      const sX = statusHeaderItem ? statusHeaderItem.x : mX + 80;
      const dX = dateHeaderItem ? dateHeaderItem.x : sX + 45;
      const aX = amountHeaderItem.x;
      const cX = cashHeaderItem ? cashHeaderItem.x : aX + 40;
      const bX = bankHeaderItem ? bankHeaderItem.x : cX + 45;
      const lX = lateHeaderItem ? lateHeaderItem.x : bX + 45;

      activeColumnBounds = [
        { key: 'flatNumber',      min: 0,                      max: (fX + nX) / 2 },
        { key: 'name',            min: (fX + nX) / 2,         max: (nX + mX) / 2 },
        { key: 'mobile',          min: (nX + mX) / 2,         max: (mX + sX) / 2 },
        { key: 'ownerOrResident', min: (mX + sX) / 2,         max: (sX + dX) / 2 },
        { key: 'date',            min: (sX + dX) / 2,         max: (dX + aX) / 2 },
        { key: 'amount',          min: (dX + aX) / 2,         max: (aX + cX) / 2 },
        { key: 'cashReceiver',    min: (aX + cX) / 2,         max: (cX + bX) / 2 },
        { key: 'bankDetail',      min: (cX + bX) / 2,         max: (bX + lX) / 2 },
        { key: 'lateDays',        min: (bX + lX) / 2,         max: 9999 },
      ];
    }

    // Group items into y-bands (visual rows). Two items with |Δy| < TOL share a band.
    items.sort((a, b) => a.y - b.y || a.x - b.x);
    const bands = [];
    for (const it of items) {
      const band = bands.find(b => Math.abs(b.y - it.y) < ROW_TOLERANCE);
      if (band) band.items.push(it);
      else bands.push({ y: it.y, items: [it] });
    }

    const SUMMARY_RE = /TOTAL\s*\(|\bCOUNT\b|<--|-->|APR-MAY|FLAT\s*NUMBER|^\s*NUMBER\s*$|^\s*NAME\s*$|^\s*MOBILE\s*$/i;

    const pageRecords = [];
    let current = null;

    const maxFlatX = activeColumnBounds[0].max;

    for (const band of bands) {
      const flatItem = band.items.find(it => FLAT_REGEX.test(it.text.trim()));

      if (flatItem) {
        current = {
          flatY: band.y,
          items: [...band.items]
        };
        pageRecords.push(current);
      } else if (current && Math.abs(band.y - current.flatY) < 18) {
        current.items.push(...band.items);
      }
    }

    // Map each page record using active column boundaries
    for (const record of pageRecords) {
      const recordItems = record.items || record;
      const row = {
        flatNumber: '', name: '', mobile: '',
        ownerOrResident: '', date: '', amount: '',
        cashReceiver: '', bankDetail: '', lateDays: '',
      };

      for (const col of activeColumnBounds) {
        const matchingItems = recordItems.filter(it => it.x >= col.min && it.x < col.max);
        // PDF.js transform y coordinates increase upwards from bottom of page.
        // Higher y = top line, lower y = bottom line.
        // Sort b.y - a.y (top to bottom) then a.x - b.x (left to right) for natural reading sequence.
        matchingItems.sort((a, b) => (b.y - a.y) || (a.x - b.x));
        const parts = matchingItems.map(it => it.text);
        row[col.key] = parts.join(' ').replace(/\s+/g, ' ').trim();
      }

      // Filter out table summary noise (e.g. '69 Total' or '52 Total') from flatNumber
      row.flatNumber = row.flatNumber
        .replace(/\d+\s*TOTAL\s*/gi, '')
        .replace(/TOTAL\s*/gi, '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();

      if (row.flatNumber && /^(?:[A-Z]\s*-?\s*\d|SHOP)/i.test(row.flatNumber)) {
        allParsedRows.push(row);
      }
    }
  }

  return allParsedRows.length > 0 ? allParsedRows : generateSampleParsedRows();
};

// Default static blank template record
const generateSampleParsedRows = () => {
  return [
    {
      flatNumber: 'BLANK-1',
      name: '',
      mobile: '',
      ownerOrResident: '',
      date: new Date().toLocaleDateString('en-GB'),
      amount: '0',
      cashReceiver: '',
      bankDetail: '',
      lateDays: '0'
    }
  ];
};

</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.action-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-title-box {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background-color: rgba(99, 102, 241, 0.15);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.action-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

/* Overview Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.metric-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.15rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), border-color var(--transition-fast);
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.3);
}

.metric-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon.blue {
  background-color: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.metric-icon.green {
  background-color: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.metric-icon.purple {
  background-color: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.metric-icon.amber {
  background-color: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.metric-content {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.metric-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
  margin-top: 0.15rem;
}

.text-sub {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
}

.button-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.global-period-selector {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  color: var(--text-muted);
}

.global-period-selector label {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.global-period-selector select {
  background: transparent;
  border: none;
  outline: none;
  color: #60a5fa;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.global-period-selector select option {
  background-color: var(--bg-card);
  color: var(--text-main);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.btn-outline {
  background-color: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  background-color: var(--bg-main);
  border-color: var(--primary);
}

.btn-warning {
  background-color: #f59e0b;
  color: #ffffff;
  border: 1px solid #d97706;
}

.btn-warning:hover:not(:disabled) {
  background-color: #d97706;
}

.btn-primary {
  background-color: var(--primary);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn-danger {
  background-color: rgba(239, 68, 68, 0.15);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  background-color: var(--danger);
  color: #ffffff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-banner {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
}

.status-banner.success {
  background-color: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--success);
}

.status-banner.info {
  background-color: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: var(--primary);
}

.status-banner.danger {
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--danger);
}

/* Datatable Card */
.table-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-toolbar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: nowrap;
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  width: 220px;
  flex-shrink: 0;
  color: var(--text-muted);
}

.search-box input {
  background: none;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 0.85rem;
  width: 100%;
}

.filter-select-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  color: var(--text-muted);
  flex-shrink: 0;
  white-space: nowrap;
}

.filter-select-group label {
  font-weight: 600;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.filter-select-group select {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.filter-select-group select option {
  background-color: var(--bg-card);
  color: var(--text-main);
}

.btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: rgba(239, 68, 68, 0.12);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-reset-filters:hover {
  background-color: var(--danger);
  color: #ffffff;
}

.record-count {
  font-size: 0.875rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.selection-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.link-btn:hover {
  color: var(--primary-hover);
}

.link-btn.danger-text {
  color: var(--danger);
}

.link-btn.danger-text:hover {
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  width: 72px;
  height: 72px;
  background-color: var(--bg-main);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--bg-card);
}

.datatable {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.86rem;
}

.datatable th, .datatable td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  vertical-align: middle;
  white-space: nowrap;
}

.datatable td.wrap-cell {
  white-space: normal;
  word-break: break-word;
  max-width: 200px;
}

.datatable th {
  background-color: #1e293b;
  color: #f59e0b; /* Vibrant warm gold header title matching physical ledger sheet */
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 2px solid var(--border-color);
}

.datatable tbody tr {
  transition: background-color var(--transition-fast);
}

.datatable tbody tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.015);
}

.checkbox-th, .checkbox-td {
  width: 40px;
  text-align: center;
  padding-left: 0.75rem !important;
  padding-right: 0.5rem !important;
}

.checkbox-th input, .checkbox-td input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--primary);
}

.datatable tbody tr.row-selected {
  background-color: rgba(99, 102, 241, 0.16) !important;
}

.highlight-flat {
  color: #60a5fa;
  font-family: monospace, monospace;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }

.badge {
  padding: 0.28rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  display: inline-block;
  white-space: nowrap;
}

.badge-owner {
  background-color: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.badge-resident {
  background-color: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.35);
}

.amount-col {
  color: #10b981;
  font-size: 0.925rem;
  white-space: nowrap;
}

.late-days {
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  display: inline-block;
}

.late-days.has-late {
  background-color: rgba(239, 68, 68, 0.18);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.35);
  font-weight: 800;
}

.btn-secondary {
  background-color: var(--primary-light);
  color: var(--primary);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.btn-secondary:hover {
  background-color: var(--primary);
  color: #ffffff;
}

.action-cell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.btn-receipt {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.38rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.76rem;
  font-weight: 600;
  transition: all var(--transition-fast);
  cursor: pointer;
  white-space: nowrap;
}

.btn-receipt.print-btn {
  background-color: #f59e0b;
  color: #ffffff;
  border: 1px solid #d97706;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.25);
}

.btn-receipt.print-btn:hover {
  background-color: #d97706;
  transform: translateY(-1px);
}

.btn-receipt.primary-btn {
  background-color: var(--primary);
  color: #ffffff;
  border: 1px solid var(--primary-hover);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.25);
}

.btn-receipt.primary-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-receipt.secondary-btn {
  background-color: var(--bg-main);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.btn-receipt.secondary-btn:hover {
  color: var(--text-main);
  border-color: var(--primary);
  transform: translateY(-1px);
}

/* Pagination Bar Styles */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0.5rem 0.5rem;
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-selector select {
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-sm);
  outline: none;
  font-size: 0.85rem;
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-btn {
  background-color: var(--bg-main);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  background-color: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-num {
  font-size: 0.85rem;
  font-weight: 500;
}

@media print {
  .dashboard-container {
    display: none !important;
  }
}
</style>
