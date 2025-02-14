// تعريف المتغيرات العالمية

let salesData = [];

let expensesData = [];

let artisansData = [];

// عند تحميل الصفحة

document.addEventListener("DOMContentLoaded", init);

function init() {

  // استعادة البيانات من localStorage إن وجدت

  salesData = JSON.parse(localStorage.getItem("salesData")) || [];

  expensesData = JSON.parse(localStorage.getItem("expensesData")) || [];

  artisansData = JSON.parse(localStorage.getItem("artisansData")) || [];

  // تعيين التاريخ التلقائي في الحقول المناسبة

  const today = new Date().toISOString().split("T")[0];

  if (document.getElementById("accountDate"))

    document.getElementById("accountDate").value = today;

  if (document.getElementById("expenseDate"))

    document.getElementById("expenseDate").value = today;

  // تحديث خيارات قائمة الأصناف في صفحة الحساب

  updateArtisanSelects();

  // إعداد زر القائمة الجانبية والتأكد من إخفاء القائمة عند البداية

  setupNavigation();

  // إعداد أزرار إظهار/إخفاء النماذج (للمصروفات والأصناف)

  if (document.getElementById("addExpenseBtn"))

    document.getElementById("addExpenseBtn").addEventListener("click", () => {

      toggleForm("expenseForm");

    });

  if (document.getElementById("addArtisanBtn"))

    document.getElementById("addArtisanBtn").addEventListener("click", () => {

      toggleForm("artisanForm");

    });

  // التعامل مع نموذج الحساب (إضافة عملية بيع)

  if (document.getElementById("accountForm"))

    document.getElementById("accountForm").addEventListener("submit", function (e) {

      e.preventDefault();

      addSale();

      this.reset();

      this.querySelector("input[type='date']").value = today;

      updateSaleTotal();

    });

  // التعامل مع نموذج المصروفات

  if (document.getElementById("expenseForm"))

    document.getElementById("expenseForm").addEventListener("submit", function (e) {

      e.preventDefault();

      addExpense();

      this.reset();

      this.querySelector("input[type='date']").value = today;

      this.classList.add("hidden");

    });

  // التعامل مع نموذج الأصناف

  if (document.getElementById("artisanForm"))

    document.getElementById("artisanForm").addEventListener("submit", function (e) {

      e.preventDefault();

      addArtisan();

      this.reset();

      this.classList.add("hidden");

    });

  // حساب الإجمالي فوراً عند إدخال الكميّة أو السعر في صفحة الحساب

  if (document.getElementById("accountQuantity") && document.getElementById("accountAmount")) {

    document.getElementById("accountQuantity").addEventListener("input", updateSaleTotal);

    document.getElementById("accountAmount").addEventListener("input", updateSaleTotal);

  }

  // إعداد أزرار تفاصيل الأشهر للمبيعات والمصروفات وصافي المبيعات

  document.querySelectorAll(".month-tab").forEach(btn => {

    btn.addEventListener("click", () => {

      const offset = parseInt(btn.getAttribute("data-month-offset"));

      renderMonthlySalesDetails(offset);

    });

  });

  document.querySelectorAll(".month-tab-expense").forEach(btn => {

    btn.addEventListener("click", () => {

      const offset = parseInt(btn.getAttribute("data-month-offset"));

      renderMonthlyExpenseDetails(offset);

    });

  });

  document.querySelectorAll(".month-tab-net").forEach(btn => {

    btn.addEventListener("click", () => {

      const offset = parseInt(btn.getAttribute("data-month-offset"));

      renderMonthlyNetDetails(offset);

    });

  });

  // تحديث الجداول عند البدء

  renderSalesTable();

  renderExpensesTable();

  renderNetSalesTable();

  renderArtisanTable();

  updateArtisanSalesTotals();

  updateExpensesTotals();

}

// تحديث خانة الإجمالي في صفحة الحساب (السعر × الكميّة)

function updateSaleTotal() {

  const amount = parseFloat(document.getElementById("accountAmount").value) || 0;

  const quantity = parseFloat(document.getElementById("accountQuantity").value) || 0;

  const total = amount * quantity;

  document.getElementById("accountTotal").value = total.toFixed(2);

}

