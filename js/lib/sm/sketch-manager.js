'use strict';

/*
 * Stupid Monolithic object for managing app context
 */

(function () {
  window.sm = {
    toggleDebug : function () {
      sm.conf.debug.active = !sm.conf.debug.active;
    },
    
    togglePause : function () {
      sm.conf.paused = !sm.conf.paused;
    },
    
    checkIfMobile : function () {
      sm.conf.mobile.is_mobile = window.innerWidth < sm.conf.mobile.mobile_break;

      if (sm.conf.mobile.last_win_width > sm.conf.mobile.mobile_break && sm.conf.mobile.is_mobile) {
        sm.resizeCanvas();
      }

      if (sm.conf.mobile.last_win_width < sm.conf.mobile.mobile_break && !sm.conf.mobile.is_mobile) {
        sm.resizeCanvas();
      }

      sm.conf.mobile.last_win_width = window.innerWidth;
    },

    resizeCanvas : function () {
      if (sm.conf.mobile.is_mobile) {
        sm.canvas.width = sm.canvas.height;
      } else {
        sm.canvas.width = sm.canvas.height * 2;
      }
    },
    stop : function() {
      sm.breakOnNextLoop = true;
    },
    context: 'root', // Used for logging context.
    conf: {
      paused : false,
      resourceDir: 'assets',
      mobile : {
        is_mobile : true,
        last_win_width : 451,
        mobile_break : 450
      },
      debug: {
        active: true,
        logConsole: {
          logToScreen: true,
          logToBrowserConsole: false,
          size : 10,
          color: Color.white,
          padding: 0.025,
          bgColor: '#000913',
          logInProgram: true
        }
      }
    },
    time: {
      last : new Date().getTime(),
      current : new Date().getTime(),
      delta : 0,
      frameRate : 0,
      frameHistory : [],
      historyCap : 100,
      update : function () {
        sm.time.current = new Date().getTime();
        sm.time.delta = (sm.time.current - sm.time.last) / 1000;
        sm.time.frameRate = (1000 / sm.time.delta) / 1000;
        sm.time.last = sm.time.current;
        sm.time.frameHistory.push(sm.time.frameRate);
        if (sm.time.frameHistory.length > sm.time.historyCap) {
          sm.time.frameHistory.splice(0, 1);
        }
        var avg = 0;
        for (var i = 0; i < sm.time.frameHistory.length; i++) {
          avg += sm.time.frameHistory[i];
        }
        avg /= sm.time.frameHistory.length;
        sm.time.frameRate = avg;
      }
    },
    logs: [],
    ctx: {},
    canvas: {},
    utils : {
      formatters : {
        float_two_pt : function (val) {
          return parseFloat((Math.round(val * 100) / 100).toFixed(2));
        }
      }
    },
    input: {
      fire: function (button) {
        this.state[button] = true;
      },
      update: function () {
        this.state = {};
      },
      state: {}
    },
    log: {
      notify: function (msg, context) {
        var date = new Date();
        var log = this.timestamp() + '[SM-Notify][' + (context ? context : 'root') + ']: ' + msg;
        if (sm.conf.debug.logConsole.logToBrowserConsole) {
          console.log(log);
        }
        sm.logs.push(log);
      },

      error: function (msg, context) {
        var log = this.timestamp() + '[SM-Error][' + (context ? context : 'root') + ']: ' + msg;
        if (sm.conf.debug.logConsole.logToBrowserConsole) {
          console.error(log);
        }
        sm.logs.push(log);
      },

      timestamp: function () {
        var date = new Date();
        return '(' +
            date.getHours() + ':' +
            date.getMinutes() + ':' +
            date.getSeconds() + ':' +
            date.getMilliseconds() +
            ')';
      }
    },

    gfx: {
      clip : { x : 0, y : 0, w : 256, h : 128 },
      width: 0,
      height: 0,
      clear: function (color) {
        sm.ctx.translate(-sm.canvas.width / 2, -sm.canvas.height / 2);
        if (color) {
          sm.ctx.fillStyle = color;
        } else {
          sm.ctx.fillStyle = sm.conf.debug.logConsole.bgColor;
        }
        sm.ctx.fillRect(0, 0, sm.canvas.width * 100, sm.canvas.height * 100);
        sm.ctx.translate(sm.canvas.width / 2, sm.canvas.height / 2);
      },

      drawPolygon: function (polygon, pos, fill, rotation) {
        sm.ctx.translate(pos.x, -pos.y);
        sm.ctx.rotate(rotation);
        sm.ctx.beginPath();
        if (!polygon.pts) {
          console.error('No property of name [pts] found on polygon parameter.');
        } else {
          var firstPt = polygon.pts[0];
          sm.ctx.moveTo(firstPt.x, firstPt.y);
          polygon.pts.forEach(function (pt) {
            if (pt !== firstPt) {
              sm.ctx.lineTo(pt.x , pt.y);
            }
          });
          sm.ctx.lineTo(firstPt.x, firstPt.y);
        }
        sm.ctx.closePath();
        fill ? sm.ctx.fill() : sm.ctx.stroke();
        sm.ctx.rotate(-rotation);
        sm.ctx.translate(-pos.x, pos.y);
      },

      drawImage: function (image, x, y, w, h, align) {
        if (image) {
          if (align) {
            var adj = align(x, y, w, h);
            sm.ctx.drawImage(image, adj.x, adj.y, w, h);
          } else {
            sm.ctx.drawImage(image, x, y, w, h);
          }
        }
      },

      loadImage: function (handle, callback) {
        var img = new Image();
        if (sm.activeProgram) {
          img.src = sm.activeProgram.resourceDir + '/' + handle;
        } else {
          img.src = sm.conf.resourceDir + '/' + handle;
        }
        img.onload = callback;
      },

      preDraw: function () {
        sm.gfx.width = sm.canvas.width;
        sm.gfx.height = sm.canvas.height;
        sm.ctx.save();
        sm.ctx.translate(sm.canvas.width / 2, sm.canvas.height / 2);
      },

      postDraw: function () {
        sm.ctx.restore();
      },

      drawRect: function (x, y, w, h, fill, rotation) {
        sm.ctx.beginPath();
        sm.ctx.fillStyle = 'white';
        var adj = Align.center(x, y, w, h);
        var transX = adj.x + (w / 2);
        var transY = adj.y + (h / 2);
        sm.ctx.translate(transX, transY);
        sm.ctx.rotate(rotation / DEG_RAD);
        sm.ctx.rect(-(w / 2), -(h / 2), w, h);
        if (fill) {
          sm.ctx.fill();
        }
        sm.ctx.stroke();
        sm.ctx.closePath();
        sm.ctx.rotate(- (rotation / DEG_RAD));
        sm.ctx.translate(-transX, -transY);
      },

      drawRectVec: function (vec, w, h, fill, rotation) {
        sm.ctx.beginPath();
        sm.ctx.fillStyle = 'white';
        var x = vec.x;
        var y = vec.y;
        var adj = Align.center(x, y, w, h);
        var transX = adj.x + (w / 2);
        var transY = adj.y + (h / 2);
        sm.ctx.translate(transX, transY);
        sm.ctx.rotate(rotation / DEG_RAD);
        sm.ctx.rect(-(w / 2), -(h / 2), w, h);
        if (fill) {
          sm.ctx.fill();
        }
        sm.ctx.stroke();
        sm.ctx.closePath();
        sm.ctx.rotate(- (rotation / DEG_RAD));
        sm.ctx.translate(-transX, -transY);
      },

      drawLine: function (x1, y1, x2, y2) {
        sm.ctx.beginPath();
        sm.ctx.moveTo(x1, y1);
        sm.ctx.lineTo(x2, y2);
        sm.ctx.stroke();
        sm.ctx.closePath();
      },

      drawVec: function (vec) {
        sm.ctx.beginPath();
        sm.ctx.moveTo(0, 0);
        sm.ctx.lineTo(vec.x, -vec.y);
        sm.ctx.stroke();
        sm.ctx.closePath();
      },

      drawPtVec: function (pt, vec) {
        sm.ctx.beginPath();
        sm.ctx.moveTo(pt.x, -pt.y);
        sm.ctx.lineTo(pt.x + vec.x, -pt.y - vec.y);
        sm.ctx.stroke();
        sm.ctx.closePath();
      },

      drawCircle: function (x, y, radius) {
        sm.ctx.beginPath();
        sm.ctx.arc(x, y, radius, 0, Math.PI * 2);
        sm.ctx.stroke();
        sm.ctx.closePath();
      },

      setStrokeColor: function (color) {
        sm.ctx.strokeStyle = color;
      },

      setStrokeWidth: function (width) {
        sm.ctx.lineWidth = width;
      },

      setFillColor: function (color) {
        sm.ctx.fillStyle = color;
      },

      text: function (center, msg, x, y, fontSize, font) {
        sm.ctx.textAlign = center ? 'center' : 'left';
        sm.ctx.beginPath();
        if (fontSize) {
          if (font) {
            sm.ctx.font = fontSize + 'px ' + font;
          } else {
            sm.ctx.font = fontSize + 'px Arial';
          }
        } else {
          if (font) {
            sm.ctx.font = '10px ' + font;
          }
        }

        sm.ctx.fillText(msg, x, y);
        sm.ctx.closePath();
      }
    },

    sfx: {
      ctx: new (window.AudioContext || window.webkitAudioContext)(),
      beep: function (note) {
        var oscillator = this.ctx.createOscillator();
        var gainNode = this.ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        gainNode.gain.value = .025;
        oscillator.frequency.value = note ? note : 440;
        oscillator.type = 'square';
        oscillator.start();
        setTimeout(
            function () {
              oscillator.stop();
            },
            200
        );
      }
    },

    init: function (canvasMountId, program) {
      this.log.notify('Mounting @ ' + canvasMountId + '...', sm.context);
      var mountPoint = document.getElementById(canvasMountId);
      
      if (mountPoint && mountPoint.tagName.toLowerCase() === 'canvas') {
        this.ctx = mountPoint.getContext('2d');
        this.canvas = mountPoint;
        window.requestAnimationFrame(this.appLoop);
      } else {
        this.log.error(console.error('Specified Mount Point: ' + canvasMountId + ' is not a canvas.'), sm.context);
      }

      sm.gfx.width = sm.canvas.width;
      sm.gfx.height = sm.canvas.height;

      if (program) {
        sm.loadProgram(program);
      }
    },

    loadProgram: function (program) {
      var state = program.state;
      var meta = state ? state.meta : null;

      if (!state) {
        sm.log.error('No state found on provided program.');
        return -1;
      }

      if (!meta) {
        sm.log.error('No meta object found on the provided program');
        return -1;
      }

      sm.log.notify('Loading Program: ' + meta.name + '...', sm.context);
      program.entityMapper = new EntityMapper();
      program.systemProcessor = new SystemProcessor(program.entityMapper);
      try {
        program.setup();
      } catch (e) {
        sm.log.error('Error loading program: ' + meta.name);
        sm.log.error(e);
        return;
      }
      sm.activeProgram = program;
      sm.log.notify('Starting...', meta.name);
      document.body.dispatchEvent(new CustomEvent('smProgramLoaded', {'detail': {'programName': meta.name}}));
    },

    unloadProgram: function () {
      var name = sm.activeProgram.state.meta.name;
      if (!sm.activeProgram) {
        sm.log.notify('Nothing to unload. Did you load a program?', sm.context);
      } else {
        sm.log.notify('Unloading: ' + name + '...', sm.context);
      }
      sm.activeProgram = undefined;
      document.body.dispatchEvent(
          new CustomEvent('smProgramUnloaded', {'detail': {'programName': name}})
      );
    },

    appLoop: function () {
      sm.time.update();
      sm.gfx.clear();
      sm.gfx.preDraw();

      var state;
      var meta;
      if (sm.activeProgram) {
        state = sm.activeProgram.state;
        meta = state.meta;
      }

      // Update Program
      if (!sm.conf.paused) {
          sm.activeProgram.update(sm.time.delta);
      } else {
        sm.gfx.setFillColor(Color.green);
        sm.gfx.text(true, 'SM-PAUSED', 0, 0);
      }

      // Render Log
      if (!sm.activeProgram || (sm.conf.debug.logConsole.logInProgram && sm.conf.debug.active)) {
        if (sm.activeProgram) {
					sm.gfx.setFillColor(Color.green);
				} else {
					sm.gfx.setFillColor(Color.white);
        }
        var viewPortW = sm.canvas.width;
        var viewPortH = sm.canvas.height;
        var padding = sm.conf.debug.logConsole.padding;
        var offsetW = viewPortW * padding;
        var offsetH = viewPortH * padding;
        for (var i = 0; i < sm.logs.length; i++) {
          sm.gfx.text(
              false,
              sm.logs[i],
              (-viewPortW / 2) + offsetW,
              (-(viewPortH / 2) + offsetH) + (offsetH * ( sm.logs.length - i)),
              sm.conf.debug.logConsole.size,
              'Ubuntu Mono'
          );
        }
      }

      // Render FPS & Title
      if (sm.conf.debug.active) {
        if (sm.activeProgram) {
          sm.gfx.setFillColor(Color.white);
          sm.gfx.text(
              false,
              meta.name,
              sm.canvas.width / 3,
              -sm.canvas.height / 2.2,
              14,
              'Ubuntu Mono');

          sm.gfx.text(
              false,
              sm.utils.formatters.float_two_pt(sm.time.frameRate),
              sm.canvas.width / 3,
              -sm.canvas.height / 2.35,
              14,
              'Ubuntu Mono');
        }
      }

      // Reset State and Input
      sm.gfx.postDraw();
      sm.input.update();
      sm.checkIfMobile();

      if (!sm.breakOnNextLoop) {
        window.requestAnimationFrame(sm.appLoop);
      } else {
        sm.breakOnNextLoop = false;
        sm.unloadProgram();
        console.log('Logs can be found at sm.logs.');
        sm.ctx.save();
        sm.ctx.fillStyle = '#000000';
        sm.ctx.fillRect(0, 0, sm.canvas.width, sm.canvas.height);
      }
    }
  };
})();
