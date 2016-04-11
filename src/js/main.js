require('flexibility');
require('classlist-polyfill');

// create an array to contain all timers
var timers = [];

// get elements
var timersContainer = document.getElementById('js-timers-container');
var newTimerButton = document.getElementById('js-new-timer');

var Clock = class {
    constructor(parent, props) {

        // Props
        this.props = props || {};
        this.isActive = props.isActive || false; // whether or not to start the clock already running
        this.delay = props.delay || 1000; // the amount of time in milliseconds after which to update the clock
        this.isGlobal = props.isGlobal || false;
        this.title = props.title || '';

        // Elements
        this.parent = parent;
        this.wrapper = this.createWrapper();
        this.timer = this.createTimer();
        this.titleInput = this.createTitleInput(this);
        this.startStopButton = this.createStartStopButton('Start', this.stopStart, this);
        this.updateStartStopButton();

        this.offset;
        this.clock;
        this.interval = null;
        this.entries = [];


        var elem = this.createElement();

        // Append elements
        elem.appendChild(this.titleInput);
        elem.appendChild(this.timer);
        elem.appendChild(this.startStopButton);

        this.titleInput.focus();

        this.reset();
    }

    // Create the clock wrapper div
    createWrapper() {
        var element = document.createElement('div');
        element.className = 'l-flex-item';
        this.parent.appendChild(element);
        return element;
    }

    // Create the clock container element
    createElement() {
        var element = document.createElement('div');
        element.className = 'clock';
        this.wrapper.appendChild(element);
        return element;
    }

    // Create the timer element
    createTimer() {
        var span = document.createElement('span');
        span.className = 'clock__timer';
        return span;
    }

    createStartStopButton(action, handler, timer) {
        var button = document.createElement('button');
        button.classList.add('clock__button', 'button');
        button.addEventListener('click', event => handler.call(timer));
        return button;
    }

    updateStartStopButton() {
        if (this.isActive === true) {
            this.startStopButton.innerHTML = 'Stop';
            this.startStopButton.classList.toggle('is-active');
        } else {
            this.startStopButton.innerHTML = 'Start';
            this.startStopButton.classList.remove('is-active');
        }
    }

    stopStart() {
        this.isActive ? this.stop() : this.start();
    }

    createTitleInput(scope) {
        var input = document.createElement('input');
        input.className = 'clock__title-input';
        input.placeholder = 'New timer';
        input.type = 'text';
        input.addEventListener('keyup', event => this.updateTimerTitle.call(scope));
        return input;
    }

    updateTimerTitle() {
        this.props.title = this.titleInput.value;
    }

    parseTime(number) {
        var sec_num = parseInt(number, 10);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours   = '0' + hours;
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
    reset() {
        this.clock = 0;
        this.render();
    }

    delta() {
        var now = Date.now();
        var d   = now - this.offset;

        this.offset = now;
        return d;
    }

    update() {
        this.clock += this.delta();
        this.render();
    }

    render() {
        this.timer.innerHTML = this.parseTime(this.clock / 1000);
    }

    start() {
        if (!this.interval) {
            this.isActive = true;
            this.stopAllClocks();
            this.offset = Date.now();
            this.interval = setInterval(this.update.bind(this), this.delay);
            this.entries.push({ start: this.offset });
            this.updateStartStopButton();
        }
    }

    stop() {
        if (this.interval) {
            this.isActive = false;
            clearInterval(this.interval);
            this.interval = null;
            this.entries[this.entries.length - 1].stop = Date.now();
            this.entries[this.entries.length - 1].duration = this.entries[this.entries.length - 1].stop - this.entries[this.entries.length - 1].start;
            this.updateStartStopButton();
        }
    }

    stopAllClocks() {
        for (var i = 0; i < timers.length; i++) {
            timers[i].stop();
        }
    }

}

window.addEventListener('load', function load(event) {

    window.removeEventListener("load", load, false); //remove listener, no longer needed

    // TODO: Local storage stuff
    if ('localStorage' in window && window['localStorage'] !== null) {
        timers = JSON.parse(localStorage['timers'] || null);

        if (timers === null) {
            timers = [];
        }
    }

    if (timers.length == 0) {
        timers.push(new Clock(timersContainer, { isGlobal: true }));
    };

    newTimerButton.onclick = function() {
        timers.push(new Clock(timersContainer, { isGlobal: true }));
    };
});

