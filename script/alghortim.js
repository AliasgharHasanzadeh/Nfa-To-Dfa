/**
 * الگوریتم تبدیل NFA به DFA (روش Subset Construction)
 * و توابع رسم گراف و جدول
 */

// پارس کردن رشته‌های ورودی ترنزیشن
// مثال: &(q0,a)=q1,q2 یا &(q0,ε)=q1
function parseNFATransitions(rawList) {
    const transitions = {};

    for (let line of rawList) {
        line = line.replace(/\s+/g, ""); // حذف فواصل
        const match = line.match(/&\((.+),(.+)\)=(.+)/);
        if (!match) continue;

        const [_, state, symbol, targetsRaw] = match;
        const targets = targetsRaw.split(",").filter((t) => t.length > 0);

        if (!transitions[state]) transitions[state] = {};
        if (!transitions[state][symbol]) transitions[state][symbol] = [];

        targets.forEach(t => {
            if (!transitions[state][symbol].includes(t)) {
                transitions[state][symbol].push(t);
            }
        });
    }
    return transitions;
}

// تولید کلید یکتا برای مجموعه وضعیت‌ها (مثلاً {q0,q1})
function getSubsetKey(states) {
    if (states.length === 0) return "Trap";
    const uniqueSorted = Array.from(new Set(states)).sort();
    return `{${uniqueSorted.join(",")}}`;
}

// محاسبه ε-closure
function getEpsilonClosure(states, transitions) {
    let stack = [...states];
    let closure = new Set(states);
    const epsilonSymbol = "ε"; // نماد لاندا

    while(stack.length > 0){
        let s = stack.pop();
        if(transitions[s] && transitions[s][epsilonSymbol]){
            for(let nextState of transitions[s][epsilonSymbol]){
                if(!closure.has(nextState)){
                    closure.add(nextState);
                    stack.push(nextState);
                }
            }
        }
    }
    return Array.from(closure);
}

// محاسبه تابع Move(T, a)
function getMove(states, symbol, transitions) {
    const result = new Set();
    for (const s of states) {
        if (transitions[s] && transitions[s][symbol]) {
            transitions[s][symbol].forEach(target => result.add(target));
        }
    }
    return Array.from(result);
}

// === الگوریتم اصلی DTRAN ===
function convertNFAtoDFA(nfa) {
    const { alphabet, transitions, startState, finalStates } = nfa;

    // ۱. وضعیت شروع DFA = epsilon-closure(startState)
    const startClosure = getEpsilonClosure([startState], transitions);
    const startKey = getSubsetKey(startClosure);

    const dfaStates = [startKey]; 
    const dfaTransitions = {};    
    const dfaFinalStates = [];    
    
    const queue = [startClosure]; 
    const dfaStateMap = { [startKey]: startClosure };
    const processedKeys = new Set();

    while (queue.length > 0) {
        const currentSet = queue.shift();
        const currentKey = getSubsetKey(currentSet);

        if (processedKeys.has(currentKey)) continue;
        processedKeys.add(currentKey);

        // بررسی پایانی بودن
        const isFinal = currentSet.some(s => finalStates.includes(s));
        if (isFinal && !dfaFinalStates.includes(currentKey)) {
            dfaFinalStates.push(currentKey);
        }

        if (!dfaTransitions[currentKey]) dfaTransitions[currentKey] = {};

        // حلقه روی حروف الفبا
        for (const symbol of alphabet) {
            const moveResult = getMove(currentSet, symbol, transitions);
            const targetSet = getEpsilonClosure(moveResult, transitions);
            
            if (targetSet.length === 0) continue; // Trap State (معمولاً رسم نمی‌شود)

            const targetKey = getSubsetKey(targetSet);
            dfaTransitions[currentKey][symbol] = targetKey;

            if (!dfaStateMap[targetKey]) {
                dfaStateMap[targetKey] = targetSet;
                dfaStates.push(targetKey);
                queue.push(targetSet);
            }
        }
    }

    return {
        states: dfaStates,
        alphabet: alphabet,
        transitions: dfaTransitions,
        startState: startKey,
        finalStates: dfaFinalStates
    };
}

// === رسم گراف (Vis.js) ===
function renderDFA(graphData, containerId) {
    const container = document.getElementById(containerId);
    
    const nodesArray = graphData.states.map(state => {
        const isFinal = graphData.finalStates.includes(state);
        const isStart = (state === graphData.startState);
        return {
            id: state,
            label: state,
            shape: isFinal ? "box" : "circle",
            color: {
                background: isStart ? "#a5d8ff" : (isFinal ? "#ffc9c9" : "#ffffff"),
                border: isFinal ? "#e03131" : "#228be6",
                highlight: "#ffec99"
            },
            borderWidth: isFinal ? 3 : 1,
            font: { size: 14 }
        };
    });

    const edgesArray = [];
    const trans = graphData.transitions;

    for (const [src, moves] of Object.entries(trans)) {
        for (const [symbol, dest] of Object.entries(moves)) {
            if (Array.isArray(dest)) { // NFA
                dest.forEach(d => {
                    edgesArray.push({ from: src, to: d, label: symbol, arrows: "to", smooth: { type: "curvedCW", roundness: 0.2 } });
                });
            } else { // DFA
                edgesArray.push({ from: src, to: dest, label: symbol, arrows: "to", smooth: { type: "curvedCW", roundness: 0.2 } });
            }
        }
    }

    const data = { nodes: new vis.DataSet(nodesArray), edges: new vis.DataSet(edgesArray) };
    const options = {
        physics: { enabled: true, hierarchicalRepulsion: { nodeDistance: 150 } },
        layout: { hierarchical: { enabled: true, direction: "LR", sortMethod: "directed" } }
    };

    new vis.Network(container, data, options);
}

// === رسم جدول DTRAN (جدید) ===
function renderTransitionTable(dfa, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `
    <table class="w-full text-left text-sm text-[#dee2e6] border-collapse">
        <thead class="bg-[#212529] text-xs uppercase text-[#4dabf7]">
            <tr>
                <th class="px-6 py-3 text-center border-b border-[#495057]">State</th>
                ${dfa.alphabet.map(a => `<th class="px-6 py-3 text-center border-b border-[#495057]">${a}</th>`).join('')}
            </tr>
        </thead>
        <tbody class="divide-y divide-[#495057]">
    `;

    dfa.states.forEach(state => {
        const isStart = (state === dfa.startState);
        const isFinal = dfa.finalStates.includes(state);
        
        let icon = "";
        if (isStart) icon += `<span class="text-green-400 font-bold mr-1">→</span>`;
        if (isFinal) icon += `<span class="text-red-400 font-bold mr-1">*</span>`;

        let rowClass = "hover:bg-[#2b3035] transition-colors";
        if (isFinal) rowClass += " bg-[#343a40]/50";

        html += `<tr class="${rowClass}">
            <td class="px-6 py-4 font-medium whitespace-nowrap text-center text-[#f8f9fa]">
                ${icon}${state}
            </td>`;
        
        dfa.alphabet.forEach(symbol => {
            const dest = dfa.transitions[state]?.[symbol] || "<span class='text-gray-600'>∅</span>";
            html += `<td class="px-6 py-4 text-center text-[#adb5bd]">${dest}</td>`;
        });

        html += `</tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}