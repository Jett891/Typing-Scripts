# Typing-Scripts

A collection of userscripts for automating typing on popular typing websites, designed to bypass anti-cheat mechanisms and simulate human-like typing behavior.

## Features
- **Menu Activation**: Press `F8` to open a configuration menu for adjusting settings like WPM and error probabilities.
- **Realistic Error Correction**: For **Keymash** and **Typeracer**, the scripts simulate human-like error correction by backspacing and retyping when mistakes are made.
- **OCR Mode for Qualification Tests**: In **Typeracer**, press the left arrow key to activate OCR mode for image-based challenges (requires Yandex API credentials).
- **Keyboard Input Blocking**: The scripts intercept physical keyboard inputs, preventing manual typing, and substitute correct characters extracted from the website's DOM text.

## Scripts
- **Monkeytype**: `monkeytype/monkeytype.js`  
- **10FastFingers**: `10fastfingers/10fastfingers.js`  
- **Typeracer**: `typeracer/typeracer.js` (includes OCR with Yandex)  
- **Keymash**: `keymash/keymash.js`  
- **Blindtype**: `blindtype/blindtype.js`

## Installation
To use these scripts, you need a userscript manager:
- [Tampermonkey](https://www.tampermonkey.net/) (Recommended for Chrome, Firefox, Edge, etc.)  
- [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (For Firefox)

### Steps:
1. Install a userscript manager from the links above.
2. Open the userscript manager dashboard.
3. Click on "Create a new script" or "Add new script."
4. Copy the contents of the desired script file (e.g., `monkeytype.js`).
5. Paste the script into the editor and save it.
6. Visit the corresponding typing website (e.g., [Monkeytype](https://monkeytype.com/)).

## Usage
- **Menu Activation**: Press `F8` to open the configuration menu. Adjust settings like WPM, error chance, and other probabilities.
- **Typing Automation**: Start typing on the website. The script will automatically input the correct text from the DOM, regardless of your physical keypresses.
- **OCR Mode (Typeracer)**: For qualification tests, press the left arrow key to trigger OCR on image-based challenges. You must provide your Yandex API credentials in the script.

### How Keyboard Input Blocking Works
The scripts use the `keydown` event listener to intercept all keyboard inputs. When you press a key, the script:
- Prevents the default behavior (`e.preventDefault()`), so your physical keypress doesn't affect the input field.
- Extracts the correct character from the website's DOM text.
- Inserts the correct character using `document.execCommand('insertText', false, char)`, simulating a valid keystroke.

This method ensures that only correct inputs are registered, bypassing anti-cheat systems that monitor typing patterns or detect unnatural speeds.

### Realistic Error Correction (Keymash and Typeracer)
In **Keymash** and **Typeracer**, the scripts simulate human-like typing errors and corrections:
- **Error Simulation**: Occasionally, the script will insert an incorrect character (e.g., a neighboring key or swapped letters).
- **Correction Mechanism**: After typing a few more characters (randomly between 3–9), the script will backspace to the point of the error and retype the correct sequence.

For example:
- Target text: "hello world"
- With error: "hello eorld"
- Typing sequence: "hello eorl" → backspace to "hello " → "hello world"

This behavior mimics how a human might notice and correct a mistake, making the automation less detectable.

## OCR Mode (Typeracer)
For image-based qualification tests on Typeracer, the script includes an OCR feature:
- **Activation**: Press the left arrow key during a qualification test.
- **How It Works**: The script captures the challenge image, sends it to the Yandex Vision API for text recognition, and types the detected text.
- **Setup**: Replace `YOUR_API_KEY_HERE` and `YOUR_FOLDER_ID_HERE` in `typeracer.js` with your Yandex API credentials.

**Note**: OCR is not available for 10FastFingers; a separate script is provided for that site.

## Configuration Options
When you open the menu with `F8`, you can adjust the following settings:
- **WPM**: Words per minute (default: 300).
- **Error Chance (%)**: Probability of making an error in a word.
- **Neighbor Swap (%)**: Probability of swapping a character with a neighboring key.
- **Swap Letters (%)**: Probability of swapping two adjacent letters in a word.
- Additional options for specific scripts (e.g., cutting or adding characters).

## Disclaimer
This project is intended for educational purposes only. The authors are not responsible for any misuse or consequences arising from the use of these scripts. Use at your own risk.

## License
Licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
