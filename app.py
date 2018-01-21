from flask import render_template, Flask, url_for, jsonify, request, json
import requests
from quoinex import Quoinex
from account import Account
from product import Product

app = Flask(__name__)
client = Quoinex(Account())

@app.route('/')
def index():
    qashusd_orderbook = client.get_orderbook(Product.QASHUSD)
    qashbtc_orderbook = client.get_orderbook(Product.QASHBTC)
    btcusd_orderbook = client.get_orderbook(Product.BTCUSD)
    return render_template('index.html', orderbooks = {"qashusd": qashusd_orderbook, "qashbtc": qashbtc_orderbook, "btcusd": btcusd_orderbook})

@app.route('/trade', methods=['POST'])
def trade():
    order = request.get_json()
    print(order)
    # resp = client.trade(order)
    return jsonify(order)

if __name__ == "__main__":
    app.run()