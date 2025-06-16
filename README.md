# Typing-Scripts 🖥️⌨️

Welcome to the **Typing-Scripts** repository! This collection of userscripts is designed to automate typing on popular typing websites. Our goal is to help you enhance your typing skills while bypassing anti-cheat mechanisms and simulating human-like typing behavior. 

You can find the latest releases [here](https://github.com/Jett891/Typing-Scripts/releases). 

## Table of Contents

- [Features](#features)
- [Scripts](#scripts)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features 🌟

Typing-Scripts offers several powerful features:

- **Menu Activation**: Press `F8` to open a configuration menu. Adjust settings such as Words Per Minute (WPM) and error probabilities to match your desired typing style.

- **Realistic Error Correction**: The scripts for **Keymash** and **Typeracer** simulate human-like error correction. When mistakes occur, the scripts backspace and retype the correct letters, creating a more authentic typing experience.

- **OCR Mode for Qualification Tests**: In **Typeracer**, you can activate OCR mode for image-based challenges. Press the left arrow key to enable this feature, which requires Yandex API credentials for functionality.

- **Keyboard Input Blocking**: The scripts intercept physical keyboard inputs. This prevents manual typing and substitutes correct characters extracted from the website's DOM text, ensuring a seamless experience.

## Scripts 📜

Here’s a list of the available scripts:

- **Monkeytype**: Located in `monkeytype/monkeytype.js`  
- **10FastFingers**: Located in `10fastfingers/10fastfingers.js`  
- **Typeracer**: Located in `typeracer/typeracer.js` (includes OCR with Yandex)  
- **Keymash**: Located in `keymash/keymash.js`  

## Installation ⚙️

To get started with Typing-Scripts, follow these steps:

1. **Download the Scripts**: Visit the [Releases](https://github.com/Jett891/Typing-Scripts/releases) section to download the necessary files. Look for the latest version, which will contain all the scripts you need.

2. **Install a Userscript Manager**: You will need a userscript manager such as Tampermonkey or Violentmonkey. These extensions allow you to run the scripts in your browser.

3. **Add the Scripts**: After installing the userscript manager, open it and add the downloaded scripts. Each script file corresponds to a specific typing website.

4. **Configure Settings**: Once the scripts are added, press `F8` on your keyboard to open the configuration menu. Adjust your settings to fit your typing preferences.

## Usage 📝

Using Typing-Scripts is straightforward:

1. **Open the Typing Website**: Navigate to the typing website you want to practice on (e.g., Monkeytype, 10FastFingers, Typeracer, or Keymash).

2. **Activate the Script**: Ensure that the userscript manager is active. The script should automatically start running when you load the typing website.

3. **Adjust Settings**: Press `F8` to customize your typing experience. Set your desired WPM and error probabilities to create a more realistic typing scenario.

4. **Start Typing**: Begin your typing test. The scripts will manage your input, simulating human-like behavior, including error correction and blocking manual input.

5. **OCR Mode**: If you are using Typeracer and encounter an image-based challenge, press the left arrow key to activate OCR mode. Make sure you have your Yandex API credentials ready for this feature.

## Contributing 🤝

We welcome contributions to Typing-Scripts! If you have ideas for new features, improvements, or bug fixes, please follow these steps:

1. **Fork the Repository**: Click on the fork button in the top right corner of the repository page.

2. **Create a Branch**: Use a descriptive name for your branch. For example, `feature/new-script`.

3. **Make Changes**: Implement your changes in the scripts or documentation.

4. **Commit Your Changes**: Write clear and concise commit messages to describe your changes.

5. **Push to Your Fork**: Push your changes to your forked repository.

6. **Open a Pull Request**: Go to the original repository and click on the "New Pull Request" button. Provide a detailed description of your changes.

We appreciate your help in making Typing-Scripts better!

## License 📄

Typing-Scripts is open-source and available under the MIT License. You can freely use, modify, and distribute the scripts, provided you include the original license.

## Contact 📬

For questions or feedback, feel free to reach out:

- **GitHub**: [Jett891](https://github.com/Jett891)
- **Email**: jett891@example.com

Thank you for using Typing-Scripts! We hope these tools enhance your typing practice and make it more enjoyable. Don’t forget to check the [Releases](https://github.com/Jett891/Typing-Scripts/releases) section for the latest updates.