'use strict';

const BadCrypto = function () {
	const BLOCK_SIZE = 16;
	const ROUNDS = 14;

	const PAD_SYM = 0x1b;

	this.sha256 = async (str) => {
		// THIS IS NOT MY CODE. // 

		const min = 0;
		const max = 16;

		// encode as UTF-8
		const msgBuffer = new TextEncoder('utf-8').encode(str);

		// hash the str
		const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

		// convert ArrayBuffer to Array
		const hashArray = Array.from(new Uint8Array(hashBuffer));

		// convert bytes to hex string
		return hashArray.map((b) => ('00' + b.toString(16)).slice(-2)).join('');
	};

	this.reverse = (str) => {
		return str.split('').reverse().join('')
	}

	this.pad = (block) => {
		const _block = block.slice();

		for (let i = 0; i < BLOCK_SIZE - block.length; i++) {
			_block.push(PAD_SYM);
		}

		return _block;
	}

	this.unpad = (block) => {
		let maxIndex = BLOCK_SIZE;

		for (let i = 0; i < block.length; i++) {
			if (block[i].charCodeAt() === PAD_SYM) {
				maxIndex = i;
				break;
			}
		}

		return block.slice(0, maxIndex);
	}

	this.xor = (a, b) => {
		a = typeof (a) === 'string' ? a.charCodeAt() : a;
		b = typeof (b) === 'string' ? b.charCodeAt() : b;
		return String.fromCharCode(a ^ b);
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
			blocks.push(this.pad(block).slice());
		}

		return blocks;
	};

	this.shiftBottom = (block) => {
		const nlen = block.length;
		const _block = block.slice();

		let r = undefined;

		for (let i = 0; i < nlen; i++) {
			r = i + 1 < nlen ? i + 1 : i + 1 - nlen;
			_block[i] = this.xor(_block[i], _block[r]);
		}

		return _block;
	};

	this._shiftBottom = (block) => {
		const nlen = block.length;
		const _block = block.slice();

		let r = undefined;

		for (let i = nlen - 1; i >= 0; i--) {
			r = i + 1 < nlen ? i + 1 : i + 1 - nlen;
			_block[i] = this.xor(_block[i], _block[r]);
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

		let _block = [];
		let r = undefined;

		for (let i = 0; i < nlen; i++) {
			r = i + 1 < BLOCK_SIZE ? i + 1 : i + 1 - nlen;
			_block.push(block[r]);
		}

		return _block;
	};

	this.cross = (b1, b2) => {
		const nlen = b1.length;
		const block = [];
		const _block = [];

		for (let i = 0; i < nlen; i++) {
			block.push(this.xor(b1[i], b2[i]));
		}

		let index = b2.length - 1;

		for (let i = 0; i < nlen; i++) {
			_block.push(this.xor(block[i], b2[index]));
			index = index - 1 >= 0 ? index - 1 : b2.length - 1;
		}

		return _block;
	};

	this.encrypt = async (msg, pwd) => {
		let pwdHash = undefined;
		let cipher = '';

		await this.sha256(pwd).then((r) => {
			pwdHash = r;
		});

		// Prevents ciphertexts with similar inputs from having similar outputs
		msg = this.cross(msg, this.reverse(msg)).join('');

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

			msg += this.unpad(b).join('');
		});

		return this.reverse(msg.trim());
	};
};