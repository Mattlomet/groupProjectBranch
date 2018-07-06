var airlineComp = {};
var airlines;

var airports;
var airportNames = {};
var userInput = {};
var flightData = {};
var flightArray = [];
var appendixSave = {};
var selectedFlightAddress = ""


// get info from firebase for flightResults
$(document).on("click", "#searchButton", function () {
    event.preventDefault();

    function getFlightByRoute(userInput) {

        var queryURL =
            `https://api.flightstats.com/flex/schedules/rest/v1/json/from/${userInput.departureAirportCode}/to/${userInput.arrivalAirportCode}/arriving/${userInput.date}?appId=e1696e2b&appKey=f99f0637eebb7f44ead254e9fc6e8cd6`
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            var i = 0
            appendixSave = response.appendix;
            flightArray = response.scheduledFlights;
            if (response.scheduledFlights.length > 0) {
                for (flight in response.scheduledFlights) {
                    function getAirline(carrierCode) {
                        for (airline in response.appendix.airlines) {
                            if (carrierCode == response.appendix.airlines[airline].fs) {
                                var flightAirline = response.appendix.airlines[airline].name;
                            }
                        }
                        return flightAirline;
                    }
                    var flightInfo = {
                        arrivalTimeLocal: moment(response.scheduledFlights[flight].arrivalTime).format(
                            'HH:mm:ss'),
                        currentTimeLocal: moment(response.appendix.airports[0].localTime).format(
                            'HH:mm:ss'),
                        airportName: response.appendix.airports[0].name,
                        arivalAirportAdress: response.appendix.airports[0].street1,
                        arrivalTerminal: response.scheduledFlights[flight].arrivalTerminal,
                        flightAirline: getAirline(response.scheduledFlights[flight].carrierFsCode),
                        flightNumber: response.scheduledFlights[flight].flightNumber
                    };
                    flightData[flight] = flightInfo;
                    var mainRow = $("<div>")
                    mainRow.attr("class", "row")

                    var mainCol = $("<div>");
                    mainCol.attr("class", "col s12");

                    var mainCard = $("<div>");
                    mainCard.attr("class", "card grey lighten-4");

                    var cardContent = $("<div>");
                    cardContent.attr("class", "card-content red-text");

                    var cardTitle = $("<span>");
                    cardTitle.attr("class", "card-title");
                    cardTitle.text(flightData[flight].airportName + "  #" + flightData[flight].flightNumber);

                    var cardButton = $("<a>");
                    cardButton.attr("class", "btn-floating halfway-fab waves-effect waves-light red");
                    cardButton.attr("id", "cardButton");


                    var cardIcon = $("<i>")
                    cardIcon.attr("class", "material-icons");
                    cardIcon.attr("id", i++)
                    cardIcon.text("add")
                    cardButton.append(cardIcon);

                    var cardCenter = $("<div>");
                    var arrivalTime = $("<div>");
                    arrivalTime.text("Arrival:  " + flightData[flight].arrivalTimeLocal);
                    var departTime = $("<div>");
                    departTime.text("Depature:  " + flightData[flight].currentTimeLocal);


                    var airlineDiv = $("<div>");
                    airlineDiv.text(flightData[flight].flightAirline)

                    var arrivalAirport = $("<div>");
                    arrivalAirport.text(flightData[flight].arivalAirportAdress + " -terminal: " + flightData[flight].arrivalTerminal);

                    var flightNumDiv = $("<div>");
                    flightNumDiv.text(flightData[flight].flightNumber)

                    var cardAction = $("<div>");
                    cardAction.attr("class", "card-action red lighten-1")
                    cardCenter.append(airlineDiv, arrivalAirport, arrivalTime, departTime);

                    cardContent.append(cardTitle, cardCenter);
                    mainCard.append(cardContent, cardButton, cardAction);
                    mainCol.append(mainCard);

                    mainRow.append(mainCol);

                    $("#flightResultDisplay").append(mainRow)


                }
                console.log(flightData);
            } else {

                console.log('Sorry No Flights Found');
            }
        })
    }
    getFlightByRoute(userInput)
});


