(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// create an array to contain all timers
var timers = [];

// get elements
var timersContainer = document.getElementById('js-timers-container');
var newTimerButton = document.getElementById('js-new-timer');

var Clock = function () {
    function Clock(parent, options) {
        _classCallCheck(this, Clock);

        this.parent = parent;
        this.timer = this.createTimer();
        this.titleInput = this.createTitleInput(this);
        this.startButton = this.createButton('Start', this.start, this);
        this.stopButton = this.createButton('Stop', this.stop, this);
        this.offset;
        this.clock;
        this.interval = null;
        this.entries = [];
        this.options = options || {};
        this.delay = options.delay || 1000; // the amount of time in milliseconds after which to update the clock
        this.isGlobal = options.isGlobal || false;
        this.title = options.title || '';

        var elem = this.createElement();

        // Append elements
        elem.appendChild(this.titleInput);
        elem.appendChild(this.timer);
        elem.appendChild(this.startButton);
        elem.appendChild(this.stopButton);
        // elem.appendChild(this.resetButton);

        // Disable the stop button
        this.stopButton.disabled = true;
        this.titleInput.focus();

        this.reset();
    }

    // Create the clock container element


    _createClass(Clock, [{
        key: 'createElement',
        value: function createElement() {
            var element = document.createElement('div');
            element.className = 'clock';
            this.parent.appendChild(element);
            return element;
        }

        // Create the timer element

    }, {
        key: 'createTimer',
        value: function createTimer() {
            var span = document.createElement('span');
            span.className = 'clock__timer';
            return span;
        }
    }, {
        key: 'createButton',
        value: function createButton(action, handler, scope) {
            var button = document.createElement('button');
            button.href = '#' + action;
            button.className = 'clock__button--' + action + ' button';
            button.innerHTML = action;
            button.addEventListener('click', function (event) {
                return handler.call(scope);
            });
            return button;
        }
    }, {
        key: 'createTitleInput',
        value: function createTitleInput(scope) {
            var _this = this;

            var input = document.createElement('input');
            input.className = 'clock__title-input';
            input.placeholder = 'New timer';
            input.type = 'text';
            input.addEventListener('keyup', function (event) {
                return _this.updateTimerTitle.call(scope);
            });
            return input;
        }
    }, {
        key: 'updateTimerTitle',
        value: function updateTimerTitle() {
            this.options.title = this.titleInput.value;
        }
    }, {
        key: 'parseTime',
        value: function parseTime(number) {
            var sec_num = parseInt(number, 10);
            var hours = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - hours * 3600) / 60);
            var seconds = sec_num - hours * 3600 - minutes * 60;

            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            var time = hours + ':' + minutes + ':' + seconds;
            return time;
        }

        // Reset the clock counter to 0

    }, {
        key: 'reset',
        value: function reset() {
            this.clock = 0;
            this.render();
        }
    }, {
        key: 'delta',
        value: function delta() {
            var now = Date.now();
            var d = now - this.offset;

            this.offset = now;
            return d;
        }
    }, {
        key: 'update',
        value: function update() {
            this.clock += this.delta();
            this.render();
        }
    }, {
        key: 'render',
        value: function render() {
            this.timer.innerHTML = this.parseTime(this.clock / 1000);
        }
    }, {
        key: 'start',
        value: function start() {
            if (!this.interval) {
                this.stopAllClocks();
                this.offset = Date.now();
                this.interval = setInterval(this.update.bind(this), this.delay);
                this.stopButton.disabled = false;
                this.startButton.disabled = true;
                this.entries.push({ start: this.offset });
            }
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
                this.startButton.disabled = false;
                this.stopButton.disabled = true;
                this.entries[this.entries.length - 1].stop = Date.now();
                this.entries[this.entries.length - 1].duration = this.entries[this.entries.length - 1].stop - this.entries[this.entries.length - 1].start;
            }
        }
    }, {
        key: 'stopAllClocks',
        value: function stopAllClocks() {
            for (var i = 0; i < timers.length; i++) {
                timers[i].stop();
            }
        }
    }]);

    return Clock;
}();

