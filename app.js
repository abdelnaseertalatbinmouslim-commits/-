// Local Database Key & Auth Passcode
const DB_STORAGE_KEY = 'aun_sports_results_db';
const ADMIN_PASS = '123456';

let currentDatabase = [];

// DOM Elements
const elements = {
    toggleAdminBtn: document.getElementById('toggleAdminBtn'),
    studentSection: document.getElementById('studentSection'),
    adminSection: document.getElementById('adminSection'),
    searchForm: document.getElementById('searchForm'),
    searchInput: document.getElementById('searchInput'),
    yearSelect: document.getElementById('yearSelect'),
    deptSelect: document.getElementById('deptSelect'),
    searchFeedback: document.getElementById('searchFeedback'),
    resultModal: document.getElementById('resultModal'),
    
    // Result Fields
    resName: document.getElementById('resName'),
    resStatus: document.getElementById('resStatus'),
    resSeat: document.getElementById('resSeat'),
    resNID: document.getElementById('resNID'),
    resYear: document.getElementById('resYear'),
    resDept: document.getElementById('resDept'),
    resTotal: document.getElementById('resTotal'),
    resPercentage: document.getElementById('resPercentage'),
    
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

// Initialize App
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

function handleSearch(e) {
    if (e) e.preventDefault();
    
    const query = elements.searchInput.value.trim();
    hideFeedback();
    elements.resultModal.classList.add('hidden');

    if (!query) {
        showFeedback('يرجى إدخال رقم الجلوس أو اسم الطالب', 'error');
        return;
    }

    if (currentDatabase.length === 0) {
        showFeedback('قاعدة البيانات فارغة حالياً. ادخل على لوحة الإدارة وارفع ملف النتائج أولاً.', 'error');
        return;
    }

    // Search directly using seat number, national ID, or name match
    const record = currentDatabase.find(student => 
        student.seatNo === query || 
        student.nationalId === query || 
        student.name.includes(query)
    );

    if (record) {
        renderResult(record);
    } else {
        showFeedback('لم يتم العثور على نتائج تطابق البيانات المدخلة. تأكد من رقم الجلوس.', 'error');
    }
}

function renderResult(record) {
    elements.resName.textContent = record.name;
    elements.resStatus.textContent = record.status;
    elements.resSeat.textContent = record.seatNo;
    elements.resNID.textContent = record.nationalId;
    elements.resYear.textContent = record.year;
    elements.resDept.textContent = record.department;
    elements.resTotal.textContent = record.total;
    elements.resPercentage.textContent = record.percentage + '%';

    // Style Status Badge
    if (record.status === 'راسب') {
        elements.resStatus.style.backgroundColor = '#ef4444';
    } else {
        elements.resStatus.style.backgroundColor = '#10b981';
    }

    elements.resultModal.classList.remove('hidden');
}

function showFeedback(msg, type) {
    elements.searchFeedback.textContent = msg;
    elements.searchFeedback.className = `feedback-msg ${type}`;
}

function hideFeedback() {
    elements.searchFeedback.className = 'feedback-msg hidden';
}

function handleAdminAuth() {
    const pass = elements.adminPass.value;
    if (pass === ADMIN_PASS) {
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
        parseAndStoreCSV(event.target.result);
    };
    reader.readAsText(file);
}

function parseAndStoreCSV(csvText) {
    const lines = csvText.split('\n');
    const parsedData = [];

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
        alert(`تم رفع البيانات بنجاح! إجمالي عدد الطلاب: ${parsedData.length}`);
    } else {
        alert('حدث خطأ في قراءة الملف.');
    }
}

function purgeDatabase() {
    if (confirm('هل أنت تأكد من محو البيانات؟')) {
        localStorage.removeItem(DB_STORAGE_KEY);
        currentDatabase = [];
        elements.recordCount.textContent = '0';
        alert('تم مسح البيانات.');
    }
}
