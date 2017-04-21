'use strict';

const Hapi = require('hapi');
const Blipp = require('blipp');
const Vision = require('vision');
const Inert = require('inert');
const Path = require('path');
const Handlebars = require('handlebars');
const fs = require("fs");
const Sequelize = require('sequelize');
const Fetch = require("node-fetch");
const FormData = require("form-data");

var PlaceAutocomplete = require("./lib/PlaceAutocomplete.js");
var googleplaces = require('googleplaces');
var config = require("./config.js");
var TextSearch = require("./lib/TextSearch.js");
var textSearch = new TextSearch(config.apiKey, config.outputFormat);
var GooglePlaces = require("./index.js");
var googlePlaces = new GooglePlaces(config.apiKey, config.outputFormat);
var placeAutocomplete = new PlaceAutocomplete(config.apiKey, config.outputFormat);


const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});

server.connection({
    host: "localhost",
    port: 3000
});


var sequelize = new Sequelize('db', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    // SQLite only
    storage: 'db.sqlite'
});


var Trip = sequelize.define('trip', {
    tripName: {
        type: Sequelize.STRING
    },
    destination: {
        type: Sequelize.STRING
    },
    startdate: {
        type: Sequelize.DATEONLY
    },
    enddate: {
        type: Sequelize.DATEONLY
    },
});


server.register([Blipp, Inert, Vision], () => {});

server.views({
    engines: {
        html: Handlebars
    },
    path: 'views',
    layoutPath: 'views/layout',
    layout: 'layout',
    helpersPath: 'views/helpers',
    //partialsPath: 'views/partials'
});


server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: {
            template: 'index'
        }
    }
});


server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './',
            listing: false,
            index: false
        }
    }
});

server.route({
    method: 'GET',
    path: '/createDB',
    handler: function (request, reply) {
        // force: true will drop the table if it already exists
        Trip.sync({
            force: true
        })
        reply("Database Created")
    }
});

server.route({

    method: 'POST',
    path: '/add',
    handler: function (request, reply) {
        var formresponse = JSON.stringify(request.payload);
        var parsing = JSON.parse(formresponse);
        //console.log(parsing);

        Trip.create(parsing).then(function (currentTrip) {
            Trip.sync();
            console.log("...syncing");
            console.log(currentTrip);
            return (currentTrip);
        }).then(function (currentTrip) {

            reply().redirect("/displayAll");

        });
    }
});


server.route({
    method: 'GET',
    path: '/destroyAll',
    handler: function (request, reply) {

        Trip.drop();

        reply("destroy all");
    }
});


server.route({
    method: 'GET',
    path: '/createTrip',
    handler: {
        view: {
            template: 'createTrip'
        }
    }
});


server.route({

    method: 'POST',
    path: '/formTrip',
    handler: function (request, reply) {
        var formresponse = JSON.stringify(request.payload);
        var parsing = JSON.parse(formresponse);
        //var days=Days.daysBetween(startdate, enddate).getDays();

        //console.log(parsing);

        var d1 = new Date(parsing.startdate);
        var d2 = new Date(parsing.enddate);

        //        //Get 1 day in milliseconds
        var one_day = 1000 * 60 * 60 * 24;
        //
        //        // Convert both dates to milliseconds
        var date1_ms = d1.getTime();
        var date2_ms = d2.getTime();
        //
        //        // Calculate the difference in milliseconds
        var difference_ms = date2_ms - date1_ms;
        //
        //        // Convert back to days and return
        var days = Math.ceil(difference_ms / one_day);

        console.log("Number of days: " + days);
        //        
        // parsing["days"] = days;

        /*--------------------------------------------------------------------------------------------*/

        //google place api

        var destination = request.payload.destination;
        var search = "point_of_interest in " + destination;

        googlePlaces.textSearch({
            query: destination
        }, function (error, response) {

            if (response) {
                //console.log("place: "+JSON.stringify(response.results[0].geometry.location) + '\n');
                //console.log('res=' + JSON.stringify(response));
                var loc = [response.results[0].geometry.location.lat, response.results[0].geometry.location.lng];


                var parameters = {
                    query: search,
                    location: loc,
                    radius: 50000

                };
                var results = [];
                googlePlaces.textSearch(parameters, function (error, response) {

                    if (response) {
                        //                        results = response.results.slice(0, 7);

                        parameters.query = "restuarant";
                        googlePlaces.textSearch(parameters, function (error, response) {

                            if (response) {
                                results = results.concat(response.results.slice(0, 2));

                                results.forEach(function (d) {

                                    var restaurant1 = {
                                        name: response.results[0].name,
                                        address: response.results[0].formatted_address,
                                        rating: response.results[0].rating,
                                        photo: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + d.photos[0].photo_reference + '&key=' + config.apiKey
                                    }

                                    var restaurant2 = {
                                        name: response.results[1].name,
                                        address: response.results[1].formatted_address,
                                        rating: response.results[1].rating,
                                        photo: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + d.photos[1].photo_reference + '&key=' + config.apiKey
                                    }

                                    //                                    console.log(d.name + '\n');
                                    //                                    console.log(d.formatted_address + '\n');
                                    //                                    console.log(d.rating + '\n'); console.log("https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + d.photos[0].photo_reference + '&key=' + config.apiKey);
                                });
                            }
                        });

                        parameters.query = "park";
                        googlePlaces.textSearch(parameters, function (error, response) {

                            if (response) {
                                results = results.concat(response.results.slice(0, 2));

                                results.forEach(function (info) {
                                    
                                    var park1 = {
                                        name: response.results[0].name,
                                        address: response.results[0].formatted_address,
                                        rating: response.results[0].rating,
                                        photo: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + d.photos[0].photo_reference + '&key=' + config.apiKey
                                    }

                                    var park2 = {
                                        name: response.results[1].name,
                                        address: response.results[1].formatted_address,
                                        rating: response.results[1].rating,
                                        photo: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + d.photos[1].photo_reference + '&key=' + config.apiKey
                                    }
                                    //                                    console.log(info.name + '\n');
                                    //                                    console.log(info.formatted_address + '\n');
                                    //                                    console.log(info.rating + '\n'); console.log("https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + info.photos[0].photo_reference + '&key=' + config.apiKey);
                                });
                            }
                        });
                    }
                });
            }
        });


        //end google place api


        Trip.create(parsing).then(function (currentTrip) {
            Trip.sync();
            console.log("...syncing");
            console.log(currentTrip);
            return (currentTrip);
        }).then(function (currentTrip) {
            currentTrip["days"] = days;
            currentTrip["restaurant1"] = restaurant1;
            currentTrip["restaurant2"] = restaurant2;
            currentTrip["park2"] = park2;
            currentTrip["park1"] = park1;
            reply.view('formresponse', {
                formresponse: currentTrip
            });
        });
    }
});

