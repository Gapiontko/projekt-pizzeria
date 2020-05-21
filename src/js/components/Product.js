import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFormHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector (select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
    //console.log(thisProduct);

    /* find the clickable trigger (the element that should react to clicking) */
    const clickableProduct = thisProduct.accordionTrigger;
    //console.log(clickableProduct);

    /* START: click event listener to trigger */
    clickableProduct.addEventListener('click', function(){
      //console.log('clicked');

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');

      /* find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

      /* START LOOP: for each active product */
      for (let activeProduct of activeProducts){

        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct != thisProduct.element) {

          /* remove class active for the active product */
          activeProduct.classList.remove('active');

        /* END: if the active product isn't the element  of thisProduct */
        }

      /* END LOOP: for each active product */
      }

    /* END: click event listener to trigger */
    });
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log(thisProduct);

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    console.log(thisProduct);

    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData', formData);

    /* Empty object thisProduct.params */
    thisProduct.params = {};

    /*variable price initially equal to default price */
    let price = thisProduct.data.price;
    console.log(price);

    /* START LOOP 1: Iterate through all params of thisProduct */
    for (let paramID in thisProduct.data.params) {
      //console.log(paramID, thisProduct.data.params[paramID]);

      const param = thisProduct.data.params[paramID];

      /* START LOOP 2: Iterate through all param options */
      for (let optionID in param.options){
        //console.log(optionID, param.options[optionID]);

        const option = param.options[optionID];

        const optionSelected = formData.hasOwnProperty(paramID) && formData[paramID].indexOf(optionID) > -1;

        /* if a non-default option is checked price must increase */
        if (optionSelected && !option.default){
          price += option.price;

        /* if a default option is not checked price must decrease */
        }else if (!optionSelected && option.default){
          price -= option.price;
        }

        /* find images */

        const optionImages = thisProduct.imageWrapper.querySelectorAll('.' + paramID + '-' + optionID);
        //console.log('.' + paramID + '-' + optionID);

        /* if an option is selcted make image visible */
        if (optionSelected){
          if(!thisProduct.params[paramID]){
            thisProduct.params[paramID] = {
              label:param.label,
              options: {},
            };
          }
          thisProduct.params[paramID].options[optionID] = option.label;

          for (let image of optionImages){
            image.classList.add(classNames.menuProduct.imageVisible);
          }

        /* otherwise make image invisible */
        } else {
          for (let image of optionImages){
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }

      /* END LOOP 2 */
      }

    /* END LOOP 1 */
    }

    /* put price into thisProduct.priceElem  & multiply price by amount*/
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    thisProduct.priceElem.innerHTML = thisProduct.price;

    //console.log(thisProduct.params);
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    /* Add addEventListener */
    thisProduct.amountWidgetElem.addEventListener('updated', function (){
      thisProduct.processOrder();
    }
    );

  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name=thisProduct.data.name;
    thisProduct.amount=thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
