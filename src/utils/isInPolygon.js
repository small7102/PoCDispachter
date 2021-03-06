
function isInPolygon(checkPoint, polygonPoints) {
  var counter = 0;
  var i;
  var xinters;
  var p1, p2;
  var pointCount = polygonPoints.length;
  p1 = polygonPoints[0];

  for (i = 1; i <= pointCount; i++) {
      p2 = polygonPoints[i % pointCount];
      if (
          checkPoint[0] > Math.min(p1[0], p2[0]) &&
          checkPoint[0] <= Math.max(p1[0], p2[0])
      ) {
          if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
              if (p1[0] != p2[0]) {
                  xinters =
                      (checkPoint[0] - p1[0]) *
                          (p2[1] - p1[1]) /
                          (p2[0] - p1[0]) +
                      p1[1];
                  if (p1[1] == p2[1] || checkPoint[1] <= xinters) {
                      counter++;
                  }
              }
          }
      }
      p1 = p2;
  }
  if (counter % 2 == 0) {
      return false;
  } else {
      return true;
  }
}
