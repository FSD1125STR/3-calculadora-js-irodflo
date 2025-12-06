// 1. REFERENCIAS DOM:

// Vistas
const startView = document.getElementById("view-start");
const loadingView = document.getElementById("view-loading");
const calculatorView = document.getElementById("view-calculator");

// Botones START y EXIT
const btnStart = document.getElementById("btn-start");
const btnExit = document.getElementById("btn-exit");

// Elementos de la calculadora
const screenEl = document.getElementById("screen"); // donde se ve el número actual
const historyEl = document.getElementById("history"); // operación en pequeño
const keysEl = document.querySelector(".calculator__keys"); // grid de botones

// 2. VISTAS:

// Mostrar una vista + ocultar las demás
function showView(viewId) {
  const views = document.querySelectorAll(".view");
  views.forEach((view) => view.classList.remove("view--active"));

  const activeView = document.getElementById(viewId);
  if (activeView) {
    activeView.classList.add("view--active");
  }
}

// Al cargar la página, empezar siempre en la vista de inicio
showView("view-start");

// START → CARGANDO → CALCULADORA
btnStart.addEventListener("click", () => {
  showView("view-loading");

  setTimeout(() => {
    showView("view-calculator");
  }, 1000); // 1 segundo
});

// EXIT → CARGANDO → START
btnExit.addEventListener("click", () => {
  showView("view-loading");

  setTimeout(() => {
    showView("view-start");
  }, 1000); // 1 segundo
});

// 3. ESTADO Y FUNCIONES DEL ENUNCIADO:

// Estado interno de la calculadora
let firstValue = null; // primer número
let operator = null; // operador actual (+ - * /)
let waitingForSecondValue = false; // indica si se está a la espera del siguiente número

// Requisito funciones Reto3:
function add(a, b) {
  return a + b;
}

function substract(a, b) {
  return a - b;
}

function product(a, b) {
  return a * b;
}

function division(a, b) {
  return a / b;
}

function clear() {
  firstValue = null;
  operator = null;
  waitingForSecondValue = false;
  screenEl.textContent = "0";
  historyEl.textContent = "";
}

// Sin eval(): calculamos a partir del operador
function calculate(a, b, op) {
  if (op === "+") return add(a, b);
  if (op === "-") return substract(a, b);
  if (op === "*") return product(a, b);
  if (op === "/") {
    if (b === 0) {
      alert("No se puede dividir entre 0");
      return a;
    }
    return division(a, b);
  }
  return b;
}

// 4. CLICK EN LOS BOTONES DE LA CALCULADORA

keysEl.addEventListener("click", (event) => {
  const button = event.target;
  if (!button.matches("button")) return; // por si se hace click en el gap

  const key = button.dataset.key; // "7", "clear", "equals", "sign", "."
  const op = button.dataset.operator; // "+", "-", "*", "/"

  // Botón ±
  if (key === "sign") {
    toggleSign();
    return;
  }

  // Botón decimal .
  if (key === ".") {
    handleNumber(".");
    return;
  }

  // Números 0-9
  if (key >= "0" && key <= "9") {
    handleNumber(key);
    return;
  }

  // Operadores (+, -, *, /)
  if (op) {
    handleOperator(op);
    return;
  }

  // Clear
  if (key === "clear") {
    clear();
    return;
  }

  // Igual
  if (key === "equals") {
    handleEquals();
    return;
  }
});

// 5. FUNCIONES AUX. (números, operadores, igual, ±):

function handleNumber(input) {
  let current = screenEl.textContent;

  // Esperando el segundo valor (acabamos de pulsar un operador),
  // reseteamos el número actual
  if (waitingForSecondValue) {
    current = "0";
    waitingForSecondValue = false;
  }

  // ---- DECIMALES ----
  if (input === ".") {
    // Si ya hay un punto en el número, no añadimos otro
    if (current.includes(".")) return;

    // Si estamos en 0, al pulsar "." queremos ver "0."
    screenEl.textContent = current === "0" ? "0." : current + ".";
    return;
  }

  // ---- NÚMEROS ----

  // Si lo que hay ahora es "0", lo sustituimos
  if (current === "0") {
    screenEl.textContent = input;
  } else {
    // Si no hay, concatenamos
    screenEl.textContent = current + input;
  }
}

function handleOperator(nextOperator) {
  const currentValue = parseFloat(screenEl.textContent);

  if (firstValue === null) {
    // Primer número introducido
    firstValue = currentValue;
  } else if (!waitingForSecondValue) {
    // Tenemos un primer valor y un operador, y se introduce otro número:
    // calculamos resultado parcial para permitir operaciones encadenadas
    const result = calculate(firstValue, currentValue, operator);
    screenEl.textContent = result;
    firstValue = result;
  }

  operator = nextOperator;
  waitingForSecondValue = true;
  historyEl.textContent = firstValue + " " + operator;
}

function handleEquals() {
  const secondValue = parseFloat(screenEl.textContent);

  if (firstValue === null || operator === null) return;

  const result = calculate(firstValue, secondValue, operator);
  screenEl.textContent = result;
  historyEl.textContent = firstValue + " " + operator + " " + secondValue;

  // Preparación de la calculadora para seguir usando el resultado
  firstValue = result;
  operator = null;
  waitingForSecondValue = true;
}

// Cambiar signo ±
function toggleSign() {
  let current = screenEl.textContent;

  // Si estamos en 0, usamos ± para empezar un número negativo
  if (current === "0") {
    screenEl.textContent = "-";
    waitingForSecondValue = false;
    return;
  }

  // Si solo hay un guion, volvemos a 0
  if (current === "-") {
    screenEl.textContent = "0";
    return;
  }

  // Cambiar signo normal
  if (current.startsWith("-")) {
    screenEl.textContent = current.slice(1);
  } else {
    screenEl.textContent = "-" + current;
  }
}

// Borrar último dígito (teclado)
function deleteLastDigit() {
  let current = screenEl.textContent;

  // Si queda 1 dígito (o "-X"), volvemos a 0
  if (
    current.length <= 1 ||
    (current.length === 2 && current.startsWith("-"))
  ) {
    screenEl.textContent = "0";
  } else {
    screenEl.textContent = current.slice(0, -1);
  }
}

// 6. EXTRA: TECLADO FÍSICO

document.addEventListener("keydown", handleKeyboardInput);

function handleKeyboardInput(event) {
  const key = event.key;

  // Números
  if (key >= "0" && key <= "9") {
    handleNumber(key);
    return;
  }

  // Decimal
  if (key === ".") {
    handleNumber(".");
    return;
  }

  // Tecla "-" → puede ser signo negativo o operador de resta
  if (key === "-") {
    const current = screenEl.textContent;

    const startingFirstNegative =
      firstValue === null && operator === null && current === "0";

    const startingSecondNegative =
      operator !== null && waitingForSecondValue === true && current === "0";

    if (startingFirstNegative || startingSecondNegative) {
      // Empezamos a escribir un número negativo
      screenEl.textContent = "-";
      waitingForSecondValue = false;
      return;
    }

    // En cualquier otro caso, se usa como operador de resta
    handleOperator("-");
    return;
  }

  // Resto de operadores (+, *, /) → sin doble función: siempre operadores

  if (key === "+" || key === "*" || key === "/") {
    handleOperator(key);
    return;
  }

  // Igual
  if (key === "Enter" || key === "=") {
    event.preventDefault();
    handleEquals();
    return;
  }

  // Clear total con C/c
  if (key.toLowerCase() === "c") {
    clear();
    return;
  }

  // Borrar
  if (key === "Backspace") {
    deleteLastDigit();
    return;
  }
}
