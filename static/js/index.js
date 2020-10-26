(() => {
    'use strict';

    const badCrypto = new BadCrypto();

    const inputLabel = $('#input-label');
    const outputLabel = $('#output-label');

    const inputLabelTxt = 'Message'; 
    const outputLabelTxt = 'Ciphertext';

    const inputBox = $('#input-box');
    const outputBox = $('#output-box');

    const password = $('#password');

    let isEncryptMode = true; 

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

    inputBox.keyup(() => process());
    password.keyup(() => process());

    inputBox.change(() => process());
    password.change(() => process());
})();