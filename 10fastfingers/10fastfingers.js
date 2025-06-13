// ==UserScript==
// @name         10FastFingers [Normal]
// @namespace    http://tampermonkey.net/
// @version      13.37
// @description  Shinigami
// @author       Shinigami
// @match        https://10fastfingers.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isPanelExpanded   = false;
    let isScriptEnabled   = false;
    let isPanelVisible    = false;
    let charIndex         = 0;
    let originalText      = "";
    let erroredText       = "";
    let lastKeyTime       = 0;
    let newTestResetDone  = false;

    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position: 'absolute',
        top: '50px',
        left: '50px',
        width: '280px',
        height: '35px',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        border: '1px solid white',
        boxShadow: '0 0 5px white',
        borderRadius: '16px',
        zIndex: '9999',
        display: 'none',
        flexDirection: 'column',
        padding: '8px',
        transform: 'scale(0.8)',
        opacity: '0',
        transition: 'transform 0.25s ease, opacity 0.25s ease, height 0.25s ease'
    });
    panel.tabIndex = -1;
    document.body.appendChild(panel);

    const topCont = document.createElement('div');
    Object.assign(topCont.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'move'
    });
    panel.appendChild(topCont);

    const togCont = document.createElement('div');
    Object.assign(togCont.style, {
        width: '36px',
        height: '18px',
        borderRadius: '9px',
        backgroundColor: 'rgba(200,200,200,0.3)',
        position: 'relative',
        backdropFilter: 'blur(4px)',
        transition: 'background 0.25s ease'
    });
    const togCircle = document.createElement('div');
    Object.assign(togCircle.style, {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: 'rgba(240,240,240,0.9)',
        position: 'absolute',
        top: '1px',
        left: '1px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'transform 0.25s ease'
    });
    togCont.appendChild(togCircle);
    topCont.appendChild(togCont);

    const resizeBtn = document.createElement('button');
    resizeBtn.textContent = '+';
    Object.assign(resizeBtn.style, {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        color: 'black',
        cursor: 'pointer',
        padding: '4px'
    });
    topCont.appendChild(resizeBtn);

    const inputsCont = document.createElement('div');
    Object.assign(inputsCont.style, {
        display: 'none',
        flexDirection: 'column',
        marginTop: '8px'
    });
    panel.appendChild(inputsCont);

    function createInput(labelText, defaultValue, id) {
        const grp = document.createElement('div');
        grp.style.marginBottom = '10px';
        const lbl = document.createElement('label');
        lbl.textContent = labelText;
        Object.assign(lbl.style, {
            color: 'black',
            fontSize: '14px',
            marginBottom: '4px',
            display: 'block'
        });
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.value = defaultValue;
        inp.id = id;
        Object.assign(inp.style, {
            width: '100%',
            padding: '6px',
            fontSize: '14px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            color: 'black',
            outline: 'none'
        });
        inp.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        inp.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                inp.blur();
                e.stopPropagation();
            }
        });
        grp.appendChild(lbl);
        grp.appendChild(inp);
        return grp;
    }

    const inputs = {
        errorChance: createInput('Error chance (%)', 15, 'errorChance'),
        neighborChars: createInput('Neighbor swap (%)', 25, 'neighborChars'),
        swapChars: createInput('Swap letters (%)', 25, 'swapChars'),
        wpmInput: createInput('WPM', 300, 'wpmInput')
    };
    Object.values(inputs).forEach(g => inputsCont.appendChild(g));

    function showPanel() {
        panel.style.display = 'flex';
        requestAnimationFrame(() => {
            panel.style.transform = 'scale(1)';
            panel.style.opacity = '1';
            panel.focus();
        });
    }

    function hidePanel() {
        panel.style.transform = 'scale(0.8)';
        panel.style.opacity = '0';
        panel.addEventListener('transitionend', function onEnd() {
            panel.removeEventListener('transitionend', onEnd);
            if (!isPanelVisible) {
                panel.style.display = 'none';
                document.body.focus();
            }
        });
    }

    togCont.addEventListener('click', e => {
        e.stopPropagation();
        isScriptEnabled = !isScriptEnabled;
        togCircle.style.transform = isScriptEnabled ? 'translateX(18px)' : 'translateX(0)';
        togCont.style.backgroundColor = isScriptEnabled
            ? 'rgba(80,80,80,0.6)' : 'rgba(200,200,200,0.3)';
    });

    resizeBtn.addEventListener('click', e => {
        e.stopPropagation();
        isPanelExpanded = !isPanelExpanded;
        resizeBtn.textContent = isPanelExpanded ? '−' : '+';
        if (isPanelExpanded) {
            inputsCont.style.display = 'flex';
            panel.style.height = inputsCont.scrollHeight + topCont.offsetHeight + 16 + 'px';
        } else {
            inputsCont.style.display = 'none';
            panel.style.height = '50px';
        }
    });

    let dragging = false, offX = 0, offY = 0;
    topCont.addEventListener('mousedown', e => {
        dragging = true;
        offX = e.clientX - panel.getBoundingClientRect().left;
        offY = e.clientY - panel.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', e => {
        if (dragging) {
            panel.style.left = (e.clientX - offX) + 'px';
            panel.style.top = (e.clientY - offY) + 'px';
        }
    });
    document.addEventListener('mouseup', () => dragging = false);

    document.addEventListener('keydown', e => {
        if (e.key === 'F8') {
            e.preventDefault();
            isPanelVisible = !isPanelVisible;
            if (isPanelVisible) {
                showPanel();
                isPanelExpanded = false;
                resizeBtn.textContent = '+';
                inputsCont.style.display = 'none';
                panel.style.height = '50px';
            } else {
                hidePanel();
            }
        }
    }, true);

    function getTextFromDOM() {
        const wordsContainer = document.getElementById('words');
        if (!wordsContainer) return "";
        const row = wordsContainer.querySelector('#row1');
        if (!row) return "";
        const spans = row.getElementsByTagName('span');
        const words = [];
        for (let span of spans) {
            words.push(span.textContent);
        }
        return words.join(' ');
    }

    function generateErroredText(original) {
        const eChance = parseFloat(document.getElementById('errorChance').value) / 100;
        const words = original.split(/\s+/).filter(Boolean);
        const resultWords = words.map(w => {
            if (Math.random() < eChance) {
                return shuffleWord(w);
            }
            return w;
        });
        return resultWords.join(' ') + ' ';
    }

    function shuffleWord(word) {
        let arr = word.split('');
        const neighborChance = parseFloat(document.getElementById('neighborChars').value) / 100;
        const swapChance = parseFloat(document.getElementById('swapChars').value) / 100;

        if (Math.random() < neighborChance && arr.length > 0) {
            let i = Math.floor(Math.random() * arr.length);
            let c = arr[i].toLowerCase();
            const neighbors = adjacentKeys[c] || [];
            if (neighbors.length > 0) {
                let r = neighbors[Math.floor(Math.random() * neighbors.length)];
                arr[i] = isUpperCase(arr[i]) ? r.toUpperCase() : r;
            }
        }
        if (Math.random() < swapChance && arr.length > 1) {
            let i = Math.floor(Math.random() * (arr.length - 1));
            [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        }
        return arr.join('');
    }

    function isUpperCase(ch) {
        return ch === ch.toUpperCase() && ch !== ch.toLowerCase();
    }

    const adjacentKeys = {
        '1': ['`','2'],'2': ['1','3'],'3': ['2','4'],
        '4': ['3','5'],'5': ['4','6'],'6': ['5','7'],
        '7': ['6','8'],'8': ['7','9'],'9': ['8','0'],
        '0': ['-','9'],
        'q': ['w','1'],'w': ['q','e','2'],'e': ['w','r','3'],
        'r': ['e','t','4'],'t': ['r','y','5'],'y': ['t','u','6'],
        'u': ['y','i','7'],'i': ['u','o','8'],'o': ['i','p','9'],
        'p': ['o','0','['],
        'a': ['s','q'], 's': ['a','d','w'],'d': ['s','f','e'],
        'f': ['d','g','r'],'g': ['f','h','t'],'h': ['g','j','y'],
        'j': ['h','k','u'],'k': ['j','l','i'],'l': ['k',';','o'],
        ';': ['l','p'],
        'z': ['x','a'],'x': ['z','c','s'],'c': ['x','v','d'],
        'v': ['c','b','f'],'b': ['v','n','g'],'n': ['b','m','h'],
        'm': ['n',',','j'],',': ['m','.','k'],'.': [',','/','l'],
        '/': ['.',';'],
        'й': ['ц','1'], 'ц': ['й','у','2'],'у': ['ц','к','3'],
        'к': ['у','е','4'],'е': ['к','н','5'],'н': ['е','г','6'],
        'г': ['н','ш','7'],'ш': ['г','щ','8'],'щ': ['ш','з','9'],
        'з': ['щ','х','0'],'х': ['з','ъ','-'],'ъ': ['х','='],
        'ф': ['ы','й'],'ы': ['ф','в','ц'],'в': ['ы','а','у'],
        'а': ['в','п','к'],'п': ['а','р','е'],'р': ['п','о','н'],
        'о': ['р','л','г'],'л': ['о','д','ш'],'д': ['л','ж','щ'],
        'ж': ['д','э','з'],'э': ['ж','ъ'],
        'я': ['ч','ф'],'ч': ['я','с','ы'],'с': ['ч','м','в'],
        'м': ['с','и','а'],'и': ['м','т','п'],'т': ['и','ь','р'],
        'ь': ['т','б','о'],'б': ['ь','ю','л'],'ю': ['б','.','д'],
        '.': ['ю','ж','э']
    };

    function simulateSpaceKey() {
        const inputField = document.getElementById('inputfield');
        if (!inputField) return;
        const downEvent = new KeyboardEvent('keydown', {
            key: ' ', code: 'Space', keyCode: 32, which: 32, bubbles: true
        });
        inputField.dispatchEvent(downEvent);
        document.execCommand('insertText', false, ' ');
        const upEvent = new KeyboardEvent('keyup', {
            key: ' ', code: 'Space', keyCode: 32, which: 32, bubbles: true
        });
        inputField.dispatchEvent(upEvent);
    }

    setInterval(() => {
        const currentDOM = getTextFromDOM();
        const timerEl = document.getElementById('timer');
        const timerText = timerEl ? timerEl.textContent.trim() : "";
        if (timerText === "1:00" && !newTestResetDone) {
            originalText = currentDOM;
            erroredText = generateErroredText(originalText);
            charIndex = 0;
            newTestResetDone = true;
        } else if (timerText !== "1:00") {
            newTestResetDone = false;
        }
        if (currentDOM && currentDOM !== originalText) {
            originalText = currentDOM;
            erroredText = generateErroredText(originalText);
            charIndex = 0;
        }
    }, 500);

    document.addEventListener('keydown', (e) => {
        if (panel.contains(e.target)) return;
        if (!isScriptEnabled) return;
        e.preventDefault();
        e.stopPropagation();
        throttledKeyPress(e.key);
    });

    function throttledKeyPress(key) {
        const wpmValue = parseFloat(document.getElementById('wpmInput').value) || 300;
        const minInterval = 60000 / (wpmValue * 5);
        const now = performance.now();
        const diff = now - lastKeyTime;
        if (diff >= minInterval) {
            lastKeyTime = now;
            processKey(key);
        } else {
            const delay = minInterval - diff;
            lastKeyTime += minInterval;
            setTimeout(() => processKey(key), delay);
        }
    }

    function processKey(key) {
        if (['Tab', 'Escape', 'Enter'].includes(key)) {
            charIndex = 0;
            erroredText = "";
            return;
        }
        if (key === 'Backspace') {
            charIndex = Math.max(0, charIndex - 1);
            return;
        }
        if (charIndex >= erroredText.length) {
            return;
        }
        let charToType = erroredText[charIndex];
        charIndex++;
        if (charToType.trim() === "") {
            simulateSpaceKey();
        } else {
            document.execCommand('insertText', false, charToType);
        }
    }
})();
