
class TimeSpan {
    constructor() {
        let len = arguments.length;
        let plens = TimeSpan.constructors.map((item) => item.length);
        let idx = plens.indexOf(len);
        if (idx === -1) {
            throw ("No constructor of TimeSpan supports " + len + " arguments");
        }
        // local variables
        this.ticks = 0; // total milliseconds elapsed from January 1, 1970
        // init variable by arguments.
        TimeSpan.constructors[idx].init(this, ...arguments);
    }

    equals(timespan) { return this.ticks === timespan.ticks; }
    duration() { return new TimeSpan(Math.abs(this.ticks)); }
    toString() {
        let sign = (this.ticks < 0 ? "-" : "");
        let dy = (Math.abs(this.days) ? Math.abs(this.days) + "." : "0.");
        let hr = TimeSpan.pad(Math.abs(this.hours));
        let min = TimeSpan.pad(Math.abs(this.minutes));
        let sec = TimeSpan.pad(Math.abs(this.seconds));
        let ms = TimeSpan.pad(Math.abs(this.milliseconds), 3);
        return sign + dy + hr + ":" + min + ":" + sec + "." + ms;
    }

    add(timespan) { return new TimeSpan(this.ticks + timespan.ticks); }
    subtract(timespan) { return new TimeSpan(this.ticks - timespan.ticks); }

    get days() { return Math.floor(this.ticks / (24 * 3600 * 1000)); }
    get hours() { return Math.floor((this.ticks % (24 * 3600 * 1000)) / (3600 * 1000)); }
    get minutes() { return Math.floor((this.ticks % (3600 * 1000)) / (60 * 1000)); }
    get seconds() { return Math.floor((this.ticks % 60000) / 1000); }
    get milliseconds() { return Math.floor(this.ticks % 1000); }
    get totalDays() { return this.ticks / (24 * 3600 * 1000); }
    get totalHours() { return this.ticks / (3600 * 1000); }
    get totalMinutes() { return this.ticks / (60 * 1000); }
    get totalSeconds() { return this.ticks / 1000; }
    get totalMilliseconds() { return this.ticks; }

    static fromDays(days) { return new TimeSpan(days, 0); }
    static fromHours(hours) { return new TimeSpan(0, hours); }
    static fromMinutes(minutes) { return new TimeSpan(0, minutes, 0); }
    static fromSeconds(seconds) { return new TimeSpan(0, 0, seconds); }
}

