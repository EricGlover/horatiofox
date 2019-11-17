import {Component} from "../Components";
import {Device, subspaceRadioType} from "../Devices/Devices";
import {Quadrant} from "./Quadrant";
import {AbstractKlingon} from "../Enemies/Enemies";
import StarBase from "../Objects/StarBase";
import Star from "../Objects/Star";

class ChartInfo {
    constructor() {
        this.hasSupernova = false;
        this.klingons = 0;
        this.bases = 0;
        this.stars = 0;
        this.hasTelemetrySensors = false;
        this.scanned = false;
    }

    print(showZeroes = false) {
        if(!this.scanned) {
            return `..${this.bases}.`;
        } else {
            if(showZeroes) {
                return`${this.hasSupernova ? '1' : '0'}${this.klingons}${this.bases}${this.stars}`;
            } else {
                let num = 0;
                if(this.hasSupernova) num += 1000;
                num += this.klingons * 100;
                num += this.bases * 10;
                num += this.stars;
                return '' + num;
            }
        }
    }
}

export class StarChart extends Component {
    constructor(parent, galaxy, subspaceRadio) {
        super(StarChart, parent);
        this.galaxy = galaxy;
        if (!Device.isType(subspaceRadio, subspaceRadioType)) {
            throw new Error("Star chart needs a subspace radio.");
        }
        this.subspaceRadio = subspaceRadio;
        this.info = []; // 2-d array [quadY] [quadX] => ChartInfo
        // since we're calling updateTelemetry a lot this helps the caching
        this.hasSensors = [];   // [setY0, setY1, ...]
        for (let i = 0; i < this.galaxy.length; i++) {
            let quadrantRow = [];
            for (let j = 0; j < this.galaxy.width; j++) {
                quadrantRow[j] = new ChartInfo();
            }
            this.info.push(quadrantRow);
            this.hasSensors.push(new Set());
        }
    }

    getInfo(quadrant) {
        if (!(quadrant instanceof Quadrant)) {
            throw new Error(`${quadrant} is not a quadrant.`);
        }
        if (!this.info[quadrant._y] || !this.info[quadrant._y][quadrant._x]) {
            throw new Error(`Error finding info.`);
        }
        return this.info[quadrant._y][quadrant._x];
    }

    // updates a chartInfo to show current quadrant data
    _updateInfo(quadrant, info) {
        info.hasSupernova = quadrant.hasSupernova;
        info.klingons = quadrant.container.getCountOfGameObjects(AbstractKlingon);
        info.bases = quadrant.container.getCountOfGameObjects(StarBase);
        info.stars = quadrant.container.getCountOfGameObjects(Star);
        info.scanned = true;
    }

    showStarBases() {
        this.galaxy.getAllQuadrants().forEach(quadrant => {
            let bases = quadrant.container.getCountOfGameObjects(StarBase);
            if (bases > 0) {
                let info = this.getInfo(quadrant);
                info.bases = bases;
            }
        })
    }

    // updates all the telemetry for quadrants we have sensors in
    updateTelemetry() {
        // check that subspace radio works
        if (this.subspaceRadio.isDamaged()) {
            return;
        }
        // go through our sensors
        this.hasSensors.forEach((s, qy) => {
            s.forEach(qx => {
                // get corresponding info
                let info = this.info[qy][qx];
                // get sector from galaxy
                let sector = this.galaxy._getQuadrant(qx, qy);
                this._updateInfo(sector, info);
            });
        });
    }

    hasTelemetrySensors(quadrant) {
        return this.hasSensors[quadrant._y].has(quadrant._x);
    }

    _deployTelemetrySensors(quadrant, info) {
        info.hasTelemetrySensors = true;
        this.hasSensors[quadrant._y].add(quadrant._x);
    }

    shortRangeScan(quadrant) {
        if (!(quadrant instanceof Quadrant)) {
            throw new Error(`${quadrant} is not a quadrant.`);
        }
        // if we have telemetry sensors skip? ponder this

        // get corresponding info
        let info = this.getInfo(quadrant);
        // update our info
        this._updateInfo(quadrant, info);
        // deploy telemetry sensors
        this._deployTelemetrySensors(quadrant, info);
    }

    longRangeScan(quadrants) {
        quadrants.forEach(quadrant => {
            if (!(quadrant instanceof Quadrant)) {
                throw new Error(`${quadrant} is not a quadrant.`);
            }
            // get corresponding info
            let info = this.getInfo(quadrant);
            // update our info
            this._updateInfo(quadrant, info);
        })
    }

    static get propName() {
        return "starChart";
    }
}