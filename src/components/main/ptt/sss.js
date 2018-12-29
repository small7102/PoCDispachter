$("#ptt").on({
  touchstart: function (e) {
    timeOutEvent = setTimeout(function () {
      if (!isPtting()) {
        pttStart();

        $("#title").css('color', 'rgb(40, 240, 100)');
        $("#title").text("呼叫中...");
        $("#ptt").css('background-color', 'rgb(40, 240, 100)');
      } else {
        console.log('ptting...');
      }
    }, 10);
  },
  touchmove: function () {
    clearTimeout(timeOutEvent);
    timeOutEvent = 0;
    e.preventDefault();
  },
  touchend: function (e) {
    clearTimeout(timeOutEvent);
    if (timeOutEvent != 0) {
      pttStop();
    }
    return false;
  }
});
