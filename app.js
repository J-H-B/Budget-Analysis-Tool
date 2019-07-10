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
  }

  Expense.prototype.calculatePercentage = (expense) => {
    console.log(`1 - ${expense}`);
    let percentage = Math.round((expense / data.totalValues.sumOfIncomes) * 100);
    return percentage;
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
  const calculateTotal = (type) => {
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
  }


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
       console.log(data.totalItems.expenses.length);
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
    btnClick : '.submit',
    incomeList: '.incomes_list',
    expenseList: '.expenses_list',
    budget: '.budget_value',
    incomeValue: '.budget_income_value',
    expenseValue: '.budget_expenses_value',
    expensePercentage: '.budget_expenses_percentage'
  };

  return {
    getInput: function() {
      return {
       type : document.querySelector(htmlClassNames.select).value,
       description : document.querySelector(htmlClassNames.description).value,
       value : parseFloat(document.querySelector(htmlClassNames.value).value)
      };
    },
    getHtmlClassNames: () => {htmlClassNames},

    displayItems: (item, type) => {
      let incomeHTML, expenseHTML, element, newHTML, id, value, description, percentage;

      incomeHTML = `<div class="income_item clearfix" id = "income-%id%"><div class="income_item_description">%description%</div>
      <div class="right"><div class="income_item_value">+ %value%</div><div class="income_item_delete clearfix">
      <button type="button" class="btn_delete" name="button"><ion-icon name="close-circle-outline"></ion-icon></button></div></div>`;

      expenseHTML = `<div class="expense_item clearfix" id = "expense-%id%"><div class="expense_item_description">%description%</div>
                         <div class="right"><div class="expense_item_value">- %value%</div><div class="expense_item_percentage">%per% %</div><div class="expense_item_delete clearfix">
                        <button type="button" class='btn_delete' name="button"><ion-icon name="close-circle-outline"></ion-icon></button></div></div></div>`;

      id = item.id;
      value = item.value;
      description = item.description;
      percentage = item.percentage > 0 ? item.percentage : 0;

      if(type === 'incomes'){
        newHTML = incomeHTML.replace('%id%',id).replace('%value%',value).replace('%description%', description);
        element = htmlClassNames.incomeList;
      } else {
        newHTML = expenseHTML.replace('%id%',id).replace('%value%',value).replace('%description',description).replace('%per%',percentage);
        element = htmlClassNames.expenseList;
      }

      // insert at the end of the related list (beforeend)
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },
    updateBudget: (budget, type) => {
      let element;
      if(type === 'incomes') {
        element = htmlClassNames.incomeValue;
        document.querySelector(element).textContent = budget.incomes;
      } else {
        element = htmlClassNames.expenseValue;
        document.querySelector(element).textContent = budget.expenses;
        element = htmlClassNames.expensePercentage;
        document.querySelector(element).textContent =  budget.totalPercentage + " %";
      }
      element = htmlClassNames.budget;
      document.querySelector(element).textContent = budget.budget;
      }
    };
}

)();


// GLOBAL APP CONTROLLER
var controller = ( (budgetCtrl, UICtrl) => {

  const htmlClassNames = UIController.getHtmlClassNames();
  const setupEventListeners = function() {
    document.querySelector('.submit').addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', (event) => {
      if(event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  }

  const updateBudget = (object, type) => {
    let budget;

    // calculate the budget
    budget = budgetController.getBudget() ;

    // display the budget values in UI
    UIController.updateBudget(budget,type);
  }


  let ctrlAddItem = () => {

    // get input from the user
    let inputs = UIController.getInput();
    let obj;
    console.log(inputs);
    // if input is valid
    if(inputs.value > 0 && !isNaN(inputs.value) && inputs.description !== ''){
      // return an object of the type(income/expense)
      obj = budgetController.addItem(inputs);

      // display the object on the UI
      UIController.displayItems(obj, inputs.type);

      // update the budget
      updateBudget(obj, inputs.type);
    }
  };


  return {
    init: setupEventListeners
  };


})(budgetController, UIController);

controller.init();
