/**
 * Get the number of days in any particular month
 * @link https://stackoverflow.com/a/1433119/1293256
 * @param  {integer} m The month (valid: 0-11)
 * @param  {integer} y The year
 * @return {integer}   The number of days in the month
 */
let daysInMonth = function (m, y) {
    let ret;
    switch (m) {
        case 1 :
            ret = (y % 4 == 0 && y % 100) || y % 400 == 0 ? 29 : 28;
            break;
        case 8 : 
        case 3 : 
        case 5 : 
        case 10 :
            ret = 30;
            break;
        default :
            ret = 31
            break;
    }
    return ret;
};

/**
 * Check if a date is valid
 * @link https://stackoverflow.com/a/1433119/1293256
 * @param  {[type]}  d The day
 * @param  {[type]}  m The month
 * @param  {[type]}  y The year
 * @return {Boolean}   Returns true if valid
 */
let isValidDate = function (d, m, y) {
    m = parseInt(m, 10) - 1;
    //console.log(m)
    return m >= 0 && m < 12 && d > 0 && d <= daysInMonth(m, y);
};

// March 30, 2017 - true
console.log(isValidDate(30, 3, 2017))
// February 29, 2017 - false
console.log(isValidDate(29, 2, 2017))
// February 29, 2016 - true
console.log(isValidDate(29, 2, 2016))
// February 29, 2000 - true
console.log(isValidDate(29, 2, 2000))
// February 29, 2100 - false
console.log(isValidDate(29, 2, 2100))

