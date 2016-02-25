// create an array to contain all timers
var timers = [];

// get elements
var timersContainer = document.getElementById('js-timers-container');
var newTimerButton = document.getElementById('js-new-timer');

var Clock = class {
    constructor(parent, options) {
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
    createElement() {
        var element = document.createElement('div');
        element.className = 'clock';
        this.parent.appendChild(element);
        return element;
    }

    // Create the timer element
    createTimer() {
        var span = document.createElement('span');
        span.className = 'clock__timer';
        return span;
    }

    createButton(action, handler, scope) {
        var button = document.createElement('button');
        button.href = '#' + action;
        button.className = 'clock__button--' + action + ' button';
        button.innerHTML = action;
        button.addEventListener('click', event => handler.call(scope));
        return button;
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
        this.options.title = this.titleInput.value;
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
            this.stopAllClocks();
            this.offset   = Date.now();
            this.interval = setInterval(this.update.bind(this), this.delay);
            this.stopButton.disabled = false;
            this.startButton.disabled = true;
            this.entries.push({ start: this.offset });
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.startButton.disabled = false;
            this.stopButton.disabled = true;
            this.entries[this.entries.length - 1].stop = Date.now();
            this.entries[this.entries.length - 1].duration = this.entries[this.entries.length - 1].stop - this.entries[this.entries.length - 1].start;
        }
    }

    stopAllClocks() {
        for (var i = 0; i < timers.length; i++) {
            timers[i].stop();
        }
    }

}

newTimerButton.onclick = function() {
    timers.push(new Clock(timersContainer, { isGlobal: true }));
};
