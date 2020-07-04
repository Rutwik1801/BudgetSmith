// for data

var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage=-1;
  };
  Expense.prototype.calcPercentages=function(totalIncome){
    if(totalIncome>0){
      this.percentage=Math.round((this.value/totalIncome)*100);
    }else{
      this.percentage=-1;
    }

  };
  Expense.prototype.getPercentage=function(){
    return this.percentage;
  }
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {

      sum += cur.value;
    });
    data.totals[type] = sum;
  }

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1 //usually good practice to set -1
  };

  return {
    addItem: function(type, des, val) {
      var ID;
      //create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on inc or exp type
      if (type === "exp") {
        var newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        var newItem = new Income(ID, des, val);
      }
      //add item to our data structure
      data.allItems[type].push(newItem);
      //return the new element
      return newItem;
    },
    deleteItem:function(type,id){
      var ids,index;
       ids =data.allItems[type].map(function(current){
        return current.id;
      });
      index=ids.indexOf(id);
      if(index!== -1){
        data.allItems[type].splice(index,1);
      }
    },
    calculateBudget: function() {
      //calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      //calculate the budget inc-ex
      data.budget = data.totals.inc - data.totals.exp;
      //calculate the % of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },

    calculatePercentages:function(){
      data.allItems.exp.forEach(function(current){
         current.calcPercentages(data.totals.inc);
      });
    },
    getPercentages:function(){
      var allPerc=data.allItems.exp.map(function(current){
        return current.getPercentage();
      });
      return allPerc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing:function(){
      console.log(data);
    }

  }
})();



// for UI
var uiController = (function() {
  var DOMstrings = {
    inputType: ".add__type",
    descriptionType: ".add__description",
    valueType: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel:".item__percentage",
    dateLabel:".budget__title--month"
  };
  var formatNumber=function(num,type){
    var numSplit,int,dec,sign;
    //+ or -
    //decimal point .00
    //comma
    num=Math.abs(num);
    num=num.toFixed(2);
    numSplit=num.split(".");
          int=numSplit[0];
    if(int.length>3){
     int = int.substr(0,int.length-3)+ "," + int.substr(int.length-3,3);
    }
    dec=numSplit[1];
   sign=type==="inc"?sign="+":sign="-";

    return sign + " " + int + "." + dec;

  };
  var nodeListForEach=function(list,callback){
    for(var i=0;i<list.length;i++){
      callback(list[i],i);
    }
  }

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //it will either be inc or exp
        description: document.querySelector(DOMstrings.descriptionType).value,
        value: parseFloat(document.querySelector(DOMstrings.valueType).value)
      };

    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      //create html string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      //replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value,type));
      //insert the html into the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml)
    },
    deleteListItem:function(selectorID){
    var el=document.getElementById(selectorID);
    el.parentNode.removeChild(el);
  },
    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMstrings.descriptionType + ", " + DOMstrings.valueType);
      // fieldsArr = Array.prototype.slice.call(fields);
      fields.forEach(function(current, index, array) {
        current.value = "";
      });
      fields[0].focus();
    },
    displayBudget: function(obj) {
      obj.budget>0?type="inc":type="exp";

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,"inc");
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,"exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";

      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "___";

      }

    },
    displayPercentages:function(percentages){
      var fields=document.querySelectorAll(DOMstrings.expensesPercLabel);

      //***this is reusable code very important for other apps too***

      nodeListForEach(fields,function(current,index){
        if(percentages[index]>0){
          current.textContent=percentages[index] + "%";
        }else{
          current.textContent= "___";
        }

      })
    },
    getDate:function(){
      var now,year,month,months;
       now=new Date();
       year=now.getFullYear();
      month=now.getMonth();
      months=["January","February","March","April","May","June","July","August","September","October","November","December"];
      document.querySelector(DOMstrings.dateLabel).textContent=months[month] + " " + year;
    },
    changedType:function(){
     var fields=document.querySelectorAll(
       DOMstrings.inputType + "," +
       DOMstrings.descriptionType + "," +
       DOMstrings.valueType
     );
     nodeListForEach(fields,function(current) {
       current.classList.toggle("red-focus")
     });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
      

    },

    getDOMstrings: function() {
      return DOMstrings;
    }

  }
})();

// for interaction of both
var controller = (function(budgetCtrl, uiCtrl) {
  var setupEventListeners = function() {
    var DOM = uiCtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.querySelector(DOM.inputType).addEventListener("change",uiCtrl.changedType);

    document.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

  }

  var updateBudget = function() {
    // 4.calculate the budget
    budgetCtrl.calculateBudget();
    //4.5 return the budget
    var budget = budgetCtrl.getBudget();
    // 5.display the budget
    uiCtrl.displayBudget(budget);
  }

  var updatePercentages=function(){
    //calculate percentages
    budgetCtrl.calculatePercentages();
    //read percentages from the budget controller
    var percentages=budgetCtrl.getPercentages();
    //update the ui with the new percentages
    uiCtrl.displayPercentages(percentages);

  }

  // to avoid repeating yourself we introduce this var and we can call this function when required
  var ctrlAddItem = function() {
    // 1.get the input field
    var input = uiCtrl.getInput();
    if (input.description !== "" && input.value > 0 && !isNaN(input.value))
      // 2.add it to budget controller
      var newItem = budgetController.addItem(input.type, input.description, input.value);
    // 3.add it to ui
    uiCtrl.addListItem(newItem, input.type);
    //clear the input fields
    uiCtrl.clearFields();
    //calculate and update the budget
    updateBudget();

    updatePercentages();
  }

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //delete the item from the data structure
      budgetCtrl.deleteItem(type,ID);
      //delete the item from the ui
      uiCtrl.deleteListItem(itemID);
      //udate and show the new budget
      updateBudget();
      updatePercentages();
    }
  }

  return {
    init: function() {
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      uiCtrl.getDate();
      setupEventListeners();
      console.log("its good");
    }
  }


})(budgetController, uiController);


controller.init();
