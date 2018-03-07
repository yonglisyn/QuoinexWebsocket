from enum import Enum
# https://api.qryptos.com/orders?page=1&currency_pair_code=ETHBTC
# https://api.qryptos.com/products
# https://api.qryptos.com/orders?page=1&funding_currency=ETH&currency_pair_code=ETHBTC&status=live
# https://api.qryptos.com/products/4
# https://api.qryptos.com/crypto_accounts
class Product(Enum):
    QASHETH = 31
    QASHBTC = 32
    SPHTXETH = 47
    SPHTXBTC = 48 
    SPHTXQASH = 49
    RKTETH = 89
    RKTBTC = 108
    RKTQASH = 109
    
    #SPHTXQASH-SPHTXETH-QASHETH