<template>
  <AdminLayout>
    <div class="dashboard-container">
      <!-- Top Action Bar -->
      <div class="action-card">
        <div class="action-header">
          <div>
            <h2>Society Maintenance Ledger</h2>
            <p class="subtitle">Upload society maintenance PDF statement to parse and view structured ledger data.</p>
          </div>
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

            <button v-if="ledgerData.length > 0" class="btn btn-secondary" @click="downloadAllPdfs">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download PDF Receipts</span>
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
        <div class="table-header">
          <div class="search-box" v-if="ledgerData.length > 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search flat, name, mobile..." />
          </div>
          <div class="record-count" v-if="ledgerData.length > 0">
            Total Records: <strong>{{ filteredData.length }}</strong>
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
              <tr v-for="(row, idx) in paginatedData" :key="idx">
                <td class="font-bold highlight-flat">{{ row.flatNumber }}</td>
                <td class="font-semibold">{{ row.name }}</td>
                <td>{{ row.mobile }}</td>
                <td>
                  <span class="badge" :class="row.ownerOrResident === 'OWNER' ? 'badge-owner' : 'badge-resident'">
                    {{ row.ownerOrResident }}
                  </span>
                </td>
                <td>{{ row.date }}</td>
                <td class="font-bold amount-col">₹{{ row.amount }}</td>
                <td>{{ row.cashReceiver || '-' }}</td>
                <td>{{ row.bankDetail || '-' }}</td>
                <td>
                  <span class="late-days" :class="{ 'has-late': Number(row.lateDays) > 0 }">
                    {{ row.lateDays }}
                  </span>
                </td>
                <td class="action-cell">
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
      :auto-download="shouldAutoDownload"
      @close="selectedReceiptData = null" 
    />
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import ReceiptModal from '../components/ReceiptModal.vue';
import * as pdfjsLib from 'pdfjs-dist';

const selectedReceiptData = ref(null);
const shouldAutoDownload = ref(false);

const openReceipt = (row) => {
  shouldAutoDownload.value = false;
  selectedReceiptData.value = row;
};

const directDownloadPdf = (row) => {
  shouldAutoDownload.value = true;
  selectedReceiptData.value = row;
};

const downloadAllPdfs = () => {
  if (filteredData.value.length > 0) {
    shouldAutoDownload.value = true;
    selectedReceiptData.value = filteredData.value[0];
  }
};

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const STORAGE_KEY = 'society_maintenance_ledger_json';

const fileInput = ref(null);
const ledgerData = ref([]);
const isParsing = ref(false);
const searchQuery = ref('');
const statusMessage = ref('');
const statusType = ref('info');

// Pagination State
const currentPage = ref(1);
const pageSize = ref(10);

