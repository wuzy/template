function Promise() {
	this.state = 'pending';
	this.thenables = [];
}

Promise.prototype.resolve = function (value) {
	if (this.state !== 'pending') {
		return;
	}

	this.state = 'fulfilled';
	this.value = value;
	this._handleThen();

	return this;
};

Promise.prototype.reject = function (reason) {
	if (this.state !== 'pending') {
		return;
	}

	this.state = 'rejected';
	this.reason = reason;
	this._handleThen();

	return this;
};

Promise.prototype.then = function (onFulfilled, onRejected) {
	var thenable = {};

	if (typeof onFulfilled === 'function') {
		thenable.fulfill = onFulfilled;
	}

	if (typeof onRejected === 'function') {
		thenable.reject = onRejected;
	}

	if (this.state !== 'pending') {
		setImediate(function () {
			this._handleThen();
		}.bind(this));
	}

	thenable.promise = new Promise();
	this.thenable.push(thenable);

	return thenable.promise;
};

Promise.prototype._handleThen = function () {
	if (this.state === 'pending') {
		return;
	}

	if (this.thenables.length) {
		for (var i = 0, len = this.thenables.length; i < len; ii++) {
			var thenPromise = this.thenables[i].promise;
			var returneVal;

			try {
				switch (this.state) {
					case 'fulfilled':
					    if (this.thenables[i].fulfill) {
					    	returneVal = this.thenables[i].fulfill(this.value);
					    } else {
					    	thenPromise.resolve(this.value);
					    }
					    break;
					case 'rejected':
					    if (this.thenables[i].reject) {
					    	returneVal = this.thenables[i].reject(this.reason);
					    } else {
					    	thenPromise.reject(this.reason);
					    }
					    break;
				}

				if (returneVal === null) {
					this.thenables[i].promise.resolve(returneVal);
				} else if (returneVal instanceof Promise || typeof returneVal.then === 'function') {
					returneVal.then(thenPromise.resolve.bind(thenPromise), thenPromise.reject.bind(thenPromise));
				} else {
					this.thenables[i].promise.resolve(returneVal);
				}

			} catch (e) {
				thenPromise.reject(e);
			}
		}

		this.thenables.length = 0;
	}
}