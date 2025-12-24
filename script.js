const display = document.getElementById("display");
const resultPreview = document.getElementById("result-preview");
const modeToggle = document.getElementById("modeToggle");
const historyToggle = document.getElementById("historyToggle");
const historyModal = document.getElementById("historyModal");
const closeHistoryBtn = document.getElementById("closeHistory");
const basicButtons = document.getElementById("basicButtons");
const scientificButtons = document.getElementById("scientificButtons");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

let expression = "";
let isScientificMode = false;
let calculationHistory = JSON.parse(localStorage.getItem("calcHistory")) || [];

// Mode toggle
modeToggle.addEventListener("click", () => {
    isScientificMode = !isScientificMode;
    basicButtons.classList.toggle("hidden");
    scientificButtons.classList.toggle("hidden");
    modeToggle.textContent = isScientificMode ? "≡ Basic" : "≡ Scientific";
});

// History toggle
historyToggle.addEventListener("click", () => {
    historyModal.classList.toggle("hidden");
    displayHistory();
});

closeHistoryBtn.addEventListener("click", () => {
    historyModal.classList.add("hidden");
});

// Close history modal when clicking outside
historyModal.addEventListener("click", (e) => {
    if (e.target === historyModal) {
        historyModal.classList.add("hidden");
    }
});

// Event listeners for both button sets
const allButtons = document.querySelectorAll(".basic-mode button:not([style*='display: none']), .scientific-mode button:not([style*='display: none'])");
allButtons.forEach(button => {
    // Skip empty buttons
    if (button.textContent.trim()) {
        button.addEventListener("click", () => {
            handleInput(button.textContent);
        });
    }
});

function handleInput(value) {
    if (value === "C" || value === "AC") {
        display.value = "";
        expression = "";
        resultPreview.textContent = "0";
    }
    else if (value === "⌫") {
        display.value = display.value.slice(0, -1);
        expression = expression.slice(0, -1);
        updatePreview();
    }
    else if (value === "=") {
        try {
            let result = eval(expression);
            display.value = result;
            resultPreview.textContent = result;
            
            // Add to history
            addToHistory(expression, result);
            
            expression = result.toString();
        } catch {
            display.value = "Error";
            resultPreview.textContent = "Error";
            expression = "";
        }
    }
    else if (value === "sin") {
        appendFunction("Math.sin(");
    }
    else if (value === "cos") {
        appendFunction("Math.cos(");
    }
    else if (value === "tan") {
        appendFunction("Math.tan(");
    }
    else if (value === "log") {
        appendFunction("Math.log10(");
    }
    else if (value === "ln") {
        appendFunction("Math.log(");
    }
    else if (value === "√") {
        appendFunction("Math.sqrt(");
    }
    else if (value === "x²") {
        addOperation("**2");
    }
    else if (value === "x³") {
        addOperation("**3");
    }
    else if (value === "xʸ") {
        addOperation("**");
    }
    else if (value === "n!") {
        appendFunction("factorial(");
    }
    else if (value === "π") {
        appendValue("Math.PI");
    }
    else if (value === "e") {
        appendValue("Math.E");
    }
    else if (value === "1/x") {
        addOperation("/(");
        display.value += "1/";
    }
    else if (value === "÷") {
        addOperator("/");
    }
    else if (value === "×") {
        addOperator("*");
    }
    else if (value === "−") {
        addOperator("-");
    }
    else if (value === "+") {
        addOperator("+");
    }
    else {
        appendValue(value);
    }
    updatePreview();
}

function appendFunction(func) {
    display.value += func;
    expression += func;
}

function appendValue(val) {
    display.value += val;
    expression += val;
}

function addOperator(op) {
    // Avoid adding operator if expression ends with an operator
    if (expression && !["+", "-", "*", "/", "("].includes(expression.slice(-1))) {
        display.value += op;
        expression += op;
    } else if (!expression) {
        // Allow minus sign at the start
        if (op === "-") {
            display.value += op;
            expression += op;
        }
    }
}

function addOperation(op) {
    if (expression && !["+", "-", "*", "/", "(", "**"].includes(expression.slice(-1))) {
        display.value += op;
        expression += op;
    }
}

function updatePreview() {
    try {
        if (expression) {
            let result = eval(expression);
            resultPreview.textContent = result;
        } else {
            resultPreview.textContent = "0";
        }
    } catch {
        resultPreview.textContent = "0";
    }
}

// Factorial function
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Make factorial available in eval
window.factorial = factorial;

/* 🔑 Keyboard Support */
document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") {
        handleInput(e.key);
    }
    else if (["+", "-", "*", "/", "."].includes(e.key)) {
        handleInput(e.key === "*" ? "×" : e.key === "/" ? "÷" : e.key === "-" ? "−" : e.key);
    }
    else if (e.key === "Enter") {
        e.preventDefault();
        handleInput("=");
    }
    else if (e.key === "Backspace") {
        e.preventDefault();
        handleInput("⌫");
    }
    else if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        handleInput("AC");
    }
    else if (e.key === "(") {
        display.value += "(";
        expression += "(";
        updatePreview();
    }
    else if (e.key === ")") {
        display.value += ")";
        expression += ")";
        updatePreview();
    }
});

// History functions
function addToHistory(expr, result) {
    calculationHistory.unshift({ expression: expr, result: result });
    if (calculationHistory.length > 20) {
        calculationHistory.pop();
    }
    localStorage.setItem("calcHistory", JSON.stringify(calculationHistory));
}

function displayHistory() {
    historyList.innerHTML = "";
    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; color: #9933ff; padding: 20px;">No history yet</div>';
        return;
    }
    calculationHistory.forEach((item, index) => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";
        historyItem.innerHTML = `
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        `;
        historyItem.addEventListener("click", () => {
            display.value = item.result;
            expression = item.result.toString();
            updatePreview();
            historyModal.classList.add("hidden");
        });
        historyList.appendChild(historyItem);
    });
}

// Clear history button listener
clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Clear all history?")) {
        calculationHistory = [];
        localStorage.removeItem("calcHistory");
        displayHistory();
    }
})
