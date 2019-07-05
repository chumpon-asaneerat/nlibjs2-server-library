let __DateTimeUtils = { };

__DateTimeUtils.isLeapYear = (year) => {
    return (((year % 4 === 0) && (year % 100 !== 0) ) || (year % 400 === 0))
}
// constants for days in month.
__DateTimeUtils.monthDays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
__DateTimeUtils.monthDaysLeapYear = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

__DateTimeUtils.getMonthArray = (year) => {
    return !__DateTimeUtils.isLeapYear(year) ? 
        __DateTimeUtils.monthDays : __DateTimeUtils.monthDaysLeapYear;
}
// get accumulate days from beginning until start of year.
__DateTimeUtils.getDaysUntilYear = (year) => {
    let val1 = 365 * year; // day in year.
    let val2 = year / 4; // get days leap year (every 4 year add one day).
    let val3 = year / 100; // get days leap year (every 100 year remove one day).
    let val4 = year / 400; // get days leap year (every 400 year add one day).
    return val1 + val2 - val3 + val4;
}
// get accumulate days from start of year until last month that specificed month parameter.
__DateTimeUtils.getDaysUntilLastMonth = (year, month) => {
    var num = 0;
    var num2 = 1;
    var numArray = __DateTimeUtils.getMonthArray(year);
    while (num2 < month) {
        num += numArray[num2++];
    }
    return num;
}

__DateTimeUtils.absoluteDays = (year, month, day) => {
    let days = 0;
    if(!year && !month && !day) {
        days = 0;
    }
    // days from date 0/0/0 to begin of year.
    let val1 = __DateTimeUtils.getDaysUntilYear(year - 1);
    // days from begin of year to last month.
    let num = __DateTimeUtils.getDaysUntilLastMonth(year, month);
    // days from begin of year not include today.
    let val2 = (day - 1 + num);
    let totalDays = val1 + val2;
    days = Math.round(totalDays);
    return days;
}

__DateTimeUtils.fromSpan = (span, what) => {
    let index = 1;
    let daysmonth = __DateTimeUtils.monthDays;
    let days = span.days;
    let num = Math.round(days / 146097);
    days -= num * 146097;
    let num2 = Math.round(days / 36524);
    if (num2 == 4) { num2 =3; }
    days -= num2 * 36524;
    let num3 = Math.round(days / 1461);
    days -= num3 * 1461;
    let num4 = Math.round(days / 365);
    if (num4 === 4) { num = 3; }
    if (what === "year") {
        return (((((num * 400) + (num2 * 100)) + (num3 * 4)) + num4) + 1);
    }
    days -= num4 * 365;
    if (what != "dayyear"){
        if ((num4 === 3) && ((num2 === 3) || (num3 !== 24))) {
            daysmonth = __DateTimeUtils.monthDaysLeapYear;
        }
        while (days >= daysmonth[index]) {
            days -= daysmonth[index++];
        }
        if (what === "month") {
            return index;
        }
    }
    return days + 1;
}

__DateTimeUtils.getMinDays = (day, days) => {
    if (day > days) {
        day = days;
    }
    return day;
}

