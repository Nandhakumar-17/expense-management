document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------
    // 1. Authentication Check
    // -----------------------------------------
    const isLoggedIn = localStorage.getItem('expenseTrackerLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('expenseTrackerLoggedIn');
        window.location.href = 'login.html';
    });

    // -----------------------------------------
    // 2. DOM Elements
    // -----------------------------------------
    const balance = document.getElementById('balance');
    const money_plus = document.getElementById('money-plus');
    const money_minus = document.getElementById('money-minus');
    const list = document.getElementById('list');
    const form = document.getElementById('transaction-form');
    const text = document.getElementById('text');
    const category = document.getElementById('category');
    const amount = document.getElementById('amount');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const warningBanner = document.getElementById('warning-banner');
    const closeWarningBtn = document.getElementById('close-warning');

    const monthYearDisplay = document.getElementById('month-year-display');
    const calendarDays = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    const viewDailyBtn = document.getElementById('view-daily');
    const viewMonthlyBtn = document.getElementById('view-monthly');
    const exportCsvBtn = document.getElementById('export-csv');

    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Theme Init
    if (localStorage.getItem('expenseTrackerTheme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('expenseTrackerTheme', 'dark');
            themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        } else {
            localStorage.setItem('expenseTrackerTheme', 'light');
            themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        }
    });

    // -----------------------------------------
    // 3. State Management
    // -----------------------------------------
    // Data structure: { "2023-10-15": [{id: 1, text: "Food", amount: -20, type: "expense", category: "Food"}] }
    let transactionsData = JSON.parse(localStorage.getItem('expenseTrackerData')) || {};

    let currentDate = new Date(); // Tracks the calendar month being viewed
    let selectedDateString = formatDate(new Date()); // The specific day selected by user
    let viewMode = 'daily'; // 'daily' or 'monthly'

    let chartInstance = null; // Store chart reference to destroy/recreate
    let categoryChartInstance = null;

    // -----------------------------------------
    // 4. Utility Functions
    // -----------------------------------------
    function formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    function generateID() {
        return Math.floor(Math.random() * 100000000);
    }

    // -----------------------------------------
    // 5. Calendar Logic
    // -----------------------------------------
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        // Clear previous days
        calendarDays.innerHTML = '';

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots before 1st day
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('calendar-day', 'empty');
            calendarDays.appendChild(emptyDiv);
        }

        const todayStr = formatDate(new Date());

        // Fill days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = i;

            const thisDateStr = formatDate(new Date(year, month, i));

            if (thisDateStr === todayStr) {
                dayDiv.classList.add('today');
            }
            if (thisDateStr === selectedDateString) {
                dayDiv.classList.add('selected');
            }
            if (transactionsData[thisDateStr] && transactionsData[thisDateStr].length > 0) {
                dayDiv.classList.add('has-data');
            }

            dayDiv.addEventListener('click', () => {
                selectedDateString = thisDateStr;
                viewMode = 'daily';
                updateViewToggles();
                renderCalendar(); // Re-render to update selected class
                updateUI();
            });

            calendarDays.appendChild(dayDiv);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        if (viewMode === 'monthly') updateUI();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        if (viewMode === 'monthly') updateUI();
    });

    // -----------------------------------------
    // 6. Transaction Logic & UI Updates
    // -----------------------------------------

    function getMonthlyTransactions() {
        const year = currentDate.getFullYear();
        let month = '' + (currentDate.getMonth() + 1);
        if (month.length < 2) month = '0' + month;
        const prefix = `${year}-${month}`;

        let monthlyTransactions = [];
        for (const date in transactionsData) {
            if (date.startsWith(prefix)) {
                // Add date to each transaction for display
                const withDate = transactionsData[date].map(t => ({ ...t, date: date }));
                monthlyTransactions = monthlyTransactions.concat(withDate);
            }
        }
        return monthlyTransactions;
    }

    // Get transactions based on current view (daily or monthly)
    function getActiveTransactions() {
        if (viewMode === 'daily') {
            return transactionsData[selectedDateString] || [];
        } else {
            // Monthly view
            return getMonthlyTransactions();
        }
    }

    function addTransactionDOM(transaction) {
        const sign = transaction.type === 'expense' ? '-' : '+';
        const item = document.createElement('li');

        item.classList.add(transaction.type === 'expense' ? 'minus' : 'plus');

        let dateHtml = '';
        if (viewMode === 'monthly' && transaction.date) {
            dateHtml = `<span class="list-item-date">${transaction.date}</span>`;
        }

        let catHtml = '';
        if (transaction.category) {
            catHtml = `<span class="list-item-cat">${transaction.category}</span>`;
        }

        item.innerHTML = `
            <div class="list-item-info">
                <div>${transaction.text} ${catHtml}</div>
                ${dateHtml}
            </div>
            <span>${sign}₹${Math.abs(transaction.amount).toFixed(2)}</span>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id}, '${transaction.date || selectedDateString}')">x</button>
        `;

        list.appendChild(item);
    }

    function updateValues() {
        // ALWAYS use monthly transactions for the upper summary cards and charts to 'carry' the income/expenses over the month
        const transactions = getMonthlyTransactions();

        const amounts = transactions.map(transaction =>
            transaction.type === 'expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount)
        );

        const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

        const income = amounts
            .filter(item => item > 0)
            .reduce((acc, item) => (acc += item), 0)
            .toFixed(2);

        const expense = (
            amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1
        ).toFixed(2);

        balance.innerText = `₹${total}`;
        money_plus.innerText = `+₹${income}`;
        money_minus.innerText = `-₹${expense}`;

        checkWarnings(income, expense);
        renderChart(income, expense);
        renderCategoryChart(transactions);
    }

    function checkWarnings(income, expense) {
        // Show warning if expenses are > 80% of income, AND expense > 0
        const inc = parseFloat(income);
        const exp = parseFloat(expense);

        if (exp > 0 && inc > 0 && exp >= (inc * 0.8)) {
            warningBanner.classList.remove('hidden');
        } else {
            warningBanner.classList.add('hidden');
        }
    }

    closeWarningBtn.addEventListener('click', () => {
        warningBanner.classList.add('hidden');
    });

    function updateUI() {
        list.innerHTML = '';
        const transactions = getActiveTransactions();

        if (transactions.length === 0) {
            list.innerHTML = `<li class="empty-state">No transactions for this ${viewMode === 'daily' ? 'day' : 'month'}.</li>`;
        } else {
            transactions.forEach(addTransactionDOM);
        }

        updateValues();

        if (viewMode === 'daily') {
            selectedDateDisplay.textContent = `For: ${selectedDateString}`;
        } else {
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            selectedDateDisplay.textContent = `For: ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
    }

    function updateViewToggles() {
        if (viewMode === 'daily') {
            viewDailyBtn.classList.add('active');
            viewMonthlyBtn.classList.remove('active');
        } else {
            viewMonthlyBtn.classList.add('active');
            viewDailyBtn.classList.remove('active');
        }
    }

    viewDailyBtn.addEventListener('click', () => {
        viewMode = 'daily';
        updateViewToggles();
        updateUI();
    });

    viewMonthlyBtn.addEventListener('click', () => {
        viewMode = 'monthly';
        updateViewToggles();
        updateUI();
    });

    // -----------------------------------------
    // 7. Add & Remove Transactions
    // -----------------------------------------
    function addTransaction(e) {
        e.preventDefault();

        if (text.value.trim() === '' || amount.value.trim() === '' || !category.value) {
            alert('Please add a text, select a category and add an amount');
            return;
        }

        const typeInput = document.querySelector('input[name="type"]:checked').value;

        const transaction = {
            id: generateID(),
            text: text.value,
            category: category.value,
            amount: +amount.value,
            type: typeInput
        };

        // Add to the specific selected date structure
        if (!transactionsData[selectedDateString]) {
            transactionsData[selectedDateString] = [];
        }
        transactionsData[selectedDateString].push(transaction);

        updateLocalStorage();

        // If we are in monthly view and just added something, we might want to switch back to daily
        // or just stay and update. Let's stay and update.

        updateUI();
        renderCalendar(); // To update the dot indicator if it's the first item

        text.value = '';
        amount.value = '';
        category.value = '';
    }

    exportCsvBtn.addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,Date,Type,Category,Description,Amount\n";

        for (const [date, transactions] of Object.entries(transactionsData)) {
            transactions.forEach(t => {
                const row = [date, t.type, t.category || "None", `"${t.text}"`, Math.abs(t.amount)].join(",");
                csvContent += row + "\n";
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "expense_tracker_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Making removeTransaction global so the inline onclick can reach it
    window.removeTransaction = function (id, dateContext) {
        // Target specific date array
        if (transactionsData[dateContext]) {
            transactionsData[dateContext] = transactionsData[dateContext].filter(transaction => transaction.id !== id);

            // Clean up empty days
            if (transactionsData[dateContext].length === 0) {
                delete transactionsData[dateContext];
            }

            updateLocalStorage();
            updateUI();
            renderCalendar();
        }
    }

    function updateLocalStorage() {
        localStorage.setItem('expenseTrackerData', JSON.stringify(transactionsData));
    }

    form.addEventListener('submit', addTransaction);

    // -----------------------------------------
    // 8. Chart.js Integration
    // -----------------------------------------
    function renderChart(income, expense) {
        const ctx = document.getElementById('expenseChart');
        if (!ctx) return;

        const inc = parseFloat(income);
        const exp = parseFloat(expense);

        // Don't render empty charts if both are 0
        if (inc === 0 && exp === 0) {
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
            return;
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    data: [inc, exp],
                    backgroundColor: [
                        '#10b981', // Success Green
                        '#ef4444'  // Danger Red
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#64748b',
                            font: { family: 'Inter' }
                        }
                    }
                }
            }
        });
    }

    function renderCategoryChart(transactions) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        // Group only expenses by category
        const expenseData = transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};

        expenseData.forEach(t => {
            const cat = t.category || 'Other Expense';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        if (labels.length === 0) {
            if (categoryChartInstance) {
                categoryChartInstance.destroy();
                categoryChartInstance = null;
            }
            return;
        }

        if (categoryChartInstance) {
            categoryChartInstance.destroy();
        }

        const backgroundColors = [
            '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'
        ];

        categoryChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#64748b',
                            font: { family: 'Inter' }
                        }
                    }
                }
            }
        });
    }

    // -----------------------------------------
    // 9. Init Init Init
    // -----------------------------------------
    renderCalendar();
    updateUI();
});