TimeSpan.constructors = [
    {
        length: 0,
        init: (ts) => {
            ts.ticks = 0;
        }
    },
    {
        length: 1,
        init: (ts, milliseconds) => {
            ts.ticks = milliseconds;
        }
    },
    {
        length: 2,
        init: (ts, days, hours) => {
            ts.ticks = (days * 86400 + hours * 3600) * 1000;
            console.log(ts.ticks)
        }
    },
    {
        length: 3,
        init: (ts, hours, minutes, seconds) => {
            ts.ticks = (hours * 3600 + minutes * 60 + seconds) * 1000;
        }
    },
    {
        length: 4,
        init: (ts, days, hours, minutes, seconds) => {
            ts.ticks = (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000;
        }
    },
    {
        length: 5,
        init: (ts, days, hours, minutes, seconds, milliseconds) => {
            ts.ticks = (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
        }
    }
];

TimeSpan.pad = (number, len = 2) => String(number).padStart(len, "0")

TimeSpan.test = () => {
    let ts;
    // milliseconds
    ts = new TimeSpan(999);
    console.log('TimeSpan(999): ', ts.toString());
    // days/hours
    ts = new TimeSpan(1, 1);
    console.log('TimeSpan(1, 1): ', ts.toString());
    // days/hours/minutes/seconds
    ts = new TimeSpan(1, 1, 1, 1);
    console.log('TimeSpan(1, 1, 1, 1): ', ts.toString());
    // days/hours/minutes/seconds/milliseconds
    ts = new TimeSpan(0, 23, 59, 59, 1000);
    console.log('TimeSpan(0, 23, 59, 59, 1000): ', ts.toString());
    console.log('totalDays:', ts.totalDays);
    console.log('totalHours:', ts.totalHours);
    console.log('totalMinutes:', ts.totalMinutes);
    console.log('totalSeconds:', ts.totalSeconds);
    console.log('totalMilliseconds:', ts.totalMilliseconds);
}

//TimeSpan.test();

class DateTime {
    constructor() {
        let len = arguments.length;
        let plens = DateTime.constructors.map((item) => item.length);
        let idx = plens.indexOf(len);

        if (idx === -1) {
            throw ("No constructor of DateTime supports " + len + " arguments");
        }

        // local variables.
        this.span = new TimeSpan();
        // init variable by arguments.
        DateTime.constructors[idx].init(this, ...arguments);
        // keep Date object value.
        this.value = new Date(this.span.ticks);
    }
    add(timespan) {
        return new DateTime(this.span.ticks + timespan.ticks);
    }
    addYears(years) {
        return new DateTime(this.year + years, this.month, this.day,
            this.hour, this.minute, this.second, this.millisecond);
    }
    addMonths(months, autoCalcDays) {
        let y = this.year;
        let m = this.month;
        let r = DateTime.calcAddMonthDays(y, m, months);
        let ret;
        if (autoCalcDays) {
            ret = this.addDays(r.days);
        }
        else {
            let endOfMonth = DateTime.daysInMonth(r.year, r.month);
            let newday = (this.isEndOfMonth) ? endOfMonth : this.day;

            ret = new DateTime(
                r.year, r.month, newday,
                this.hour, this.minute, this.second,
                this.millisecond);
        }
        return ret;
    }
    addDays(days) {
        return new DateTime(this.span.ticks + ((days * 86400) * 1000));
    }
    addHours(hours) {
        return new DateTime(this.span.ticks + ((hours * 3600) * 1000));
    }
    addMinutes(minutes) {
        return new DateTime(this.span.ticks + ((minutes * 60) * 1000));
    }
    addSeconds(seconds) {
        return new DateTime(this.span.ticks + (seconds * 1000));
    }
    addMilliseconds(milliseconds) {
        return new DateTime(this.span.ticks + milliseconds);
    }

    get year() { return this.value.getFullYear(); }
    get month() { return this.value.getMonth() + 1; }
    get day() { return this.value.getDate(); }
    get dayOfWeek() { return this.value.getDay(); }
    get hour() { return this.value.getHours(); }
    get minute() { return this.value.getMinutes(); }
    get second() { return this.value.getSeconds(); }
    get millisecond() { return this.value.getMilliseconds(); }
    get isEndOfMonth() {
        let ret = (DateTime.daysInMonth(this.year, this.month) === this.day);
        return ret;
    }

    format(mask, locale = DateTime.LocaleSettings) {
        const token = /d{1,4}|M{1,4}|y{1,4}|([Hhms])\1?|tt|[Ll]|"[^"]*"|'[^']*'/g
        const d = this.day;
        const D = this.dayOfWeek;
        const M = this.month;
        const y = this.year;
        const H = this.hour;
        const m = this.minute;
        const s = this.second;
        const L = this.millisecond;
        const flags = {
            d,
            dd: DateTime.pad(d),
            ddd: locale.abbreviatedDayNames[D],
            dddd: locale.dayNames[D],
            M,
            MM: DateTime.pad(M),
            MMM: locale.abbreviatedMonthNames[M - 1],
            MMMM: locale.monthNames[M - 1],
            y: Number(String(y).slice(2)),
            yy: String(y).slice(2),
            yyy: DateTime.pad(y, 3),
            yyyy: DateTime.pad(y, 4),
            h: H % 12 || 12,
            hh: DateTime.pad(H % 12 || 12),
            H,
            HH: DateTime.pad(H),
            m,
            mm: DateTime.pad(m),
            s,
            ss: DateTime.pad(s),
            l: DateTime.pad(L, 3),
            L: DateTime.pad(L > 99 ? Math.round(L / 10) : L),
            tt: H < 12 ? "AM" : "PM",
        };
        return mask.replace(token, ($0) => {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1)
        });
    }
    valueOf() {
        return this.span.ticks;
    }
    toString(format = "yyyy-MM-dd HH:mm:ss.l") {
        let fmt = (format) ? format : "yyyy-MM-dd HH:mm:ss.l";
        return this.format(fmt);
    }

    static get now() { return new DateTime(Date.now()) }

    static isLeapYear(year) {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
    }
    static isValidMonth(month) { return (month > 0 && month <= 12); }
    static isValidDayInMonth(year, month, day) {
        let ret = true;
        let maxDay = DateTime.daysInMonth(year, month);
        if (day <= 0 || day > maxDay) ret = false;
        return ret;
    }
    static daysInMonth(year, month) {
        let leap = DateTime.isLeapYear(year);
        let ret = DateTime.monthDays[month - 1];
        if (month === 2 && leap) ret = 29; // leap year Feb has 29 days.
        return ret;
    }
}

