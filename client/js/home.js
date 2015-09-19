var central_campus = {lat: 42.447578, lng: -76.480256};
var map;
var events = [];
var info;

Template.home.onCreated(function(){
	GoogleMaps.ready('map', function(map){
		// Query Events
		events = Events.find({},{sort: {"date": 1, "startTime": 1}}).fetch();

		// Create generic InfoWindow
		info = new google.maps.InfoWindow();

		// Create Markers
		for (var i = 0; i < events.length; i++){
			(function (){
				var marker = new google.maps.Marker({
			  		position: {lat: events[i].latitude, lng: events[i].longitude},
			  		map: map.instance,
			  		title: events[i].name + " at " + events[i].startTime
			  		//, icon: images/img.png
			  	});
			  	marker.addListener('click', function(){
			  		info.setContent(marker.title);
			  		info.open(map.instance, marker)});
			}())
		}

		// Make the map reactive
		Events.find().observe({
			added: function (newEvent) {
				var marker = new google.maps.Marker({
			  		position: {lat: newEvent.latitude, lng: newEvent.longitude},
			  		map: map.instance,
			  		title: newEvent.name + " at " + newEvent.startTime
			  		//, icon: images/img.png
			  	});
			  	marker.addListener('click', function(){
			  		info.setContent(marker.title);
			  		info.open(map.instance, marker)});
			},
			removed: function (oldEvent) {

			},
			changed: function (newEvent, oldEvent) {

			}
		});
	});
});

function tConvert (time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}

Template.home.helpers({
	 'events': function() {
        return Events.find({},{sort: {"date": 1, "startTime": 1}}).fetch();
    },
    'myEvent': function(eventId) {
    	return Meteor.userId() == Events.findOne({_id: eventId}).adminId;
    },
    'mine': function(eventId) {
    	if( Meteor.userId() == Events.findOne({_id:eventId}).adminId){
    		return "mine";
    	}
    	return "notMine";
    },
    'getDate': function(date) {
    	date = date.split('-');
    	var formatDate = new Date(date);
    	return formatDate.getMonth()+1 + "/" + formatDate.getDate() + "/" + date[0]
    },
    'getTime': function(time) {
    	return tConvert(time);
    },
    'getTimeToEvent': function(time) {
    	var hours = parseInt(time.split(":")[0]);
    	var minutes = parseInt(time.split(":")[1]);
    	var totalMinutes = 60*hours + minutes
    	var d = new Date();
    	var tM = 60*d.getHours() + d.getMinutes();
    	var diff = totalMinutes - tM
  		if(diff<0){
  			return 0;
  		}
  		if( Math.floor(diff/60) == 0){
  			return "<1";
  		}
  		return Math.floor(diff/60);
    },
    'pluralize': function(time) {
    	var hours = parseInt(time.split(":")[0]);
    	var minutes = parseInt(time.split(":")[1]);
    	var totalMinutes = 60*hours + minutes
    	var d = new Date();
    	var tM = 60*d.getHours() + d.getMinutes();
    	var diff = totalMinutes - tM
  		if( Math.floor(diff/60) <= 1){
  			return "hour";
  		}
    	return "hours";
    },
    'sameDay':function(date) {
		var inputDate = new Date(date);
		var todaysDate = new Date();
		if(inputDate.getFullYear() == todaysDate.getFullYear() && inputDate.getMonth() == todaysDate.getMonth() && inputDate.getDate()+1 == todaysDate.getDate())
		{
    		return true;
		}
		return false;
    },
    'notAlreadyHappened':function(Event){
    	date=Event.date;
    	startTime=Event.startTime;
    	endTime=Event.endTime;
    	var eventDate = new Date(date.split("-")[0],date.split("-")[1],date.split("-")[2], startTime.split(":")[0], startTime.split(":")[1], 0);
		var endDate = new Date(date.split("-")[0],date.split("-")[1],date.split("-")[2], endTime.split(":")[0], endTime.split(":")[1], 0);
		var currentDate = new Date();
		if(eventDate < currentDate || endDate <= eventDate){
			Events.remove({
				_id: Event._id
			})
			return false;
		}
		return true;
	},
	mapOptions: function() {
		return {center: central_campus, zoom: 15};
	}
})

Template.home.events({

	'click #new-event': function(evt) {
		$("#myModalLabel").html("New Event");
		$("form.edit-event").attr("class","add-event");
		$("form.add-event")[0].reset();
    },
	'click a#edit-event': function(evt) {
		$("#myModalLabel").html("Edit Event");
		var eventId = $(evt.target).data("eventid");
		$("form.add-event").attr("class","edit-event");
		$("#eventId").val(eventId);
		var myEvent = Events.findOne({_id: eventId});
		if(Meteor.userId() == myEvent.adminId) {
	    	$("#eventName").val(myEvent.name);
	    	$("#eventDescription").val(myEvent.description);
	    	$("#eventLocation").val(myEvent.location);
	    	$("#eventDate").val(myEvent.date);
	    	$("#eventStartTime").val(myEvent.startTime);
	    	$("#eventEndTime").val(myEvent.endTime);
    	}
    },

	'click a#delete-event': function(evt) {
    $('#dialogModal').data('eventid', $(evt.target).data('eventid'));
    $('#dialogModal').modal();
  },

  	'click #my-events-button': function(evt) {
  		$('.notMine#event-container').toggle();
  		$('#all-events-button').toggle();
  		$('#my-events-button').toggle();
  	},
  	'click #all-events-button': function(evt) {
  		$('.notMine#event-container').toggle();
  		$('#all-events-button').toggle();
  		$('#my-events-button').toggle();
  	}
});
