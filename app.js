// The module patterns are imported via expressions
// Module Pattern: is used to enforce encapsulation but defining public functions called
// closures that will be able to access private variables and functions in the lexical
// environment

// BUDGET CONTROLLER
var budgetController = (  () => {

  class Income {
    constructor(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  class Expense {
    constructor(id, description, value, percentage){
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = percentage;
    }

    calculatePercentage = (expense) => {
      let percentage = Math.round((expense / data.totalValues.sumOfIncomes) * 100);
      return percentage;
    }
  }

  let data = {
    totalItems: {
      incomes: [],
      expenses: []
    },
    totalValues: {
      sumOfIncomes: 0,
      sumOfExpenses: 0
    },
    budget: 0,
    percentage: -1
  };

  // calculate total of incomes and expenses
  const calculateTotal = function (type) {
    let sum = 0;

    data.totalItems[type].forEach((item) => sum += item.value );

    if(type === 'incomes'){
        data.totalValues.sumOfIncomes = sum;
    } else {
      data.totalValues.sumOfExpenses = sum;
    }
  }


  // calculate expense percentage
  let calculatePercentage = (expense) => {
    let percentage = Math.round((expense / data.totalValues.sumOfIncomes) * 100);
    data.percentage = percentage;
    return percentage;
  };

  return {
    addItem: (inputValues) => {
      let obj, id;

      if(data.totalItems[inputValues.type].length > 0){
        id = data.totalItems[inputValues.type][data.totalItems[inputValues.type].length - 1].id + 1;
      } else {
        id = 0;
      }

      if(inputValues.type === 'incomes'){
        obj = new Income(id, inputValues.description, inputValues.value);
      } else {
        obj = new Expense(id, inputValues.description, inputValues.value, calculatePercentage(inputValues.value));
      }

      data.totalItems[inputValues.type].push(obj);
      return obj;
    },
     getBudget: () => {

       let totalPercentage, sum;

       calculateTotal('incomes');
       calculateTotal('expenses');

       if(data.totalItems.expenses.length > 0){
         totalPercentage = data.totalItems.expenses.reduce((sum, expense) => sum + expense.percentage, 0);
       } else {
         totalPercentage = 0;
       }

       data.budget = data.totalValues.sumOfIncomes - data.totalValues.sumOfExpenses;
       return {
         incomes: data.totalValues.sumOfIncomes,
         expenses: data.totalValues.sumOfExpenses,
         budget: data.budget,
         percentage: data.percentage,
         totalPercentage: totalPercentage
       }
     },

     deleteItem: function (type, id) {

       data.totalItems[type].forEach( el => {

         if ( el.id === parseInt(id) ) {
           let currentID = data.totalItems[type].indexOf(el);
           data.totalItems[type].splice(currentID,1);
         }
       });
     }
  };

}
)();


// UI CONTROLLER
var UIController = (  () => {

  const htmlClassNames = {
    select: '.select_options',
    description: '.add_description',
    value: '.add_value',
    btnSubmit : '.submit',
    incomeList: '.incomes_list',
    expenseList: '.expenses_list',
    budget: '.budget_value',
    incomeValue: '.budget_income_value',
    expenseValue: '.budget_expenses_value',
    expensePercentage: '.budget_expenses_percentage',
    date: '.budget_title_month',
    container: '.container'
  };

  const formatNumber = (num, type) => {
       let numSplit, int, dec;
       /*
           + or - before number
           exactly 2 decimal points
           comma separating the thousands
           2310.4567 -> + 2,310.46
           2000 -> + 2,000.00
           */

       num = Math.abs(num);
       num = num.toFixed(2);

       numSplit = num.split('.');

       int = numSplit[0];
       if (int.length > 3) {
           int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
       }

       dec = numSplit[1];

       return (type === 'expenses' ? '-' : '+') + ' ' + int + '.' + dec;
   };

  return {
    getInput: function ()  {
      return {    type : document.querySelector(htmlClassNames.select).value,
                  description : document.querySelector(htmlClassNames.description).value,
                  value : parseFloat(document.querySelector(htmlClassNames.value).value)
              }
      },

    getHtmlClassNames: () => htmlClassNames,

    displayItems: function (item, type) {
      let incomeHTML, expenseHTML, element, newHTML, id, value, description, percentage;

      incomeHTML = `<div class="income_item clearfix" id = "incomes-%id%"><div class="income_item_description">%description%</div>
      <div class="right"><div class="income_item_value"> %value%</div><div class="income_item_delete clearfix">
      <button type="button" class="btn_delete" name="button"><ion-icon name="close-circle-outline"></ion-icon></button></div></div>`;

      expenseHTML = `<div class="expense_item clearfix" id = "expenses-%id%"><div class="expense_item_description">%description%</div>
                         <div class="right"><div class="expense_item_value"> %value%</div><div class="expense_item_percentage">%per% %</div><div class="expense_item_delete clearfix">
                        <button type="button" class='btn_delete' name="button"><ion-icon name="close-circle-outline"></ion-icon></button></div></div></div>`;

      id = item.id;
      value = item.value;
      description = item.description;
      percentage = item.percentage > 0 ? item.percentage : 0;

      if(type === 'incomes'){
        newHTML = incomeHTML.replace('%id%',id).replace('%value%',formatNumber(value,type)).replace('%description%', description);
        element = htmlClassNames.incomeList;
      } else {
        newHTML = expenseHTML.replace('%id%',id).replace('%value%', formatNumber(value,type)).replace('%description',description).replace('%per%',percentage);
        element = htmlClassNames.expenseList;
      }

      // insert at the end of the related list (beforeend)
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },

    displayDate: function () {
        const now = new Date();
        const thisMonth = now.getMonth();
        const months = {
          0: 'January',
          1: 'February',
          2: 'March',
          3: 'April',
          4: 'May',
          5: 'June',
          6: 'August',
          8: 'September',
          9: 'October',
          10: 'November',
          11: 'December'
        }
        const year = now.getFullYear();

        document.querySelector(htmlClassNames.date).textContent = `${months[thisMonth]}, ${year}`;
    },

    clearFields: function () {
      let fields = document.querySelectorAll(`${htmlClassNames.value}, ${htmlClassNames.description}`);
      [...fields].forEach( (el) => {
        el.value = '';
      }) ;

     [...fields][0].focus();
    },

    updateBudget: function (budget, type) {
      let element;
      if(type === 'incomes' ) {
        element = htmlClassNames.incomeValue;
        document.querySelector(element).textContent = formatNumber(budget.incomes, type);
      } else {
        element = htmlClassNames.expenseValue;
        document.querySelector(element).textContent = formatNumber(budget.expenses, type);
        element = htmlClassNames.expensePercentage;
        document.querySelector(element).textContent =  budget.totalPercentage + " %";
      }
      element = htmlClassNames.budget;
      if(budget.budget > 0 ) {
        document.querySelector(element).textContent = formatNumber(budget.budget, 'incomes');
    } else {
        document.querySelector(element).textContent = 0;
    }
    },

    deleteItem: function (id) {
      let element = document.getElementById(id);
      element.parentNode.removeChild(element);
    }
    };
}

)();


// GLOBAL APP CONTROLLER
var controller = ( (budgetCtrl, UICtrl) => {

  const htmlClassNames = UIController.getHtmlClassNames();

  const setupEventListeners = function() {

    // adding an item
    document.querySelector(htmlClassNames.btnSubmit).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function (event) {
      if(event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    // deleting an item
    document.querySelector(htmlClassNames.container).addEventListener('click', ctrlDeleteItem);
  }

  const updateBudget = ( type) => {
    let budget;

    // calculate the budget
    budget = budgetController.getBudget() ;

    // display the budget values in UI
    UIController.updateBudget(budget,type);
  }




  let ctrlAddItem = function () {

    // get input from the user
    let inputs = UIController.getInput();
    let obj;

    // if input is valid
    if(inputs.value > 0 && !isNaN(inputs.value) && inputs.description !== ''){
      // return an object of the type(income/expense)
      obj = budgetController.addItem(inputs);

      // clear UI
      UIController.clearFields();

      // display the object on the UI
      UIController.displayItems(obj, inputs.type);

      // update the budget
      updateBudget(inputs.type);
    }
  };

  const ctrlDeleteItem = function (event) {
    let itemID, type, id;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID) {
      type = itemID.substr(0,itemID.indexOf('-'));
      id = itemID.substr(itemID.indexOf('-')+1, itemID.length)

      budgetController.deleteItem(type,id);
      UIController.deleteItem(itemID);
      updateBudget(type);
    }
  };

  return {
    init: function() {
      UIController.displayDate();
      setupEventListeners();
      UIController.updateBudget(
        {
          incomes: 0,
          expenses: 0,
          budget: 0,
          percentage: 0,
          totalPercentage: 0
        },'incomes');
        UIController.updateBudget(
          {
            incomes: 0,
            expenses: 0,
            budget: 0,
            percentage: 0,
            totalPercentage: 0
          },'expenses');
        }
  };


})(budgetController, UIController);

controller.init();
