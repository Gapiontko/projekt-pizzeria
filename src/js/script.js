/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

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
      });
    }

    processOrder(){
      const thisProduct = this;
      //console.log(thisProduct);

      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      /* default price */
      let price = thisProduct.data.price;
      //console.log(price);

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

      /* put price into thisProduct.priceElem */

      thisProduct.priceElem.textContent = price;
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions(event);

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */

      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;
      console.log('thisWidget');

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      console.log('changed');

      thisWidget.linkDecrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();

      thisApp.initMenu();
    },
  };

  app.init();
}
