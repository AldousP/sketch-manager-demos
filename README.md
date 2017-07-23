# Sketch-Manager 

Demos of rendering to a canvas mounted to a Sketch Manager (SM) context.

```JavaScript
/*
 * Begins sm and renders output to the specified <canvas> element.
 */
sm.init('canvas-id'); 

/*
 * Loads program.
 */
sm.loadProgram(new SampleProgram());
```

## Programs
Programs contain user-defined code which can render to the canvas via sm.gfx, a series of utilities
for faster drawing, and sm.ctx, which exposes the raw 2D rendering context of the canvas. Programs may leverage
other modules such as sm.sfx for sound rendering and sm.log for logging to the in-canvas debug console.

A simple program can be seen below.

```JavaScript
var SampleProgram = function () {


  this.state = {
    meta : {
      name : 'A Simple Program',
      date : '01.01.70',
      description : "A demonstration of a program definition."
    }
  };
  
  this.update = function (delta) {
    sm.gfx.clear(this.state.bgColor);
    sm.gfx.setStrokeColor(Color.white);
    sm.gfx.text(true, this.state.meta.description, 0, -sm.gfx.height / 2.5 + 24, 12, 'Arial');
  }
};

```


