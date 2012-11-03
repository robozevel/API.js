(function(root) {
	var API
	,	publicMethods = {}
	,	toString = Object.prototype.toString
	,	forEach  = Array.prototype.forEach
	,	UNDEFINED_TYPE = "*"
	,	UNKNOWN_TYPE = "?"
	,	SPREAD_TYPE = "..."
	,	types = {}
	;

	if (forEach) {
		each = function(array, iterator, context) {
			return forEach.call(array, iterator, context || this);
		}
	} else {
		each = function(array, iterator, context) {
			context = context || this;
			for (var i = 0, l = array.length; i < l; i++) {
				iterator.call(context, array[i], i, array);
			}
		}
	}

	function noop() {}

	function addType(type, signature) {
		types['[object ' + type + ']'] = signature || type.toLowerCase();
	}

	function addTypes(types) {
		each(types, function(type) {
			addType(type);
		});
	}

	function stringify(signature) {
		return signature.join(" ");
	}

	function defineInterface(functions) {
		
		function Interface() {
			var fn, signature = [];

			if (arguments.length) {
				each(arguments, function(argument) {
					var type = toString.call(argument);
					signature.push(types[type] || UNKNOWN_TYPE);
				});
			}
			// Attempt to find "<type>" OR "<type> *" OR "..."
			fn = functions[stringify(signature)] || functions[stringify(signature.concat(UNDEFINED_TYPE))] || functions[SPREAD_TYPE];

			// Attempt to find "*"
			if (!fn) {
				signature[signature.length - 1] = UNDEFINED_TYPE;
				fn = functions[stringify(signature)];
			}

			return (fn || noop).apply(this, arguments);
		};

		Interface.extend = function(signature, fn) {
			functions[signature] = fn;
		}

		return Interface;
	}

	function defineExtendedInterface(functions, props) {
		var api = defineInterface(functions);
		for (var prop in props) {
			if (props.hasOwnProperty(prop)) api[prop] = props[prop];
		}
		return api;
	}

	// Add built-in types
	addTypes(['Boolean', 'Object', 'Array', 'Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp']);

	each(['Null', 'Undefined'], function(type) {
		addType(type, UNDEFINED_TYPE);
	});

	// Exspose API
	publicMethods = {
		getTypes: function() { return types; },
		addTypes: defineInterface({
			"string *"	: addType,
			"array"		: addTypes,
			"object"	: function(signatures) {
				for (var type in signatures) {
					if (signatures.hasOwnProperty(type)) addType(type, signatures[type]);
				}
			}
		})
	};

	API = defineExtendedInterface({
		"object"		 : defineInterface,
		"object object"	 : defineExtendedInterface,
		"function object": function(fn, props) {
			return defineExtendedInterface({ "": fn }, props);
		}
	}, publicMethods);

	root["API"] = root["API"] || API;

}(this));