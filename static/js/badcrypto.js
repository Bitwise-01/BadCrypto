'use strict';

const BadCrypto = function () {
    const BLOCK_SIZE = 4; // 16;
    const ROUNDS = 4;

    this.xor = (a, b) => {
        return String.fromCharCode(a.charCodeAt() ^ b.charCodeAt());
    };

    this.getBlocks = (msg) => {
        const blocks = [];
        const block = [];

        for (let e of msg) {
            block.push(e);
            if (block.length >= BLOCK_SIZE) {
                blocks.push(block.slice());
                block.length = 0;
            }
        }

        if (block.length) {
            while (block.length < BLOCK_SIZE) {
                block.push(' ');
            }
            blocks.push(block.slice());
        }

        return blocks;
    };

    this.shiftBottom = (block) => {
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
    };

    this._shiftBottom = (block) => {
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
    };

    this.shiftRight = (block) => {
        const nlen = block.length;
        const _block = block.slice();
        let _block_ = [];

        let r = undefined;

        for (let i = 0; i < nlen; i++) {
            r = i - 1 < 0 ? nlen - i - 1 : i - 1;

            _block_.push(_block[r]);
        }

        return _block_;
    };

    this._shiftRight = (block, n = 32) => {
        const nlen = block.length;
        const _block = block.slice();
        let _block_ = [];

        let r = undefined;

        for (let i = 0; i < nlen; i++) {
            r = i + 1 < BLOCK_SIZE ? i + 1 : i + 1 - nlen;

            _block_.push(block[r]);
        }

        return _block_;
    };

    this.cross = (block, pwd) => {
        const nlen = block.length;
        let _block = [];

        for (let i = 0; i < nlen; i++) {
            _block.push(this.xor(block[i], pwd[i]));
        }

        return _block;
    };

    this.sha256 = async (str) => {
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
    };

    this.encrypt = async (msg, pwd) => {
        let pwdHash = undefined;
        let cipher = '';

        await this.sha256(pwd).then((r) => {
            pwdHash = r;
        });

        this.getBlocks(msg).forEach((b) => {
            for (let i = 0; i < ROUNDS; i++) {
                b = this.shiftBottom(b);
                b = this.cross(b, pwdHash);
                b = this.shiftRight(b);
                b = this.cross(b, pwdHash);
            }
            cipher += b.join('');
        });

        return Base64.encode(cipher);
    };

    this.decrypt = async (cipher, pwd) => {
        let pwdHash = undefined;
        let msg = '';

        await this.sha256(pwd).then((r) => {
            pwdHash = r;
        });

        cipher = Base64.decode(cipher);

        this.getBlocks(cipher).forEach((b) => {
            for (let i = 0; i < ROUNDS; i++) {
                b = this.cross(b, pwdHash);
                b = this._shiftRight(b);
                b = this.cross(b, pwdHash);
                b = this._shiftBottom(b);
            }
            msg += b.join('');
        });

        return msg.trim();
    };
};