// تحديث خيارات قائمة الأصناف (في صفحة الحساب)

function updateArtisanSelects() {

  const selects = [document.getElementById("accountArtisan")];

  selects.forEach(select => {

    if (!select) return;

    select.innerHTML = "";

    artisansData.forEach(artisan => {

      const option = document.createElement("option");

      option.value = artisan.name;

      option.textContent = artisan.name;

      select.appendChild(option);

    });

  });

}

// تبديل عرض النماذج (عند الضغط على زر إضافة مصروف أو صنف)

function toggleForm(formId) {

  const form = document.getElementById(formId);

  if (form) {

    form.classList.toggle("hidden");

  }

}

// إضافة عملية بيع (صفحة الحساب)

// تُقرأ البيانات: التاريخ، السعر، الكميّة، ويتم حساب الإجمالي، واختيار الصنف من القائمة

function addSale() {

  const date = document.getElementById("accountDate").value;

  const amount = parseFloat(document.getElementById("accountAmount").value);

  const quantity = parseFloat(document.getElementById("accountQuantity").value);

  const total = amount * quantity;

  const product = document.getElementById("accountArtisan").value;

  const sale = { id: Date.now(), date, amount, quantity, total, product };

  salesData.push(sale);

  saveData("salesData", salesData);

  renderSalesTable();

  renderNetSalesTable();

  renderArtisanTable();

  updateArtisanSalesTotals();

}

// إضافة مصروف (صفحة المصروفات)

function addExpense() {

  const date = document.getElementById("expenseDate").value;

  const amount = parseFloat(document.getElementById("expenseAmount").value);

  const reason = document.getElementById("expenseReason").value;

  const expense = { id: Date.now(), date, amount, reason };

  expensesData.push(expense);

  saveData("expensesData", expensesData);

  renderExpensesTable();

  renderNetSalesTable();

  renderArtisanTable();

  updateExpensesTotals();

}

// إضافة صنف جديد (صفحة الأصناف)

// يُقرأ: اسم الصنف و الكميّة المشتراة

function addArtisan() {

  const name = document.getElementById("artisanName").value;

  const quantity = parseFloat(document.getElementById("artisanQuantity").value) || 0;

  const artisan = { id: Date.now(), name, quantity };

  artisansData.push(artisan);

  saveData("artisansData", artisansData);

  renderArtisanTable();

  updateArtisanSalesTotals();

  // تحديث القائمة في صفحة الحساب فوراً

  updateArtisanSelects();

}

// حفظ البيانات في localStorage

function saveData(key, data) {

  localStorage.setItem(key, JSON.stringify(data));

}

// تحديث جدول المبيعات (صفحة المبيعات)

function renderSalesTable() {

  const tbody = document.querySelector("#salesTable tbody");

  if (!tbody) return;

  tbody.innerHTML = "";

  salesData.forEach(sale => {

    const tr = document.createElement("tr");

    tr.innerHTML = `

      <td>${sale.date}</td>

      <td>${sale.amount.toFixed(2)}</td>

      <td>${sale.product}</td>

      <td>${sale.quantity}</td>

      <td>

        <button onclick="editSale(${sale.id})"><i class="fas fa-edit"></i></button>

        <button onclick="deleteSale(${sale.id})"><i class="fas fa-trash-alt"></i></button>

      </td>

    `;

    tbody.appendChild(tr);

  });

  updateSalesTotals();

}

// حساب إجمالي المبيعات (بالمبالغ) اليومية لتاريخ معين

function calculateDailyTotal(dateStr) {

  const total = salesData

    .filter(sale => sale.date === dateStr)

    .reduce((sum, sale) => sum + sale.total, 0);

  return total.toFixed(2);

}

// تحديث إجماليات المبيعات (شهري ويومي) في صفحة المبيعات (بالمبالغ)

function updateSalesTotals() {

  const monthlyTotal = salesData

    .filter(sale => new Date(sale.date).getMonth() === new Date().getMonth())

    .reduce((sum, sale) => sum + sale.total, 0);

  if (document.getElementById("monthlySalesTotal"))

    document.getElementById("monthlySalesTotal").textContent = `إجمالي المبيعات الشهري: ${monthlyTotal.toFixed(2)}`;

  if (document.getElementById("dailySalesTotals"))

    document.getElementById("dailySalesTotals").textContent = `إجمالي المبيعات اليومية: ${calculateDailyTotal(new Date().toISOString().split("T")[0])}`;

}

