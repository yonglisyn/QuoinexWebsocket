import requests, math
import time
import json
import jwt



encoded = jwt.encode({'path':'/crypto_accounts','nonce': int(time.time() * 1000), 'token_id': 1}, '2', algorithm='HS256')
print(encoded)
        