DateTime.constructors = [
    {
        length: 0,
        init: () => { }
    },
    {
        length: 1,
        init: (dt, millisecond) => { dt.span = new TimeSpan(millisecond); }
    },
    {
        length: 3,
        init: (dt, year, month, day) => {
            if (!DateTime.isValidMonth(month) ||
                !DateTime.isValidDayInMonth(year, month, day)) {
                throw (`Invalid Date in ctor(3): (year: ${year}, month: ${month}, day: ${day})`);
            }
            let d = new Date(year, month - 1, day);
            dt.span = new TimeSpan(d.getTime());
        }
    },
    {
        length: 6,
        init: (dt, year, month, day, hour, minute, second) => {
            if (!DateTime.isValidMonth(month) ||
                !DateTime.isValidDayInMonth(year, month, day)) {
                throw (`Invalid Date in ctor(6): (year: ${year}, month: ${month}, day: ${day})`);
            }
            let d = new Date(year, month - 1, day, hour, minute, second);
            dt.span = new TimeSpan(d.getTime());
        }
    },
    {
        length: 7,
        init: (dt, year, month, day, hour, minute, second, millisecond) => {
            if (!DateTime.isValidMonth(month) ||
                !DateTime.isValidDayInMonth(year, month, day)) {
                throw (`Invalid Date in ctor(7): (year: ${year}, month: ${month}, day: ${day})`);
            }
            let d = new Date(year, month - 1, day, hour, minute, second, millisecond);
            dt.span = new TimeSpan(d.getTime());
        }
    }
]

DateTime.monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

DateTime.getAddedDays = (currYear, currMonth, addMonths) => {
    let yr = currYear;
    let mn = currMonth;
    let months = addMonths;
    let days = 0;
    for (let i = 0; i < months; i++) {
        if (mn + 1 > 12) {
            mn = 1;
            yr++;
        }
        days += DateTime.daysInMonth(yr, mn);
        mn++;
    }
    let r = { year: yr, month: mn, days: days };
    return r;
}
DateTime.getRemovedDays = (currYear, currMonth, removeMonths) => {
    let yr = currYear;
    let mn = currMonth;
    let months = -1 * removeMonths;
    let days = 0;
    for (let i = 0; i < months; i++) {
        if (mn - 1 <= 0) {
            mn = 12;
            yr--;
        }
        days += DateTime.daysInMonth(yr, mn);
        mn--;
    }
    let r = { year: yr, month: mn, days: -1 * days };
    return r;
}
DateTime.calcAddMonthDays = (currYear, currMonth, months) => {
    let add = DateTime.getAddedDays;
    let rem = DateTime.getRemovedDays;
    let y = currYear;
    let m = currMonth;
    let r = (months >= 0) ? add(y, m, months) : rem(y, m, months);
    return r;
}

DateTime.pad = (number, len = 2) => String(number).padStart(len, "0")
// EN Locale settings.
DateTime.LocaleSettings = {
    dateCompsOrder: "mdy",
    minSupportedDate: "0000-01-01T00:00:00.000Z",
    maxSupportedDate: "9999-12-31T23:59:59.999Z",
    abbreviatedDayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
    ],
    monthNames: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ],
    abbreviatedMonthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    dayNames: [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ],
    shortDateTimePattern: "M/d/yyyy h:mm tt",
    abbreviatedDatePattern: "d MMM yyyy",
    abbreviatedShortDatePattern: "d MMM yyyy",
    shortDatePattern: "M/d/yyyy",
    shortestDatePattern: "M/d/yy",
    abbreviatedMonthDayPattern: "d MMM",
    shortMonthDayPattern: "M/d",
    shortTimePattern: "h:mm tt",
    twoDigitYearMax: 2029,

    humanizeFormats: {
        full: {
            dateDaysAgo: "{0} days|ago",
            dateInDays: "in {0}|days",
            dateInWeek: "in a|week",
            dateTimeAndZone: "{0} ({1})",
            dateTimeCombined: "{0}, {1}",
            dateToday: "today",
            dateTomorrow: "tomorrow",
            dateWeekAgo: "a week|ago",
            dateYesterday: "yesterday",
            dimeInSeconds: "in {0}|seconds",
            timeHourAgo: "an hour|ago",
            timeHoursAgo: "{0} hours|ago",
            timeInHour: "in an|hour",
            timeInHours: "in {0}|hours",
            timeInMinute: "in a|minute",
            timeInMinutes: "in {0}|minutes",
            timeInSecond: "in a|second",
            timeInSeconds: "in {0}|seconds",
            timeMinuteAgo: "a minute|ago",
            timeMinutesAgo: "{0} minutes|ago",
            timeSecondAgo: "a second|ago",
            timeSecondsAgo: "{0} seconds|ago",
        },

        short: {
            dateDaysAgo: "{0}d|ago",
            dateInDays: "in|{0}d",
            dateInWeek: "in a|week",
            dateTimeAndZone: "{0} ({1})",
            dateTimeCombined: "{0}, {1}",
            dateToday: "today",
            dateTomorrow: "tomorrow",
            dateWeekAgo: "a week|ago",
            dateYesterday: "yesterday",
            timeHourAgo: "1h|ago",
            timeHoursAgo: "{0}h|ago",
            timeInHour: "in|1h",
            timeInHours: "in|{0}h",
            timeInMinute: "in|1m",
            timeInMinutes: "in|{0}m",
            timeInSecond: "in|1s",
            timeInSeconds: "in|{0}s",
            timeMinuteAgo: "1m|ago",
            timeMinutesAgo: "{0}m|ago",
            timeSecondAgo: "1s|ago",
            timeSecondsAgo: "{0}s|ago",
        },
    },

    rangeFormats: {
        dateTimeFromFormat: "from {0} {1}",
        dateTimeToFormat: "to {0} {1}",
        dateTimeRangeFormat: "from {0} to {1} {2}",
        timeFromFormat: "from {0} {1}",
        timeToFormat: "to {0} {1}",
        timeRangeFormat: "from {0} to {1} {2}",
    },
}

