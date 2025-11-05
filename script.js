// --- КОНСТАНТЫ ---
const TICKET_DURATION_MS = 90 * 60 * 1000; // 90 минут в миллисекундах
const END_TIME_KEY = 'ticketEndTime';

// Оновлення дати придбання
function displayPurchaseInfo() {
    const now = new Date();
    // Мы не меняем эту функцию, так как она отображает только время приобретения
    const options = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedDate = now.toLocaleString('uk-UA', options);
    document.getElementById('purchase-info').textContent = `Придбано ${formattedDate}`;
}

// Збільшення номера квитка (функция не изменена)
function incrementTicketNumber() {
    let ticketNumber = localStorage.getItem('ticketNumber');
    if (!ticketNumber) {
        ticketNumber = 186542;
    } else {
        // Мы НЕ увеличиваем номер при каждом обновлении, только при первом запуске!
        // Если вы хотите, чтобы номер увеличивался только один раз, нужно добавить логику проверки.
        // Оставляем как есть, если это ваше намерение, но это увеличивает номер при каждом обновлении.
        // ticketNumber = parseInt(ticketNumber) + 1; 
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

    // 1. ПЕРВЫЙ ЗАПУСК / СТАРТ
    if (!endTime || parseInt(endTime) < now) {
        // Если конечного времени нет ИЛИ таймер уже закончился
        endTime = now + TICKET_DURATION_MS;
        localStorage.setItem(END_TIME_KEY, endTime);
        timeLeftMs = TICKET_DURATION_MS;
    } else {
        // 2. ВОЗОБНОВЛЕНИЕ
        // Таймер уже был запущен, рассчитываем оставшееся время
        timeLeftMs = parseInt(endTime) - now;
    }

    // Если время осталось (больше 0 миллисекунд)
    if (timeLeftMs > 0) {
        const intervalId = setInterval(function () {
            let totalSeconds = Math.round((parseInt(localStorage.getItem(END_TIME_KEY)) - Date.now()) / 1000);
            
            // Если время вышло, останавливаем таймер
            if (totalSeconds <= 0) {
                clearInterval(intervalId);
                displayElement.textContent = "0:00:00";
                // Очистить endTime, чтобы при следующем открытии начался новый
                localStorage.removeItem(END_TIME_KEY); 
                return;
            }

            // Форматирование времени
            let hours = Math.floor(totalSeconds / 3600);
            let minutes = Math.floor((totalSeconds % 3600) / 60);
            let seconds = totalSeconds % 60;

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            
            displayElement.textContent = hours + ":" + minutes + ":" + seconds;
        }, 1000);

        // Немедленное обновление дисплея, чтобы не ждать первую секунду
        // (Вычисляем время заново, чтобы быть уверенными)
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
    }
}

// --- ЗАПУСК ---
window.onload = function () {
    displayPurchaseInfo();
    incrementTicketNumber();
    
    const display = document.querySelector('#timer');
    startPersistentTimer(display);
};
