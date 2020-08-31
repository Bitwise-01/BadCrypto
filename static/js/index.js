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

// Start Crypto
class BadCrypto {
    static BLOCK_SIZE = 4;

    static xor(a, b) {
        return String.fromCharCode(a.charCodeAt() ^ b.charCodeAt());
    }

    static getBlocks(msg) {
        const blocks = [];
        const block = [];

        for (let e of msg) {
            block.push(e);
            if (block.length >= this.BLOCK_SIZE) {
                blocks.push(block.slice());
                block.length = 0;
            }
        }

        if (block.length) {
            while (block.length < this.BLOCK_SIZE) {
                block.push(' ');
            }
            blocks.push(block.slice());
        }

        return blocks;
    }

    static shiftBottom(block) {
        const nlen = block.length;
        const _block = block.slice();

        let r = undefined;
        let a = undefined;
        let b = undefined;

        for (let i = 0; i < nlen; i++) {
            r = i + 1 < nlen ? i + 1 : i + 1 - nlen;
            a = _block[i];
            b = _block[r];
            _block[i] = this.xor(a, b);
        }

        return _block;
    }

    static _shiftBottom(block) {
        const nlen = block.length;
        const _block = block.slice();

        let r = undefined;
        let a = undefined;
        let b = undefined;

        for (let i = nlen - 1; i >= 0; i--) {
            r = i + 1 < nlen ? i + 1 : i + 1 - nlen;

            a = _block[i];
            b = _block[r];
            _block[i] = this.xor(a, b);
        }

        return _block;
    }

    static shiftRight(block) {
        const nlen = block.length;
        const _block = block.slice();
        let _block_ = [];

        let r = undefined;

        for (let i = 0; i < nlen; i++) {
            r = i - 1 < 0 ? nlen - i - 1 : i - 1;

            _block_.push(_block[r]);
        }

        return _block_;
    }

    static _shiftRight(block, n = 32) {
        const nlen = block.length;
        const _block = block.slice();
        let _block_ = [];

        let r = undefined;

        for (let i = 0; i < nlen; i++) {
            r = i + 1 < this.BLOCK_SIZE ? i + 1 : i + 1 - nlen;

            _block_.push(block[r]);
        }

        return _block_;
    }

    static cross(block, pwd) {
        const nlen = block.length;
        let _block = [];

        for (let i = 0; i < nlen; i++) {
            _block.push(this.xor(block[i], pwd[i]));
        }

        return _block;
    }

    static async sha256(str) {
        const min = 0;
        const max = 16;

        // encode as UTF-8
        const msgBuffer = new TextEncoder('utf-8').encode(str);

        // hash the str
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

        // convert ArrayBuffer to Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        // convert bytes to hex string
        const hashHex = hashArray.map((b) => ('00' + b.toString(16)).slice(-2)).join('');

        return hashHex;
    }

    static async encrypt(msg, pwd) {
        let pwdHash = undefined;
        let cipher = '';

        await this.sha256(pwd).then((r) => {
            pwdHash = r;
        });

        this.getBlocks(msg).forEach((b) => {
            for (let i = 0; i < 4; i++) {
                b = this.shiftBottom(b);
                b = this.cross(b, pwdHash);
                b = this.shiftRight(b);
                b = this.cross(b, pwdHash);
            }
            cipher += b.join('');
        });

        return Base64.encode(cipher);
    }

    static async decrypt(cipher, pwd) {
        let pwdHash = undefined;
        let msg = '';

        await this.sha256(pwd).then((r) => {
            pwdHash = r;
        });

        cipher = Base64.decode(cipher);

        this.getBlocks(cipher).forEach((b) => {
            for (let i = 0; i < 4; i++) {
                b = this.cross(b, pwdHash);
                b = this._shiftRight(b);
                b = this.cross(b, pwdHash);
                b = this._shiftBottom(b);
            }
            msg += b.join('');
        });

        return msg.trim();
    }
}
// End Crypto

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
