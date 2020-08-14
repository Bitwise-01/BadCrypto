'use strict';

const MAX_CHAR = 4096;

const loader1 = $('#loader1');
const loader2 = $('#loader2');

const btnEncr = $('#btn-encr');
const btnDecr = $('#btn-decr');

const editorEncr = $('#editor-encr');
const editorDecr = $('#editor-decr');

const pwd = $('#pwd');

let isLoading = false;

let encrLast = undefined;
let decrLast = undefined;

btnEncr.click(() => {
    let encrText = editorEncr.text();
    let pwdVal = pwd.val();

    if (encrText.length <= 0 || pwdVal.length <= 0 || isLoading) {
        return;
    }

    if (encrText.length >= MAX_CHAR || pwdVal.length >= MAX_CHAR) {
        return;
    }

    if (encrText === encrLast) {
        return;
    }

    startLoading(true);

    BadCrypto.encrypt(encrText, pwdVal)
        .then((cipher) => {
            editorEncr.text(cipher);
            stopLoading(true);
            encrLast = cipher;
        })
        .catch(() => {
            stopLoading(true);
        });

    // $.ajax({
    //     type: 'POST',
    //     url: '/encrypt',
    //     data: { msg: encrText, pwd: pwdVal },
    // }).done((resp) => {
    //     const status = resp['status'];

    //     if (status == 1) {
    //         editorEncr.text(resp['cipher']);
    //     }

    //     stopLoading(true);
    // });
});

btnDecr.click(() => {
    let decrText = editorDecr.text();
    let pwdVal = pwd.val();

    if (decrText.length <= 0 || pwdVal.length <= 0 || isLoading) {
        return;
    }

    if (decrText.length >= MAX_CHAR || pwdVal.length >= MAX_CHAR) {
        return;
    }

    if (decrText === decrLast) {
        return;
    }

    startLoading(false);

    BadCrypto.decrypt(decrText, pwdVal)
        .then((msg) => {
            editorDecr.text(msg);
            stopLoading(false);
            decrLast = msg;
        })
        .catch(() => {
            stopLoading(false);
        });

    // $.ajax({
    //     type: 'POST',
    //     url: '/decrypt',
    //     data: { cipher: decrText, pwd: pwdVal },
    // }).done((resp) => {
    //     const status = resp['status'];

    //     if (status == 1) {
    //         editorDecr.text(resp['msg']);
    //     }

    //     stopLoading(false);
    // });
});

function startLoading(isEncrypt) {
    if (isEncrypt) {
        loader1.prop('hidden', false);
        btnEncr.prop('hidden', true);
    } else {
        loader2.prop('hidden', false);
        btnDecr.prop('hidden', true);
    }

    isLoading = true;
}

function stopLoading(isEncrypt) {
    if (isEncrypt) {
        loader1.prop('hidden', true);
        btnEncr.prop('hidden', false);
    } else {
        loader2.prop('hidden', true);
        btnDecr.prop('hidden', false);
    }

    isLoading = false;
}
