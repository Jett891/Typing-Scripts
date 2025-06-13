// ==UserScript==
// @name         Typeracer [Normal + OCR]
// @namespace    http://tampermonkey.net/
// @version      13.37
// @description  Shinigami
// @author       Shinigami
// @match        *://*.typeracer.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    let ocrDetectedText = '';
    let ocrTypingInProgress = false;
    let ocrCharIndex = 0;
    let isOCRActive = false;
    let normalModeDisabled = false;

    const OCR_API_KEY = 'YOUR_API_KEY_HERE';
    const OCR_FOLDER_ID = 'YOUR_FOLDER_ID_HERE';
    const OCR_API_URL = 'https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze';

    const OCR_ERROR_PROBABILITY = 0.02;
    const OCR_ERROR_MAP = {
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

    function getBase64Image(imageUrl, callback) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            callback(dataUrl.split(',')[1]);
        };
        img.onerror = function() {
            alert('OCR: Image upload error!');
        };
        img.src = imageUrl;
    }

    function sendImageForOCR(base64Image) {
        const requestPayload = {
            folderId: OCR_FOLDER_ID,
            analyze_specs: [
                {
                    content: base64Image,
                    features: [
                        {
                            type: 'TEXT_DETECTION',
                            text_detection_config: { language_codes: ['ru'] }
                        }
                    ]
                }
            ]
        };

        GM_xmlhttpRequest({
            method: 'POST',
            url: OCR_API_URL,
            headers: {
                'Authorization': `Api-Key ${OCR_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(requestPayload),
            onload: function(response) {
                try {
                    const result = JSON.parse(response.responseText);
                    if (result.results && result.results.length > 0) {
                        const text = result.results[0].results.map(page => {
                            return page.textDetection.pages[0].blocks.map(block => {
                                return block.lines.map(line => {
                                    return line.words.map(word => word.text).join(' ');
                                }).join(' ');
                            }).join(' ');
                        }).join(' ');
                        const correctedText = text.replace(/--/g, '-');
                        startOcrAutoTyping(correctedText);
                    } else {
                        console.error('OCR: No results found');
                        alert('OCR: No results found');
                    }
                } catch (error) {
                    console.error('OCR: Response processing error:', error);
                    alert('OCR: API response processing error');
                }
            },
            onerror: function(error) {
                console.error('OCR: Request Error:', error);
                alert('OCR: Request Error!');
            }
        });
    }

    function startOcrAutoTyping(text) {
        ocrDetectedText = text;
        ocrTypingInProgress = true;
        ocrCharIndex = 0;
        isOCRActive = true;
        normalModeDisabled = true;
        removeNormalModeHandler();
        console.log("OCR: Start of auto-printing:", ocrDetectedText);
    }

    function ocrProcessKey(e) {
        const field = document.querySelector('.challengeTextArea');
        if (!field) {
            console.error("OCR: No input field found!");
            return;
        }

        if (!ocrTypingInProgress) return;

        if (ocrCharIndex < ocrDetectedText.length) {
            let currentChar = ocrDetectedText.charAt(ocrCharIndex);
            if (Math.random() < OCR_ERROR_PROBABILITY && ocrCharIndex > 0) {
                if (OCR_ERROR_MAP[currentChar]) {
                    let alternatives = OCR_ERROR_MAP[currentChar];
                    currentChar = alternatives[Math.floor(Math.random() * alternatives.length)];
                }
            }
            field.value += currentChar;
            ocrCharIndex++;
        } else {
            ocrTypingInProgress = false;
            isOCRActive = false;
            normalModeDisabled = false;
            addNormalModeHandler();
            setTimeout(() => {
                const submitButton = document.querySelector("button.gwt-Button");
                if (submitButton) {
                    submitButton.click();
                } else {
                    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
                    document.dispatchEvent(enterEvent);
                }
            }, 200);
        }
    }

    function ocrThrottledKeyPress(e) {
        ocrProcessKey(e);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            const image = document.querySelector('img.challengeImg');
            if (image) {
                let imageUrl = image.src;
                if (imageUrl.startsWith("challenge")) {
                    imageUrl = "https://typeracer.com/" + imageUrl;
                }
                getBase64Image(imageUrl, function(base64Image) {
                    sendImageForOCR(base64Image);
                });
            } else {
                alert('OCR: No image found!');
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (ocrTypingInProgress) {
            e.preventDefault();
            e.stopPropagation();
            ocrThrottledKeyPress(e);
        }
    }, true);

    let isPanelExpanded       = false;
    let isScriptEnabled       = false;
    let isPanelVisible        = false;
    let normalCharIndex       = 0;
    let originalText          = "";
    let erroredText           = "";
    let lastKeyTime           = 0;
    let errorCorrectionState  = null;
    let skipNextErrorInjection= false;
    let newTestResetDone      = false;

    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position: 'absolute',
        top: '50px',
        left: '50px',
        width: '280px',
        height: '35px',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.6)',
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
        backgroundColor: 'rgba(50,50,50,0.3)',
        position: 'relative',
        backdropFilter: 'blur(4px)',
        transition: 'background 0.25s ease'
    });
    const togCircle = document.createElement('div');
    Object.assign(togCircle.style, {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: 'rgba(150,150,150,0.9)',
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
        color: '#fff',
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
            color: '#fff',
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
            background: 'rgba(200,200,200,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            color: '#fff',
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
        errorChance: createInput('Error chance (%)', 25, 'errorChance'),
        neighborChars: createInput('Neighbor swap (%)', 40, 'neighborChars'),
        swapChars: createInput('Swap letters (%)', 40, 'swapChars'),
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
            ? 'rgba(80,80,80,0.6)' : 'rgba(50,50,50,0.3)';
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

    document.addEventListener('keydown', function(e) {
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
        const inputField = document.querySelector("input.txtInput");
        if (!inputField) return "";
        const panelTable = inputField.closest("table.inputPanel");
        if (!panelTable) return "";
        const spans = panelTable.querySelectorAll("span[unselectable='on']");
        let text = "";
        spans.forEach(span => {
            text += span.textContent;
        });
        return text.trim();
    }

    function generateErroredText(original) {
        const eChance = parseFloat(document.getElementById('errorChance').value) / 100;
        const words = original.split(/\s+/).filter(Boolean);
        const resultWords = words.map(w => (Math.random() < eChance ? shuffleWord(w) : w));
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

    function insertCharacter(ch) {
        const inputField = document.querySelector('input.txtInput');
        if (!inputField) return;
        inputField.value += ch;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function simulateBackspace() {
        const inputField = document.querySelector('input.txtInput');
        if (!inputField) return;
        inputField.value = inputField.value.slice(0, -1);
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    setInterval(() => {
        const currentDOM = getTextFromDOM();
        if (currentDOM && currentDOM !== originalText) {
            originalText = currentDOM;
            erroredText = generateErroredText(originalText);
            normalCharIndex = 0;
            errorCorrectionState = null;
        }
    }, 500);

    function processNormalKey(key) {
        if (!errorCorrectionState && skipNextErrorInjection) {
            insertCharacter(originalText[normalCharIndex]);
            normalCharIndex++;
            skipNextErrorInjection = false;
            return;
        }

        if (['Tab', 'Escape', 'Enter'].includes(key)) {
            normalCharIndex = 0;
            erroredText = "";
            errorCorrectionState = null;
            return;
        }
        if (key === 'Backspace') {
            normalCharIndex = Math.max(0, normalCharIndex - 1);
            errorCorrectionState = null;
            return;
        }

        if (errorCorrectionState !== null) {
            if (errorCorrectionState.correctionInProgress) {
                if (normalCharIndex > errorCorrectionState.errorStartIndex) {
                    simulateBackspace();
                    normalCharIndex--;
                    return;
                } else {
                    insertCharacter(originalText[errorCorrectionState.errorStartIndex]);
                    normalCharIndex = errorCorrectionState.errorStartIndex + 1;
                    errorCorrectionState = null;
                    skipNextErrorInjection = true;
                    return;
                }
            } else {
                if (errorCorrectionState.typedAfterError < errorCorrectionState.threshold) {
                    errorCorrectionState.typedAfterError++;
                    if (normalCharIndex < erroredText.length) {
                        insertCharacter(erroredText[normalCharIndex]);
                        normalCharIndex++;
                    }
                    return;
                } else {
                    errorCorrectionState.correctionInProgress = true;
                    simulateBackspace();
                    if (normalCharIndex > errorCorrectionState.errorStartIndex) {
                        normalCharIndex--;
                    }
                    return;
                }
            }
        }

        if (normalCharIndex < erroredText.length && normalCharIndex < originalText.length) {
            let errChar = erroredText[normalCharIndex];
            let origChar = originalText[normalCharIndex];
            if (origChar === ' ') {
                insertCharacter(' ');
                normalCharIndex++;
                return;
            }
            if (errChar !== origChar) {
                errorCorrectionState = {
                    errorStartIndex: normalCharIndex,
                    typedAfterError: 0,
                    threshold: (Math.random() < 0.7)
                        ? Math.floor(Math.random() * 3) + 3
                        : Math.floor(Math.random() * 3) + 7,
                    correctionInProgress: false
                };
                insertCharacter(errChar);
                normalCharIndex++;
                return;
            } else {
                insertCharacter(origChar);
                normalCharIndex++;
                return;
            }
        }
    }

    function throttledKeyPress(key) {
        const wpmValue = parseFloat(document.getElementById('wpmInput').value) || 300;
        const minInterval = 60000 / (wpmValue * 5);
        const now = performance.now();
        const diff = now - lastKeyTime;
        if (diff >= minInterval) {
            lastKeyTime = now;
            processNormalKey(key);
        } else {
            const delay = minInterval - diff;
            lastKeyTime += minInterval;
            setTimeout(() => processNormalKey(key), delay);
        }
    }

    function normalModeKeydownHandler(e) {
        if (panel.contains(e.target)) return;
        if (e.key === 'ArrowLeft') return;
        if (ocrTypingInProgress || normalModeDisabled) return;
        if (!isScriptEnabled) return;
        e.preventDefault();
        e.stopPropagation();
        throttledKeyPress(e.key);
    }

    function addNormalModeHandler() {
        document.addEventListener('keydown', normalModeKeydownHandler, true);
    }

    function removeNormalModeHandler() {
        document.removeEventListener('keydown', normalModeKeydownHandler, true);
    }

    addNormalModeHandler();
})();