//findAll returns an array of users, Uses helper to loop through array

server.route({
    method: 'GET',
    path: '/displayAll',
    handler: function (request, reply) {
        Trip.findAll().then(function (users) {
            // projects will be an array of all User instances
            //console.log(users[0].tripName);
            var allUsers = JSON.stringify(users);
            reply.view('dbresponse', {
                dbresponse: allUsers
            });
        });
    }
});



//Find returns one user

server.route({
    method: 'GET',
    path: '/find/{tripName}',
    handler: function (request, reply) {
        Trip.findOne({
            where: {
                tripName: encodeURIComponent(request.params.tripName),
            }
        }).then(function (user) {
            var currentUser = "";
            currentUser = JSON.stringify(user);
            //console.log(currentUser);
            currentUser = JSON.parse(currentUser);
            console.log(currentUser);
            reply.view('find', {
                dbresponse: currentUser
            });

        });
    }
});


server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);

});









//var a = {
//    "formatted_address": "Seaview Commercial Building, 21-24 Connaught Rd W, Hong Kong",
//    "geometry": {
//        "location": {
//            "lat": 22.28777729999999,
//            "lng": 114.1491572
//        },
//        "viewport": {
//            "northeast": {
//                "lat": 22.2891262802915,
//                "lng": 114.1505061802915
//            },
//            "southwest": {
//                "lat": 22.28642831970849,
//                "lng": 114.1478082197085
//            }
//        }
//    },
//    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png",
//    "id": "ff8d6936781a6b7106d7d6bcbf234ebd9677a16b",
//    "name": "Fung Shing Restaurant",
//    "opening_hours": {
//        "open_now": false,
//        "weekday_text": []
//    },
//    "photos": [{
//        "height": 2448,
//        "html_attributions": ["<a href=\"https://maps.google.com/maps/contrib/102111242712363729138/photos\">Charles Chau</a>"],
//        "photo_reference": "CoQBdwAAAPGmLn_IiCdze2DyotCQl6LGRNEJAu-V5Sly_VvJ_kCXEuqTs6GtF8S2RzRUZJhR_IaympWXbK3kq1duP7JY_RqOIBqGQVoGNaU2go8R7P-w1HlqLkM-yuh5LNaOAAMbEMydy5QYSGwleHgCwz_oF2iYoXQHdHekWYFaHw7alse8EhAXZkrD0mG05T2Ms68JXAC_GhQvH1G3FwtPw2qXe1eD-2JB9Y5F8w",
//        "width": 3264
//            }],
//    "place_id": "ChIJp4Bk1n0ABDQRZmMHq1rwIOQ",
//    "rating": 3.1,
//    "reference": "CmRSAAAAAbRruYrkpj7h4RE-oddjOgQEJk0rTKQ2G5tbvddicG-ouNTNWt4quLR3ATR5ObYsNFaccXv-MTFevQ53VjfvcvziVvEhLP_dyL8Xx6Hb93zvtm71eDvyOqdisSGECylbEhDtYYGRYOoIdVbgQJQ_vZdbGhQvFvpZaYDQ75ztGJOXBlZsSwHQLQ",
//    "types": ["restaurant", "food", "point_of_interest", "establishment"]
//}