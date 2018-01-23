
var products = {"btcusd": 1, "ethusd": 27, "ethbtc": 37, "qashbtc": 52, "qashusd": 57};
var app = new Vue({
	el: "#app",
	data: {
		orderbooks: {},
		product_lines: [{key:"QASHUSD-QASHBTC-BTCUSD", from: "qashusd", mid: "qashbtc", to: "btcusd", is_auto: false, auto_interval: 2000, trade_history:[], earning: 0, precision: 0},
						{key:"ETHUSD-ETHBTC-BTCUSD", from: "ethusd", mid: "ethbtc", to: "btcusd", is_auto: false, auto_interval: 2000, trade_history:[], earning: 0, precision: 4}]
	},
	computed: {
		accumulate_orderbooks: function(){
			var a_orderbooks = {};
			var orderbooks = this.orderbooks;
			for(var name in orderbooks){
				a_orderbooks[name] = {"sell":[], "buy":[]}
				if(orderbooks[name]["sell"])
				{
					for(var i = 0; i<20; i++){
						if(a_orderbooks[name]["sell"].length == 0){
							a_orderbooks[name]["sell"].push([orderbooks[name]["sell"][i][0]*1, orderbooks[name]["sell"][i][1]*1, orderbooks[name]["sell"][i][0] * orderbooks[name]["sell"][i][1]])
						}else{
							var current_total = orderbooks[name]["sell"][i][0] * orderbooks[name]["sell"][i][1] * 1;
							var pre_total = a_orderbooks[name]["sell"][i-1][2] * 1;
							var amount = a_orderbooks[name]["sell"][i-1][1] * 1 + orderbooks[name]["sell"][i][1] * 1;
							var price = (current_total + pre_total)/amount *1;
							a_orderbooks[name]["sell"].push([price, amount, pre_total+current_total])
						}
					}
				}
				if(this.orderbooks[name]["buy"])
				{
					for(var i = 0; i<20; i++){
						if(a_orderbooks[name]["buy"].length == 0){
							a_orderbooks[name]["buy"].push([orderbooks[name]["buy"][i][0]*1, orderbooks[name]["buy"][i][1]*1, orderbooks[name]["buy"][i][0] * orderbooks[name]["buy"][i][1]])
						}else{
							var current_total = orderbooks[name]["buy"][i][0] * orderbooks[name]["buy"][i][1] * 1;
							var pre_total = a_orderbooks[name]["buy"][i-1][2] * 1;
							var amount = a_orderbooks[name]["buy"][i-1][1] * 1 + orderbooks[name]["buy"][i][1] * 1;
							var price = (current_total + pre_total)/amount *1;
							a_orderbooks[name]["buy"].push([price, amount, pre_total+current_total])
						}
					}
				}
			}
			return a_orderbooks;
		},
		exchange_positive: function(){
			var scope = this;
			var temp = {};
			this.product_lines.map(function(product_line){
				var from_sell_orderbook = scope.accumulate_orderbooks[product_line.from]["sell"];
				var mid_buy_orderbook = scope.accumulate_orderbooks[product_line.mid]["buy"];
				var to_buy_orderbook = scope.accumulate_orderbooks[product_line.to]["buy"];

				var amount = scope.to_precision_decimal_ceil(to_buy_orderbook[0][0] * 0.001 / from_sell_orderbook[0][0], product_line.precision);
				var from_sell, mid_buy, to_buy;
				
				for(var i =0; i<20;i++){
					if(from_sell_orderbook[i][1] > amount){
						var pre_total = 0, pre_amount = 0;
						if(i==0){
							pre_total = from_sell_orderbook[i][2] * 1;
							pre_amount = from_sell_orderbook[i][1] * 1;
						}else{
							pre_total = from_sell_orderbook[i-1][2] * 1;
							pre_amount = from_sell_orderbook[i-1][1] * 1;
						}
						var current_amount = from_sell_orderbook[i][1];
						var current_price = from_sell_orderbook[i][0];
						from_sell = {"pre_total": pre_total, "pre_amount": pre_amount, "current_amount": current_amount, "ave_price": (pre_total + (amount-pre_amount) * current_price)/amount};
						break;
					}
				}
				
				for(var i =0; i<20;i++){
					if(mid_buy_orderbook[i][1] > amount){
						var pre_total = 0, pre_amount = 0;
						if(i==0){
							pre_total = mid_buy_orderbook[i][2] * 1;
							pre_amount = mid_buy_orderbook[i][1] * 1;
						}else{
							pre_total = mid_buy_orderbook[i-1][2] * 1;
							pre_amount = mid_buy_orderbook[i-1][1] * 1;
						}
						var current_amount = mid_buy_orderbook[i][1];
						var current_price = mid_buy_orderbook[i][0];
						mid_buy = {"pre_total": pre_total, "pre_amount": pre_amount, "current_amount": current_amount, "ave_price": (pre_total + (amount - pre_amount) * current_price)/amount};
						break;
					}
				}
				
				to_buy = {"pre_total": to_buy_orderbook[2], "pre_amount": to_buy_orderbook[1], "ave_price": to_buy_orderbook[0][0]}
				
				temp[product_line.key] = {"ratio": (100/from_sell["ave_price"]*mid_buy["ave_price"]*to_buy["ave_price"]).toFixed(8), 
										  "availabe_amount": Math.min(from_sell["current_amount"], mid_buy["current_amount"]).toFixed(8), 
										  "trade_amount": amount, "from_ave_price": from_sell["ave_price"], "mid_ave_price": mid_buy["ave_price"], "to_ave_price": to_buy["ave_price"]};
			});
			return temp;
		},
		exchange_negative: function(){
			var scope = this;
			var temp = {};
			this.product_lines.map(function(product_line){
				var from_buy_orderbook = scope.accumulate_orderbooks[product_line.from]["buy"];
				var mid_sell_orderbook = scope.accumulate_orderbooks[product_line.mid]["sell"];
				var to_sell_orderbook = scope.accumulate_orderbooks[product_line.to]["sell"];

				var amount = scope.to_precision_decimal_ceil(to_sell_orderbook[0][0] * 0.001 / from_buy_orderbook[0][0], product_line.precision);
				var to_sell, mid_sell, from_buy;
				for(var i =0; i<20;i++){
					if(from_buy_orderbook[i][1] > amount){
						var pre_total = 0, pre_amount = 0;
						if(i==0){
							pre_total = from_buy_orderbook[i][2] * 1;
							pre_amount = from_buy_orderbook[i][1] * 1;
						}else{
							pre_total = from_buy_orderbook[i-1][2] * 1;
							pre_amount = from_buy_orderbook[i-1][1] * 1;
						}
						var current_amount = from_buy_orderbook[i][1];
						var current_price = from_buy_orderbook[i][0];
						from_buy = {"pre_total": pre_total, "pre_amount": pre_amount, "current_amount": current_amount, "ave_price": (pre_total + (amount-pre_amount) * current_price)/amount};
						break;
					}
				}
				for(var i =0; i<20;i++){
					if(mid_sell_orderbook[i][1] > amount){
						var pre_total = 0, pre_amount = 0;
						if(i==0){
							pre_total = mid_sell_orderbook[i][2] * 1;
							pre_amount = mid_sell_orderbook[i][1] * 1;
						}else{
							pre_total = mid_sell_orderbook[i-1][2] * 1;
							pre_amount = mid_sell_orderbook[i-1][1] * 1;
						}
						var current_amount = mid_sell_orderbook[i][1];
						var current_price = mid_sell_orderbook[i][0];
						mid_sell = {"pre_total": pre_total, "pre_amount": pre_amount, "current_amount": current_amount, "ave_price": (pre_total + (amount - pre_amount) * current_price)/amount};
						break;
					}
				}
				to_sell = {"pre_total": to_sell_orderbook[2], "pre_amount": to_sell_orderbook[1], "ave_price": to_sell_orderbook[0][0]}
				temp[product_line.key] = {"ratio": (100/to_sell["ave_price"]/mid_sell["ave_price"]*from_buy["ave_price"]).toFixed(8), 
						"availabe_amount": Math.min(from_buy["current_amount"], mid_sell["current_amount"]).toFixed(8), 
						"trade_amount": amount, "from_ave_price": from_buy["ave_price"], "mid_ave_price": mid_sell["ave_price"], "to_ave_price": to_sell["ave_price"]};
			});
				
			return temp;
		}
	},
	filters: {
		to8Decimal: function(value){
			if(isNaN(value)){
				return 0;
			}
			return (value*1).toFixed(8);
		}
	},
	methods: {
		positive_trade: function(product_line){
			var exchange = this.exchange_positive[product_line.key];
			if(exchange["ratio"] > 100.1){
				var from_amount = exchange["trade_amount"] * 1;
				var mid_ave_price = exchange["mid_ave_price"] * 1;
				var earn_amount = (from_amount * mid_ave_price).toFixed(8) * exchange["to_ave_price"] - from_amount * exchange["from_ave_price"];
				var from_order = {"order":{"order_type": "market", "product_id": products[product_line.from], "side": "buy", "quantity": from_amount, "price": 0}};			
				var mid_order = {"order":{"order_type": "market", "product_id": products[product_line.mid], "side": "sell", "quantity": from_amount, "price": 0}};	
				var to_order = {"order":{"order_type": "market", "product_id": products[product_line.to], "side": "sell", "quantity": (from_amount * mid_ave_price).toFixed(8), "price": 0}};
				product_line.trade_history.push({time: this.date_string(), earning: earn_amount, type: "positive"});
				product_line.earning = product_line.earning + earn_amount;
				this.trade_in_sequence(from_order, mid_order, to_order, function(){
					if(product_line.is_auto){
						setTimeout(this.positive_trade(product_line), product_line.auto_interval*1);
						playSound();
					}
				});
			}
		},
		negative_trade: function(product_line){
			var exchange = this.exchange_negative[product_line.key]
			if(exchange["ratio"] > 100.1){
				var from_amount = exchange["trade_amount"] * 1;
				var mid_ave_price = exchange["mid_ave_price"] * 1;
				var earn_amount = from_amount * exchange["from_ave_price"] - (from_amount * mid_ave_price).toFixed(8) * exchange["to_ave_price"];
				var to_order = {"order":{"order_type": "market", "product_id": products[product_line.to], "side": "buy", "quantity": (from_amount * mid_ave_price).toFixed(8), "price": 0}};	
				var mid_order = {"order":{"order_type": "market", "product_id": products[product_line.mid], "side": "buy", "quantity": from_amount, "price": 0}};	
				var from_order = {"order":{"order_type": "market", "product_id": products[product_line.from], "side": "sell", "quantity": from_amount, "price": 0}};
				product_line.trade_history.push({time: this.date_string(), earning: earn_amount, type: "negative"});
				product_line.earning = product_line.earning + earn_amount;
				this.trade_in_sequence(to_order, mid_order, from_order, function(){
					if(product_line.is_auto){
						setTimeout(this.negative_trade(product_line), product_line.auto_interval*1);
						playSound();
					}
				});
			}
			
		},
		trade_in_sequence: function(order1, order2, order3, callback){
			var get_fiat_account = this.get_fiat_account;
			trade = this.trade;
			trade(order1, function(data_to_order){
				trade(order2, function(data_mid_order){
					trade(order3, function(data_from_order){
						get_fiat_account("USD");
						callback();
					})
				})
			})
		},
		trade: function(order, callback){
			$.ajax({
				url: "/trade",
				method: "POST",
				data: JSON.stringify(order),
				contentType: "application/json; charset=UTF-8",
				dataType: "json",
				success: function(data){
					console.log(data);
					callback(data)
				}
			})
		},
		toggleAuto: function(product_line){
			if(product_line.is_auto){
				this.positive_trade(product_line);
				this.negative_trade(product_line);
			}
		},
		get_fiat_account:function(currency){
			$.get("/fiat/"+currency, function(resp){
				$("#"+currency.toLowerCase()).html(resp);
			})
		},
		get_crypto_account: function(currency){
			$.get("/crypto/"+currency, function(resp){
				$("#"+currency.toLowerCase()).html(resp);
			})
		},
		date_string: function(){
			var myDate = new Date();  
			return myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + ":" + myDate.getMilliseconds()
		},
		to_precision_decimal_ceil: function(value, precision){
			return Math.ceil(value*Math.pow(10, precision))/Math.pow(10, precision);
		}
	},
	watch:{
	},
	beforeMount:function(){
		this.orderbooks = orderbooks;
	},
	mounted: function(){
		this.get_fiat_account('USD');
		this.get_crypto_account('QASH');
		this.get_crypto_account('BTC');
		this.get_crypto_account('ETH');
	}
})

var pusher = new Pusher("2ff981bb060680b5ce97", {
	wsHost: "ws.pusherapp.com",
	wsPort: 80,
	enabledTransports: ["ws", "flash", "wss"],
	disabledTransports: ["flash"]
});

for(var name in products){
	pusher.subscribe("price_ladders_cash_" + name + "_sell");
	pusher.subscribe("price_ladders_cash_" + name + "_buy");
}

pusher.allChannels().forEach(channel => {
	var name = channel.name.replace("price_ladders_cash_", "").split("_");
	var key = name[0];
	var type = name[1];
	channel.bind("updated", function(data){
		orderbooks[key][type] = data;
		app.$data.orderbooks = orderbooks;
	})
});

function playSound() {
	var sound = document.getElementById("audio");
	sound.play();
}