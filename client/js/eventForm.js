var buildings = [];

Template.eventForm.rendered = function() {
  HTTP.get(Meteor.absoluteUrl("assets/buildings.json"), function(err,result) {
      buildings = result.data;
      var names = _.pluck(buildings, 'Name');
      Session.set('names', names);
  });
};

Template.eventForm.events({
  'submit form.add-event': function(evt) {
  	evt.preventDefault();
  	var name = evt.target.eventName.value;
  	if(evt.target.eventDescription){
  		var description = evt.target.eventDescription.value;
  	}
  	var location = evt.target.eventLocation.value;
  	var date = evt.target.eventDate.value;
  	var startTime = evt.target.eventStartTime.value;
  	var endTime = evt.target.eventEndTime.value;
  	var attendees = [];
  	var category = evt.target.eventCategory.value;
  	var eventDate = new Date(date.split("-")[0],date.split("-")[1]-1,date.split("-")[2], startTime.split(":")[0], startTime.split(":")[1], 0);
  	var endDate = new Date(date.split("-")[0],date.split("-")[1]-1,date.split("-")[2], endTime.split(":")[0], endTime.split(":")[1], 0);
  	var currentDate = new Date();
  	if(eventDate < currentDate || endDate <= eventDate || !name || !location || !date || !startTime || !endTime){
  		$("#error-messages").show();
  		return;
  	}

    // Trashy way to get lat/lon
    var latitude = undefined;
    var longitude = undefined;
    var i = 0;
    while (latitude == undefined && i < buildings.length) {
      if (buildings[i].Name == location) {
        latitude = buildings[i].Latitude;
        longitude = buildings[i].Longitude;
      }
      i++;
    }

    var newEvent = {
      adminId: Meteor.userId(),
      name: name,
      description: description,
      location: location,
        latitude: latitude,
        longitude: longitude,
      date: date,
      dateObj: eventDate,
      startTime: startTime,
      endTime: endTime,
      attendees: attendees,
      numAttendees: attendees.length,
      category: category
    };

    Events.insert(newEvent, function (err, newId) {
      newEvent._id = newId;
      Session.set('events',Events.find({},{sort: {"date": 1, "startTime": 1}}).fetch())

      // Create new marker on map
      window.addMarker(newEvent, false);
      // Switch to viewing all events
      $("#time_checkbox").attr("checked", false);
      window.toggleTime();
    });
    $("#modal-close").click();
    $("form")[0].reset();
  },

  'submit form.edit-event': function(evt) {
  	evt.preventDefault();
  	var eventId = evt.target.eventId.value;
  	var name = evt.target.eventName.value;
  	var description = evt.target.eventDescription.value;
  	var location = evt.target.eventLocation.value;
  	var date = evt.target.eventDate.value;
  	var startTime = evt.target.eventStartTime.value;
  	var endTime = evt.target.eventEndTime.value;
  	var attendees = [];
  	var category = evt.target.eventCategory.value;

  	var eventDate = new Date(date.split("-")[0],date.split("-")[1]-1,date.split("-")[2], startTime.split(":")[0], startTime.split(":")[1], 0);
  	var endDate = new Date(date.split("-")[0],date.split("-")[1]-1,date.split("-")[2], endTime.split(":")[0], endTime.split(":")[1], 0);
  	var currentDate = new Date();
  	if(eventDate < currentDate || endDate <= eventDate || !name || !location || !date || !startTime || !endTime){
  		$("#error-messages").show();
  		return;
  	}

    // Trashy way to get lat/lon
    var latitude = undefined;
    var longitude = undefined;
    var i = 0;
    while (latitude == undefined && i < buildings.length) {
      if (buildings[i].Name == location) {
        latitude = buildings[i].Latitude;
        longitude = buildings[i].Longitude;
      }
      i++;
    }

    Events.update({
            _id: eventId
        }, {
            $set: {
                adminId: Meteor.userId(),
    			name: name,
		    	description: description,
		    	location: location,
		      	latitude: latitude,
		      	longitude: longitude,
		    	date: date,
		    	dateObj: eventDate,
		    	startTime: startTime,
		    	endTime: endTime,
		    	attendees: attendees,
		    	numAttendees: attendees.length,
		    	category: category
            }
        });
    $("#modal-close").click();
    $("form")[0].reset();
    Session.set('events',Events.find({},{sort: {"date": 1, "startTime": 1}}).fetch())


    // Remove old marker
    window.removeMarker(eventId);

    // Create new marker
    window.addMarker({
      _id: eventId,
      adminId: Meteor.userId(),
      name: name,
      description: description,
      location: location,
      latitude: latitude,
      longitude: longitude,
      date: date,
      startTime: startTime,
      endTime: endTime,
      attendees: attendees
    }, true);
  }
});


Template.eventForm.helpers({
	'today': function() {
    	var t = new Date();
		var dd = t.getDate();
		var mm = t.getMonth()+1;
		var yyyy = t.getFullYear();

		if(dd<10) {
		    dd='0'+dd
		}

		if(mm<10) {
		    mm='0'+mm
		}

		t = yyyy + "-" + mm+'-'+dd;
		return t;
	},
	'categoryNames': function() {
		return ["Club Meeting","Study Group","Office Hours","Party","Other"];
	},
  'locationNames': function() {
    return Session.get('names');
  }
});
