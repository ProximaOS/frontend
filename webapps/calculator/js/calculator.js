document.addEventListener("DOMContentLoaded", function() {
  // Get the calculator buttons
  var buttons = document.getElementsByClassName("button");

  // Attach onclick event handler to each button
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", buttonClickHandler);
  }
});

function buttonClickHandler(event) {
  var value = event.target.innerHTML;

  switch (value) {
    case "C":
      clearResult();
      break;
    case "←":
      deleteLast();
      break;
    case "=":
      calculate();
      break;
    default:
      appendToResult(value);
      break;
  }
}

function appendToResult(value) {
  document.getElementById("result").value += value;
}

function clearResult() {
  document.getElementById("result").value = "";
}

function deleteLast() {
  var result = document.getElementById("result").value;
  document.getElementById("result").value = result.slice(0, -1);
}

function calculate() {
  var result = document.getElementById("result").value;
  var answer = eval(result.replace('÷', '/'));
  document.getElementById("result").value = answer.toLocaleString(navigator.language);
}
