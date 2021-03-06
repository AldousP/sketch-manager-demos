'use strict';

var SPoly = {
  /**
   * Conversion constant for degrees-to-radians.
   */
  DEG_RAD: 57.2958,

  /**
   * Polygon class. Pts describing local position.
   * @param pts of the Polygon
   * @constructor
   */
  Polygon: function (pts) {
    this.pts = pts ? pts : [];
  },

  /**
   * Projects the provided polygon object onto the provided axis.
   * @returns {SVec.Vector}
   */
  project: function (poly, pos, axis) {
    var axis_norm = SVec.normVec(SVec.cpyVec(axis));
    var min, max;
    for (var i = 0; i < poly.pts.length; i++) {
      var proj = SVec.dot(SVec.addVecVec(SVec.cpyVec(poly.pts[i]), pos), axis_norm);
      if (!min) {
        min = proj;
        max = proj;
      } else {
        if (proj < min) {
          min = proj;
        } else if (proj > max) {
          max = proj;
        }
      }
    }
    return new SVec.Vector(min, max);
  },

  /**
   * Generate a new Polygon
   * @param vertCount the amount of vertices in the polygon
   * @param radius the radius of the polygon
   * @param startingDegree beginning rotation in radians
   * @param scaleX horizontal scaling
   * @param scaleY vertical scaling
   */
  generatePolygon: function (vertCount, radius, startingDegree, scaleX, scaleY) {
    startingDegree = startingDegree ? startingDegree : 0;
    var circDiv = (2 * Math.PI)  / vertCount;
    var polygon = new SPoly.Polygon();
    for (var i = 0; i < vertCount; i++ ) {
      polygon.pts.push(
          new SVec.Vector (
              (Math.cos(startingDegree + circDiv * i) * radius) * (scaleX ? scaleX : 1),
              (Math.sin(startingDegree + circDiv * i) * radius) * (scaleY ? scaleY : 1)
          )
      )
    }
    return polygon;
  },

  /**
   * Convenience method for generating a square for a given width.
   * @param width of the square
   * @returns a Polygon with four vertices at the designated width.
   */
  polySquare: function (width) {
    return this.generatePolygon(4, width / 2, 45 / this.DEG_RAD, 1, 1)
  },

  polyRect: function (width, height) {
    return this.generatePolygon(4, width / 2, 45 / this.DEG_RAD, 1, height / width);
  },

  /**
   * Scale the contents of a polygon by a scalar vector
   * @param poly the polygon to scale
   * @param scalar the scaling value
   */
  scalePoly: function (poly, scalar) {
    poly.pts.forEach(function (pt) {
      SVec.multVec(pt, scalar);
    });
    return poly;
  },

  /**
   * Scale the contents of a polygon by an x and y
   * @param poly the polygon to scale
   */
  scalePolyConst: function (poly, x, y) {
    poly.pts.forEach(function (pt) {
      SVec.multVecConst(pt, x, y);
    });

    return poly;
  },

  /**
   * Convenience method for generating a circle with the given radius.
   * @param radius of the circle
   * @returns a Polygon with thirty-two vertices and the designated radius.
   */
  polyCircle: function (radius, vertCount) {
    return this.generatePolygon(vertCount || 32, radius, 45 / this.DEG_RAD, 1.25, 1.2)
  }
};