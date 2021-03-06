import moment from 'moment';
// import fa from './moment.locale.fa';
import es from './moment.locale.es';
import utils from './utils';
moment.updateLocale('en', {
    weekdaysMin: 'S_M_T_W_T_F_S'.split('_')
});
// moment.updateLocale('fa', fa);
moment.updateLocale('es', es);
// moment.loadPersian({dialect: 'persian-modern'});
moment.daysInMonth = function (year, month) {
    return moment({year, month}).daysInMonth();
};


//=====================================
//           CONFIG
//=====================================
const localMethods = {
    /*fa: {
        daysInMonth: 'jDaysInMonth',
        year:        'jYear',
        month:       'jMonth',
        date:        'jDate',
        day:         'day',
    },*/
    en: {
        daysInMonth: 'daysInMonth',
        year:        'year',
        month:       'month',
        date:        'date',
        day:         'day'
    },
    es: {
        daysInMonth: 'daysInMonth',
        year:        'year',
        month:       'month',
        date:        'date',
        day:         'day'
    }
};
const localesConfig = {
    /*fa: {
        dow: 6,
        dir: 'rtl',
        lang: {
            submit:    "تایید",
            cancel:    "انصراف",
            now:       "اکنون",
            nextMonth: "ماه بعد",
            prevMonth: "ماه قبل",
        }
    },*/
    en: {
        dow: 0,
        dir: 'ltr',
        lang: {
            submit:    "Select",
            cancel:    "Cancel",
            now:       "Now",
            nextMonth: "Next month",
            prevMonth: "Previous month",
        }
    },
    es: {
        dow: 0,
        dir: 'ltr',
        lang: {
            submit:    "Aceptar",
            cancel:    "Cancelar",
            now:       "Ahora",
            nextMonth: "Siguiente mes",
            prevMonth: "Mes anterior",
        }
    }
};


const Core = function (defaultLocaleName) {

    'use strict';

    const Instance = {
        moment:        moment,
        locale:        {name: 'en', config: {}},
        changeLocale:  null,
        getWeekArray:  null,
        getYearsList:  null,
        getMonthsList: null,
    };

    //=====================================
    //           METHODS
    //=====================================
    let xDaysInMonth;

    Instance.changeLocale = function changeLocale(localeName = 'en', options = {}) {        
        let locale    = this.locale;
        let config    = JSON.parse(JSON.stringify((localesConfig[localeName] || localesConfig.en)));
        let methods   = localMethods[localeName] || localMethods.en;

        options       = options[localeName] || {};
        locale.name   = localeName;
        locale.config = utils.extend(true, config, options);

        xDaysInMonth = moment[methods.daysInMonth];

        function addMethods(date) {
            if (date === undefined) return;

            const nameInLocale = name => {
                // if (locale.name !== 'en')
                //    name = name.replace(/j/g, '');
                // console.log('nameInLocale', name)
                return name;
            };

            date.xYear  = moment.fn[methods.year];
            date.xMonth = moment.fn[methods.month];
            date.xDate  = moment.fn[methods.date];

            date.xFormat = function (format) {                
                return this.format(nameInLocale(format));
            };
            date.xStartOf = function (value) {
                return this.startOf(methods[value]);
            };
            date.xEndOf = function (value) {
                return this.endOf(methods[value]);
            };
            date.xAdd = function (amount, key) {
                return this.add(amount, methods[key]);
            };
            date.clone = function () {
                return Instance.moment(this.toDate());
            };
        }

        this.moment = function () {
            let date = moment.apply(null, arguments);
            date.locale(locale.name);
            addMethods(date);
            return date;
        };
    };

    Instance.getWeekArray = function getWeekArray (d) {

        function addWeek(weekArray, week) {
            let emptyDays = 7 - week.length;

            for (let i = 0; i < emptyDays; ++i) {
                week[weekArray.length ? 'push' : 'unshift'](null);
            }

            weekArray.push(week);
        }

        let moment = this.moment;
        let daysInMonth = xDaysInMonth(moment(d).xYear(), moment(d).xMonth());

        let dayArray = [];
        for (let i = 1; i <= daysInMonth; i++) {
            dayArray.push(moment(d).xDate(i).toDate());
        }

        let weekArray = [];
        let week = [];

        dayArray.forEach(day => {
            if (week.length > 0 && day.getDay() === this.locale.config.dow) {
                addWeek(weekArray, week);
                week = [];
            }

            week.push(day);

            if (dayArray.indexOf(day) === dayArray.length - 1) {
                addWeek(weekArray, week);
            }
        });

        return weekArray;
    };

    Instance.getYearsList = function getYearsList(from, to, range = false, date) {
        let years = [];
        if (range) {
            let year = getYear(date);
            from = year - range;
            to = year + range;
        }
        for (let i = from; i <= to; i++) {
            years.push(i);
        }
        return years;
    };

    Instance.getMonthsList = function getMonthsList(minDate, maxDate, date) {
        let list = [],
            min = minDate ? minDate.clone().xStartOf('month').unix() : -Infinity,
            max = maxDate ? maxDate.clone().xEndOf('month').unix() : Infinity;
        for (let i = 0; i < 12; i++) {
            let month = date.clone().xMonth(i);
            let start = month.clone().xStartOf('month').unix();
            let end   = month.clone().xEndOf('month').unix();
            month.disabled = (start < min || end > max);
            list.push(month);
        }
        return list;
    };

    Instance.changeLocale(defaultLocaleName);

    return Instance;
};


export default Core;

export {localesConfig};