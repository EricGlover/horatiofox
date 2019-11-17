import {Collider} from "../Components/Collider";
import {GameObject} from "../Components/GameObject";

/**
 Class A Geothermal (Gothos)
 Class B Geomorteus (Mercury)
 Class C Geoinactive (Psi 2000)
 Class D Asteroid/Moon (Luna)
 Class E Geoplastic (Excalbia)
 Class F Geometallic (Janus VI)
 Class G Geocrystaline (Delta Vega)
 Class H Desert (Rigel XII)
 Class I Gas Supergiant (Q'tahL)
 Class J Gas Giant (Jupiter)
 Class K Adaptable (Mars)
 Class L Marginal (Indri VIII)
 Class M Terrestrial (Earth) -- terrestial world - habitable
 https://stexpanded.fandom.com/wiki/Class_M_planet
 Class N Reducing (Venus) -- barren world - not habitable
 https://stexpanded.fandom.com/wiki/Class_N_planet
 Class O Pelagic (Argo) -- aquatic world - habitable
 https://stexpanded.fandom.com/wiki/Class_O_planet
 Class P Glaciated (Breen)
 Class Q Variable (Genesis Planet)
 Class R Rogue (Dakala)
 Class S and T Ultragiants
 Class X, Y and Z Demon (Tholian homeworld (Class Y))
 */

class PlanetType {
    constructor(name, habitable) {
        this.name = name;
        this.habitable = habitable;
    }
}

const MType = new PlanetType('m', true);
const NType = new PlanetType('n', false);
const OType = new PlanetType('o', true);

export default class Planet {
    constructor(type, hasCrystals, known = false) {
        if(!(type instanceof PlanetType)) throw new Error("planet type must be provided.");
        this.gameObject = new GameObject(this, true);
        this.collider = new Collider(this, this.gameObject, 25, 25, 1000);
        this.type = type; // M N or O
        this.hasCrystals = hasCrystals;
        this.known = known;
        this.name = "planet";
    }

    // randomly set the values for our planet
    static randomlyGenerate() {
        // set the class
        let type;
        let r = Math.random();
        if (r > 2 / 3) {
            type = MType;
        } else if (r > 1 / 3) {
            type = NType;
        } else {
            type = OType;
        }
        // determine if it has crystals
        return new Planet(type, Math.random() > 2 / 3);
    }
}
