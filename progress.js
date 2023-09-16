function countNonWeekdays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;

    // Loop through each day in the range and count weekends (Saturday and Sunday)
    while (startDate <= endDate) {
        const dayOfWeek = startDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            count++; // Weekend day
        }
        startDate.setDate(startDate.getDate() + 1); // Move to the next day
    }

    return count;
}

function exceptionDayCount(exceptions, only_weekdays) {
    let totalCount = 0;

    exceptions.forEach((exception) => {
        if (typeof exception === "string") {
            totalCount += 1;
        } else if (typeof exception === "object" && exception.from && exception.to) {
            const daysBetween = (new Date(exception.to) - new Date(exception.from)) / (24 * 60 * 60 * 1000) + 1;
            if (only_weekdays) {
                totalCount += daysBetween - countNonWeekdays(exception.from, exception.to);
            } else {
                // Count the days between "from" and "to" regardless of weekends
                totalCount += daysBetween;
            }
        }
    });

    return totalCount;
}

function getProgress(start, end, only_weekdays, exceptions) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const currentDate = new Date();

    // Check if currentDate is a weekendDay and if only_weekdays is true, if so set currentDate to the next monday 00:00:00
    if (only_weekdays && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        currentDate.setDate(currentDate.getDate() + (8 - currentDate.getDay()));
        currentDate.setHours(0, 0, 0, 0);
    }

    // Calc days from start to end
    const total = (endDate - startDate) - exceptionDayCount(exceptions, only_weekdays) * (24 * 60 * 60 * 1000) - (countNonWeekdays(start, end) * only_weekdays) * (24 * 60 * 60 * 1000);

    // Calc days from start to current date
    let exceptionDaysSinceStart = 0;
    for (exception of exceptions) {
        if (typeof exception === "string") {
            const exceptDate = new Date(exception);
            if (exceptDate <= currentDate) exceptionDaysSinceStart++;
        } else {
            const exceptionStart = new Date(exception.from);
            let exceptionEnd = new Date(exception.to);
            if (exceptionStart > currentDate) continue;
            if (exceptionEnd > currentDate) exceptionEnd = currentDate;
            exceptionDaysSinceStart += (exceptionEnd - exceptionStart) / (24 * 60 * 60 * 1000) + 1;
            if (only_weekdays) {
                exceptionDaysSinceStart -= countNonWeekdays(exception.from, exception.to);
            }
        }
    }
    const exceptionsSinceStart = exceptionDaysSinceStart * (24 * 60 * 60 * 1000);
    const weekendDaysSinceStart = countNonWeekdays(start, currentDate);
    let sinceStart = currentDate - startDate - exceptionsSinceStart - (weekendDaysSinceStart * only_weekdays) * (24 * 60 * 60 * 1000);

    if (sinceStart < 0) {
        return 0;
    }

    if (sinceStart > total) {
        return 100;
    }

    return (sinceStart / total * 100);
}