// تحديث إجمالي المبيعات (بالمبالغ) لكل صنف (صفحة المبيعات)

function updateArtisanSalesTotals() {

  const container = document.getElementById("artisanSalesTotals");

  if (!container) return;

  let html = "<h3>إجمالي مبيعات كل صنف:</h3><ul>";

  artisansData.forEach(artisan => {

    const totalMoney = salesData

      .filter(sale => sale.product === artisan.name)

      .reduce((sum, sale) => sum + sale.total, 0);

    html += `<li>${artisan.name}: ${totalMoney.toFixed(2)}</li>`;

  });

  html += "</ul>";

  container.innerHTML = html;

}

// تحديث إجمالي المصروفات (شهري ويومي) في صفحة المصروفات

function updateExpensesTotals() {

  const monthlyExpenses = expensesData

    .filter(exp => new Date(exp.date).getMonth() === new Date().getMonth())

    .reduce((sum, exp) => sum + exp.amount, 0);

  if (document.getElementById("monthlyExpensesTotal"))

    document.getElementById("monthlyExpensesTotal").textContent = `إجمالي المصروفات الشهري: ${monthlyExpenses.toFixed(2)}`;

  if (document.getElementById("dailyExpensesTotal"))

    document.getElementById("dailyExpensesTotal").textContent = `إجمالي المصروفات اليومية: ${expensesData

      .filter(exp => exp.date === new Date().toISOString().split("T")[0])

      .reduce((sum, exp) => sum + exp.amount, 0)

      .toFixed(2)}`;

}

// تحديث جدول الأصناف (صفحة الأصناف)

// الأعمدة: اسم الصنف، ج المشتراة، ج المباعة، الكميّة المتبقية، الإجراءات

function renderArtisanTable() {

  const tbody = document.querySelector("#artisanTable tbody");

  if (!tbody) return;

  tbody.innerHTML = "";

  artisansData.forEach(artisan => {

    const sold = salesData

      .filter(sale => sale.product === artisan.name)

      .reduce((sum, sale) => sum + sale.quantity, 0);

    const purchased = artisan.quantity || 0;

    const remaining = purchased - sold;

    const tr = document.createElement("tr");

    tr.innerHTML = `

      <td>${artisan.name}</td>

      <td>${purchased}</td>

      <td>${sold}</td>

      <td>${remaining}</td>

      <td>

        <button onclick="editArtisan(${artisan.id})"><i class="fas fa-edit"></i></button>

        <button onclick="deleteArtisan(${artisan.id})"><i class="fas fa-trash-alt"></i></button>

      </td>

    `;

    tbody.appendChild(tr);

  });

}

// تعديل صنف: استخدام prompt لتعديل اسم الصنف وكمية المشتراة

function editArtisan(id) {

  const artisan = artisansData.find(a => a.id === id);

  if (!artisan) return;

  const newName = prompt("تعديل اسم الصنف:", artisan.name);

  if (newName !== null && newName.trim() !== "") {

    artisan.name = newName.trim();

  }

  const newQuantity = prompt("تعديل الكميّة المشتراة:", artisan.quantity);

  if (newQuantity !== null && !isNaN(newQuantity)) {

    artisan.quantity = parseFloat(newQuantity);

  }

  saveData("artisansData", artisansData);

  updateArtisanSelects();

  renderArtisanTable();

  updateArtisanSalesTotals();

}

// حذف صنف

function deleteArtisan(id) {

  if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {

    artisansData = artisansData.filter(a => a.id !== id);

    saveData("artisansData", artisansData);

    updateArtisanSelects();

    renderArtisanTable();

    updateArtisanSalesTotals();

  }

}

// وظائف تعديل وحذف المبيعات

