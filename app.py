from flask import render_template, Flask, url_for, jsonify, request, json
import requests
from qryptos import Qryptos
from account import Account
from product import Product

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
client = Qryptos(Account())


@app.route('/crypto/<currency>')
def crypto_balance(currency=None):
    return client.get_crypto_account_balance(currency)

@app.route('/')
def index():
    orderbooks = {}
    products = {}
    for product in Product:
        orderbooks[product.name.lower()] = client.get_orderbook(product)
        products[product.name.lower()] = product.value

    return render_template('index.html', orderbooks = orderbooks, products = products)

@app.route('/trade', methods=['POST'])
def trade():
    order = request.get_json()
    resp = client.trade(order)
    print(resp)
    return jsonify(resp)

if __name__ == "__main__":
    app.run()