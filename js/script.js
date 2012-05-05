/* Author: Chris Barna (@ctbarna) */
(function () {
  var canvas = document.getElementById("fishtank");

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
        this.x += this.dx;
        this.y += this.dy;

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
        console.log(this.x + ", " + this.y);
      };
    };

    // Animate code!
    var animate = function () {
      context.clearRect(0, 0, width, height);

      for (var i = 0; i < fishes.length; i += 1) {
        fishes[i].move();
        fishes[i].draw();
      }

    };

    setInterval(animate, 10);

    for (var i = 0; i < 100; i += 1) {
      fishes.push(new Fish(Math.random() * width, Math.random() * height));
    }
  }

})();