window.addEventListener('load', function load(event) {

    window.removeEventListener("load", load, false); //remove listener, no longer needed

    if ('localStorage' in window && window['localStorage'] !== null) {
        timers = JSON.parse(localStorage['timers'] || null);

        if (timers === null) {
            timers = [];
        }
    }

    if (timers.length == 0) {
        timers.push(new Clock(timersContainer, { isGlobal: true }));
    };

    newTimerButton.onclick = function () {
        timers.push(new Clock(timersContainer, { isGlobal: true }));
    };
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0NBLElBQUksU0FBUyxFQUFUOzs7QUFHSixJQUFJLGtCQUFrQixTQUFTLGNBQVQsQ0FBd0IscUJBQXhCLENBQWxCO0FBQ0osSUFBSSxpQkFBaUIsU0FBUyxjQUFULENBQXdCLGNBQXhCLENBQWpCOztBQUVKLElBQUk7QUFDQSxhQURBLEtBQ0EsQ0FBWSxNQUFaLEVBQW9CLE9BQXBCLEVBQTZCOzhCQUQ3QixPQUM2Qjs7QUFDekIsYUFBSyxNQUFMLEdBQWMsTUFBZCxDQUR5QjtBQUV6QixhQUFLLEtBQUwsR0FBYSxLQUFLLFdBQUwsRUFBYixDQUZ5QjtBQUd6QixhQUFLLFVBQUwsR0FBa0IsS0FBSyxnQkFBTCxDQUFzQixJQUF0QixDQUFsQixDQUh5QjtBQUl6QixhQUFLLFdBQUwsR0FBbUIsS0FBSyxZQUFMLENBQWtCLE9BQWxCLEVBQTJCLEtBQUssS0FBTCxFQUFZLElBQXZDLENBQW5CLENBSnlCO0FBS3pCLGFBQUssVUFBTCxHQUFrQixLQUFLLFlBQUwsQ0FBa0IsTUFBbEIsRUFBMEIsS0FBSyxJQUFMLEVBQVcsSUFBckMsQ0FBbEIsQ0FMeUI7QUFNekIsYUFBSyxNQUFMLENBTnlCO0FBT3pCLGFBQUssS0FBTCxDQVB5QjtBQVF6QixhQUFLLFFBQUwsR0FBZ0IsSUFBaEIsQ0FSeUI7QUFTekIsYUFBSyxPQUFMLEdBQWUsRUFBZixDQVR5QjtBQVV6QixhQUFLLE9BQUwsR0FBZSxXQUFXLEVBQVgsQ0FWVTtBQVd6QixhQUFLLEtBQUwsR0FBYSxRQUFRLEtBQVIsSUFBaUIsSUFBakI7QUFYWSxZQVl6QixDQUFLLFFBQUwsR0FBZ0IsUUFBUSxRQUFSLElBQW9CLEtBQXBCLENBWlM7QUFhekIsYUFBSyxLQUFMLEdBQWEsUUFBUSxLQUFSLElBQWlC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QWYsR0FBeUIsWUFBVztBQUNoQyxlQUFPLElBQVAsQ0FBWSxJQUFJLEtBQUosQ0FBVSxlQUFWLEVBQTJCLEVBQUUsVUFBVSxJQUFWLEVBQTdCLENBQVosRUFEZ0M7S0FBWCxDQWhCd0I7Q0FBckIsQ0FBaEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gY3JlYXRlIGFuIGFycmF5IHRvIGNvbnRhaW4gYWxsIHRpbWVyc1xudmFyIHRpbWVycyA9IFtdO1xuXG4vLyBnZXQgZWxlbWVudHNcbnZhciB0aW1lcnNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanMtdGltZXJzLWNvbnRhaW5lcicpO1xudmFyIG5ld1RpbWVyQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2pzLW5ldy10aW1lcicpO1xuXG52YXIgQ2xvY2sgPSBjbGFzcyB7XG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgICAgICB0aGlzLnRpbWVyID0gdGhpcy5jcmVhdGVUaW1lcigpO1xuICAgICAgICB0aGlzLnRpdGxlSW5wdXQgPSB0aGlzLmNyZWF0ZVRpdGxlSW5wdXQodGhpcyk7XG4gICAgICAgIHRoaXMuc3RhcnRCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbignU3RhcnQnLCB0aGlzLnN0YXJ0LCB0aGlzKTtcbiAgICAgICAgdGhpcy5zdG9wQnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24oJ1N0b3AnLCB0aGlzLnN0b3AsIHRoaXMpO1xuICAgICAgICB0aGlzLm9mZnNldDtcbiAgICAgICAgdGhpcy5jbG9jaztcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHRoaXMuZW50cmllcyA9IFtdO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB0aGlzLmRlbGF5ID0gb3B0aW9ucy5kZWxheSB8fCAxMDAwOyAvLyB0aGUgYW1vdW50IG9mIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRvIHVwZGF0ZSB0aGUgY2xvY2tcbiAgICAgICAgdGhpcy5pc0dsb2JhbCA9IG9wdGlvbnMuaXNHbG9iYWwgfHwgZmFsc2U7XG4gICAgICAgIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlIHx8ICcnO1xuXG4gICAgICAgIHZhciBlbGVtID0gdGhpcy5jcmVhdGVFbGVtZW50KCk7XG5cbiAgICAgICAgLy8gQXBwZW5kIGVsZW1lbnRzXG4gICAgICAgIGVsZW0uYXBwZW5kQ2hpbGQodGhpcy50aXRsZUlucHV0KTtcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnRpbWVyKTtcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnN0YXJ0QnV0dG9uKTtcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnN0b3BCdXR0b24pO1xuICAgICAgICAvLyBlbGVtLmFwcGVuZENoaWxkKHRoaXMucmVzZXRCdXR0b24pO1xuXG4gICAgICAgIC8vIERpc2FibGUgdGhlIHN0b3AgYnV0dG9uXG4gICAgICAgIHRoaXMuc3RvcEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMudGl0bGVJbnB1dC5mb2N1cygpO1xuXG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIGNsb2NrIGNvbnRhaW5lciBlbGVtZW50XG4gICAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSAnY2xvY2snO1xuICAgICAgICB0aGlzLnBhcmVudC5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSB0aW1lciBlbGVtZW50XG4gICAgY3JlYXRlVGltZXIoKSB7XG4gICAgICAgIHZhciBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBzcGFuLmNsYXNzTmFtZSA9ICdjbG9ja19fdGltZXInO1xuICAgICAgICByZXR1cm4gc3BhbjtcbiAgICB9XG5cbiAgICBjcmVhdGVCdXR0b24oYWN0aW9uLCBoYW5kbGVyLCBzY29wZSkge1xuICAgICAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGJ1dHRvbi5ocmVmID0gJyMnICsgYWN0aW9uO1xuICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gJ2Nsb2NrX19idXR0b24tLScgKyBhY3Rpb24gKyAnIGJ1dHRvbic7XG4gICAgICAgIGJ1dHRvbi5pbm5lckhUTUwgPSBhY3Rpb247XG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IGhhbmRsZXIuY2FsbChzY29wZSkpO1xuICAgICAgICByZXR1cm4gYnV0dG9uO1xuICAgIH1cblxuICAgIGNyZWF0ZVRpdGxlSW5wdXQoc2NvcGUpIHtcbiAgICAgICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgaW5wdXQuY2xhc3NOYW1lID0gJ2Nsb2NrX190aXRsZS1pbnB1dCc7XG4gICAgICAgIGlucHV0LnBsYWNlaG9sZGVyID0gJ05ldyB0aW1lcic7XG4gICAgICAgIGlucHV0LnR5cGUgPSAndGV4dCc7XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZXZlbnQgPT4gdGhpcy51cGRhdGVUaW1lclRpdGxlLmNhbGwoc2NvcGUpKTtcbiAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgIH1cblxuICAgIHVwZGF0ZVRpbWVyVGl0bGUoKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy50aXRsZSA9IHRoaXMudGl0bGVJbnB1dC52YWx1ZTtcbiAgICB9XG5cbiAgICBwYXJzZVRpbWUobnVtYmVyKSB7XG4gICAgICAgIHZhciBzZWNfbnVtID0gcGFyc2VJbnQobnVtYmVyLCAxMCk7XG4gICAgICAgIHZhciBob3VycyAgID0gTWF0aC5mbG9vcihzZWNfbnVtIC8gMzYwMCk7XG4gICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcigoc2VjX251bSAtIChob3VycyAqIDM2MDApKSAvIDYwKTtcbiAgICAgICAgdmFyIHNlY29uZHMgPSBzZWNfbnVtIC0gKGhvdXJzICogMzYwMCkgLSAobWludXRlcyAqIDYwKTtcblxuICAgICAgICBpZiAoaG91cnMgPCAxMCkge1xuICAgICAgICAgICAgaG91cnMgICA9ICcwJyArIGhvdXJzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtaW51dGVzIDwgMTApIHtcbiAgICAgICAgICAgIG1pbnV0ZXMgPSAnMCcgKyBtaW51dGVzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWNvbmRzIDwgMTApIHtcbiAgICAgICAgICAgIHNlY29uZHMgPSAnMCcgKyBzZWNvbmRzO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0aW1lID0gaG91cnMgKyAnOicgKyBtaW51dGVzICsgJzonICsgc2Vjb25kcztcbiAgICAgICAgcmV0dXJuIHRpbWU7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgdGhlIGNsb2NrIGNvdW50ZXIgdG8gMFxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLmNsb2NrID0gMDtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBkZWx0YSgpIHtcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHZhciBkICAgPSBub3cgLSB0aGlzLm9mZnNldDtcblxuICAgICAgICB0aGlzLm9mZnNldCA9IG5vdztcbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLmNsb2NrICs9IHRoaXMuZGVsdGEoKTtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMudGltZXIuaW5uZXJIVE1MID0gdGhpcy5wYXJzZVRpbWUodGhpcy5jbG9jayAvIDEwMDApO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgICBpZiAoIXRoaXMuaW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcEFsbENsb2NrcygpO1xuICAgICAgICAgICAgdGhpcy5vZmZzZXQgICA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwodGhpcy51cGRhdGUuYmluZCh0aGlzKSwgdGhpcy5kZWxheSk7XG4gICAgICAgICAgICB0aGlzLnN0b3BCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5lbnRyaWVzLnB1c2goeyBzdGFydDogdGhpcy5vZmZzZXQgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wKCkge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnZhbCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5zdGFydEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zdG9wQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZW50cmllc1t0aGlzLmVudHJpZXMubGVuZ3RoIC0gMV0uc3RvcCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB0aGlzLmVudHJpZXNbdGhpcy5lbnRyaWVzLmxlbmd0aCAtIDFdLmR1cmF0aW9uID0gdGhpcy5lbnRyaWVzW3RoaXMuZW50cmllcy5sZW5ndGggLSAxXS5zdG9wIC0gdGhpcy5lbnRyaWVzW3RoaXMuZW50cmllcy5sZW5ndGggLSAxXS5zdGFydDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0b3BBbGxDbG9ja3MoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGltZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aW1lcnNbaV0uc3RvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gbG9hZChldmVudCkge1xuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGxvYWQsIGZhbHNlKTsgLy9yZW1vdmUgbGlzdGVuZXIsIG5vIGxvbmdlciBuZWVkZWRcblxuICAgIGlmICgnbG9jYWxTdG9yYWdlJyBpbiB3aW5kb3cgJiYgd2luZG93Wydsb2NhbFN0b3JhZ2UnXSAhPT0gbnVsbCkge1xuICAgICAgICB0aW1lcnMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZVsndGltZXJzJ10gfHwgbnVsbCk7XG5cbiAgICAgICAgaWYgKHRpbWVycyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGltZXJzID0gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGltZXJzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHRpbWVycy5wdXNoKG5ldyBDbG9jayh0aW1lcnNDb250YWluZXIsIHsgaXNHbG9iYWw6IHRydWUgfSkpO1xuICAgIH07XG5cbiAgICBuZXdUaW1lckJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVycy5wdXNoKG5ldyBDbG9jayh0aW1lcnNDb250YWluZXIsIHsgaXNHbG9iYWw6IHRydWUgfSkpO1xuICAgIH07XG59KTtcblxuIl19
