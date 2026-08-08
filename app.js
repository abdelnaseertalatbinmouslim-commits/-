// Database storage identifier
const DB_STORAGE_KEY = 'aun_sports_results_db';
const ADMIN_KEY_HASH = '123456'; // Default system admin access passcode

// State Variables
let currentDatabase = [];

// DOM Element Registry
const elements = {
    studentSection: document.getElementById('studentSection'),
    adminSection: document.getElementById('adminSection'),
    toggleAdminBtn: document.getElementById('toggleAdminBtn'),
    searchForm: document.getElementById('searchForm'),
    searchInput: document.getElementById('searchInput'),
    searchFeedback: document.getElementById('searchFeedback'),
    resultCard: document.getElementById('resultCard'),
    
    // Result Details
    resName: document.getElementById('resName'),
    resDepartment: document.getElementById('resDepartment'),
    resSeat: document.getElementById('resSeat'),
    resNID: document.getElementById('resNID'),
    resYear: document.getElementById('resYear'),
    resTotal: document.getElementById('resTotal'),
    resPercentage: document.getElementById('resPercentage'),
    resStatus: document.getElementById('resStatus'),
    
    // Admin Controls
    adminAuthBox: document.getElementById('adminAuthBox'),
    adminControlBox: document.getElementById('adminControlBox'),
    adminPass: document.getElementById('adminPass'),
    loginBtn: document.getElementById('loginBtn'),
    dropzone: document.getElementById('dropzone'),
    csvFileInput: document.getElementById('csvFileInput'),
    recordCount: document.getElementById('recordCount'),
    purgeDataBtn: document.getElementById('purgeDataBtn')
};

// System Initializer
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    bindEvents();
});

function loadDatabase() {
    const rawData = localStorage.getItem(DB_STORAGE_KEY);
    if (rawData) {
        try {
            currentDatabase = JSON.parse(rawData);
            if (elements.recordCount) elements.recordCount.textContent = currentDatabase.length;
        } catch (e) {
            currentDatabase = [];
        }
    }
}

function bindEvents() {
    if (elements.toggleAdminBtn) elements.toggleAdminBtn.addEventListener('click', toggleViews);
    if (elements.searchForm) elements.searchForm.addEventListener('submit', handleSearch);
    if (elements.loginBtn) elements.loginBtn.addEventListener('click', handleAdminAuth);
    
    // Admin CSV File Handlers
    if (elements.dropzone) elements.dropzone.addEventListener('click', () => elements.csvFileInput.click());
    if (elements.csvFileInput) elements.csvFileInput.addEventListener('change', handleFileUpload);
    if (elements.purgeDataBtn) elements.purgeDataBtn.addEventListener('click', purgeDatabase);
}

function toggleViews() {
    const isAdminVisible = !elements.adminSection.classList.contains('hidden');
    if (isAdminVisible) {
        elements.adminSection.classList.add('hidden');
        elements.studentSection.classList.remove('hidden');
        elements.toggleAdminBtn.textContent = 'لوحة الإدارة 🔒';
    } else {
        elements.studentSection.classList.add('hidden');
        elements.adminSection.classList.remove('hidden');
        elements.toggleAdminBtn.textContent = 'واجهة الطلاب 🎓';
    }
}

function handleSearch() {
    const query = elements.searchInput.value.trim();
    hideFeedback();
    elements.resultCard.classList.add('hidden');

    if (!query) return;

    if (currentDatabase.length === 0) {
        showFeedback('قاعدة البيانات فارغة حالياً. يرجى مراجعة إدارة الكلية.', 'error');
        return;
    }

    // Direct search matching Seat Number or National Identity
    const record = currentDatabase.find(student => 
        student.seatNo === query || student.nationalId === query
    );

    if (record) {
        renderStudentResult(record);
    } else {
        showFeedback('لم يتم العثور على نتائج تطابق رقم الجلوس أو الرقم القومي المدخل.', 'error');
    }
}

function renderStudentResult(record) {
    elements.resName.textContent = record.name;
    elements.resDepartment.textContent = record.department || 'عام';
    elements.resSeat.textContent = record.seatNo;
    elements.resNID.textContent = record.nationalId;
    elements.resYear.textContent = record.year;
    elements.resTotal.textContent = record.total;
    elements.resPercentage.textContent = record.percentage + '%';
    elements.resStatus.textContent = record.status;

    elements.resultCard.classList.remove('hidden');
}

function showFeedback(message, type) {
    elements.searchFeedback.textContent = message;
    elements.searchFeedback.className = `feedback-msg ${type}`;
}

function hideFeedback() {
    elements.searchFeedback.className = 'feedback-msg hidden';
}

function handleAdminAuth() {
    const pass = elements.adminPass.value;
    if (pass === ADMIN_KEY_HASH) {
        elements.adminAuthBox.classList.add('hidden');
        elements.adminControlBox.classList.remove('hidden');
    } else {
        alert('كلمة المرور غير صحيحة.');
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        parseAndStoreCSV(text);
    };
    reader.readAsText(file);
}

function parseAndStoreCSV(csvContent) {
    const lines = csvContent.split('\n');
    const parsedData = [];

    // Skip Header Index (Line 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',');
        if (cols.length >= 7) {
            parsedData.push({
                seatNo: cols[0].trim(),
                nationalId: cols[1].trim(),
                name: cols[2].trim(),
                year: cols[3].trim(),
                department: cols[4].trim(),
                total: cols[5].trim(),
                percentage: cols[6].trim(),
                status: cols[7] ? cols[7].trim() : 'ناجح'
            });
        }
    }

    if (parsedData.length > 0) {
        currentDatabase = parsedData;
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(currentDatabase));
        elements.recordCount.textContent = currentDatabase.length;
        alert(`تم رفع وتحديث البيانات بنجاح! عدد الطلاب المسجلين: ${parsedData.length}`);
    } else {
        alert('حدث خطأ أثناء قراءة الملف. تأكد من تصفيف الأعمدة بالشكل الصحيح.');
    }
}

function purgeDatabase() {
    if (confirm('هل أنت تأكد من محو جميع السجلات الحالية من النظام؟')) {
        localStorage.removeItem(DB_STORAGE_KEY);
        currentDatabase = [];
        elements.recordCount.textContent = '0';
        alert('تمت إزالة قاعدة البيانات.');
    }
}

