var mbr = mbr || {};

(function () {
  var CONST = {
    GET: 'GET',
    AMP: '&',
    EMPTY: '',
    EQ: '=',
    QUESTION: '?'
  };

  var STATE = {
    IDLE: 'IDLE',
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    ABORTED: 'ABORTED'
  };

  function getParams (params) {
    var result = CONST.EMPTY;

    if (params) for (var key in params) {
      if (params[key] !== undefined) {
        result += (result ? CONST.AMP : CONST.EMPTY) +
          key + CONST.EQ + encodeURIComponent(params[key]);
      }
    }

    return result ? (CONST.QUESTION + result) : result;
  }

  function getUrl (options) {
    return options.url + getParams(options.params);
  }

  function Request (options, params) {
    var _this = this;
    this.url = options.url;
    this.params = params || options.params;
    this.state = STATE.IDLE;
    this.onrequest = options.onrequest;
    this.onresponse = options.onresponse;
    this.request = new XMLHttpRequest();

    if (options.headers instanceof Object) for (var name in options.headers) {
      if (options.headers[name] instanceof Array) {
        for (var index = 0; index < options.headers[name].length; ++index) {
          this.request.setRequestHeader(name, options.headers[name][index]);
        }
      } else {
        this.request.setRequestHeader(name, options.headers[name]);
      }
    }

    this.request.open(options.method, getUrl(options), true);

    this.request.onreadystatechange = function () {
      if (this.readyState === 4) {
        _this.state = (this.status < 400) ? STATE.SUCCESS : STATE.ERROR;
        (_this.onresponse instanceof Function) && (_this.onresponse.call(_this, this.responseText));
      }
    }
  }
  Request.prototype.send = function (data) {
    data || (data = '');
    this.data = data;

    var dataToSend = this.onrequest instanceof Function
      && this.onrequest.call(this, data)
      || data;

    this.request.send(dataToSend);
    this.state = STATE.PENDING;

    return this;
  }
  Request.prototype.abort = function () {
    this.request.abort();
    this.state = STATE.ABORTED;

    return this;
  }
  Request.prototype.STATE = STATE;

  function Ajax (options) {
    this.options = {
      method: CONST.GET
    };
    this.set(options);
  }
  Ajax.prototype.set = function (options) {
    if (options instanceof Object) for (var key in options) {
      this.options[key] = options[key];
    }
    return this;
  }
  Ajax.prototype.send = function (data, params) {
    return new Request(this.options, params).send(data);
  }

  mbr.ajax = function (options) {
    return new Ajax(options);
  }
})()