// get info from firebase for input autocompletes
function dataBaseSetup() {
    var config = {
        apiKey: "AIzaSyCaBbxHqXrTLz2fGKLGqQoLplQY4LgdtmQ",
        authDomain: "flight-tracker-2018.firebaseapp.com",
        databaseURL: "https://flight-tracker-2018.firebaseio.com",
        projectId: "flight-tracker-2018",
        storageBucket: "flight-tracker-2018.appspot.com",
        messagingSenderId: "594780032348"
    };


    firebase.initializeApp(config);
    var database = firebase.database();

    var airlinesRef = database.ref('airlines')
    airlinesRef.on('value', gotDataAirline, error)
    var airportsRef = database.ref('airports')
    airportsRef.on('value', gotDataAirport, error)


    function gotDataAirline(data) {
        airlines = data.val().airlines;
        for (airline in airlines) {
            if (airlines[airline].icao) {
                airlineComp[`${airlines[airline].name}`] =
                    `http://pics.avs.io/450/450/${airlines[airline].iata}.png`
            } else {
                airlineComp[`${airlines[airline].name}`] = ''
            }
        }
        // alert('Airlines have been loaded')
        console.log('Airlines have been loaded')
    }

    function gotDataAirport(data) {
        airports = data.val().airports;
        for (airport in airports) {
            if (airports[airport].classification == 1 || airports[airport].classification == 2 || airports[
                    airport].classification == 3) {
                airportNames[`${airports[airport].name}`] =
                    `http://www.countryflags.io/${airports[airport].countryCode}/flat/64.png`
            }
        }
    }


    function error(error) {
        console.log('Error!')
    }
}
dataBaseSetup()


// arrival inputs
$("#arrival-airport").on('click', function () {
    $('input.arrival-airport-autocomplete-input').autocomplete({
        data: airportNames
    });
})
$('.arrival-airport-autocomplete-input').on('change', function () {
    for (airport in airports) {
        if (airports[airport].name === $(this).val()) {
            userInput['arrivalAirportCode'] = airports[airport].fs
        }
    }
    console.log(userInput)
})


// departure inputs
$("#departure-airport").on('click', function () {
    $('input.departure-airport-autocomplete-input').autocomplete({
        data: airportNames
    });
})
$('.departure-airport-autocomplete-input').on('change', function () {
    for (airport in airports) {
        if (airports[airport].name === $(this).val()) {
            userInput['departureAirportCode'] = airports[airport].fs
        }
    }
    console.log(userInput)
})



// date input
$('.date-input').on('change', function () {
    var dateString = String($(this).val());
    var newchar = '/'
    mystring = dateString.split('-').join(newchar);
    console.log(mystring);
    userInput['date'] = mystring;
})




// lyft button logic
var OPTIONS = {
    scriptSrc: 'assets/javascript/lyftWebButton.min.js',
    namespace: 'RCB Airport App',
    clientId: 'lkwXvq-kX5kH',
    clientToken: 'shY3pwJvuJ880BsTNKvzH+G8cd7SJwc/dwvcoiF2iVAvUCb8JnLz856RvxOIDvSyeaxBtmhYRfLgQ0cMB8zvV2tn7O7kkoWfuu/XtsgiCXArJJC/hCucQuQ=',
    location: {
        pickup: {},
        destination: {
            address: selectedFlightAddress
        },
    },
    parentElement: document.getElementById('lyft-web-button-parent'),
    queryParams: {
        credits: ''
    },
};
(function (t) {
    var n = this.window,
        e = this.document;
    n.lyftInstanceIndex = n.lyftInstanceIndex || 0;
    var a = t.parentElement,
        c = e.createElement("script");
    c.async = !0, c.onload = function () {
        n.lyftInstanceIndex++;
        var e = t.namespace ? "lyftWebButton" + t.namespace + n.lyftInstanceIndex : "lyftWebButton" + n
            .lyftInstanceIndex;
        n[e] = n.lyftWebButton, t.objectName = e, n[e].initialize(t)
    }, c.src = t.scriptSrc, a.insertBefore(c, a.childNodes[0])
}).call(this,
    OPTIONS);


