function parseElement(element, vm) {
	var model = vm;

	if (element.getAttribute('vm-model')) {
		model = bindModel(element.getAttribute('vm-model'));
	}

	for (var i = 0, len = element.attributes.length; i < len; i++) {
		parseAttribute(element, element.attributes[i], model);
	}

	for (var i = 0, len = element.children.length; i < len; i++) {
		parseElement(element.children[i], model);
	}
}

function bindModel(modelName) {
	thin.log('model' + modelName);

	var model = thin.use(modelName, true);
	var instance = new model();

	return instance;
}

function parseAttribute(element, attr, model) {
	if (attr.name.indexOf('vm-') == 0) {
		var type = attr.name.slice(3);

		switch (type) {
			case 'init':
			    bindInit(element, attr.value, model);
			    break;
			case 'value':
			    bindValue(element, attr.value, model);
			    break;
			case 'click':
			    bindClick(element, attr.value, model);
			    break;
			case 'enable':
			    bindEnable(element, attr.value, model, true);
			    break;
			case 'disable':
			    bindEnable(element, attr.value, model, false);
			    break;
			case 'visible':
			    bindVisible(element, attr.value, model, true);
			    break;
			case 'invisible':
			    bindVisible(element, attr.value, model, false);
			    break;
			case 'element':
			    model[attr.value] = element;
			    break;
		}
	}
}

function bindValue(element, key, vm) {
	vm.$watch(key, function (value, oldValue) {
		element.value = value || '';
	});

	element.onkeyup = function () {
		vm[key] = element.value;
	};

	element.onpaste = function () {
		vm[key] = element.value;
	};
}

var Binder = {
    $watch: function (key, watcher) {
    	if (!this.$watchers[key]) {
    		this.$watchers[key] = {
    			value: this[key],
    			list: []
    		};

    		Object.defineProperty(this, key, {
    			set: function (val) {
    				var oldValue = this.$watchers[key].value;
    				this.$watchers[key].value = val;

    				for (var i = 0, len = this.$watchers[key].list.length; i < len; i++) {
    					this.$watchers[key].list[i](val, oldValue);
    				}
    			},

    			get: function () {
    				return this.$watchers[key].value;
    			}
    		});
    	}

    	this.$watchers[key].list.push(watcher);
    }
};

function bindModel(name) {
	var model = thin.use(name, true);
	var instance = new model().extend(Binder);
	instance.$watchers = {};

	return instance;
}