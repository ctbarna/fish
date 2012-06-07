/* Author: Chris Barna (@ctbarna) */
(function () {
  var height = $(window).height(), width = $(window).width();
  var paper = new Raphael(0, 0, width, height);
  var n = 75;
  var n_pred = 15;

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
    cr: 30,
    ca: 25,
    lr: 25,
    la: 40,
    lc: 8,
    dt: 0.5,
    velocity: 1,
    birth_rate: 0.002,
    death_rate: 0.001,
    play: true
  };

  var pred_props = {
    alpha: 0.5,
    beta: 1,
    cr: 70,
    ca: 100,
    lr: 15,
    la: 100,
    lc: 10,
    dt: 0.5,
    velocity: 2,
    school: true,
    starvation: true,
    min_pop: 3,
    birth_rate: 0.002,
    starve_rate: 150,
    color: "#000",
    play: true
  };

  // Initialize dat.gui.
  var gui = new dat.GUI();
  // gui.remember(prey_props);
  // gui.remember(pred_props);

  var prey_folder = gui.addFolder("Prey");
  prey_folder.add(prey_props, "play");
  prey_folder.add(prey_props, "dt", 0, 1);
  prey_folder.add(prey_props, "birth_rate");
  prey_folder.add(prey_props, "death_rate");
  prey_folder.open();

  var pred_folder = gui.addFolder("Predators");
  pred_folder.add(pred_props, "play");
  pred_folder.add(pred_props, "dt", 0, 1);
  pred_folder.add(pred_props, "birth_rate");
  pred_folder.add(pred_props, "starve_rate");
  pred_folder.open();

  // Handle the page resize.
  $(window).resize(function () {
    height = $(window).height();
    width = $(window).width();

    $(paper.canvas).height(height);
    $(paper.width).width(width);
  });

  // Fish element.
  var Fish = function (x, y, props, member_of) {
    this.x = x;
    this.y = y;
    this.props = props;

    this.array = window[member_of];

    this.vx = randn();
    this.vy = randn();

    this.ax = randn() * 0.001;
    this.ay = randn() * 0.001;

    if (props.starvation === true) {
      this.last_meal = 0;
    }

    this.element = paper.circle(x, y, 5);

    if (props.color !== undefined) {
      this.element.attr('fill', props.color);
    }

    this.predators = [];
    this.prey = [];

    this.remove = function () {
      var index = this.array.indexOf(this);
      this.array.splice(index, 1);
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

      if ((props.starvation === true) && (this.last_meal > props.starve_rate) && (this.array.length >= props.min_pop)) {
        console.log("Starvation!");
        this.remove();
      }
    };

    this.adjustVelocity = function () {
      // Reset everything.
      var fx = 0, fy = 0;
      this.ax = 0;
      this.ay = 0;

      if (props.school !== false) {
        for (var i = 0; i < this.array.length; i += 1) {
          var d = Math.sqrt(Math.pow(this.x - this.array[i].x, 2)
            + Math.pow(this.y - this.array[i].y, 2));

          if (this.array[i] !== this) {
            this.ax = this.ax
              + (props.cr * Math.exp(-d / props.lr)
                 * (-1 / (2 * props.lr))
                 * (1/d) * (2 * (this.x - this.array[i].x)))
              - (props.ca * Math.exp(-d / props.la)
                 * (-1 / (2 * props.la))
                 * (1/d) * (2 * (this.x - this.array[i].x)));
            fx = fx + this.array[i].vx * Math.exp(-d / props.lc);

            this.ay = this.ay
              + (props.cr * Math.exp(-d / props.lr)
                 * (-1 / (2 * props.lr))
                 * (1/d) * (2 * (this.y - this.array[i].y)))
              - (props.ca * Math.exp(-d / props.la)
                 * (-1 / (2 * props.la))
                 * (1/d) * (2 * (this.y - this.array[i].y)));
            fy = fy + this.array[i].vy * Math.exp(-d / props.lc);
          }
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

      // Iterate over predators.
      for (var i = 0; i < this.predators.length; i += 1) {
        for (var j = 0; j < this.predators[i].length; j += 1) {
          var current_predator = this.predators[i][j];
          var d = Math.sqrt(Math.pow(this.x - current_predator.x, 2)
            + Math.pow(this.y - current_predator.y, 2));

          this.ax = this.ax
            + (current_predator.props.cr * Math.exp(-d / current_predator.props.lr)
               * (-1 / (2 * current_predator.props.lr))
               * (1/d) * (2 * (this.x - current_predator.x)));

          this.ay = this.ay
            + (current_predator.props.cr * Math.exp(-d / current_predator.props.lr)
               * (-1 / (2 * current_predator.props.lr))
               * (1/d) * (2 * (this.y - current_predator.y)));
        }
      }

      // Iterate over prey.
      for (var i = 0; i < this.prey.length; i += 1) {
        for (var j = 0; j < this.prey[i].length; j += 1) {
          var current_prey = this.prey[i][j];
          var d = Math.sqrt(Math.pow(this.x - current_prey.x, 2)
            + Math.pow(this.y - current_prey.y, 2));
          var la = current_prey.props.la * 2;
          var ca = current_prey.props.ca * 8;

          this.ax = this.ax
            - (ca * Math.exp(-d / la)
               * (-1 / (2 * la))
               * (1/d) * (2 * (this.x - current_prey.x)));

          this.ay = this.ay
            - (ca * Math.exp(-d / la)
               * (-1 / (2 * la))
               * (1/d) * (2 * (this.y - current_prey.y)));

          // Remove the prey!!!
          if (d < 10) {
            console.log("Kill!");
            current_prey.remove();

            if (typeof(this.last_meal) === "number") {
              this.last_meal = 0;
            }
          }
        }
      }

      if (typeof(this.last_meal) === "number") {
        this.last_meal = this.last_meal + props.dt;
      }

      this.ax = props.alpha * fx - props.beta
        * this.vx - this.ax;

      this.ay = props.alpha * fy - props.beta
        * this.vy - this.ay;

    };

    this.birthRate = function (probability) {
      var u = Math.random();

      if (u < probability) {
        this.array.push(new Fish(this.x, this.y, props, member_of));
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
  window.predators = [];

  for (var i = 0; i < n_pred; i += 1) {
    var randx = Math.random() * width;
    var randy = Math.random() * height;
    predators.push(new Fish(randx, randy, pred_props, 'predators'));
  }

  for (var i = 0; i < n; i += 1) {
    var randx = Math.random() * width;
    var randy = Math.random() * height;
    fish.push(new Fish(randx, randy, prey_props, 'fish'));
    fish[i].predators.push(predators);
  }

  for (var i = 0; i < n_pred; i += 1) {
    predators[i].prey.push(fish);
  }

  // Animation function.
  var animate = function () {
    if (prey_props.play === true) {
      for (var i = 0; i < fish.length; i += 1) {
        fish[i].motion();
        fish[i].birthRate(prey_props.birth_rate);
        fish[i].deathRate(prey_props.death_rate);
        fish[i].predators = [predators]
      }
    }
    if (pred_props.play === true) {
      for (var i = 0; i < predators.length; i += 1) {
        predators[i].motion();
        predators[i].birthRate(pred_props.birth_rate);
        predators[i].prey = [fish];
      }
    }
  }

  var animationInterval = setInterval(animate, 100);

})();
