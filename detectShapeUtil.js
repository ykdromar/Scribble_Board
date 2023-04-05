// point array should be like this
// var points = [
//     { x: 100, y: 100 },
//     { x: 150, y: 50 },
//     { x: 200, y: 100 },
//     { x: 200, y: 200 },
//     { x: 150, y: 250 },
//     { x: 100, y: 200 },
//     { x: 100, y: 100 }
// ];

function getTanFromDegrees(degrees) {
    return Math.tan(degrees * Math.PI / 180);
}

function detectCircle(points) {

    // center point (average of first and last points)
    var centerX = (points[0].x + points[(points.length - 1) / 2].x) / 2;
    var centerY = (points[0].y + points[(points.length - 1) / 2].y) / 2;
    var center = { x: centerX, y: centerY };

    // radius (average distance to center)
    // var sumDistances = 0;
    var Distance = [];

    for (var i = 0; i < points.length; i++) {
        Distance[i] = Math.sqrt(
            Math.pow(points[i].x - center.x, 2) + Math.pow(points[i].y - center.y, 2)
        );
    }

    for(var i=0; i<points.length; i++) {
        for(var j=0; j<points.length; j++) {
           if( Distance[i] - Distance[j]) 
        }
    }
    // for (var i = 0; i < points.length; i++) {
    //     var distance = Math.sqrt(
    //         Math.pow(points[i].x - center.x, 2) + Math.pow(points[i].y - center.y, 2)
    //     );
    //     sumDistances += distance;
    // }
    var radius = sumDistances / points.length;

    // Check if the points form a circle by looking at the signs of the derivatives
    var derivatives = [];
    var quad = (points.length - 1) / 4;
    var difAngle = 90 / quad;
    if (difAngle < 5) {
        difAngle = 5
    }
    for (var i = 1; i < points.length; i++) {
        var dx = points[i].x - points[i - 1].x;
        var dy = points[i].y - points[i - 1].y;
        var dr = Math.sqrt(dx * dx + dy * dy);
        var derivative = dy / dx
        //   var dtheta = Math.atan2(dy, dx);
        //   var theta = (dtheta + 2 * Math.PI) % (2 * Math.PI);
        //   var sign = Math.sign(dr - radius);
        if (i != 0) {
            if (derivative >= (derivatives[i - 1] + getTanFromDegrees(difAngle)) || derivative <= (derivatives[i - 1] - getTanFromDegrees(difAngle))) {
                return null;
            }
        }
        derivatives.push(derivative);
    }

    return { type: 'circle', center: center, radius: radius };
}

function detectPolygon(points) {
    let count = 0;
    var derivatives = [];
    var edgesIndex = [];
    for (var i = 1; i < points.length; i++) {
        var dx = points[i].x - points[i - 1].x;
        var dy = points[i].y - points[i - 1].y;
        // var dr = Math.sqrt(dx * dx + dy * dy);
        var derivative = dy / dx
        if (i > 2) {
            if (derivative > derivatives[i - 2] + getTanFromDegrees(45) || derivative < derivatives[i - 2] - getTanFromDegrees(45)) {
                count++;
                edgesIndex.push(i)
            }
        }
        derivatives.push(derivative)
    }
    edgesIndex.push(0);

    if (count >= 4) {
        var centerX = 0;
        var centerY = 0;
        for (var i = 0; i < points.length; i++) {
            centerX += points[i].x;
            centerY += points[i].y;
        }
        centerX /= points.length;
        centerY /= points.length;
        var squareC = { x: centerX, y: centerY };
        var sumDistances = 0;
        for (var i = 0; i < edgesIndex.length - 1; i++) {
            var distance = Math.sqrt(
                Math.pow(points[edgesIndex[i]].x - points[edgesIndex[i + 1]].x, 2) + Math.pow(points[edgesIndex[i]].y - points[edgesIndex[i + 1]].y, 2)
            );
            sumDistances += distance;
        }
        var squareLength = sumDistances / (edgesIndex.length)
        return { type: 'square', center: squareC, length: squareLength }
    }
    else if (count >= 3) {
        var centerX = 0;
        var centerY = 0;
        for (var i = 0; i < points.length; i++) {
            centerX += points[i].x;
            centerY += points[i].y;
        }
        centerX /= points.length;
        centerY /= points.length;
        var squareC = { x: centerX, y: centerY };
        var sumDistances = 0;
        for (var i = 0; i < edgesIndex.length - 1; i++) {
            var distance = Math.sqrt(
                Math.pow(points[edgesIndex[i]].x - points[edgesIndex[i + 1]].x, 2) + Math.pow(points[edgesIndex[i]].y - points[edgesIndex[i + 1]].y, 2)
            );
            sumDistances += distance;
        }
        var squareLength = sumDistances / (edgesIndex.length)
        return { type: 'triangle', center: squareC, length: squareLength }
    }
    else {
        return null;
    }

}

export function detectShape(points) {
    var result = null;
    if (detectCircle(points) != null) {
        result = detectCircle(points);
    }
    else if (detectPolygon(points) != null) {
        result = detectPolygon(points);
    }

    return result;
}