function editSale(id) {

  const sale = salesData.find(s => s.id === id);

  if (!sale) return;

  document.getElementById("accountDate").value = sale.date;

  document.getElementById("accountAmount").value = sale.amount;

  document.getElementById("accountQuantity").value = sale.quantity;

  document.getElementById("accountTotal").value = sale.total.toFixed(2);

  document.getElementById("accountArtisan").value = sale.product;

  deleteSale(id);

}

function deleteSale(id) {

  if (confirm("هل أنت متأكد من حذف هذه العملية؟")) {

    salesData = salesData.filter(s => s.id !== id);

    saveData("salesData", salesData);

    renderSalesTable();

    renderNetSalesTable();

    renderArtisanTable();

    updateArtisanSalesTotals();

  }

}

// تحديث جدول المصروفات

function renderExpensesTable() {

  const tbody = document.querySelector("#expensesTable tbody");

  if (!tbody) return;

  tbody.innerHTML = "";

  expensesData.forEach(expense => {

    const tr = document.createElement("tr");

    tr.innerHTML = `

      <td>${expense.date}</td>

      <td>${expense.reason}</td>

      <td>${expense.amount.toFixed(2)}</td>

      <td>${calculateExpenseDailyTotal(expense.date)}</td>

      <td>

        <button onclick="editExpense(${expense.id})"><i class="fas fa-edit"></i></button>

        <button onclick="deleteExpense(${expense.id})"><i class="fas fa-trash-alt"></i></button>

      </td>

    `;

    tbody.appendChild(tr);

  });

}

// حساب إجمالي المصروفات اليومية لتاريخ معين

function calculateExpenseDailyTotal(dateStr) {

  const total = expensesData

    .filter(exp => exp.date === dateStr)

    .reduce((sum, exp) => sum + exp.amount, 0);

  return total.toFixed(2);

}

function editExpense(id) {

  const expense = expensesData.find(exp => exp.id === id);

  if (!expense) return;

  document.getElementById("expenseDate").value = expense.date;

  document.getElementById("expenseAmount").value = expense.amount;

  document.getElementById("expenseReason").value = expense.reason;

  deleteExpense(id);

  document.getElementById("expenseForm").classList.remove("hidden");

}

function deleteExpense(id) {

  if (confirm("هل أنت متأكد من حذف هذه العملية؟")) {

    expensesData = expensesData.filter(exp => exp.id !== id);

    saveData("expensesData", expensesData);

    renderExpensesTable();

    renderNetSalesTable();

    renderArtisanTable();

    updateExpensesTotals();

  }

}

// تحديث جدول صافي المبيعات

function renderNetSalesTable() {

  const tbody = document.querySelector("#netSalesTable tbody");

  if (!tbody) return;

  tbody.innerHTML = "";

  const datesSet = new Set([...salesData.map(s => s.date), ...expensesData.map(e => e.date)]);

  const datesArr = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));

  datesArr.forEach(date => {

    const totalSales = salesData.filter(s => s.date === date).reduce((sum, s) => sum + s.total, 0);

    const totalExpenses = expensesData.filter(e => e.date === date).reduce((sum, e) => sum + e.amount, 0);

    const net = totalSales - totalExpenses;

    const tr = document.createElement("tr");

    tr.innerHTML = `

      <td>${date}</td>

      <td>${totalSales.toFixed(2)}</td>

      <td>${totalExpenses.toFixed(2)}</td>

      <td>${net.toFixed(2)}</td>

    `;

    tbody.appendChild(tr);

  });

  // تحديث إجمالي الصافي (اليومي والشهري)

  updateNetSalesTotals();

}

// تحديث إجمالي صافي المبيعات (اليومي والشهري)

