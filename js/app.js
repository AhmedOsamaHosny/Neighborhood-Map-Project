
//This is the map to be created later.
var map;
//This is an array of diffrent locations we wish to add markers to.
var locations = [{
    title: "Essen Hauptbahnhof",
    position: {
      lat: 51.449839,
      lng: 7.01262
    },
    searchPhrase: "Essen_Hauptbahnhof"
  },
  {
    title: "Limbecker Platz",
    position: {
      lat: 51.458325,
      lng: 7.006009
    },
    searchPhrase: "Limbecker_Platz"
  },
  {
    title: "Decathlon Essen",
    position: {
      lat: 51.457561,
      lng: 7.016324
    },
    searchPhrase: "Decathlon _(Unternehmen)"
  },
  {
    title: "CinemaxX Essen",
    position: {
      lat: 51.458276,
      lng: 7.003803
    },
    searchPhrase: "Cinemaxx"
  },
  {
    title: "Universitätsklinikum Essen",
    position: {
      lat: 51.4363052,
      lng: 6.9907035
    },
    searchPhrase: "Universitätsklinikum_Essen"
  }
];
//This array will hold the created markers for future reference.
var markers = [];

function initMap() {
  //This intializes the map with a specific location and zoom.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 51.454291,
      lng: 7.010228
    },
    zoom: 13
  });
  //This loop creates our markers for the locations we have.
  for (var i = 0; i < locations.length; i++) {
    var location = locations[i];

    //This creates a marker.
    var marker = new google.maps.Marker({
      position: location.position,
      map: map,
      animation: google.maps.Animation.DROP,
      title: location.title
    });
    marker.searchPhrase = location.searchPhrase;

    //add the created marker to the array of markers
    markers.push(marker);

    //create an info window to appear once clicked on the marker.
    marker.infowindow = new google.maps.InfoWindow({
      content: "Loading..."
    });
    //This adds the click listener to the marker.
    addMarkerListener(marker);
  }

  function addMarkerListener(marker){
    marker.addListener('click', function(){
      markerClickAction(this);
    });
  }

  //This is the code to be excuted once the marker is clicked on.
  function markerClickAction(thisMarker) {
    //close all open markers to open the new one later.
    for (var j = 0; j < markers.length; j++) {
      markers[j].infowindow.close();
      markers[j].setAnimation(null);
    }
    //This is an ajax call that fetches info from Wikipedia api.
    $.ajax({
      type: 'GET',
      url: 'https://de.wikipedia.org/w/api.php',
      data: {
        origin: '*',
        format: 'json',
        action: 'query',
        prop: 'extracts',
        exintro: '',
        exsentences: '3',
        explaintext: '',
        titles: thisMarker.searchPhrase
      },
      dataType: 'json',
      success: function(data) {
        //Set the markers info window content to be the api reques result.
        var id = Object.keys(data.query.pages)[0];
        thisMarker.infowindow.setContent(data.query.pages[id].extract);
      }
    });

    //If the marker has no bouncing animation this adds one.
    if (thisMarker.getAnimation() !== null) {
      thisMarker.setAnimation(null);
    } else {
      thisMarker.setAnimation(google.maps.Animation.BOUNCE);
    }

    //This sets the action of closing the info window to stoping the animation too.
    thisMarker.infowindow.addListener('closeclick', function() {
      thisMarker.setAnimation(null);
    });

    //This opens the clicked marker info window.
    thisMarker.infowindow.open(map, thisMarker);
  }

  //This is the viewModel used by knockout
  function viewModel() {
    var self = this;

    //The search bar is being observed by knockout for any changes
    self.search = ko.observable("");

    //This computes the list of markers to be displayed in the side bar
    self.displayedMarkers = ko.computed(function() {
      for (var k = 0; k < markers.length; k++) {
        markers[k].setVisible(false);
        markers[k].infowindow.close();
      }
      var displayedMarkers = [];
      if (self.search() === "") {
        for (var l = 0; l < markers.length; l++) {
          displayedMarkers.push(markers[l]);
          markers[l].setVisible(true);
        }
        return displayedMarkers;
      } else {
        for (var m = 0; m < markers.length; m++) {
          if (markers[m].title.toUpperCase().includes(self.search().toUpperCase())) {
            displayedMarkers.push(markers[m]);
            markers[m].setVisible(true);
          }
        }
        return displayedMarkers;
      }
    });

    //This function triggers the marker once clicked on its name in the side bar
    self.chooseMarker = function(marker) {
      new google.maps.event.trigger(marker, 'click');
    };
  }

  //This binds our viewModel with the view
  ko.applyBindings(new viewModel());

}
