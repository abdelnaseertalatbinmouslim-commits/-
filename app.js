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
    elements.resPercentage.textContent = record.percentage;

    // Build Detailed Subject Table Dynamic Component
    let tableHTML = `
        <table style="width: 100%; margin-top: 15px; border-collapse: collapse; text-align: center; font-size: 0.85rem; border: 1px solid #e2e8f0;">
            <thead>
                <tr style="background-color: #f1f5f9; color: #1e293b;">
                    <th style="padding: 6px; border: 1px solid #cbd5e1;">المادة</th>
                    <th style="padding: 6px; border: 1px solid #cbd5e1;">الدرجة العظمى</th>
                    <th style="padding: 6px; border: 1px solid #cbd5e1;">الدرجة المكتسبة</th>
                </tr>
            </thead>
            <tbody>
                <tr><td style="padding: 6px; border: 1px solid #e2e8f0;">التشريح الوظيفي</td><td style="padding: 6px; border: 1px solid #e2e8f0;">100</td><td style="padding: 6px; border: 1px solid #e2e8f0;">${record.sub1}</td></tr>
                <tr><td style="padding: 6px; border: 1px solid #e2e8f0;">علم النفس الرياضي</td><td style="padding: 6px; border: 1px solid #e2e8f0;">100</td><td style="padding: 6px; border: 1px solid #e2e8f0;">${record.sub2}</td></tr>
                <tr><td style="padding: 6px; border: 1px solid #e2e8f0;">التدريب الميداني</td><td style="padding: 6px; border: 1px solid #e2e8f0;">100</td><td style="padding: 6px; border: 1px solid #e2e8f0;">${record.sub3}</td></tr>
                <tr><td style="padding: 6px; border: 1px solid #e2e8f0;">الإصابات والتأهيل</td><td style="padding: 6px; border: 1px solid #e2e8f0;">100</td><td style="padding: 6px; border: 1px solid #e2e8f0;">${record.sub4}</td></tr>
                <tr><td style="padding: 6px; border: 1px solid #e2e8f0;">نظريات ومناهج التربية الرياضية</td><td style="padding: 6px; border: 1px solid #e2e8f0;">100</td><td style="padding: 6px; border: 1px solid #e2e8f0;">${record.sub5}</td></tr>
            </tbody>
        </table>
    `;

    // Append table to modal if not exists
    let tableContainer = document.getElementById('gradesTableContainer');
    if (!tableContainer) {
        tableContainer = document.createElement('div');
        tableContainer.id = 'gradesTableContainer';
        document.querySelector('.res-grid').after(tableContainer);
    }
    tableContainer.innerHTML = tableHTML;

    // Status Pill Styling
    if (record.status.includes('راسب')) {
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
        if (cols.length >= 12) {
            parsedData.push({
                seatNo: cols[0].trim(),
                nationalId: cols[1].trim(),
                name: cols[2].trim(),
                year: cols[3].trim(),
                department: cols[4].trim(),
                sub1: cols[5].trim(),
                sub2: cols[6].trim(),
                sub3: cols[7].trim(),
                sub4: cols[8].trim(),
                sub5: cols[9].trim(),
                total: cols[10].trim(),
                percentage: cols[11].trim(),
                status: cols[12] ? cols[12].trim() : 'ناجح'
            });
        }
    }

    if (parsedData.length > 0) {
        currentDatabase = parsedData;
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(currentDatabase));
        elements.recordCount.textContent = currentDatabase.length;
        alert(`تم رفع الملف بنجاح! إجمالي عدد الطلاب: ${parsedData.length}`);
    } else {
        alert('حدث خطأ في قراءة صيغة الأعمدة المخصصة للمواد.');
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