function updateNetSalesTotals() {

  // حساب الصافي اليومي: مجموع (sale.total) لليوم - مجموع (expense.amount) لليوم

  const today = new Date().toISOString().split("T")[0];

  const dailySales = salesData.filter(s => s.date === today)

                      .reduce((sum, s) => sum + s.total, 0);

  const dailyExpenses = expensesData.filter(e => e.date === today)

                        .reduce((sum, e) => sum + e.amount, 0);

  const dailyNet = dailySales - dailyExpenses;

  // حساب الصافي الشهري: نفس الطريقة للشهر الحالي

  const currentMonth = new Date().getMonth();

  const monthlySales = salesData

                        .filter(s => new Date(s.date).getMonth() === currentMonth)

                        .reduce((sum, s) => sum + s.total, 0);

  const monthlyExpenses = expensesData

                           .filter(e => new Date(e.date).getMonth() === currentMonth)

                           .reduce((sum, e) => sum + e.amount, 0);

  const monthlyNet = monthlySales - monthlyExpenses;

  if (document.getElementById("dailyNetTotal"))

    document.getElementById("dailyNetTotal").textContent = `صافي المبيعات اليومية: ${dailyNet.toFixed(2)}`;

  if (document.getElementById("monthlyNetTotal"))

    document.getElementById("monthlyNetTotal").textContent = `صافي المبيعات الشهري: ${monthlyNet.toFixed(2)}`;

}

// عرض تفاصيل المبيعات للشهر المحدد

function renderMonthlySalesDetails(monthOffset) {

  const detailsDiv = document.getElementById("salesMonthDetails");

  detailsDiv.innerHTML = "";

  const targetDate = new Date();

  targetDate.setMonth(targetDate.getMonth() - monthOffset);

  const targetMonth = targetDate.getMonth();

  const targetYear = targetDate.getFullYear();

  const filtered = salesData.filter(sale => {

    const d = new Date(sale.date);

    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;

  });

  if (filtered.length === 0) {

    detailsDiv.textContent = "لا توجد بيانات لهذا الشهر.";

    return;

  }

  const table = document.createElement("table");

  table.innerHTML = `

    <thead>

      <tr>

        <th>التاريخ</th>

        <th>السعر</th>

        <th>الكميّة</th>

        <th>اسم الصنف</th>

        <th>الإجراءات</th>

      </tr>

    </thead>

    <tbody></tbody>

  `;

  const tbody = table.querySelector("tbody");

  filtered.forEach(sale => {

    const tr = document.createElement("tr");

    tr.innerHTML = `

      <td>${sale.date}</td>

      <td>${sale.amount.toFixed(2)}</td>

      <td>${sale.quantity}</td>

      <td>${sale.product}</td>

      <td>

        <button onclick="editSale(${sale.id})"><i class="fas fa-edit"></i></button>

        <button onclick="deleteSale(${sale.id})"><i class="fas fa-trash-alt"></i></button>

      </td>

    `;

    tbody.appendChild(tr);

  });

  detailsDiv.appendChild(table);

}

// عرض تفاصيل المصروفات للشهر المحدد

function renderMonthlyExpenseDetails(monthOffset) {

  const detailsDiv = document.getElementById("expenseMonthDetails");

  detailsDiv.innerHTML = "";

  const targetDate = new Date();

  targetDate.setMonth(targetDate.getMonth() - monthOffset);

  const targetMonth = targetDate.getMonth();

  const targetYear = targetDate.getFullYear();

  const filtered = expensesData.filter(exp => {

    const d = new Date(exp.date);

    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;

  });

  if (filtered.length === 0) {

    detailsDiv.textContent = "لا توجد بيانات لهذا الشهر.";

    return;

  }

  const table = document.createElement("table");

  table.innerHTML = `

    <thead>

      <tr>

        <th>التاريخ</th>

        <th>السبب</th>

        <th>المبلغ</th>

        <th>إجمالي اليوم</th>

        <th>الإجراءات</th>

      </tr>

    </thead>

    <tbody></tbody>

  `;

  const tbody = table.querySelector("tbody");

  filtered.forEach(exp => {

    const tr = document.createElement("tr");

    tr.innerHTML = `

      <td>${exp.date}</td>

      <td>${exp.reason}</td>

      <td>${exp.amount.toFixed(2)}</td>

      <td>${calculateExpenseDailyTotal(exp.date)}</td>

      <td>

        <button onclick="editExpense(${exp.id})"><i class="fas fa-edit"></i></button>

        <button onclick="deleteExpense(${exp.id})"><i class="fas fa-trash-alt"></i></button>

      </td>

    `;

    tbody.appendChild(tr);

  });

  detailsDiv.appendChild(table);

}

// عرض تفاصيل صافي المبيعات للشهر المحدد

