/* Author: Chris Barna (@ctbarna) */
(function () {
  var canvas = document.getElementById("fishtank");

  // Helper method to generate a normally distributed random number.
  var randn = function (mean, variance) {
    if (typeof(mean) === "undefined") {
      mean = 0;
    }
    if (typeof(variance) === "undefined") {
      variance = 1;
    }

    var v1, v2, s;

    do {
      var u1 = Math.random();
      var u2 = Math.random();

      v1 = 2 * u1 - 1;
      v2 = 2 * u2 - 1;

      s = Math.pow(v1, 2) + Math.pow(v2, 2);
    } while (s > 1);

    var x = Math.sqrt(-2 * Math.log(s) / s) * v1;
    x = mean + Math.sqrt(variance) * x;
    return x;
  };

  // Change the size of the canvas.
  $("#fishtank").attr("height", $(window).height());
  $("#fishtank").attr("width", $(window).width());

  var height = $("#fishtank").height(),
    width = $("#fishtank").width();
  var fishes = [];

  // Check if they have canvas.
  if (canvas.getContext) {
    var context = canvas.getContext('2d');

    // Fish!
    var Fish = function (x, y) {
      this.x = x;
      this.y = y;

      this.dx = (Math.random() - 0.5) * 5;
      this.dy = (Math.random() - 0.5) * 5;

      this.draw = function () {
        context.beginPath();
        context.fillStyle = "#000";
        context.arc(this.x, this.y, 5, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
      };

      this.move = function () {
        this.x += this.dx + randn(0, 0.35);
        this.y += this.dy + randn(0, 0.35);

        if (this.x > width) {
          this.x -= width;
        } else if (this.x < 0) {
          this.x += width;
        }

        if (this.y > height) {
          this.y -= height;
        } else if (this.y < 0) {
          this.y += height;
        }
      };

      this.changeVelocity = function (e) {
        // var closeFish = [];
        var x_sum = 0, y_sum = 0, total = 0;

        for (var i = 0; i < fishes.length; i += 1) {
          var d = Math.sqrt(Math.pow(fishes[i].x - this.x, 2)
            + Math.pow(fishes[i].y - this.y, 2));

          if (d < e && d > 0) {
            x_sum += fishes[i].dx;
            y_sum += fishes[i].dy;
            total += 1;
          }
        }

        if (total > 0) {
          this.dx = x_sum / total;
          this.dy = y_sum / total;
        }

      };
    };

    // Animate code!
    var animate = function () {
      context.clearRect(0, 0, width, height);

      for (var i = 0; i < fishes.length; i += 1) {
        fishes[i].move();
        fishes[i].draw();
        fishes[i].changeVelocity(10);
      }

    };

    setInterval(animate, 10);

    for (var i = 0; i < 250; i += 1) {
      fishes.push(new Fish(Math.random() * width, Math.random() * height));
    }
  }

})();
