var Application = function(panel_id) {

  this.panel_id = panel_id;
  if (this.panel_id == null) {
    this.panel_id = "container";
  }

  var instance = this;
  this.block_size = 40;
  this.container_size = 162;
  this.score_size = 100;
  this.blocks = [];
  this.numbers = [];
  this.paper = null;
  this.current_block = 0;
  this.clear_block = 15;
  this.swap_speed = 300;
  this.work_animation = 0;
  this.clicks = 0;
  
  // Controls 
  this.score_text = null;

  this.initialize = function() {
    this.paper = new Raphael(this.panel_id, this.container_size + this.score_size, this.container_size);
    var t = this.paper.text(10, this.container_size + this.score_size / 3 + 15, "Clicks:");
    this.score_text = this.paper.text(this.container_size + this.score_size / 3 + 15, 30, this.clicks.toString());
    var s = this.paper.set();
    s.push(t).push(this.score_text).attr({"font-size": 20, "font-family": "Myrand"});
    this.randomize_blocks();
  };
  
  this.clear_boxes = function(pos) {
    var instance = this;
    if (pos == 16) return;
    instance.blocks[pos].animate({opacity: 0}, 200, "<>", function() {
                                                          this.remove();
                                                          instance.clear_boxes(pos + 1);
                                                        });
  };
  
  this.randomize_blocks = function() {
    for(var i = 0; i < 4; i++) {
      for(var j = 0; j < 4; j++) {
        var position = -1;
        for(;position == -1 || this.is_exists_block(position);) {
          position = Math.floor(Math.random() * 16) + 1;
        }
        var set = this.create_block(i, j, position, this.blocks.length);
        this.blocks.push(set);
        this.numbers.push(position);
      }
    }
  };

  this.is_exists_block = function(number) {
    for(var i = 0; i < this.numbers.length; i++) {
      if (this.numbers[i] == number) {
        return true;
      }
    }
    return false;
  };

  this.find_block = function(control) {
    // TODO: rewrite method for placing behind the blocks rectangle with opacity.
    for(var i = 0; i < this.blocks.length; i++) {
      if (control.type == "rect" && this.blocks[i][0].id == control.id) {
        return i;
      // Try to check another boxes types
      } else if (this.blocks[i].length > 1 && this.blocks[i][1].id == control.id) {
        return i;
      }
    }
    return -1;
  };

  this.is_complete = function() {
    var iterator = 0;
    for (var i = 0; i < this.numbers.length; i++) {
      if(this.numbers[i] == i + 1) {
        iterator++;
      }
    }
    if (iterator == i) {
      return true;
    }
    return false;
  };

  this.show_scores = function() {
    alert('You completed!');
  };

  this.restart_game = function() {
    this.clear_boxes(0);
    
    this.blocks = [];
    this.numbers = [];
    this.clear_block = 0;
    this.current_block = 0;
    this.clicks = -1;
    
    this.update_score();
    this.randomize_blocks();
  };
  
  this.update_score = function() {
    this.clicks += 1;
    this.score_text.attr({text: this.clicks});
  }

  this.near_clear_block = function(i) {
    if (this.clear_block == i + 1 ||
        this.clear_block == i - 1 ||
        this.clear_block == i + 4 ||
        this.clear_block == i - 4) {
      return true;
    }
    return false;
  };

  this.get_positions = function(i) {
    if (this.clear_block == i + 1) {
      return {f: [this.block_size, 0], s: [-this.block_size, 0]};
    } else if (this.clear_block == i - 1) {
      return {f: [-this.block_size, 0], s: [this.block_size, 0]};
    } else if (this.clear_block == i + 4) {
      return {f: [0, this.block_size], s: [0, -this.block_size]};
    } else if (this.clear_block == i - 4) {
      return {f: [0, -this.block_size], s: [0, this.block_size]};
    }
    return {f:[0,0], s:[0,0]};
  }

  this.swap_blocks = function(i, j) {
    var p = this.get_positions(i);
    var b1 = this.blocks[i];
    var b2 = this.blocks[j];
    
    this.work_animation = b1.length + b2.length;
    this.move_block(b1, p['f'][0], p['f'][1]);
    this.move_block(b2, p['s'][0], p['s'][1]);

    var block = this.blocks[i];
    this.blocks[i] = this.blocks[j];
    this.blocks[j] = block;

    var n = this.numbers[i];
    this.numbers[i] = this.numbers[j];
    this.numbers[j] = n;
  };

  this.move_block = function(bl, x, y) {
    var instance = this;
    for(var i = 0; i < bl.length; i++) {
      bl[i].animate({
        x: x + bl[i].attrs.x,
        y: y + bl[i].attrs.y
      }, this.swap_speed, ">", function() {
        instance.work_animation -= 1;
      });
    }
  };

  this.create_block = function(i, j, iterator, len) {
    var set = this.paper.set();
    if (iterator != 16) {
      set.push(
        this.paper.rect(this.block_size * j,
                        this.block_size * i,
                        this.block_size,
                        this.block_size, 10)
                  .attr({fill: '#9cf', stroke: '#ddd', 'stroke-width': 5}),
        this.paper.text(this.block_size * (j + 1) - this.block_size / 2,
                        this.block_size * (i + 1) - this.block_size / 2,
                        iterator)
                  .attr({"font-family": "Myrand", "font-size": 18})
      );
    } else {
      set.push(
        this.paper.rect(this.block_size * j,
                        this.block_size * i,
                        this.block_size,
                        this.block_size, 10)
                  .attr({fill: '#9cf', stroke: '#ddd', 'stroke-width': 5})
      );
      this.clear_block = len;
    };

    set.click(function() {
      instance.update_score();
      if (instance.work_animation == 0) {
        var block = instance.find_block(this);
        if (block != -1 && instance.near_clear_block(block)) {
          instance.swap_blocks(block, instance.clear_block);
          instance.clear_block = block;
        }
        if (instance.is_complete()) {
          instance.restart_game();
        }
      }
    });

    set.hover(function() {
      if (set.length > 1) {
        set[1].attr({fill: "red"});
      }
    }, function() {
      if (set.length > 1) {
        set[1].attr({fill: "black"});
      }
    });

    return set;
  }

  this.initialize();

}