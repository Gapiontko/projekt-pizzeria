
/* global flatpickr */

import {settings, select} from '../settings.js';
import {utils} from '../utils.js';
import BaseWidget from './BaseWidget.js';

class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  isValid(){
    return true;
  }

  renderValue (){

  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);

    thisWidget.maxDate = utils.addDays (thisWidget.minDate,  settings.datePicker.maxDaysInFuture);

    const thisWidgetOptions = {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      locale: {
        firstDayOfWeek: 1, // start week on Monday
      },
      disable: [
        function(date) {
        // return true to disable
          return (date.getDay() === 1);
        }],
    };

    flatpickr (thisWidget.dom.input, thisWidgetOptions);
  }
}

export default DatePicker;
