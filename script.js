// --- КОНСТАНТЫ И КЛЮЧИ LOCAL STORAGE ---
const TICKET_DURATION_MS = 90 * 60 * 1000; // 90 минут в миллисекундах
const END_TIME_KEY = 'ticketEndTime';
const RELOAD_COUNT_KEY = 'ticketReloadCount';
const MAX_RELOADS = 3; // Максимальное количество обновлений для сброса
const TICKET_NUMBER_KEY = 'ticketNumber'; // Ключ для номера билета

// Оновлення дати придбання (Без изменений)
function displayPurchaseInfo() {
    const now = new Date();
    const options = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedDate = now.toLocaleString('uk-UA', options);
    document.getElementById('purchase-info').textContent = `Придбано ${formattedDate}`;
}

// Збільшення номера квитка
function incrementTicketNumber() {
    let currentNumber = localStorage.getItem(TICKET_NUMBER_KEY);
    let newNumber;

    if (!currentNumber) {
        // Если это первый запуск или полный сброс
        newNumber = 186542; // Устанавливаем начальное значение
    } else {
        // Если номер уже был, увеличиваем его на 1
        newNumber = parseInt(currentNumber) + 1;
    }
    
    localStorage.setItem(TICKET_NUMBER_KEY, newNumber);

    // Форматуємо число з пробілом (наприклад: 186 543)
    const formattedNumber = Number(newNumber).toLocaleString('uk-UA');
    document.getElementById('ticket-number').textContent = formattedNumber;
}

// --- ЛОГИКА ТАЙМЕРА ---
function startPersistentTimer(displayElement) {
    let endTime = localStorage.getItem(END_TIME_KEY);
    let now = Date.now();
    let timeLeftMs;
    let reloadCount = parseInt(localStorage.getItem(RELOAD_COUNT_KEY) || 0);

    // 3. ПРОВЕРКА НА ПОЛНЫЙ СБРОС (Reset Check)
    if (reloadCount >= MAX_RELOADS) {
        // Достигнуто 3 обновления -> ПОЛНЫЙ СБРОС
        localStorage.removeItem(END_TIME_KEY);
        localStorage.removeItem(RELOAD_COUNT_KEY);
        localStorage.removeItem(TICKET_NUMBER_KEY); // <-- ВАЖНО: Сброс номера билета
        location.reload(); 
        return; 
    }

    // 1. ИНИЦИАЛИЗАЦИЯ / ПЕРВЫЙ ЗАПУСК
    if (!endTime || parseInt(endTime) < now) {
        // Устанавливаем новый таймер
        endTime = now + TICKET_DURATION_MS;
        localStorage.setItem(END_TIME_KEY, endTime);
        localStorage.setItem(RELOAD_COUNT_KEY, 0); // Обнуляем счетчик
        timeLeftMs = TICKET_DURATION_MS;
    } else {
        // 2. ВОЗОБНОВЛЕНИЕ СЧЕТА С ПОТЕРЕЙ
        
        // Увеличиваем счетчик обновлений
        localStorage.setItem(RELOAD_COUNT_KEY, reloadCount + 1);

        // Расчет оставшегося времени с учетом времени, которое прошло пока вкладка была неактивна
        timeLeftMs = parseInt(endTime) - now;
    }

    // --- ФУНКЦИЯ ТИКЕРА ---
    if (timeLeftMs > 0) {
        const intervalId = setInterval(function () {
            let totalSeconds = Math.round((parseInt(localStorage.getItem(END_TIME_KEY)) - Date.now()) / 1000);
            
            // Если время вышло, останавливаем таймер
            if (totalSeconds <= 0) {
                clearInterval(intervalId);
                displayElement.textContent = "0:00:00";
                // Очистить все ключи
                localStorage.removeItem(END_TIME_KEY);
                localStorage.removeItem(RELOAD_COUNT_KEY);
                localStorage.removeItem(TICKET_NUMBER_KEY);
                return;
            }

            // Форматирование
            let hours = Math.floor(totalSeconds / 3600);
            let minutes = Math.floor((totalSeconds % 3600) / 60);
            let seconds = totalSeconds % 60;

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            
            displayElement.textContent = hours + ":" + minutes + ":" + seconds;
        }, 1000);

        // Немедленное обновление дисплея
        let totalSeconds = Math.round(timeLeftMs / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        displayElement.textContent = hours + ":" + minutes + ":" + seconds;

    } else {
        // Если времени не осталось
        displayElement.textContent = "0:00:00";
        localStorage.removeItem(END_TIME_KEY);
        localStorage.removeItem(RELOAD_COUNT_KEY);
        localStorage.removeItem(TICKET_NUMBER_KEY);
    }
}

// --- ЗАПУСК ---
window.onload = function () {
    // ВАЖНО: incrementTicketNumber вызывается ДО startPersistentTimer
    // Это гарантирует, что номер билета увеличится ПЕРЕД проверкой сброса
    incrementTicketNumber();
    displayPurchaseInfo();
    
    const display = document.querySelector('#timer');
    startPersistentTimer(display);
};
