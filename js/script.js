/* Author: Chris Barna (@ctbarna) */
(function () {
  var height = $(window).height(), width = $(window).width();
  var paper = new Raphael(0, 0, width, height);
  var n = 150;

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

  // Tons of initial conditions.
  var prey_props = {
    alpha: 0.5,
    beta: 1,
    cr: 25,
    ca: 15,
    lr: 30,
    la: 60,
    lc: 8,
    dt: 0.5,
    velocity: 1,
    play: true
  };

  // Initialize dat.gui.
  var gui = new dat.GUI();
  gui.remember(prey_props);
  gui.add(prey_props, "play");
  gui.add(prey_props, "alpha", 0, 10);
  gui.add(prey_props, "beta", 0, 10);
  gui.add(prey_props, "cr", 0, 25);
  gui.add(prey_props, "ca", 0, 25);
  gui.add(prey_props, "lr", 0, 100);
  gui.add(prey_props, "la", 0, 100);
  gui.add(prey_props, "lc", 0, 25);
  gui.add(prey_props, "dt", 0, 1);

  // Handle the page resize.
  $(window).resize(function () {
    height = $(window).height();
    width = $(window).width();

    $(paper.canvas).height(height);
    $(paper.width).width(width);
  });

  // Fish element.
  var Fish = function (x, y, props) {
    this.x = x;
    this.y = y;

    this.vx = randn();
    this.vy = randn();

    this.ax = randn() * 0.001;
    this.ay = randn() * 0.001;

    this.element = paper.circle(x, y, 5);

    this.remove = function () {
      var index = fish.indexOf(this);
      fish.splice(index, 1);
      this.element.remove();
    };

    this.motion = function () {
      this.vx = this.vx + props.dt * this.ax;
      this.vy = this.vy + props.dt * this.ay;

      // Let's set the velocities to a constant magnitude.
      var v_len = Math.sqrt(Math.pow(this.vx, 2) +
                            Math.pow(this.vy, 2));
      if (v_len < props.velocity) {
        this.vx = this.vx / v_len * props.velocity;
        this.vy = this.vy / v_len * props.velocity;
      }

      // Move the fish!
      this.x = this.x + this.vx;
      this.y = this.y + this.vy;
      this.element.animate({cx: this.x, cy: this.y}, 5);

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
      // Reset everything.
      var fx = 0, fy = 0;
      this.ax = 0;
      this.ay = 0;

      for (var i = 0; i < fish.length; i += 1) {
        var d = Math.sqrt(Math.pow(this.x - fish[i].x, 2)
          + Math.pow(this.y - fish[i].y, 2));

        if (fish[i] !== this) {
          this.ax = this.ax
            + (props.cr * Math.exp(-d / props.lr)
               * (-1 / (2 * props.lr))
               * (1/d) * (2 * (this.x - fish[i].x)))
            - (props.ca * Math.exp(-d / props.la)
               * (-1 / (2 * props.la))
               * (1/d) * (2 * (this.x - fish[i].x)));
          fx = fx + fish[i].vx * Math.exp(-d / props.lc);

          this.ay = this.ay
            + (props.cr * Math.exp(-d / props.lr)
               * (-1 / (2 * props.lr))
               * (1/d) * (2 * (this.y - fish[i].y)))
            - (props.ca * Math.exp(-d / props.la)
               * (-1 / (2 * props.la))
               * (1/d) * (2 * (this.y - fish[i].y)));
          fy = fy + fish[i].vy * Math.exp(-d / props.lc);
        }
      }

      // Avoid the edges.
      this.ax = this.ax
        + (props.cr * Math.exp(-this.x / props.lr)
          * (-1 / (2 * props.lr))
          * (1 / this.x) * (2 * this.x))
        - (props.cr * Math.exp(-(width - this.x) / props.lr)
          * (-1 / (2 * props.lr))
          * (1 / (width - this.x)) * (2 * (width - this.x)));

      this.ay = this.ay
        + (props.cr * Math.exp(-this.y / props.lr)
          * (-1 / (2 * props.lr))
          * (1/this.y) * (2 * this.y))
        - (props.cr * Math.exp(-(height - this.y) / props.lr)
          * (-1 / (2 * props.lr))
          * (1 / (height - this.y)) * (2 * (height - this.y)));


      this.ax = props.alpha * fx - props.beta
        * this.vx - this.ax;

      this.ay = props.alpha * fy - props.beta
        * this.vy - this.ay;

    };

    this.birthRate = function (probability) {
      var u = Math.random();

      if (u < probability) {
        fish.push(new Fish(this.x, this.y, props));
        console.log("Birth!");
      }
    }

    this.deathRate = function (probability) {
      var u = Math.random();

      if (u < probability) {
        this.remove();
        console.log("Death!");
      }
    }
  };

  window.fish = [];

  for (var i = 0; i < n; i += 1) {
    var randx = Math.random() * width;
    var randy = Math.random() * height;
    fish.push(new Fish(randx, randy, prey_props));
  }

  // Animation function.
  var animate = function () {
    if (prey_props.play === true) {

      for (var i = 0; i < fish.length; i += 1) {
        fish[i].motion();
        fish[i].birthRate(0.0001);
        fish[i].deathRate(0.0001);
      }

    }
  }

  var animationInterval = setInterval(animate, 10);

})();