__DateTimeUtils.DateTimeInitializers = [
    { 
        len: 0, 
        init: (dt) => {
            let d = new Date();
            let _year = d.getFullYear();
            let _month = d.getMonth() + 1;
            let _day = d.getDay();
            let _hour = d.getHours();
            let _minute = d.getMinutes();
            let _second = d.getSeconds();
            let _millisecond = d.getMilliseconds();
            let _days = __DateTimeUtils.absoluteDays(_year, _month, _day);
            dt.span = new TimeSpan(_days, _hour, _minute, _second, _millisecond);
        } 
    },
    { 
        len: 1, 
        init: (dt, millisecond) => {
            let _year = 0;
            let _month = 0;
            let _day = 0;
            let _hour = 0;
            let _minute = 0;
            let _second = 0;
            let _millisecond = millisecond;
            let _days = __DateTimeUtils.absoluteDays(_year, _month, _day);
            dt.span = new TimeSpan(_days, _hour, _minute, _second, _millisecond);
        }
    },
    { 
        len: 3, 
        init: (dt, year, month, day) => {
            let _year = year;
            let _month = month;
            let _day = day;
            let _hour = 0;
            let _minute = 0;
            let _second = 0;
            let _millisecond = 0;
            let _days = __DateTimeUtils.absoluteDays(_year, _month, _day);
            dt.span = new TimeSpan(_days, _hour, _minute, _second, _millisecond);
        } 
    },
    { 
        len: 6, 
        init: (dt, year, month, day, hour, minute, second) => {
            let _year = year;
            let _month = month;
            let _day = day;
            let _hour = hour;
            let _minute = minute;
            let _second = second;
            let _millisecond = 0;
            let _days = __DateTimeUtils.absoluteDays(_year, _month, _day);
            dt.span = new TimeSpan(_days, _hour, _minute, _second, _millisecond);
        }
    },
    { 
        len: 7, 
        init: (dt, year, month, day, hour, minute, second, millisecond) => {
            let _year = year;
            let _month = month;
            let _day = day;
            let _hour = hour;
            let _minute = minute;
            let _second = second;
            let _millisecond = millisecond;
            let _days = __DateTimeUtils.absoluteDays(_year, _month, _day);
            dt.span = new TimeSpan(_days, _hour, _minute, _second, _millisecond);
        }
    }
]

class DateTime {
    constructor() {
        let len = arguments.length;
        let plens = __DateTimeUtils.DateTimeInitializers.map((item) => item.len);
        let idx = plens.indexOf(len);
        
        if (idx === -1) {
            throw("No constructor of DateTime supports " + len + " arguments");
        }

        // local variables.
        this.span = new TimeSpan();
        // init variable by arguments.
        __DateTimeUtils.DateTimeInitializers[idx].init(this, ...arguments);
    }

    add(timespan) {
        return new DateTime(this.span._millis + timespan._millis);
    }
    addYears(years) {
        return this.addMonths(years * 12);
    }
    addMonths(months) {
        let day = this.day;
        let month = this.month + (months % 12);
        let year = this.year + Math.round(months / 12);
        
        if (month < 1) {
            month = 12 + month;
        } else if (month > 12){
            month -=12;
            year++;
        }
        
        let days = DateTime.daysInMonth(year, month);
        day = __DateTimeUtils.getMinDays(day, days);
            
        let time = new DateTime(year, month, day);
        return time.add(this.timeOfDay);
    }
    addDays(days) {
        return new DateTime(this.span._millis + days * 86400000);
    }
    addHours(hours) {
        return new DateTime(this.span._millis + hours * 3600000);
    }
    addMinutes(minutes) {
        return new DateTime(this.span._millis + minutes * 60000);
    }
    addSeconds(seconds) {
        return new DateTime(this.span._millis + seconds * 1000);
    }
    addMilliseconds(milliseconds) {
        return new DateTime(this.span._millis + milliseconds);
    }
    compareTo(datetime) {
        return this.span.compareTo(datetime.span);
    }
    equals(datetime) {
        return this.span.equals(datetime.span);
    }
    subtractDate(datetime) {
        return new TimeSpan(this.span._millis - datetime.span._millis);
    }
    subtractTime(timespan) {
        return new DateTime(this.span._millis - timespan._millis);
    }

    get date() {
        return new DateTime(this.year, this.month, this.day);
    }
    get year() {
        return __DateTimeUtils.fromSpan(this.span, "year");
    }
    get month() {
        return __DateTimeUtils.fromSpan(this.span, "month");
    }
    get day() {
        return __DateTimeUtils.fromSpan(this.span, "day");
    }
    get dayOfWeek() {
        return (this.span.days + 1) % 7;
    }
    get dayOfYear() {
        return __DateTimeUtils.fromSpan(this.span, "dayyear");
    }
    get hour() {
        return this.span.hours;
    }
    get minute() {
        return this.span.minutes;
    }
    get second() {
        return this.span.seconds;
    }
    get millisecond() {
        return this.span.milliseconds;
    }
    get timeOfDay() {
        return new TimeSpan(this.span._millis % 86400000);
    }

