// ======================================================
// 1. داده‌های اولیه (با انتقالات لاندا / اپسیلون)
// ======================================================
let arrState = ["q0", "q1", "q2"];
let arrAlphabet = ["a", "b"]; // ε اینجا نیست
let startState = "q0";
let selectedStates = ["q2"];

// مثال: q0 با لاندا به q1 میره، q1 با لاندا به q2 میره
let arrTrans = [
  "&(q0,a)=q0",
  "&(q0,ε)=q1",  // انتقال ε
  "&(q1,b)=q1",
  "&(q1,ε)=q2",  // انتقال ε
  "&(q2,a)=q2",
  "&(q2,b)=q2"
];

const actionIcons = ` 
<div class='flex gap-2'>
  <svg onclick="handleDelete(this)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 cursor-pointer hover:text-red-500 delete-btn"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
  <svg onclick="handleEdit(this)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 cursor-pointer hover:text-yellow-400 edit-btn"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
</div>`;

const tasksList = document.getElementById("trans");
const alphabetList = document.getElementById("alphabets");
const stateList = document.getElementById("states");
const selectStart = document.getElementById("startState");
const selectFinal = document.getElementById("finalStates");
const inpTrans = document.getElementById("inpTrans");
const inpAlphabet = document.getElementById("inpAlphabets");
const inpState = document.getElementById("inpStates");

// ======================================================
// 2. توابع کمکی (CRUD)
// ======================================================

function createListItem(text, container, type) {
  const newli = document.createElement("li");
  newli.dataset.type = type;
  newli.innerHTML = `
    <input type='text' class='hidden outline-none border-none w-auto bg-transparent text-white'/>
    <span class="task-text select-none">${text}</span>
    ${actionIcons}
  `;
  container.appendChild(newli);
}

function handleDelete(el) {
  const item = el.closest("li");
  const taskText = item.querySelector(".task-text").innerText;
  const type = item.dataset.type;
  item.classList.add("fall");

  if (type === "trans") {
    const idx = arrTrans.indexOf(taskText);
    if (idx > -1) arrTrans.splice(idx, 1);
  } else if (type === "alphabet") {
    const idx = arrAlphabet.indexOf(taskText);
    if (idx > -1) arrAlphabet.splice(idx, 1);
  } else if (type === "state") {
    const idx = arrState.indexOf(taskText);
    if (idx > -1) arrState.splice(idx, 1);
    updateSelectOptions();
  }
  setTimeout(() => item.remove(), 400);
}

function handleEdit(el) {
  const item = el.closest("li");
  const task = item.querySelector(".task-text");
  const input = item.querySelector("input");
  const type = item.dataset.type;
  const originalText = task.innerText;

  if (input.style.display !== "inline") {
    task.style.display = "none";
    input.style.display = "inline";
    input.value = originalText;
    input.focus();
    item.style.backgroundColor = "#212529";
    el.classList.add("animate-pulse");
    el.style.color = "red";
  } else {
    const newVal = input.value.trim();
    if (newVal !== "") {
      if (type === "trans") {
        const idx = arrTrans.indexOf(originalText);
        if (idx > -1) arrTrans[idx] = newVal;
      } else if (type === "alphabet") {
        const idx = arrAlphabet.indexOf(originalText);
        if (idx > -1) arrAlphabet[idx] = newVal;
      } else if (type === "state") {
        const idx = arrState.indexOf(originalText);
        if (idx > -1) arrState[idx] = newVal;
        updateSelectOptions();
      }
      task.textContent = newVal;
    }
    task.style.display = "inline";
    input.style.display = "none";
    item.style.backgroundColor = "#343a40";
    el.classList.remove("animate-pulse");
    el.style.color = "";
  }
}

// ======================================================
// 3. لودرها و لیسنرها
// ======================================================

function loadTransitions() {
  tasksList.innerHTML = "";
  arrTrans.forEach(item => createListItem(item, tasksList, "trans"));
}
document.getElementById("btn-add-trans").addEventListener("click", () => {
  const val = inpTrans.value.trim();
  if (!val) return;
  arrTrans.push(val);
  createListItem(val, tasksList, "trans");
  inpTrans.value = "";
});

function loadAlphabet() {
  alphabetList.innerHTML = "";
  arrAlphabet.forEach(item => createListItem(item, alphabetList, "alphabet"));
}
document.getElementById("btn-add-alphabet").addEventListener("click", () => {
  const val = inpAlphabet.value.trim();
  if (!val) return;
  arrAlphabet.push(val);
  createListItem(val, alphabetList, "alphabet");
  inpAlphabet.value = "";
});

function loadState() {
  stateList.innerHTML = "";
  arrState.forEach(item => createListItem(item, stateList, "state"));
  updateSelectOptions();
}
document.getElementById("btn-add-state").addEventListener("click", () => {
  const val = inpState.value.trim();
  if (!val) return;
  arrState.push(val);
  createListItem(val, stateList, "state");
  inpState.value = "";
  updateSelectOptions();
});

function updateSelectOptions() {
  selectStart.innerHTML = `<option value="" disabled class="text-[#868e96]">Select Start State</option>`;
  arrState.forEach((item) => {
    const sOpt = document.createElement("option");
    sOpt.value = item;
    sOpt.innerText = item;
    if (item === startState) sOpt.selected = true;
    selectStart.appendChild(sOpt);
  });

  selectFinal.innerHTML = "";
  arrState.forEach((item) => {
    const fOpt = document.createElement("option");
    fOpt.value = item;
    fOpt.innerText = item;
    if (selectedStates.includes(item)) fOpt.selected = true;
    selectFinal.appendChild(fOpt);
  });
}

selectStart.addEventListener("change", (e) => startState = e.target.value);
selectFinal.addEventListener("change", () => selectedStates = Array.from(selectFinal.selectedOptions).map(opt => opt.value));

// ======================================================
// 4. محاسبه و رسم (CALC)
// ======================================================
document.getElementById("btn-calc").addEventListener("click", function () {
  if (!startState) {
    alert("Please select a start state!");
    return;
  }

  const nfaParsedTransitions = parseNFATransitions(arrTrans);
  
  const nfaData = {
    alphabet: [...arrAlphabet],
    states: [...arrState],
    startState: startState,
    finalStates: [...selectedStates],
    transitions: nfaParsedTransitions,
  };

  console.log("NFA Input:", nfaData);

  const dfaResult = convertNFAtoDFA(nfaData);
  console.log("DFA Result:", dfaResult);

  // رسم نمودارها
  renderDFA(nfaData, "inputDFA");
  renderDFA(dfaResult, "outputDFA");

  // رسم جدول Dtran (جدید)
  renderTransitionTable(dfaResult, "dtranTableContainer");
});

// ======================================================
// 5. مقداردهی اولیه
// ======================================================
function init() {
  loadTransitions();
  loadAlphabet();
  loadState();
  
  // اگر می‌خواهید با باز شدن صفحه خودکار حل شود، خط زیر را فعال کنید:
  // document.getElementById("btn-calc").click();
}

init();