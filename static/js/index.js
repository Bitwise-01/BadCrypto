(() => {
    'use strict';

    const badCrypto = new BadCrypto();

    const inputLabel = $('#input-label');
    const outputLabel = $('#output-label');

    const inputLabelTxt = 'Message'; 
    const outputLabelTxt = 'Ciphertext';

    const inputBox = $('#input-box');
    const outputBox = $('#output-display');

    const password = $('#password');
    const copyBtn = $('#copy-btn');

    let isEncryptMode = true; 

    $(document).ready(() => {
        password.focus();
    });

    $('#swap').click(() => {
        isEncryptMode = !isEncryptMode;

        // Swap labels 
        inputLabel.text(isEncryptMode ? inputLabelTxt : outputLabelTxt);
        outputLabel.text(isEncryptMode ? outputLabelTxt : inputLabelTxt);  
        
        // Swap text 
        const inputText = inputBox.text();
        inputBox.text(outputBox.text());
        outputBox.text(inputText);
    });

    const encrypt = (msg, pwd) => {
        badCrypto.encrypt(msg, pwd).then((ciphertext) => {
            outputBox.text(ciphertext);
        });
    };
    
    const decrypt = (ciphertext, pwd) => {
        badCrypto.decrypt(ciphertext, pwd).then((msg) => {
            outputBox.text(msg);
        });
    }; 

    const process = () => {
        const inputText = inputBox.text().trim();
        const pwd = password.val().trim();

        if (!pwd.length) {
            password.focus();
            return;
        } 

        isEncryptMode ? encrypt(inputText, pwd) : decrypt(inputText, pwd);
    };

    const copyToClipboard = (value) => {
         const textArea = document.createElement('textarea'); 

         textArea.value = value; 
         document.body.appendChild(textArea); 

         textArea.select(); 
         document.execCommand('copy'); 

         document.body.removeChild(textArea); 
    };

    const copy = () => {
        const ciphertextCopied = $('#ciphertext-copied');
        const successMsg = 'Copied!';
        const failMsg = 'Failed to copy!';

        if (outputBox.text().length) {
            copyToClipboard(outputBox.text());
        } {
            copyBtn.blur();
        }

        ciphertextCopied.text(outputBox.text().length ? successMsg : failMsg); 
        ciphertextCopied.css({'display': 'inline'});        

        setTimeout(() => {
            ciphertextCopied.css({'display': 'none'});
        }, 850);    
    };
    
    inputBox.on('input', () => process());
    password.on('input', () => process());
    copyBtn.click(() => copy());
})();