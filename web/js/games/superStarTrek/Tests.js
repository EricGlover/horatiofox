export default class Tests {
    calcAngle(from, to) {
        let deltaX = to[0] - from[0];
        let deltaY = -1 * (to[1] - from[1]);
        return Math.atan2(deltaY, deltaX);
    }

    convertToDegrees(rad) {
        return rad * 180 / Math.PI;
    }

    testAngle() {
        let me = [0, 0];
        let topLeft = [-1, -1];
        let top = [0, -1];
        let topRight = [1, -1];
        let right = [1, 0];
        let bottomRight = [1, 1];
        let bottom = [0, 1];
        let bottomLeft = [-1, 1];
        let left = [-1, 0];

        let points = [topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left];
        points.forEach(point => {
            let angle = this.calcAngle(me, point);
            console.log(angle);
            console.log(this.convertToDegrees(angle));
            debugger;
        })
    }
}