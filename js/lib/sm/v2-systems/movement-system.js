function MovementSystem () {
	this.name = 'movement-system';

	// Defines which entities will be passed into the process function.
	this.filter = [
		ComponentType.position,
		ComponentType.movement
	];
	
	this.process = function (entity, fire) {

	};

  this.listeners = {
  	moveBy: {
  		type: EventTypes.MOVE_BY,
			handle: function (entity) {
  			console.log(entity);
      }
		}
	}
}