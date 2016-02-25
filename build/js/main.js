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

newTimerButton.onclick = function () {
    timers.push(new Clock(timersContainer, { isGlobal: true }));
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0NBLElBQUksU0FBUyxFQUFUOzs7QUFHSixJQUFJLGtCQUFrQixTQUFTLGNBQVQsQ0FBd0IscUJBQXhCLENBQWxCO0FBQ0osSUFBSSxpQkFBaUIsU0FBUyxjQUFULENBQXdCLGNBQXhCLENBQWpCOztBQUVKLElBQUk7QUFDQSxhQURBLEtBQ0EsQ0FBWSxNQUFaLEVBQW9CLE9BQXBCLEVBQTZCOzhCQUQ3QixPQUM2Qjs7QUFDekIsYUFBSyxNQUFMLEdBQWMsTUFBZCxDQUR5QjtBQUV6QixhQUFLLEtBQUwsR0FBYSxLQUFLLFdBQUwsRUFBYixDQUZ5QjtBQUd6QixhQUFLLFVBQUwsR0FBa0IsS0FBSyxnQkFBTCxDQUFzQixJQUF0QixDQUFsQixDQUh5QjtBQUl6QixhQUFLLFdBQUwsR0FBbUIsS0FBSyxZQUFMLENBQWtCLE9BQWxCLEVBQTJCLEtBQUssS0FBTCxFQUFZLElBQXZDLENBQW5CLENBSnlCO0FBS3pCLGFBQUssVUFBTCxHQUFrQixLQUFLLFlBQUwsQ0FBa0IsTUFBbEIsRUFBMEIsS0FBSyxJQUFMLEVBQVcsSUFBckMsQ0FBbEIsQ0FMeUI7QUFNekIsYUFBSyxNQUFMLENBTnlCO0FBT3pCLGFBQUssS0FBTCxDQVB5QjtBQVF6QixhQUFLLFFBQUwsR0FBZ0IsSUFBaEIsQ0FSeUI7QUFTekIsYUFBSyxPQUFMLEdBQWUsRUFBZixDQVR5QjtBQVV6QixhQUFLLE9BQUwsR0FBZSxXQUFXLEVBQVgsQ0FWVTtBQVd6QixhQUFLLEtBQUwsR0FBYSxRQUFRLEtBQVIsSUFBaUIsSUFBakI7QUFYWSxZQVl6QixDQUFLLFFBQUwsR0FBZ0IsUUFBUSxRQUFSLElBQW9CLEtBQXBCLENBWlM7QUFhekIsYUFBSyxLQUFMLEdBQWEsUUFBUSxLQUFSLElBQWlC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LE9BQUwsQ0FBYSxNQUFiLEdBQXNCLENBQXRCLENBQWIsQ0FBc0MsSUFBdEMsR0FBNkMsS0FBSyxHQUFMLEVBQTdDLENBTGU7QUFNZixxQkFBSyxPQUFMLENBQWEsS0FBSyxPQUFMLENBQWEsTUFBYixHQUFzQixDQUF0QixDQUFiLENBQXNDLFFBQXRDLEdBQWlELEtBQUssT0FBTCxDQUFhLEtBQUssT0FBTCxDQUFhLE1BQWIsR0FBc0IsQ0FBdEIsQ0FBYixDQUFzQyxJQUF0QyxHQUE2QyxLQUFLLE9BQUwsQ0FBYSxLQUFLLE9BQUwsQ0FBYSxNQUFiLEdBQXNCLENBQXRCLENBQWIsQ0FBc0MsS0FBdEMsQ0FOL0U7YUFBbkI7Ozs7d0NBVVk7QUFDWixpQkFBSyxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksT0FBTyxNQUFQLEVBQWUsR0FBbkMsRUFBd0M7QUFDcEMsdUJBQU8sQ0FBUCxFQUFVLElBQVYsR0FEb0M7YUFBeEM7Ozs7V0FySUo7R0FBSjs7QUE0SUEsZUFBZSxPQUFmLEdBQXlCLFlBQVc7QUFDaEMsV0FBTyxJQUFQLENBQVksSUFBSSxLQUFKLENBQVUsZUFBVixFQUEyQixFQUFFLFVBQVUsSUFBVixFQUE3QixDQUFaLEVBRGdDO0NBQVgiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gY3JlYXRlIGFuIGFycmF5IHRvIGNvbnRhaW4gYWxsIHRpbWVyc1xudmFyIHRpbWVycyA9IFtdO1xuXG4vLyBnZXQgZWxlbWVudHNcbnZhciB0aW1lcnNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanMtdGltZXJzLWNvbnRhaW5lcicpO1xudmFyIG5ld1RpbWVyQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2pzLW5ldy10aW1lcicpO1xuXG52YXIgQ2xvY2sgPSBjbGFzcyB7XG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgICAgICB0aGlzLnRpbWVyID0gdGhpcy5jcmVhdGVUaW1lcigpO1xuICAgICAgICB0aGlzLnRpdGxlSW5wdXQgPSB0aGlzLmNyZWF0ZVRpdGxlSW5wdXQodGhpcyk7XG4gICAgICAgIHRoaXMuc3RhcnRCdXR0b24gPSB0aGlzLmNyZWF0ZUJ1dHRvbignU3RhcnQnLCB0aGlzLnN0YXJ0LCB0aGlzKTtcbiAgICAgICAgdGhpcy5zdG9wQnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24oJ1N0b3AnLCB0aGlzLnN0b3AsIHRoaXMpO1xuICAgICAgICB0aGlzLm9mZnNldDtcbiAgICAgICAgdGhpcy5jbG9jaztcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHRoaXMuZW50cmllcyA9IFtdO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB0aGlzLmRlbGF5ID0gb3B0aW9ucy5kZWxheSB8fCAxMDAwOyAvLyB0aGUgYW1vdW50IG9mIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRvIHVwZGF0ZSB0aGUgY2xvY2tcbiAgICAgICAgdGhpcy5pc0dsb2JhbCA9IG9wdGlvbnMuaXNHbG9iYWwgfHwgZmFsc2U7XG4gICAgICAgIHRoaXMudGl0bGUgPSBvcHRpb25zLnRpdGxlIHx8ICcnO1xuXG4gICAgICAgIHZhciBlbGVtID0gdGhpcy5jcmVhdGVFbGVtZW50KCk7XG5cbiAgICAgICAgLy8gQXBwZW5kIGVsZW1lbnRzXG4gICAgICAgIGVsZW0uYXBwZW5kQ2hpbGQodGhpcy50aXRsZUlucHV0KTtcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnRpbWVyKTtcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnN0YXJ0QnV0dG9uKTtcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnN0b3BCdXR0b24pO1xuICAgICAgICAvLyBlbGVtLmFwcGVuZENoaWxkKHRoaXMucmVzZXRCdXR0b24pO1xuXG4gICAgICAgIC8vIERpc2FibGUgdGhlIHN0b3AgYnV0dG9uXG4gICAgICAgIHRoaXMuc3RvcEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgY2xvY2sgY29udGFpbmVyIGVsZW1lbnRcbiAgICBjcmVhdGVFbGVtZW50KCkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdjbG9jayc7XG4gICAgICAgIHRoaXMucGFyZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIHRpbWVyIGVsZW1lbnRcbiAgICBjcmVhdGVUaW1lcigpIHtcbiAgICAgICAgdmFyIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHNwYW4uY2xhc3NOYW1lID0gJ2Nsb2NrX190aW1lcic7XG4gICAgICAgIHJldHVybiBzcGFuO1xuICAgIH1cblxuICAgIGNyZWF0ZUJ1dHRvbihhY3Rpb24sIGhhbmRsZXIsIHNjb3BlKSB7XG4gICAgICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLmhyZWYgPSAnIycgKyBhY3Rpb247XG4gICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnY2xvY2tfX2J1dHRvbi0tJyArIGFjdGlvbiArICcgYnV0dG9uJztcbiAgICAgICAgYnV0dG9uLmlubmVySFRNTCA9IGFjdGlvbjtcbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4gaGFuZGxlci5jYWxsKHNjb3BlKSk7XG4gICAgICAgIHJldHVybiBidXR0b247XG4gICAgfVxuXG4gICAgY3JlYXRlVGl0bGVJbnB1dChzY29wZSkge1xuICAgICAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBpbnB1dC5jbGFzc05hbWUgPSAnY2xvY2tfX3RpdGxlLWlucHV0JztcbiAgICAgICAgaW5wdXQucGxhY2Vob2xkZXIgPSAnTmV3IHRpbWVyJztcbiAgICAgICAgaW5wdXQudHlwZSA9ICd0ZXh0JztcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBldmVudCA9PiB0aGlzLnVwZGF0ZVRpbWVyVGl0bGUuY2FsbChzY29wZSkpO1xuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuXG4gICAgdXBkYXRlVGltZXJUaXRsZSgpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLnRpdGxlID0gdGhpcy50aXRsZUlucHV0LnZhbHVlO1xuICAgIH1cblxuICAgIHBhcnNlVGltZShudW1iZXIpIHtcbiAgICAgICAgdmFyIHNlY19udW0gPSBwYXJzZUludChudW1iZXIsIDEwKTtcbiAgICAgICAgdmFyIGhvdXJzICAgPSBNYXRoLmZsb29yKHNlY19udW0gLyAzNjAwKTtcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKChzZWNfbnVtIC0gKGhvdXJzICogMzYwMCkpIC8gNjApO1xuICAgICAgICB2YXIgc2Vjb25kcyA9IHNlY19udW0gLSAoaG91cnMgKiAzNjAwKSAtIChtaW51dGVzICogNjApO1xuXG4gICAgICAgIGlmIChob3VycyA8IDEwKSB7XG4gICAgICAgICAgICBob3VycyAgID0gJzAnICsgaG91cnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1pbnV0ZXMgPCAxMCkge1xuICAgICAgICAgICAgbWludXRlcyA9ICcwJyArIG1pbnV0ZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlY29uZHMgPCAxMCkge1xuICAgICAgICAgICAgc2Vjb25kcyA9ICcwJyArIHNlY29uZHM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRpbWUgPSBob3VycyArICc6JyArIG1pbnV0ZXMgKyAnOicgKyBzZWNvbmRzO1xuICAgICAgICByZXR1cm4gdGltZTtcbiAgICB9XG5cbiAgICAvLyBSZXNldCB0aGUgY2xvY2sgY291bnRlciB0byAwXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuY2xvY2sgPSAwO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIGRlbHRhKCkge1xuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIGQgICA9IG5vdyAtIHRoaXMub2Zmc2V0O1xuXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gbm93O1xuICAgICAgICByZXR1cm4gZDtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuY2xvY2sgKz0gdGhpcy5kZWx0YSgpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy50aW1lci5pbm5lckhUTUwgPSB0aGlzLnBhcnNlVGltZSh0aGlzLmNsb2NrIC8gMTAwMCk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIGlmICghdGhpcy5pbnRlcnZhbCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wQWxsQ2xvY2tzKCk7XG4gICAgICAgICAgICB0aGlzLm9mZnNldCAgID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpLCB0aGlzLmRlbGF5KTtcbiAgICAgICAgICAgIHRoaXMuc3RvcEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zdGFydEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmVudHJpZXMucHVzaCh7IHN0YXJ0OiB0aGlzLm9mZnNldCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0b3AoKSB7XG4gICAgICAgIGlmICh0aGlzLmludGVydmFsKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0QnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnN0b3BCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5lbnRyaWVzW3RoaXMuZW50cmllcy5sZW5ndGggLSAxXS5zdG9wID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHRoaXMuZW50cmllc1t0aGlzLmVudHJpZXMubGVuZ3RoIC0gMV0uZHVyYXRpb24gPSB0aGlzLmVudHJpZXNbdGhpcy5lbnRyaWVzLmxlbmd0aCAtIDFdLnN0b3AgLSB0aGlzLmVudHJpZXNbdGhpcy5lbnRyaWVzLmxlbmd0aCAtIDFdLnN0YXJ0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RvcEFsbENsb2NrcygpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aW1lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRpbWVyc1tpXS5zdG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxubmV3VGltZXJCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgIHRpbWVycy5wdXNoKG5ldyBDbG9jayh0aW1lcnNDb250YWluZXIsIHsgaXNHbG9iYWw6IHRydWUgfSkpO1xufTtcbiJdfQ==