    static daysInMonth(year, month) {
        if (__DateTimeUtils.isLeapYear(year)) {
            return __DateTimeUtils.monthDaysLeapYear[month];
        } 
        else {
            return __DateTimeUtils.monthDays[month];
        }
    }
    static isLeapYear(year) {
        return __DateTimeUtils.isLeapYear(year);
    }
    static get now() {
        let d = new Date();
        return new DateTime(
            d.getFullYear(), d.getMonth() + 1, d.getDay(), 
            d.getHours(), d.getMinutes(), d.getSeconds(), 
            d.getMilliseconds()
        );
    }
    static get utcNow() {
        let d = new Date();
        return new DateTime(
            d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDay(), 
            d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), 
            d.getUTCMilliseconds()
        );
    }
    static get today() {
        let now = DateTime.now;
        return new DateTime(now.year(), now.month(), now.day());
    }
}

let __TimeSpanUtils = {}
__TimeSpanUtils.rounder = (number) =>{
    if (this._millis < 0)
        return Math.ceil(number);
    return Math.floor(number);
}

__TimeSpanUtils.pad = (number) => {
    return (number < 10 ? '0' : '') + number;
}

__TimeSpanUtils.TimeSpanInitializers = [
    {
        len: 0,
        init: (ts) => {
            ts._millis = 0;
        }
    },
    {
        len: 1,
        init: (ts, milliseconds) => {
            ts._millis = milliseconds;
        }
    },
    {
        len: 2,
        init: (ts, days, hours) => {
            ts._millis = (days * 86400 + hours * 3600);
        }
    },
    {
        len: 3,
        init: (ts, hours, minutes, seconds) => {
            ts._millis = (hours * 3600 + minutes * 60 + seconds);
        }
    },
    {
        len: 4,
        init: (ts, days, hours, minutes, seconds) => {
            ts._millis = (days * 86400 + hours * 3600 + minutes * 60 + seconds);
        }
    },
    {
        len: 5,
        init: (ts, days, hours, minutes, seconds, milliseconds) => {
            ts._millis = (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
        }
    }
]

class TimeSpan {
    constructor() {
        let len = arguments.length;
        let plens = __TimeSpanUtils.TimeSpanInitializers.map((item) => item.len);
        let idx = plens.indexOf(len);
        
        if (idx === -1) {
            throw("No constructor of TimeSpan supports " + len + " arguments");
        }

        // local variables
        this._millis = 0;
        // init variable by arguments.
        __TimeSpanUtils.TimeSpanInitializers[idx].init(this, ...arguments);
    }
    add(timespan) {
        console.log(timespan._millis)
        console.log(this._millis)
        console.log(timespan._millis + this._millis)
        return new TimeSpan(timespan._millis + this._millis);
    }
    compareTo(timespan) {
        let ret = 0
        if (this._millis > timespan._millis) ret = 1;        
        if (this._millis < timespan._millis) ret = -1;
        //if (this._millis === timespan._millis) ret = 0;
        return ret;
    }
    duration() {
        return new TimeSpan(Math.abs(this._millis));
    }
    equals(timespan) {
        return this._millis === timespan._millis;
    }
    negate() {
        this._millis *= -1;
    }
    subtract(timespan) {
        return new TimeSpan(this._millis - timespan._millis);
    }
    toString() {
        let sign = (this._millis < 0 ? "-" : "");
        let dy = (Math.abs(this.days) ? __TimeSpanUtils.pad(Math.abs(this.days))  + ".": "");
        let hr = __TimeSpanUtils.pad(Math.abs(this.hours));
        let min = __TimeSpanUtils.pad(Math.abs(this.minutes));
        let sec = __TimeSpanUtils.pad(Math.abs(this.seconds));
        let ms = Math.abs(this.milliseconds);
        return sign + dy + hr + ":" + min + ":" + sec + "." + ms;
    }
    get days() { 
        return __TimeSpanUtils.rounder(this._millis / (24 * 3600 * 1000));
    }
    get hours() {
        return __TimeSpanUtils.rounder( (this._millis % (24 * 3600 * 1000)) / (3600 * 1000));
    }
    get minutes() {
        return __TimeSpanUtils.rounder( (this._millis % (3600 * 1000)) / (60 * 1000));
    }
    get seconds() {
        return __TimeSpanUtils.rounder((this._millis % 60000) / 1000);
    }
    get milliseconds() {
        return __TimeSpanUtils.rounder(this._millis % 1000);
    }
    get totalDays() {
        return this._millis / (24 * 3600 * 1000);
    }
    get totalHours() {
        return this._millis / (3600 * 1000);
    }
    get totalMinutes() {
        return this._millis / (60 * 1000);
    }
    get totalSeconds() {
        return this._millis / 1000;
    }
    get totalMilliseconds() {
        return this._millis;
    }
}

// TimeSpan class test.
/*
let ts = new TimeSpan(99, 23, 59, 59, 1000)
console.log(`Days: ${ts.days}`)
console.log(`Hours: ${ts.hours}`)
console.log(`Minutes: ${ts.minutes}`)
console.log(`Seconds: ${ts.seconds}`)
console.log(`Milliseconds: ${ts.milliseconds}`)

ts.negate() // * -1
console.log(`Total days: ${ts.totalDays}`)
console.log(`Total hours: ${ts.totalHours}`)
console.log(`Total minutes: ${ts.totalMinutes}`)
console.log(`Total seconds: ${ts.totalSeconds}`)
console.log(`Total milliseconds: ${ts.totalMilliseconds}`)
console.log(ts.toString())

let ts2 = ts.duration() // make abs value.

console.log(`Total days: ${ts2.totalDays}`)
console.log(`Total hours: ${ts2.totalHours}`)
console.log(`Total minutes: ${ts2.totalMinutes}`)
console.log(`Total seconds: ${ts2.totalSeconds}`)
console.log(`Total milliseconds: ${ts2.totalMilliseconds}`)
console.log(ts2.toString())

let ts3 = ts2.add(new TimeSpan(1, 1, 1, 1, 1));

console.log(`Total days: ${ts3.totalDays}`)
console.log(`Total hours: ${ts3.totalHours}`)
console.log(`Total minutes: ${ts3.totalMinutes}`)
console.log(`Total seconds: ${ts3.totalSeconds}`)
console.log(`Total milliseconds: ${ts3.totalMilliseconds}`)
console.log(ts3.toString())

ts.negate(); // make is positive again.
console.log('same:', ts.equals(ts2));
console.log('ts = ts2:', ts.compareTo(ts2));
console.log('ts < ts3', ts.compareTo(ts3));
console.log('ts3 < ts', ts3.compareTo(ts));
*/

// DateTime class test.
/*
let o = new DateTime(2019, 7, 3, 23, 58, 58, 999)
let dt;
//console.log(dt)
//dt = o.addYears(1);
//dt = o.addMinutes(48); // NOT OK seem to be if day change the calculation is not work.
//dt = o.addSeconds(60); // OK
//dt = o.addMilliseconds(667); // OK
//dt = o.addMinutes(1).addSeconds(1).addMilliseconds(1); // OK
//dt = o.addMinutes(46).addSeconds(60).addMilliseconds(667); // NOT OK
dt = o;
dt = dt.addMilliseconds(1);
dt = dt.addSeconds(1);
dt = dt.addMinutes(1); //! at this step the day not work correctly.

console.log(`${dt.year}-${dt.month}-${dt.day} ${dt.hour}:${dt.minute}:${dt.second}.${dt.millisecond}`);
*/

// JavaScript Date class test.

let d = new Date(2019, 1, 28);
console.log(`Date (src): ${d}`);

//let ms = d.getTime() - (d.getTimezoneOffset() * 60000); // UTC time
let ms = d.getTime(); // local time

let totalms = ms;
console.log(`ms: ${totalms}`);

let d2 = new Date(totalms);
console.log(`Date from ms: ${d2}`);

// note: month start from 0 to 11
let offset = (new Date(1970, 0, 1).getTimezoneOffset() * 60000);
console.log('offset:', offset)
let dd1 = new Date(1970, 0, 1) // elapsed from January 1, 1970
console.log(dd1);
let dd2 = new Date(2019, 6, 4) // date only
//let dd2 = new Date() // date with time
console.log(dd2);
let diffMillsecs = (dd2 - (dd1.getTime() - offset))
console.log('diff in ms:', diffMillsecs)
let diffDays = diffMillsecs / (24 * 3600 * 1000)
console.log('diff in days:', diffDays)

let d3 = new Date(diffMillsecs);
console.log(`Date from ms: ${d3}`)