// flight selector
$(document).on("click", "#cardButton",function(event){
    var finderIndex = event.currentTarget.childNodes[0].id

    
    function getAirline(carrierCode) {
        for (airline in appendixSave.airlines) {
            if (carrierCode == appendixSave.airlines[airline].fs) {
                var flightAirline = appendixSave.airlines[airline].name;
            }
        }
        return flightAirline;
    }
    
    
    flightArray[finderIndex].arrivalTimeLocal = moment(flightArray[finderIndex].arrivalTime).format(
        'HH:mm:ss');
        flightArray[finderIndex].currentTimeLocal = moment().format(
            'HH:mm:ss');
            flightArray[finderIndex].flightAirline = getAirline(flightArray[finderIndex].carrierFsCode);
            flightArray[finderIndex].arivalAirportAdress = appendixSave.airports[0].street1;
            flightArray[finderIndex].airportName = appendixSave.airports[0].name;
    selectedFlightAddress = flightArray[finderIndex].airportName ;

    var mainRow = $("<div>")
    mainRow.attr("class", "row")

    var mainCol = $("<div>");
    mainCol.attr("class", "col s12");

    var mainCard = $("<div>");
    mainCard.attr("class", "card grey lighten-4");

    var cardContent = $("<div>");
    cardContent.attr("class", "card-content red-text");

    var cardTitle = $("<span>");
    cardTitle.attr("class", "card-title");
    cardTitle.text(flightArray[finderIndex].airportName + "  #" + flightArray[finderIndex].flightNumber);
    var mapDiv = $("<div>");
    mapDiv.attr("class", "container-fluid");
    var mapRow = $("<div>");
    mapRow.attr("class","row");
    mapRow.attr("id", "mapRow");
    mapRow.css("display", "none");


    var mapCol = $("<div>");
    mapCol.attr("class", "col l6")
    mapCol.attr("id", "mapDisplay");

    var directionsCol = $("<div>");
    directionsCol.attr("class", "col l6")
    directionsCol.attr("id", "directionsDisplay");

    mapRow.append(mapCol,directionsCol);
    mapDiv.append(mapRow);

    var cardCenter = $("<div>");
    var arrivalTime = $("<div>");
    arrivalTime.text("Arrival:  " + flightArray[finderIndex].arrivalTimeLocal);
    var departTime = $("<div>");
    departTime.text("Depature:  " + flightArray[finderIndex].currentTimeLocal);


    var airlineDiv = $("<div>");
    airlineDiv.text(flightArray[finderIndex].flightAirline)

    var arrivalAirport = $("<div>");
    arrivalAirport.text(flightArray[finderIndex].arivalAirportAdress + " -terminal: " + flightArray[finderIndex].arrivalTerminal);

    var flightNumDiv = $("<div>");
    flightNumDiv.text(flightArray[finderIndex].flightNumber)

    var cardAction = $("<div>");
    cardAction.attr("class", "card-action red lighten-1")
    cardCenter.append(airlineDiv, arrivalAirport, arrivalTime, departTime, mapDiv);

    cardContent.append(cardTitle, cardCenter);
    mainCard.append(cardContent, cardAction);
    mainCol.append(mainCard);

    mainRow.append(mainCol);

    $("#flightResultDisplay").html(mainRow)
    $("#buttonRow").css("display","block")
})




// gooogle maps api
var directionsDisplay = new google.maps.DirectionsRenderer;
var directionsService = new google.maps.DirectionsService;

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
       var currentLocation = prompt("What is you current location?")
    directionsService.route({
        origin: currentLocation,
        destination: selectedFlightAddress,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

$(document).on("click", "#googleButton", function(){
$("#mapRow").css("display","block")
        var map = new google.maps.Map(document.getElementById('mapDisplay'), {
            zoom: 7,
            center: { lat: 41.85, lng: -87.65 }
        });
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('directionsDisplay'));


    calculateAndDisplayRoute(directionsService, directionsDisplay);
        
});
        