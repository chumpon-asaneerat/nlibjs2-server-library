class TimeSpan {
    constructor() {
        let len = arguments.length;
        let plens = TimeSpan.constructors.map((item) => item.length);
        let idx = plens.indexOf(len);
        if (idx === -1) {
            throw("No constructor of TimeSpan supports " + len + " arguments");
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
        let ms = Math.abs(this.milliseconds);
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

TimeSpan.pad = (number) => { return (number < 10 ? '0' : '') + number; }

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

TimeSpan.test();