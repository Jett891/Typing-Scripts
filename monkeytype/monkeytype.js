// ==UserScript==
// @name         Monkeytype [Normal + Tribe]
// @namespace    http://tampermonkey.net/
// @version      13.37
// @description  Shinigami
// @author       Shinigami
// @match        https://monkeytype.com/*
// @match        https://dev.monkeytype.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var isExpanded = false;
    var isMenuVisible = false;
    var isToggled = false;
    var Index = 0;
    var typeWord = "";
    var lastKeyTime = 0;
    var isDragging = false, offsetX = 0, offsetY = 0;

    var menu = document.createElement('div');
    Object.assign(menu.style, {
        position: 'absolute',
        top: '50px',
        left: '50px',
        width: '280px',
        height: '35px',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '16px',
        zIndex: '9999',
        display: 'none',
        flexDirection: 'column',
        padding: '8px',
        transform: 'scale(0.8)',
        opacity: '0',
        transition: 'transform 0.25s ease, opacity 0.25s ease, height 0.25s ease'
    });
    menu.tabIndex = -1;
    document.body.appendChild(menu);

    var header = document.createElement('div');
    Object.assign(header.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'move'
    });
    menu.appendChild(header);

    var toggle = document.createElement('div');
    Object.assign(toggle.style, {
        width: '36px',
        height: '18px',
        borderRadius: '9px',
        backgroundColor: 'rgba(200,200,200,0.3)',
        position: 'relative',
        backdropFilter: 'blur(4px)',
        transition: 'background 0.25s ease'
    });
    var knob = document.createElement('div');
    Object.assign(knob.style, {
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
    toggle.appendChild(knob);
    header.appendChild(toggle);

    var expandBtn = document.createElement('button');
    expandBtn.textContent = '+';
    Object.assign(expandBtn.style, {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        color: '#fff',
        cursor: 'pointer',
        padding: '4px'
    });
    header.appendChild(expandBtn);

    var settings = document.createElement('div');
    Object.assign(settings.style, {
        display: 'none',
        flexDirection: 'column',
        marginTop: '8px'
    });
    menu.appendChild(settings);

    function createField(labelText, id, defaultValue) {
        var wrap = document.createElement('div');
        wrap.style.marginBottom = '10px';
        var label = document.createElement('label');
        label.textContent = labelText;
        Object.assign(label.style, { color: '#fff', fontSize: '14px', marginBottom: '4px', display: 'block' });
        var input = document.createElement('input');
        input.id = id; input.value = defaultValue; input.type = 'number';
        Object.assign(input.style, {
            width: '100%',
            padding: '6px',
            fontSize: '14px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            color: '#fff',
            outline: 'none'
        });
        input.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                input.blur();
                e.stopPropagation();
            }
        });
        wrap.appendChild(label);
        wrap.appendChild(input);
        return wrap;
    }
    ['Error Chance (%)','Swap Chars (%)','Neighbor Chars (%)','Word Last Char (%)','Cut Last Chars (%)','WPM'].forEach((text, i) =>
        settings.appendChild(createField(text, ['errorChance','swapChars','neighborChars','wordLastChar','cutLastChars','wpmInput'][i], ['10','5','5','15','3','300'][i]))
    );

    function showMenu() {
        menu.style.display = 'flex';
        requestAnimationFrame(() => {
            menu.style.transform = 'scale(1)';
            menu.style.opacity = '1';
            menu.focus();
        });
    }
    function hideMenu() {
        menu.style.transform = 'scale(0.8)';
        menu.style.opacity = '0';
        menu.addEventListener('transitionend', function onEnd() {
            menu.removeEventListener('transitionend', onEnd);
            if (!isMenuVisible) {
                menu.style.display = 'none';
                document.body.focus();
            }
        });
    }

    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        isToggled = !isToggled;
        knob.style.transform = isToggled ? 'translateX(18px)' : 'translateX(0)';
        toggle.style.backgroundColor = isToggled ? 'rgba(80,80,80,0.6)' : 'rgba(200,200,200,0.3)';
    });

    expandBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        isExpanded = !isExpanded;
        expandBtn.textContent = isExpanded ? '−' : '+';
        if (isExpanded) {
            settings.style.display = 'flex';
            menu.style.height = settings.scrollHeight + header.offsetHeight + 16 + 'px';
        } else {
            settings.style.display = 'none';
            menu.style.height = '50px';
        }
    });

    header.addEventListener('mousedown', function(e) {
        isDragging = true;
        offsetX = e.clientX - menu.getBoundingClientRect().left;
        offsetY = e.clientY - menu.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            menu.style.left = (e.clientX - offsetX) + 'px';
            menu.style.top = (e.clientY - offsetY) + 'px';
        }
    });
    document.addEventListener('mouseup', function() { isDragging = false; });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'F8') {
            e.preventDefault();
            isMenuVisible = !isMenuVisible;
            if (isMenuVisible) {
                showMenu();
                isExpanded = false;
                expandBtn.textContent = '+';
                settings.style.display = 'none';
                menu.style.height = '50px';
            } else {
                hideMenu();
            }
        }
    }, true);

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

    function getCurrentWordAndSpace() {
        var activeWords = document.querySelectorAll('.word.active');
        var characterList = [];
        activeWords.forEach(function(wordElement) {
            var letters = wordElement.querySelectorAll('letter');
            letters.forEach(function(letterElement) {
                characterList.push(letterElement.textContent.trim());
            });
            characterList.push(' ');
        });
        return characterList.join('');
    }

    function ErroredWord(word, chances) {
        var analy = word.trim();
        if (Math.random() < chances.errorChance) {
            var shuffledWord = shuffle(analy, chances);
            return shuffledWord + ' ';
        }
        return analy + ' ';
    }

    function shuffle(word, chances) {
        var array = word.split('');

        for (let i = 0; i < array.length; i++) {
            if (Math.random() < chances.neighborChars) {
                const currentChar = array[i];
                const possibleSwaps = adjacentKeys[currentChar] || [];
                if (possibleSwaps.length > 0) {
                    const randomNeighbor = possibleSwaps[Math.floor(Math.random() * possibleSwaps.length)];
                    array[i] = randomNeighbor;
                }
            }
            if (Math.random() < chances.swapChars) {
                if (i > 0 && Math.random() < 0.5) {
                    [array[i], array[i - 1]] = [array[i - 1], array[i]];
                } else if (i < array.length - 1) {
                    [array[i], array[i + 1]] = [array[i + 1], array[i]];
                }
            }
        }

        function addAdjacentChar(arr) {
            if (arr.length === 0) return arr;
            const lastIndex = arr.length - 1;
            const secondLastIndex = arr.length - 2;
            const targetIndex = (arr.length > 1 && Math.random() < 0.5) ? secondLastIndex : lastIndex;
            const targetChar = arr[targetIndex];
            const possibleAdjacent = adjacentKeys[targetChar] || [];
            if (possibleAdjacent.length > 0) {
                const randomAdjacent = possibleAdjacent[Math.floor(Math.random() * possibleAdjacent.length)];
                arr.splice(targetIndex + 1, 0, randomAdjacent);
            }
            return arr;
        }

        if (Math.random() < chances.wordLastChar) {
            array = addAdjacentChar(array);
        }

        if (Math.random() < chances.cutLastChars && array.length > 0) {
            array.pop();
        }

        if (Math.random() < chances.cutLastChars && array.length >= 2) {
            array.splice(array.length - 2, 1);
        }

        return array.join('');
    }

    function processKeystroke(key) {
        var chances = {
            errorChance: parseFloat(document.getElementById('errorChance').value) / 100,
            swapChars: parseFloat(document.getElementById('swapChars').value) / 100,
            neighborChars: parseFloat(document.getElementById('neighborChars').value) / 100,
            wordLastChar: parseFloat(document.getElementById('wordLastChar').value) / 100,
            cutLastChars: parseFloat(document.getElementById('cutLastChars').value) / 100
        };

        if (['Tab', 'Escape', 'Enter'].includes(key)) {
            Index = 0;
            typeWord = "";
            return;
        }
        if (key === 'Backspace') {
            Index--;
            return;
        }

        if (Index >= typeWord.length) {
            var currentWord = getCurrentWordAndSpace();
            Index = 0;
            typeWord = ErroredWord(currentWord, chances);
        }
        if (typeWord === "") {
            var currentWord = getCurrentWordAndSpace();
            typeWord = ErroredWord(currentWord, chances);
        }
        let correctChar = typeWord[Index];
        Index++;
        document.execCommand('insertText', false, correctChar);
    }

    function throttleKeystroke(key) {
        var wpmValue = parseFloat(document.getElementById('wpmInput').value);
        if (isNaN(wpmValue) || wpmValue <= 0) {
            wpmValue = 300;
        }
        var minInterval = 60000 / (wpmValue * 5);
        var now = performance.now();
        var timeSinceLast = now - lastKeyTime;
        if (timeSinceLast >= minInterval) {
            lastKeyTime = now;
            processKeystroke(key);
        } else {
            var delay = minInterval - timeSinceLast;
            lastKeyTime = lastKeyTime + minInterval;
            setTimeout(function() {
                processKeystroke(key);
            }, delay);
        }
    }

    document.addEventListener('keydown', function(e) {
        if (!isToggled) return;
        e.preventDefault();
        e.stopPropagation();
        throttleKeystroke(e.key);
    });
})();
