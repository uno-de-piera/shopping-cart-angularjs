'use strict';

/**
 * ng-Shop v0.0.1 Israel Parra - modulo que cumple el proceso de compra con angularjs
 * @link - http://uno-de-piera.com/carrito-de-compras-angularjs
 */

var shop = angular.module('ng-Shop', []);

//nuestra factoria se llamará $shop, inyectamos $rootScope
//devuleve un objeto con toda la funcionalidad que debe tener un carrito
shop.factory('$shop', ['$rootScope', function ($rootScope)
{
	/**
	* @var array con el contenido del carrito
	*/
	$rootScope.udpShopContent = [],
	/**
	* @var float con el precio total del carrito
	*/
	$rootScope.udpShopTotalPrice = 0,
	/**
	* @var integer con el número de artículos del carrito
	*/
	$rootScope.udpShopTotalProducts = 0;

	return{
		/**
		* @desc - comprueba los campos que introducimos al añadir productos
		*/
		minimRequeriments: function(product)
		{
			if(!product.qty || !product.price || !product.id)
			{
				throw new Error("Los campos qty, price y id son necesarios");
			}
			if(isNaN(product.qty) || isNaN(product.price) || isNaN(product.id))
			{
				throw new Error("Los campos qty, price y id deben ser númericos");
			}
			if(product.qty <= 0)
			{
				throw new Error("La cantidad añadida debe ser mayor de 0");
			}
			if(this.isInteger(product.qty) === false)
			{
				throw new Error("La cantidad del producto debe ser un número entero");
			}
		},
		/**
		* @desc - comprueba si el número pasado es un entero
		* @return - bool
		*/
		isInteger: function(n) 
		{
		    if(n % 1 === 0)
		    	return true;
		    else
		    	return false;
		},
		/**
		* @desc - añade nuevos productos al carrito
		* @param - array con los datos del producto
		* @return - mixed
		*/
		add: function(producto)
		{
			try{
				//comprobamos si el producto cumple los requisitos
				this.minimRequeriments(producto);

				//si el producto existe le actualizamos la cantidad
				if(this.checkExistsProduct(producto,$rootScope.udpShopContent) === true)
				{
					$rootScope.udpShopTotalPrice += parseFloat(producto.price * producto.qty,10);
					$rootScope.udpShopTotalProducts += producto.qty;
					return {"msg":"updated"};
				}
				//en otro caso, lo añadimos al carrito
				else
				{
					$rootScope.udpShopTotalPrice += parseFloat(producto.price * producto.qty,10);
					$rootScope.udpShopTotalProducts += producto.qty;
					$rootScope.udpShopContent.push(producto);
					return {"msg":"insert"};
				}
			}
			catch(error)
			{
				alert("Error " + error);
			}
		},
		/**
		* @desc - comprueba si el producto existe en el carrito
		* @param - product - objecto con los datos del producto a añadir
		* @param - products - array con el contenido del carrito
		* @return - bool
		*/
		checkExistsProduct: function(product, products) 
		{
		    var i, len;
		    for (i = 0, len = products.length; i < len; i++) 
		    {
		        if (products[i].id === product.id) 
		        {	   	
		        	products[i].qty += product.qty;  
		            return true;
		        }
		    }
		    return false;
		},
		/**
		* @desc -elimina un producto completo por su id
		* @param - int - id del producto
		* @return - mixed
		*/
		remove: function(id)
		{
			try{
				var i, len;
				for (i = 0, len = $rootScope.udpShopContent.length; i < len; i++) 
			    {
			        if ($rootScope.udpShopContent[i].id === id) 
			        {
			        	$rootScope.udpShopTotalPrice -= parseFloat($rootScope.udpShopContent[i].price * $rootScope.udpShopContent[i].qty,10);
			        	$rootScope.udpShopTotalProducts -= $rootScope.udpShopContent[i].qty;
			        	$rootScope.udpShopContent.splice(i, 1);
			        	if(isNaN($rootScope.udpShopTotalPrice))
			        	{
			        		$rootScope.udpShopTotalPrice = 0;
			        	}
			        	return {"msg":"deleted"};
			        }
			    }
			}
			catch(error)
			{
				alert("Error " + error);
			}
		},
		/**
		* @desc - elimina todo el contenido del carrito, precio total y productos
		* @return - bool
		*/
		destroy: function()
		{
			try{
				$rootScope.udpShopContent = [];
				$rootScope.udpShopTotalPrice = 0;
				$rootScope.udpShopTotalProducts = 0;
			}
			catch(error)
			{
				alert("Error " + error);
			}
		},
		/**
		* @desc - prepara el formulario hacía paypal con el contenido del carrito y los datos
		* que ha establecido el usuario previamente
		* @param - userData - datos de la tienda para el formulario de paypal
		*/
		dataPayPal: function(userData)
		{
			var htmlForm = "";
			for (var i = 0, len = $rootScope.udpShopContent.length; i < len; i++) 
			{
			    var product = $rootScope.udpShopContent[i];
			    var currentProduct = i + 1;
			    htmlForm += "<input type='hidden' name='item_number_"+currentProduct+"' value="+product.id+" />";
			    htmlForm += "<input type='hidden' name='item_name_"+currentProduct+"' value='"+product.name+"' />";
			    htmlForm += "<input type='hidden' name='quantity_"+currentProduct+"' value="+product.qty+" />";
			    htmlForm += "<input type='hidden' name='amount_"+currentProduct+"' value="+product.price.toFixed(2)+" />";
			}

			htmlForm += "<input type='hidden' name='cmd' value='"+userData.cmd+"' />";
			htmlForm += "<input type='hidden' name='upload' value='"+userData.upload+"' />";
			htmlForm += "<input type='hidden' name='business' value='"+userData.business+"' />";
			htmlForm += "<input type='hidden' name='cancel_return' value='"+userData.cancelUrl+"' />";
			htmlForm += "<input type='hidden' name='cbt' value='"+userData.msgReturn+"' />";
			htmlForm += "<input type='hidden' name='return' value='"+userData.successUrl+"' />";
			htmlForm += "<input type='hidden' name='rm' value="+userData.rm+ " />";
			htmlForm += "<input type='hidden' name='lc' value='"+userData.lc+"' />";
			htmlForm += "<input type='hidden' name='currency_code' value='"+userData.currencyCode+"' />";
			htmlForm += "<input type='hidden' name='cbt' value='"+userData.cbt+"' />";
			htmlForm += "<input type='image' src='https://www.paypal.com/es_ES/i/btn/btn_buynow_SM.gif' border='0' name='submit' />";
        	htmlForm += "<img border='0' src='https://www.paypal.com/es_ES/i/scr/pixel.gif' width='1' height='1' />";
			
			$(userData.formClass).html("").append(htmlForm);
		}
	};
}]);