function renderMonthlyNetDetails(monthOffset) {

  const detailsDiv = document.getElementById("netMonthDetails");

  detailsDiv.innerHTML = "";

  const targetDate = new Date();

  targetDate.setMonth(targetDate.getMonth() - monthOffset);

  const targetMonth = targetDate.getMonth();

  const targetYear = targetDate.getFullYear();

  const datesSet = new Set();

  salesData.forEach(sale => {

    const d = new Date(sale.date);

    if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {

      datesSet.add(sale.date);

    }

  });

  expensesData.forEach(exp => {

    const d = new Date(exp.date);

    if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {

      datesSet.add(exp.date);

    }

  });

  const datesArr = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));

  if (datesArr.length === 0) {

    detailsDiv.textContent = "لا توجد بيانات لهذا الشهر.";

    return;

  }

  const table = document.createElement("table");

  table.innerHTML = `

    <thead>

      <tr>

        <th>التاريخ</th>

        <th>إجمالي المبيعات</th>

        <th>إجمالي المصروفات</th>

        <th>الصافي</th>

      </tr>

    </thead>

    <tbody></tbody>

  `;

  const tbody = table.querySelector("tbody");

  datesArr.forEach(date => {

    const totalSales = salesData.filter(s => s.date === date).reduce((sum, s) => sum + s.total, 0);

    const totalExpenses = expensesData.filter(e => e.date === date).reduce((sum, e) => sum + e.amount, 0);

    const net = totalSales - totalExpenses;

    const tr = document.createElement("tr");

    tr.innerHTML = `

      <td>${date}</td>

      <td>${totalSales.toFixed(2)}</td>

      <td>${totalExpenses.toFixed(2)}</td>

      <td>${net.toFixed(2)}</td>

    `;

    tbody.appendChild(tr);

  });

  detailsDiv.appendChild(table);

  updateNetSalesTotals();

}

// تحديث إجمالي صافي المبيعات (اليومي والشهري)

function updateNetSalesTotals() {

  const today = new Date().toISOString().split("T")[0];

  const dailySales = salesData.filter(s => s.date === today)

                      .reduce((sum, s) => sum + s.total, 0);

  const dailyExpenses = expensesData.filter(e => e.date === today)

                        .reduce((sum, e) => sum + e.amount, 0);

  const dailyNet = dailySales - dailyExpenses;

  const currentMonth = new Date().getMonth();

  const monthlySales = salesData

                        .filter(s => new Date(s.date).getMonth() === currentMonth)

                        .reduce((sum, s) => sum + s.total, 0);

  const monthlyExpenses = expensesData

                           .filter(e => new Date(e.date).getMonth() === currentMonth)

                           .reduce((sum, e) => sum + e.amount, 0);

  const monthlyNet = monthlySales - monthlyExpenses;

  if (document.getElementById("dailyNetTotal"))

    document.getElementById("dailyNetTotal").textContent = `صافي المبيعات اليومية: ${dailyNet.toFixed(2)}`;

  if (document.getElementById("monthlyNetTotal"))

    document.getElementById("monthlyNetTotal").textContent = `صافي المبيعات الشهري: ${monthlyNet.toFixed(2)}`;

}

// إعداد زر القائمة الجانبية والتنقل بين الصفحات

function setupNavigation() {

  const sidebar = document.getElementById("sidebar");

  const toggleBtn = document.getElementById("toggle-btn");

  if (sidebar && toggleBtn) {

    sidebar.style.display = "none";

    toggleBtn.addEventListener("click", () => {

      if (sidebar.style.display === "none") {

        sidebar.style.display = "block";

      } else {

        sidebar.style.display = "none";

      }

    });

  }

  const sidebarItems = document.querySelectorAll("#sidebar ul li");

  sidebarItems.forEach(item => {

    if (item.getAttribute("data-page") === "account") {

      item.style.marginTop = "20px";

    }

    item.addEventListener("click", () => {

      const targetPage = item.getAttribute("data-page");

      navigateToPage(targetPage);

    });

  });

}

// التنقل بين الصفحات

function navigateToPage(pageId) {

  document.querySelectorAll(".page").forEach(page => {

    page.classList.remove("active");

  });

  const target = document.getElementById(pageId);

  if (target) target.classList.add("active");

}

