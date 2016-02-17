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
        this.startButton = this.createButton('start', this.start, this);
        this.stopButton = this.createButton('stop', this.stop, this);
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
            button.className = 'clock__' + action + 'button';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0NBLElBQUksU0FBUyxFQUFUOzs7QUFHSixJQUFJLGtCQUFrQixTQUFTLGNBQVQsQ0FBd0IscUJBQXhCLENBQWxCO0FBQ0osSUFBSSxpQkFBaUIsU0FBUyxjQUFULENBQXdCLGNBQXhCLENBQWpCOztBQUVKLElBQUk7QUFDQSxhQURBLEtBQ0EsQ0FBWSxNQUFaLEVBQW9CLE9BQXBCLEVBQTZCOzhCQUQ3QixPQUM2Qjs7QUFDekIsYUFBSyxNQUFMLEdBQWMsTUFBZCxDQUR5QjtBQUV6QixhQUFLLEtBQUwsR0FBYSxLQUFLLFdBQUwsRUFBYixDQUZ5QjtBQUd6QixhQUFLLFVBQUwsR0FBa0IsS0FBSyxnQkFBTCxDQUFzQixJQUF0QixDQUFsQixDQUh5QjtBQUl6QixhQUFLLFdBQUwsR0FBbUIsS0FBSyxZQUFMLENBQWtCLE9BQWxCLEVBQTJCLEtBQUssS0FBTCxFQUFZLElBQXZDLENBQW5CLENBSnlCO0FBS3pCLGFBQUssVUFBTCxHQUFrQixLQUFLLFlBQUwsQ0FBa0IsTUFBbEIsRUFBMEIsS0FBSyxJQUFMLEVBQVcsSUFBckMsQ0FBbEIsQ0FMeUI7QUFNekIsYUFBSyxNQUFMLENBTnlCO0FBT3pCLGFBQUssS0FBTCxDQVB5QjtBQVF6QixhQUFLLFFBQUwsR0FBZ0IsSUFBaEIsQ0FSeUI7QUFTekIsYUFBSyxPQUFMLEdBQWUsRUFBZixDQVR5QjtBQVV6QixhQUFLLE9BQUwsR0FBZSxXQUFXLEVBQVgsQ0FWVTtBQVd6QixhQUFLLEtBQUwsR0FBYSxRQUFRLEtBQVIsSUFBaUIsSUFBakI7QUFYWSxZQVl6QixDQUFLLFFBQUwsR0FBZ0IsUUFBUSxRQUFSLElBQW9CLEtBQXBCLENBWlM7QUFhekIsYUFBSyxLQUFMLEdBQWEsUUFBUSxLQUFSLElBQWlC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TCxDQUFhLEtBQUssT0FBTCxDQUFhLE1BQWIsR0FBc0IsQ0FBdEIsQ0FBYixDQUFzQyxRQUF0QyxHQUFpRCxLQUFLLE9BQUwsQ0FBYSxLQUFLLE9BQUwsQ0FBYSxNQUFiLEdBQXNCLENBQXRCLENBQWIsQ0FBc0MsSUFBdEMsR0FBNkMsS0FBSyxPQUFMLENBQWEsS0FBSyxPQUFMLENBQWEsTUFBYixHQUFzQixDQUF0QixDQUFiLENBQXNDLEtBQXRDLENBTi9FO2FBQW5COzs7O3dDQVVZO0FBQ1osaUJBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLE9BQU8sTUFBUCxFQUFlLEdBQW5DLEVBQXdDO0FBQ3BDLHVCQUFPLENBQVAsRUFBVSxJQUFWLEdBRG9DO2FBQXhDOzs7O1dBaklKO0dBQUo7O0FBd0lBLGVBQWUsT0FBZixHQUF5QixZQUFXO0FBQ2hDLFdBQU8sSUFBUCxDQUFZLElBQUksS0FBSixDQUFVLGVBQVYsRUFBMkIsRUFBRSxVQUFVLElBQVYsRUFBN0IsQ0FBWixFQURnQztDQUFYIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIGNyZWF0ZSBhbiBhcnJheSB0byBjb250YWluIGFsbCB0aW1lcnNcclxudmFyIHRpbWVycyA9IFtdO1xyXG5cclxuLy8gZ2V0IGVsZW1lbnRzXHJcbnZhciB0aW1lcnNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanMtdGltZXJzLWNvbnRhaW5lcicpO1xyXG52YXIgbmV3VGltZXJCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanMtbmV3LXRpbWVyJyk7XHJcblxyXG52YXIgQ2xvY2sgPSBjbGFzcyB7XHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICB0aGlzLnRpbWVyID0gdGhpcy5jcmVhdGVUaW1lcigpO1xyXG4gICAgICAgIHRoaXMudGl0bGVJbnB1dCA9IHRoaXMuY3JlYXRlVGl0bGVJbnB1dCh0aGlzKTtcclxuICAgICAgICB0aGlzLnN0YXJ0QnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24oJ3N0YXJ0JywgdGhpcy5zdGFydCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5zdG9wQnV0dG9uID0gdGhpcy5jcmVhdGVCdXR0b24oJ3N0b3AnLCB0aGlzLnN0b3AsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMub2Zmc2V0O1xyXG4gICAgICAgIHRoaXMuY2xvY2s7XHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5lbnRyaWVzID0gW107XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuICAgICAgICB0aGlzLmRlbGF5ID0gb3B0aW9ucy5kZWxheSB8fCAxMDAwOyAvLyB0aGUgYW1vdW50IG9mIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRvIHVwZGF0ZSB0aGUgY2xvY2tcclxuICAgICAgICB0aGlzLmlzR2xvYmFsID0gb3B0aW9ucy5pc0dsb2JhbCB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLnRpdGxlID0gb3B0aW9ucy50aXRsZSB8fCAnJztcclxuXHJcbiAgICAgICAgdmFyIGVsZW0gPSB0aGlzLmNyZWF0ZUVsZW1lbnQoKTtcclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIGVsZW1lbnRzXHJcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnRpdGxlSW5wdXQpO1xyXG4gICAgICAgIGVsZW0uYXBwZW5kQ2hpbGQodGhpcy50aW1lcik7XHJcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnN0YXJ0QnV0dG9uKTtcclxuICAgICAgICBlbGVtLmFwcGVuZENoaWxkKHRoaXMuc3RvcEJ1dHRvbik7XHJcbiAgICAgICAgLy8gZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnJlc2V0QnV0dG9uKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgY2xvY2sgY29udGFpbmVyIGVsZW1lbnRcclxuICAgIGNyZWF0ZUVsZW1lbnQoKSB7XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdjbG9jayc7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSB0aW1lciBlbGVtZW50XHJcbiAgICBjcmVhdGVUaW1lcigpIHtcclxuICAgICAgICB2YXIgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICBzcGFuLmNsYXNzTmFtZSA9ICdjbG9ja19fdGltZXInO1xyXG4gICAgICAgIHJldHVybiBzcGFuO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUJ1dHRvbihhY3Rpb24sIGhhbmRsZXIsIHNjb3BlKSB7XHJcbiAgICAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xyXG4gICAgICAgIGJ1dHRvbi5ocmVmID0gJyMnICsgYWN0aW9uO1xyXG4gICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSAnY2xvY2tfXycgKyBhY3Rpb24gKyAnYnV0dG9uJztcclxuICAgICAgICBidXR0b24uaW5uZXJIVE1MID0gYWN0aW9uO1xyXG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IGhhbmRsZXIuY2FsbChzY29wZSkpO1xyXG4gICAgICAgIHJldHVybiBidXR0b247XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlVGl0bGVJbnB1dChzY29wZSkge1xyXG4gICAgICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgaW5wdXQuY2xhc3NOYW1lID0gJ2Nsb2NrX190aXRsZS1pbnB1dCc7XHJcbiAgICAgICAgaW5wdXQucGxhY2Vob2xkZXIgPSAnTmV3IHRpbWVyJztcclxuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGV2ZW50ID0+IHRoaXMudXBkYXRlVGltZXJUaXRsZS5jYWxsKHNjb3BlKSk7XHJcbiAgICAgICAgcmV0dXJuIGlucHV0O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVRpbWVyVGl0bGUoKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnRpdGxlID0gdGhpcy50aXRsZUlucHV0LnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVGltZShudW1iZXIpIHtcclxuICAgICAgICB2YXIgc2VjX251bSA9IHBhcnNlSW50KG51bWJlciwgMTApO1xyXG4gICAgICAgIHZhciBob3VycyAgID0gTWF0aC5mbG9vcihzZWNfbnVtIC8gMzYwMCk7XHJcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKChzZWNfbnVtIC0gKGhvdXJzICogMzYwMCkpIC8gNjApO1xyXG4gICAgICAgIHZhciBzZWNvbmRzID0gc2VjX251bSAtIChob3VycyAqIDM2MDApIC0gKG1pbnV0ZXMgKiA2MCk7XHJcblxyXG4gICAgICAgIGlmIChob3VycyA8IDEwKSB7XHJcbiAgICAgICAgICAgIGhvdXJzICAgPSAnMCcgKyBob3VycztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1pbnV0ZXMgPCAxMCkge1xyXG4gICAgICAgICAgICBtaW51dGVzID0gJzAnICsgbWludXRlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNlY29uZHMgPCAxMCkge1xyXG4gICAgICAgICAgICBzZWNvbmRzID0gJzAnICsgc2Vjb25kcztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRpbWUgPSBob3VycyArICc6JyArIG1pbnV0ZXMgKyAnOicgKyBzZWNvbmRzO1xyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBjbG9jayBjb3VudGVyIHRvIDBcclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMuY2xvY2sgPSAwO1xyXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZGVsdGEoKSB7XHJcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICAgICAgdmFyIGQgICA9IG5vdyAtIHRoaXMub2Zmc2V0O1xyXG5cclxuICAgICAgICB0aGlzLm9mZnNldCA9IG5vdztcclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5jbG9jayArPSB0aGlzLmRlbHRhKCk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgdGhpcy50aW1lci5pbm5lckhUTUwgPSB0aGlzLnBhcnNlVGltZSh0aGlzLmNsb2NrIC8gMTAwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmludGVydmFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcEFsbENsb2NrcygpO1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCAgID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMudXBkYXRlLmJpbmQodGhpcyksIHRoaXMuZGVsYXkpO1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5zdGFydEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZW50cmllcy5wdXNoKHsgc3RhcnQ6IHRoaXMub2Zmc2V0IH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdG9wKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0QnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuc3RvcEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZW50cmllc1t0aGlzLmVudHJpZXMubGVuZ3RoIC0gMV0uc3RvcCA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50cmllc1t0aGlzLmVudHJpZXMubGVuZ3RoIC0gMV0uZHVyYXRpb24gPSB0aGlzLmVudHJpZXNbdGhpcy5lbnRyaWVzLmxlbmd0aCAtIDFdLnN0b3AgLSB0aGlzLmVudHJpZXNbdGhpcy5lbnRyaWVzLmxlbmd0aCAtIDFdLnN0YXJ0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdG9wQWxsQ2xvY2tzKCkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGltZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRpbWVyc1tpXS5zdG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5cclxubmV3VGltZXJCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGltZXJzLnB1c2gobmV3IENsb2NrKHRpbWVyc0NvbnRhaW5lciwgeyBpc0dsb2JhbDogdHJ1ZSB9KSk7XHJcbn07XHJcbiJdfQ==
