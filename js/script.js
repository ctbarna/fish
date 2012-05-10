/* Author: Chris Barna (@ctbarna) */
(function () {
  var height = $(window).height(), width = $(window).width();
  var paper = new Raphael(0, 0, width, height);

  // Handle the page resize.
  $(window).resize(function () {
    height = $(window).height();
    width = $(window).width();

    $(paper.canvas).height(height);
    $(paper.width).width(width);
  });

  // Fish element.
  var Fish = function (x, y) {
    this.x = x;
    this.y = y;

    this.dx = Math.random() * 5;
    this.dy = Math.random() * 5;

    this.element = paper.circle(x, y, 5);

    this.motion = function () {
      this.x = this.x + this.dx;
      this.y = this.y + this.dy;
      this.element.animate({cx: this.x, cy: this.y}, 1);

      if (this.x > width || this.x < 0) {
        if (this.x > width) {
          this.x = 0;
        } else if (this.x < 0) {
          this.x = width;
        }
        this.element.animate({"cx": this.x}, 0);
      }

      if (this.y > height || this.y < 0) {
        if (this.y > height) {
          this.y = 0;
        } else if (this.y < 0) {
          this.y = height;
        }
        this.element.animate({"cy": this.y}, 0);
      }

      this.adjustVelocity(15);
    };

    this.adjustVelocity = function (e) {
      var x_sum = 0, y_sum = 0, total = 0;

      for (var i = 0; i < fish.length; i += 1) {
        var d = Math.sqrt(Math.pow(fish[i].x - this.x, 2)
          + Math.pow(fish[i].y - this.y, 2));

        if (d < e && d > 0) {
          x_sum += fish[i].dx;
          y_sum += fish[i].dy;
          total += 1;
        }
      }

      if (total > 0) {
        this.dx = x_sum / total;
        this.dy = y_sum / total;
      }

    };
  };

  var fish = [];

  for (var i = 0; i < 50; i += 1) {
    var randx = Math.random() * width;
    var randy = Math.random() * height;
    fish.push(new Fish(randx, randy));
  }

  // Animation function.
  var animate = function () {
    for (var i = 0; i < fish.length; i += 1) {
      fish[i].motion();
      if (i === 1) {
        console.log(fish[i].x);
      }
    }

  }

  setInterval(animate, 25);

})();
