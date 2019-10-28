/**
 * Handles screen size changes
 */
export default class Screen {
    constructor() {
        this.isTinyScreen = false;
        this.isSmallScreen = false;
        this.isMediumScreen = true;
        this.isLargeScreen = false;
        this.receivedNotificationCount = 0;

        if(!matchMedia) {
            console.error("match media not supported....abandon ship");
            return;
        }
        // media querying bullshit
        this._isTinyScreenQuery = matchMedia("(max-width: 767px)");
        this._isSmallScreenQuery =  matchMedia("(min-width: 768px) and (max-width: 991px)");
        this._isMediumScreenQuery =  matchMedia("(min-width: 992px) and (max-width: 1299px)");
        this._isLargeScreenQuery =  matchMedia("(min-width: 1300px)");

        this.handleSizeChange = this.handleSizeChange.bind(this);

        if (this._isTinyScreenQuery.addEventListener) {
            this._isTinyScreenQuery.addEventListener("change", this.handleSizeChange);
            this._isSmallScreenQuery.addEventListener("change", this.handleSizeChange);
            this._isMediumScreenQuery.addEventListener("change", this.handleSizeChange);
            this._isLargeScreenQuery.addEventListener("change", this.handleSizeChange);
        }else if (this._isTinyScreenQuery.addListener) {
            console.error("mediaQuery.addEventListener not supported, using addListener");
            this._isTinyScreenQuery.addListener(this.handleSizeChange);
            this._isSmallScreenQuery.addListener(this.handleSizeChange);
            this._isMediumScreenQuery.addListener(this.handleSizeChange);
            this._isLargeScreenQuery.addListener(this.handleSizeChange);
        } else {
            setInterval(this.pollForSizeChange.bind(this), 1000);
            console.error("matchMedia.addListener not supported, resorting to polling every second");
        }
        this.determineScreenSize();
        this.onSizeChangeCallbacks = [];
    }
    pollForSizeChange() {
        let oldT = this.isTinyScreen;
        let oldS = this.isSmallScreen;
        let oldM = this.isMediumScreen;
        let oldL = this.isLargeScreen;
        this.determineScreenSize();
        if(
            oldT !== this.isTinyScreen ||
            oldS !== this.isSmallScreen ||
            oldM !== this.isMediumScreen ||
            oldL !== this.isLargeScreen
        ) {
            this.onSizeChangeCallbacks.forEach( fn => fn(this));
        }
    }
    handleSizeChange() {
        this.receivedNotificationCount++;
        // you get two notifications for the change, we want to emit only one so...
        if(this.receivedNotificationCount === 2) {
            this.receivedNotificationCount = 0;
            this.determineScreenSize();
            this.onSizeChangeCallbacks.forEach( fn => fn(this));
        }
    }
    determineScreenSize() {
        this.isTinyScreen = this._isTinyScreenQuery.matches;
        this.isSmallScreen = this._isSmallScreenQuery.matches;
        this.isMediumScreen = this._isMediumScreenQuery.matches;
        this.isLargeScreen = this._isLargeScreenQuery.matches;
    }
    addSizeChangeCallback(fn) {
        this.onSizeChangeCallbacks.push(fn);
    }
}