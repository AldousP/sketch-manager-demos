var Cameras = function () {
  this.state = {
    meta : {
      name : 'Camera Tests',
      date : '07.17.2017',
      description : 'Trying out some camera work.'
    },
    bgColor: '#c3667c',
    entityCount : 264
  };

  this.setup = function () {
    this.systemProcessor.addSystem(new BackgroundSystem("a"));
    this.systemProcessor.addSystem(new MovementSystem("b"));
    this.systemProcessor.addSystem(new RenderingSystem("c"));

    var entities = [];
    var halfW = sm.gfx.width / 2;
    var halfH = sm.gfx.height / 2;

    for (var i = 0; i < this.state.entityCount; i++) {
      var child = this.entityMapper.createEntity([
          new ColorComponent(Color.white),
          new RotationComponent(SMath.rand(0, 360)),
          new MovementComponent(new Vector(SMath.rand(-15, 15), SMath.rand(-15, 15), SMath.rand(-128, 128))),
          new PositionComponent(SMath.rand(-halfW, halfW), SMath.rand(-halfH, halfH)),
          new PolygonComponent(generatePolygon(
              SMath.rand(3, 16),                // Vert Count
              halfH / SMath.rand(48, 128),      // Radius
              Math.PI / 6 * SMath.rand(1, 8),   // Rotation
              SMath.rand(.45, 2.25),            // Scale-X
              SMath.rand(.45, 3.25)             // Scale-Y
          ))
      ], 'random entity #' + i);

      entities.push(child);

    }

    this.entityMapper.createEntity([
      new RenderRoot(),
      new CameraComponent(),
      new PolygonComponent(generatePolygon(4, 128, Math.PI / 4,  3.75, 1.75)),
      new ClipComponent(),
      new ColorComponent(Color.white),
      new PositionComponent(0, 0),
      new InputComponent(),
      new RotationComponent(0)
    ], 'root', entities);
  };

  this.update = function (delta) {
    this.systemProcessor.processEntities(this.state, delta);
    sm.gfx.setFillColor(Color.white);
  }
};