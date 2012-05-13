/* Author: Chris Barna (@ctbarna) */
(function () {
  var height = $(window).height(), width = $(window).width();
  // var height = 100, width = 100;
  var paper = new Raphael(0, 0, width, height);

  // Tons of initial conditions.
  var alpha = 0.9,
    beta = 1,
    cr = 4.5,
    ca = 11.5,
    lr = 30,
    la = 75,
    lc = 10,
    dt = 0.05;

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

    this.vx = (Math.random() * 5) - 2.5;
    this.vy = (Math.random() * 5) - 2.5;

    this.ax = Math.random() * 0.001;
    this.ay = Math.random() * 0.001;

    this.element = paper.circle(x, y, 5);

    this.motion = function () {
      this.vx = this.vx + dt * this.ax;
      this.vy = this.vy + dt * this.ay;

      this.x = this.x + this.vx;
      this.y = this.y + this.vy;
      this.element.animate({cx: this.x, cy: this.y}, 1);

      if (this.x > width || this.x < 0) {
        if (this.x > width) {
          this.x = this.x - width;
        } else if (this.x < 0) {
          this.x = this.x + width;
        }
        this.element.animate({"cx": this.x}, 0);
      }

      if (this.y > height || this.y < 0) {
        if (this.y > height) {
          this.y = this.y - height;
        } else if (this.y < 0) {
          this.y = this.y + height;
        }
        this.element.animate({"cy": this.y}, 0);
      }

      this.adjustVelocity();
    };

    this.adjustVelocity = function () {
      var x_sum = 0, y_sum = 0, total = 0;


      for (var i = 0; i < fish.length; i += 1) {
        var d = Math.sqrt(Math.pow(fish[i].x - this.x, 2)
          + Math.pow(fish[i].y - this.y, 2));

        if (d > 0) {
          this.ax = this.ax
            + (cr * Math.exp(Math.E, -d / lr) * (-1 / (2 * lr))
               * (1/d) * (2 * (this.x - fish[i].x)))
            - (ca * Math.exp(Math.E, -d / la) * (-1 / (2 * la))
               * (1/d) * (2 * (this.x - fish[i].x)));

          this.ay = this.ay
            + (cr * Math.exp(Math.E, -d / lr) * (-1 / (2 * lr))
               * (1/d) * (2 * (this.y - fish[i].y)))
            - (ca * Math.exp(Math.E, -d / la) * (-1 / (2 * la))
               * (1/d) * (2 * (this.y - fish[i].y)));
        }
      }

      this.ax = (alpha - beta)
        * this.vx - this.ax;

      this.ay = (alpha - beta)
        * this.vy - this.ay;

    };
  };

  window.fish = [];

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
        console.log(fish[i].ax);
      }
    }

  }

  setInterval(animate, 50);

})();
