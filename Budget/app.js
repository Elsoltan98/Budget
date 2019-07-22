/*global document, window*/
// BUDGET CONTROLLER
var budgetController = (function () {
    'use strict';
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.precentage = -1;
    };
    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.precentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.precentage = -1;
        }
    };
    Expense.prototype.getPercentage = function() {
        return this.precentage;  
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) { 
            sum += cur.value;   
        });
        data.totals[type] = sum;
    };
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
        precentage: -1 
    };
    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // Create new Item
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // Push it in our data structure
            data.allItems[type].push(newItem);
            // return the new Element 
            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },
        calculateBudget: function () {
            // Calculate total income and expense 
                calculateTotal('exp');
                calculateTotal('inc');
            // Calculate the budget: income - expense 
                data.budget = data.totals.inc - data.totals.exp;
            // Calculate precentage of income we spent
                if (data.totals.inc > 0) {
                    data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else {
                    data.precentage = -1;
                }  
        },
        calculatePercentage: function() {
          
            data.allItems.exp.forEach(function(cur) {
                cur.calculatePercentage(data.totals.inc);
            });  
        },
        getPercentage: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                 return cur.getPercentage();
            });
            return allPerc; 
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                precentage: data.precentage
            }
        },
    };
})();
// UI CONTROLLER 
var UIController = (function () {
    'use strict';
    var DomStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputAdd: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        presentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel : '.budget__title--month'
    };
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; 
    };
    var nodeListForEach = function (list, callback){
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    };
    return {
        getInput: function () {
            return {
                type : document.querySelector(DomStrings.inputType).value,
                description : document.querySelector(DomStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DomStrings.inputValue).value)
            };
        },
        addListItem: function (obj, type) {
            var html, newhtml, element;
            // create html string with placeholder text
            if (type === 'inc') {
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DomStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace the placeholder text with some data 
            newhtml = html.replace('%id%', obj.id);
            newhtml = newhtml.replace('%description%', obj.description);
            newhtml = newhtml.replace('%value%', formatNumber(obj.value, type));
            // Insert the html data into the dom 
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
        },
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields : function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DomStrings.inputDescription + ', ' + DomStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.precentage > 0 ) {
                document.querySelector(DomStrings.presentageLabel).textContent = obj.precentage + '%';
            } else {
                document.querySelector(DomStrings.presentageLabel).textContent = '--';
            }
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DomStrings.expensesPercLabel);
            nodeListForEach(fields, function(current, index) {
               if(percentages[index] > 0) {
                   current.textContent = percentages[index] + '%';
               } else {
                   current.textContent = '--';
               }
            });
        },
        displayDate: function() {
            var now, months, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septemper', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function() {
            var fields = document.querySelectorAll(
                DomStrings.inputType + ',' +
                DomStrings.inputDescription + ',' + 
                DomStrings.inputValue
            );
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            document.querySelector(DomStrings.inputAdd).classList.toggle('red');
        },    
        getDomStrings: function () {         
            return DomStrings;
        }      
    }; 
})();
// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    'use strict';
    var setupEventListener = function () {
        document.querySelector(Dom.inputAdd).addEventListener('click', ctrlAddItem);
        document.querySelector(Dom.inputType).addEventListener('change', UICtrl.changedType);
        document.addEventListener('keypress', function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem); 
    };
    var Dom = UICtrl.getDomStrings();
    var updateBudget = function () {
        // 1. Calculate the budget 
            budgetCtrl.calculateBudget();
        // 2. Return the budget
            var budget = budgetCtrl.getBudget();
        // 3. Display the budget 
            UICtrl.displayBudget(budget);
    };
    var updatePercentages = function() {
        // 1. Calculate percentage
            budgetCtrl.calculatePercentage();
        // 2. Read percentage from the budget controller 
            var percentage = budgetCtrl.getPercentage();
        // 3. Update the UI with the new percentage
            UICtrl.displayPercentages(percentage);
    };
    var ctrlAddItem = function () {
            // 1. Get the fields value
                var inputVal = UICtrl.getInput();
        if (inputVal.description !== "" && !isNaN(inputVal.value) && inputVal.value > 0) {
            // 2. Add the item to budget controller
                var newItem = budgetCtrl.addItem(inputVal.type, inputVal.description, inputVal.value);
            // 3. Add item to UI controller
                UICtrl.addListItem(newItem, inputVal.type);
            // 3+. Clear the value of fields 
                UICtrl.clearFields();
            // 4. Calculate and Update the Budget
                updateBudget();
            // 5. Calculate and Update the precentage
                updatePercentages();
        }
        };
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) { 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. Delete item from data structure
                budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from UI
                UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
                updateBudget();
        }  
    };
    return {
        init: function () {
            window.console.log('Application has been started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                precentage: -1
            });
            setupEventListener();
        }   
    };  
})(budgetController, UIController);
controller.init();