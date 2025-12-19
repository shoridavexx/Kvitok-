// --- КОНСТАНТЫ И КЛЮЧИ LOCAL STORAGE ---
const TICKET_DURATION_MS = 90 * 60 * 1000; // 90 минут в миллисекундах
const END_TIME_KEY = 'ticketEndTime';
const RELOAD_COUNT_KEY = 'ticketReloadCount';
const MAX_RELOADS = 3; // Максимальное количество обновлений для сброса

// Оновлення дати придбання (Без изменений)
function displayPurchaseInfo() {
    const now = new Date();
    const options = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedDate = now.toLocaleString('uk-UA', options);
    document.getElementById('purchase-info').textContent = `Придбано ${formattedDate}`;
}

// Збільшення номера квитка (Вы просили оставить, без изменений)
function incrementTicketNumber() {
    let ticketNumber = localStorage.getItem('ticketNumber');
    
    if (!ticketNumber) {
        // Якщо квитка ще немає в пам'яті, встановлюємо початкове значення
        ticketNumber = 236542; 
    } else {
        // Якщо квиток є, перетворюємо його на число і додаємо 1
        ticketNumber = parseInt(ticketNumber) + 1;
    } 
    
    // Зберігаємо вже оновлене значення назад у LocalStorage
    localStorage.setItem('ticketNumber', ticketNumber);
    
    // Форматуємо число (додаємо пробіли для тисяч) і виводимо на екран
    const formattedNumber = Number(ticketNumber).toLocaleString('uk-UA');
    document.getElementById('ticket-number').textContent = formattedNumber;
}
    
    localStorage.setItem('ticketNumber', ticketNumber);
    const formattedNumber = Number(ticketNumber).toLocaleString('uk-UA');
    document.getElementById('ticket-number').textContent = formattedNumber;
}

// --- НОВАЯ ЛОГИКА ТАЙМЕРА ---
function startPersistentTimer(displayElement) {
    let endTime = localStorage.getItem(END_TIME_KEY);
    let now = Date.now();
    let timeLeftMs;
    let reloadCount = parseInt(localStorage.getItem(RELOAD_COUNT_KEY) || 0);

    // 3. ПРОВЕРКА НА ПОЛНЫЙ СБРОС (Reset Check)
    if (reloadCount >= MAX_RELOADS) {
        // Достигнуто 3 обновления -> полный сброс билета
        localStorage.removeItem(END_TIME_KEY);
        localStorage.removeItem(RELOAD_COUNT_KEY);
        // Перезагружаем страницу, чтобы запустить таймер с нуля
        location.reload(); 
        return; 
    }

    // 1. ИНИЦИАЛИЗАЦИЯ / ПЕРВЫЙ ЗАПУСК
    if (!endTime || parseInt(endTime) < now) {
        // Конечного времени нет ИЛИ таймер уже закончился
        endTime = now + TICKET_DURATION_MS;
        localStorage.setItem(END_TIME_KEY, endTime);
        localStorage.setItem(RELOAD_COUNT_KEY, 0); // Обнуляем счетчик при новом билете
        timeLeftMs = TICKET_DURATION_MS;
    } else {
        // 2. ВОЗОБНОВЛЕНИЕ СЧЕТА С ПОТЕРЕЙ (Resume with Loss)
        // Таймер был запущен, рассчитываем оставшееся время
        
        // Увеличиваем счетчик обновлений
        localStorage.setItem(RELOAD_COUNT_KEY, reloadCount + 1);

        // Расчет оставшегося времени с учетом времени, которое прошло пока вкладка была неактивна
        timeLeftMs = parseInt(endTime) - now;
    }

    // --- ФУНКЦИЯ ТИКЕРА ---
    if (timeLeftMs > 0) {
        const intervalId = setInterval(function () {
            // Фактическое оставшееся время всегда рассчитывается от абсолютного END_TIME
            let totalSeconds = Math.round((parseInt(localStorage.getItem(END_TIME_KEY)) - Date.now()) / 1000);
            
            // Если время вышло, останавливаем таймер
            if (totalSeconds <= 0) {
                clearInterval(intervalId);
                displayElement.textContent = "0:00:00";
                // Очистить все ключи, чтобы при следующем открытии начался новый билет
                localStorage.removeItem(END_TIME_KEY);
                localStorage.removeItem(RELOAD_COUNT_KEY);
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
    }
}

// --- ЗАПУСК ---
window.onload = function () {
    displayPurchaseInfo();
    incrementTicketNumber();
    
    const display = document.querySelector('#timer');
    startPersistentTimer(display);
};

