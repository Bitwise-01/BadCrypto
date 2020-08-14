import flask
import os
import base64
import time
import random
from lib import badcrypto


app = flask.Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(0x400)

MAX_CHARS = 4096


def process(_input, pwd, is_encrypt):
    resp = {'status': 0}

    if len(_input) > MAX_CHARS or len(pwd) > MAX_CHARS:
        resp['status'] = -2
        return flask.jsonify(resp)

    if is_encrypt:
        try:
            cipher = badcrypto.encrypt(_input, pwd)
            cipher = base64.b64encode(cipher).decode()
        except:
            resp['status'] = -1
            return resp

        resp['status'] = 1
        resp['cipher'] = cipher
    else:
        try:
            msg = base64.b64decode(_input.encode())
            msg = badcrypto.decrypt(msg, pwd).decode()
        except:
            resp['status'] = -1
            return resp

        resp['status'] = 1
        resp['msg'] = msg

    time.sleep(random.randint(2, 6))
    return resp


@app.route('/')
def index():
    return flask.render_template('index.html')


@app.route('/encrypt', methods=['POST'])
def encrpyt():
    resp = {'status': 0}
    form = flask.request.form

    if not 'msg' in form or not 'pwd' in form:
        return flask.jsonify(resp)

    msg = flask.escape(form.get('msg'))
    pwd = flask.escape(form.get('pwd'))

    if not msg.strip() or not pwd.strip():
        return flask.jsonify(resp)

    return flask.jsonify(process(msg, pwd, is_encrypt=True))


@app.route('/decrypt', methods=['POST'])
def decrypt():
    resp = {'status': 0}
    form = flask.request.form

    if not 'cipher' in form or not 'pwd' in form:
        return flask.jsonify(resp)

    cipher = flask.escape(form.get('cipher'))
    pwd = flask.escape(form.get('pwd'))

    if not cipher.strip() or not pwd.strip():
        return flask.jsonify(resp)

    return flask.jsonify(process(cipher, pwd, is_encrypt=False))


if __name__ == '__main__':
    app.run()
