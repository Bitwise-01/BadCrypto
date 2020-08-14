import copy
import hashlib


def xor(a, b):
    return chr(ord(a) ^ ord(b))


def get_blocks(m):
    blocks = []
    block = []

    for i in m:
        block.append(i)
        if len(block) >= 16:
            blocks.append(block)
            block = []

    if block:
        while len(block) < 16:
            block.append(b'\x20')

        blocks.append(block)

    return blocks


def shift_bottom(block):
    nlen = len(block)
    block = copy.deepcopy(block)

    for i in range(nlen):
        r = i + 1 if i + 1 < nlen else ((i + 1) - nlen)

        a = block[i]
        b = block[r]

        block[i] = xor(a, b)

    return block


def _shift_bottom(block):
    nlen = len(block)
    block = copy.deepcopy(block)

    for i in range(nlen-1, -1, -1):
        r = i + 1 if i + 1 < nlen else ((i + 1) - nlen)

        a = block[i]
        b = block[r]

        block[i] = xor(a, b)

    return block


def shift_right(block, n=32):
    nlen = len(block)
    _block = []

    for i in range(nlen):
        r = i - 1
        _block.append(block[r])

    if n:
        _block = shift_right(_block, n-1)

    return _block


def _shift_right(block, n=32):
    nlen = len(block)
    _block = []

    for i in range(nlen):
        r = i + 1 if i + 1 < 16 else (i + 1) - nlen
        _block.append(block[r])

    if n:
        _block = _shift_right(_block, n-1)
    return _block


def cross(block, pwd):
    nlen = len(block)
    block = copy.deepcopy(block)
    _block = []

    for i in range(nlen):
        _block.append(xor(block[i], pwd[i]))
    return _block


def unpad(block):
    _block = []
    nlen = len(block)
    max_i = nlen-1

    for i in range(nlen-1, 0, -1):
        if block[i].strip():
            max_i = i
            break

    for i in range(max_i + 1):
        _block.append(block[i])

    return _block


def encrypt(msg, pwd):
    cipher = ''
    pwd = hashlib.sha256(pwd.encode()).hexdigest()

    for b in get_blocks(msg):
        for _ in range(4):
            b = shift_bottom(b)
            b = cross(b, pwd)
            b = shift_right(b)
            b = cross(b, pwd)
        cipher += ''.join(b)
    return cipher.encode()


def decrypt(cipher, pwd):
    msg = ''
    pwd = hashlib.sha256(pwd.encode()).hexdigest()

    for b in get_blocks(cipher.decode()):
        for _ in range(4):
            b = cross(b, pwd)
            b = _shift_right(b)
            b = cross(b, pwd)
            b = _shift_bottom(b)
        msg += ''.join(unpad(b))
    return msg.strip().encode()
