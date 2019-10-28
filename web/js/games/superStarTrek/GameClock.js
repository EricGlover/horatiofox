import mitt from "mitt";

class GameClock {
    constructor() {
        this.emitter = new mitt();
        this._initialStarDate = null;
        this._starDate = null;
    }

    init(date) {
        this._initialStarDate = date;
        this._starDate = date;
    }

    get starDate() {
        return this._starDate;
    }

    getElapsedTime() {
        return this._starDate - this._initialStarDate;
    }

    elapseTime(days) {
        this._starDate += days;
        this.emitter.emit("timeElapse", days);
    }
    unregister(fn) {
        this.emitter.off('timeElapse', fn);
    }

    register(fn) {
        this.emitter.on("timeElapse", fn);
    }
}
const clock = new GameClock();
export default clock;