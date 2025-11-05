// Оновлення дати придбання
function displayPurchaseInfo() {
    const now = new Date();
    const options = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedDate = now.toLocaleString('uk-UA', options);
    document.getElementById('purchase-info').textContent = `Придбано ${formattedDate}`;
}

// Збільшення номера квитка
function incrementTicketNumber() {
    let ticketNumber = localStorage.getItem('ticketNumber');
    if (!ticketNumber) {
        ticketNumber = 186542; // Початкове значення
    } else {
        ticketNumber = parseInt(ticketNumber) + 1;
    }
    localStorage.setItem('ticketNumber', ticketNumber);

    // Форматуємо число з пробілом (наприклад: 186 542)
    const formattedNumber = Number(ticketNumber).toLocaleString('uk-UA');
    document.getElementById('ticket-number').textContent = formattedNumber;
}

// Таймер дії квитка
function startTimer(duration, display) {
    let timer = duration, hours, minutes, seconds;
    setInterval(function () {
        hours = Math.floor(timer / 3600);
        minutes = Math.floor((timer % 3600) / 60);
        seconds = timer % 60;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = hours + ":" + minutes + ":" + seconds;
        if (--timer < 0) {
            timer = 0;
        }
    }, 1000);
}

window.onload = function () {
    displayPurchaseInfo();
    incrementTicketNumber();
    const oneHourThirtyMin = 90 * 60; // 1 година 30 хвилин
    const display = document.querySelector('#timer');
    startTimer(oneHourThirtyMin, display);
};
