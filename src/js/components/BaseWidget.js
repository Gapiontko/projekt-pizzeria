class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};

    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.value = initialValue;
  }

  get Value (){
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set Value(value){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    /* TODO: Add validation */

    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();
  }
  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN (value);
  }

  renderValue (){
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){ //create an instance of the buildin class Event
    const thisWidget = this;

    const event = new CustomEvent ('updated', {bubbles: true});
    thisWidget.dom.wrapper.dispatchEvent(event);
  }

  setValue (value){
    const thisWidget = this;
    thisWidget.value = value;
  }
}

export default BaseWidget;
