from flask import render_template, Flask, url_for, jsonify, request, json
import requests
from quoinex import Quoinex
from account import Account
from product import Product

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
client = Quoinex(Account())

@app.route('/fiat/<currency>')
def fiat_balance(currency=None):
    return client.get_fiat_account_balance(currency)

@app.route('/crypto/<currency>')
def crypto_balance(currency=None):
    return client.get_crypto_account_balance(currency)

@app.route('/')
def index():
    qashusd_orderbook = client.get_orderbook(Product.QASHUSD)
    qashbtc_orderbook = client.get_orderbook(Product.QASHBTC)
    btcusd_orderbook = client.get_orderbook(Product.BTCUSD)
    return render_template('index.html', orderbooks = {"qashusd": qashusd_orderbook, "qashbtc": qashbtc_orderbook, "btcusd": btcusd_orderbook})

@app.route('/trade', methods=['POST'])
def trade():
    order = request.get_json()
    resp = client.trade(order)
    print(resp)
    return jsonify(resp)

if __name__ == "__main__":
    app.run()