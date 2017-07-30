var Sequences = function () {
  this.state = {
    assets: 'assets',
    meta : {
      name : 'Sequences',
      date : '07.29.2017',
      description : 'Sequences and easing.'
    },
    systemStates : {
      rendering: {
        assets: 'assets/animations/'
      },
      background : {
        bgColor: '#40a841'
      }
    }
  };

  this.setup = function () {
    var entities = [];

    var ballA = this.entityMapper.createEntity([
        new PositionComponent(-128, 128),
        new PathComponent([new Vector(-128, 128), new Vector(128, 128)]),
        new PolygonComponent(polyCircle(16)),
        new ColorComponent(Color.white, Color.white),
        new SequenceComponent([
          {
            name: 'positionSequence',
            easing: 'squared',
            type: SequenceType.PING_PONG,
            length: 2,
            pos: 0
          }
        ])
    ]);

    var ballB = this.entityMapper.createEntity([
      new PositionComponent(-128, 0),
      new PathComponent([new Vector(-128, 0), new Vector(128, 0)]),
      new PolygonComponent(polyCircle(16)),
      new ColorComponent(Color.white, Color.white),
      new SequenceComponent([
        {
          name: 'positionSequence',
          easing: 'squared',
          type: SequenceType.NORMAL,
          length: 2,
          pos: 0
        }
      ])
    ]);

    var ballC = this.entityMapper.createEntity([
      new PositionComponent(-128, -128),
      new PathComponent([new Vector(-128, -128), new Vector(128, -128)]),
      new PolygonComponent(polyCircle(16)),
      new ColorComponent(Color.white, Color.white),
      new SequenceComponent([
        {
          name: 'positionSequence',
          easing: 'cubic',
          easingConfig: {

          },
          type: SequenceType.NORMAL,
          length: 2,
          pos: 0
        }
      ])
    ]);

    entities.push(ballA, ballB, ballC);

    var root = this.entityMapper.createEntity([
      new RenderRoot()
    ], 'root', entities );

    this.state.rootID = root.ID;
    this.systemProcessor.addSystem(new BackgroundSystem());
    this.systemProcessor.addSystem(new PathSystem());
    this.systemProcessor.addSystem(new RenderingSystem());

    var that = this;
    this.systemProcessor.addSystem(new SequenceSystem({
      positionSequence: {
        update: function (entity, progress) {
          var path = smx.path(entity);
          var pos = smx.pos(entity);
          path.alpha = progress;
          sm.gfx.text(sm.utils.formatters.float_two_pt(progress), pos.x, pos.y);

          setVecVec(pos, path.pos);
          sm.gfx.setTextConf({ align:'center', color: that.state.systemStates.background.bgColor });
        }
      }
    }));
    this.systemProcessor.addSystem(new CameraSystem());
  };

  this.update = function (delta) {
    this.systemProcessor.processEntities(delta);
    // var ptA = new Vector(-128, -128);
    // var ptB = new Vector(128, 128);
    // var cp1 = new Vector(32, 64);
    // var cp2 = new Vector(-32, -64);
    //
    // sm.gfx.setStrokeColor(Color.white);
    // sm.gfx.drawLineVec(ptA, ptB);
    //
    // sm.gfx.drawLineVec(ptA, cp1);
    // sm.gfx.drawLineVec(ptB, cp2);
    //
    // sm.gfx.setFillColor(Color.white);
    // sm.gfx.drawCircleVec(cp1, 8);
    // sm.gfx.drawCircleVec(cp2, 8);
  };
};