DateTime.test = () => {
    let dt;

    dt = DateTime.now;
    console.log('now:', dt)
    console.log('now:', dt.toString("yyyy-MM-dd HH:mm:ss.l"))
    /*
    dt = new DateTime(2019, 7, 5)
    console.log('DateTime(2019, 7, 5):', dt)

    dt = new DateTime(2019, 7, 5, 23, 59, 59)
    console.log('DateTime(2019, 7, 5, 23, 59, 59):', dt)

    //dt = new DateTime(2100, 2, 29, 23, 59, 59) //! invalid date
    //console.log('DateTime(2019, 13, 5, 23, 59, 59):', dt)

    dt = new DateTime(2019, 7, 5, 23, 59, 59, 999)
    console.log('DateTime(2019, 7, 5, 23, 59, 59, 999):', dt)

    console.log('year:', dt.year)
    console.log('Is Leap Year:', DateTime.isLeapYear(dt.year))
    console.log('month:', dt.month)
    console.log('day:', dt.day)
    console.log('dayOfWeek:', dt.dayOfWeek)
    console.log('hour:', dt.hour)
    console.log('minute:', dt.minute)
    console.log('second:', dt.second)
    console.log('millisecond:', dt.millisecond)

    console.log('day in (2019/2):', DateTime.daysInMonth(2019, 2))
    console.log('day in (2020/2):', DateTime.daysInMonth(2020, 2))
    console.log('day in (2000/2):', DateTime.daysInMonth(2000, 2))
    console.log('day in (2100/2):', DateTime.daysInMonth(2100, 2))

    dt = new DateTime(2019, 7, 5, 23, 59, 59, 999)
    //dt = dt.addMilliseconds(1)
    //dt = dt.addMilliseconds(-1)
    //dt = dt.addSeconds(1)
    //dt = dt.addSeconds(-1)
    //dt = dt.addMinutes(1);
    //dt = dt.addMinutes(-1);
    //dt = dt.addHours(1);
    //dt = dt.addHours(-1);
    //dt = dt.addDays(1);
    //dt = dt.addDays(-1);
    
    console.log('year:', dt.year)
    console.log('month:', dt.month)
    console.log('day:', dt.day)
    console.log('hour:', dt.hour)
    console.log('minute:', dt.minute)
    console.log('second:', dt.second)
    console.log('millisecond:', dt.millisecond)
    
    dt = new DateTime(2104, 4, 30)
    console.log('year:', dt.year)
    console.log('month:', dt.month)
    console.log('day:', dt.day)
    dt = dt.addMonths(2);
    console.log('year:', dt.year)
    console.log('month:', dt.month)
    console.log('day:', dt.day)
    
    dt = new DateTime(2104, 4, 30)
    console.log('year:', dt.year)
    console.log('month:', dt.month)
    console.log('day:', dt.day)
    dt = dt.addYears(-100);
    console.log('year:', dt.year)
    console.log('month:', dt.month)
    console.log('day:', dt.day)
    */
};

//DateTime.test();