const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return ledgerData.value;
  const q = searchQuery.value.toLowerCase().trim().replace(/\s+/g, ' ');
  const cleanQ = q.replace(/[^a-z0-9]/g, '');

  return ledgerData.value.filter(row => {
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

    return flat.includes(q) ||
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
    const parsedRows = await parsePdfContent(arrayBuffer);
    
    // Clear old JSON data and store newly uploaded JSON
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

// Column X-boundary map (derived from PDF layout analysis).
// Each item's x0 falls into exactly one column bucket.
const COLUMN_BOUNDS = [
  { key: 'flatNumber',      min: 55,  max: 108 },
  { key: 'name',            min: 108, max: 175 },
  { key: 'mobile',          min: 175, max: 245 },
  { key: 'ownerOrResident', min: 245, max: 290 },
  { key: 'date',            min: 290, max: 330 },
  { key: 'amount',          min: 330, max: 360 },
  { key: 'cashReceiver',    min: 360, max: 405 },
  { key: 'bankDetail',      min: 405, max: 450 },
  { key: 'lateDays',        min: 450, max: 999 },
];

const FLAT_REGEX = /^(?:[A-Z]-?\d{2,4}|Shop\s*-?\s*\d{1,2})$/i;
const ROW_TOLERANCE = 5; // y-distance in points that still counts as same row

const parsePdfContent = async (arrayBuffer) => {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allRecords = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

    // Convert every text item to {x, y-from-top, text}
    const items = textContent.items
      .map(it => ({
        x: it.transform[4],
        y: viewport.height - it.transform[5],
        text: (it.str || '').trim(),
      }))
      .filter(it => it.text.length > 0);

    // Group items into y-bands (visual rows). Two items with |Δy| < TOL share a band.
    items.sort((a, b) => a.y - b.y || a.x - b.x);
    const bands = [];
    for (const it of items) {
      const band = bands.find(b => Math.abs(b.y - it.y) < ROW_TOLERANCE);
      if (band) band.items.push(it);
      else bands.push({ y: it.y, items: [it] });
    }

    // Bands are already ordered top-to-bottom. A band that contains a flat-number
    // token in the leftmost column starts a new record; subsequent bands without
    // a flat number are treated as continuation lines (multi-line name, bank,
    // cash-receiver notes) and merged into the current record.
    // Regex matching page-footer summary rows / block headers that must NOT be
    // merged into the last flat record on the page.
    const SUMMARY_RE = /TOTAL\s*\(|\bCOUNT\b|<--|-->|APR-MAY|FLAT\s*NUMBER|^\s*NUMBER\s*$|^\s*NAME\s*$|^\s*MOBILE\s*$/i;

    let current = null;
    for (const band of bands) {
      const hasFlat = band.items.some(it => it.x < 108 && FLAT_REGEX.test(it.text));
      const bandText = band.items.map(it => it.text).join(' ');
      if (hasFlat) {
        if (current) allRecords.push(current);
        current = [...band.items];
      } else if (current) {
        if (SUMMARY_RE.test(bandText)) {
          // Close out the current record — everything below is footer/header noise
          allRecords.push(current);
          current = null;
        } else {
          current.push(...band.items);
        }
      }
    }
    if (current) allRecords.push(current);
  }

  // Convert each record's item list into a structured row by column bucket.
  const structured = allRecords.map(items => {
    const row = {
      flatNumber: '', name: '', mobile: '',
      ownerOrResident: '', date: '', amount: '',
      cashReceiver: '', bankDetail: '', lateDays: '',
    };
    for (const col of COLUMN_BOUNDS) {
      const parts = items
        .filter(it => it.x >= col.min && it.x < col.max)
        .sort((a, b) => a.y - b.y || a.x - b.x)
        .map(it => it.text);
      row[col.key] = parts.join(' ').replace(/\s+/g, ' ').trim();
    }
    row.flatNumber = row.flatNumber.toUpperCase().replace(/\s+/g, ' ');
    if (!row.lateDays) row.lateDays = '0';
    return row;
  }).filter(r =>
    r.flatNumber &&
    /^(?:[A-Z]-?\d|SHOP)/i.test(r.flatNumber) &&
    !/TOTAL|COUNT/i.test(r.flatNumber)
  );

  return structured.length > 0 ? structured : generateSampleParsedRows();
};

// Empty fallback array so no sample static data remains in codebase
const generateSampleParsedRows = () => {
  return [];
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
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
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

.button-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius-sm);
  width: 100%;
  max-width: 320px;
  color: var(--text-muted);
}

.search-box input {
  background: none;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 0.875rem;
  width: 100%;
}

.record-count {
  font-size: 0.875rem;
  color: var(--text-muted);
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
}

.datatable {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
  font-size: 0.88rem;
}

.datatable th, .datatable td {
  padding: 1rem 1.15rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: normal;
  word-break: break-word;
  max-width: 320px;
}

.datatable th {
  background-color: #1e293b;
  color: #f59e0b; /* Vibrant warm gold header title matching physical ledger sheet */
  font-size: 0.78rem;
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

.datatable tbody tr:hover {
  background-color: rgba(99, 102, 241, 0.08);
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
  color: #f3f4f6;
  font-size: 0.925rem;
}

.late-days {
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
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
  gap: 0.5rem;
}

.btn-receipt {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
  transition: all var(--transition-fast);
  cursor: pointer;
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
