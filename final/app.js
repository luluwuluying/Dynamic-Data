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
//const pg = require("pg");

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

var sequelize;


server.connection({
    port: (process.env.PORT || 3000)
});


if (process.env.DATABASE_URL) {
    // the application is executed on Heroku ... use the postgres database
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: true //false
    })
} else {
    sequelize = new Sequelize('db', 'username', 'password', {
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
}

   


var Trip = sequelize.define('trip', {
    tripName: {
        type: Sequelize.STRING
    },
    destination: {
        type: Sequelize.STRING
    },
    restaurant1: {
        type: Sequelize.STRING
    },
    restaurant2: {
        type: Sequelize.STRING
    },
    random1: {
        type: Sequelize.STRING
    },
    random2: {
        type: Sequelize.STRING
    },
    random3: {
        type: Sequelize.STRING
    },
    random4: {
        type: Sequelize.STRING
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
            template: 'createTrip'
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

        /*-----------------------------------------------------------------------------------*/

        //google place api

        var destination = request.payload.destination;
        var tripName = request.payload.tripName;
        var restaurant1 = [];
        var restaurant2 = [];
        var random1 = [];
        var random2 = [];
        var random3 = [];
        var random4 = [];

        var queryList = ["museum", "park", "church"];

        var prevQueryNum = 0;

        var currentTrip = {};

        googlePlaces.textSearch({
            query: destination
        }, function (error, response) {

            if (response) {
                //console.log("place: "+JSON.stringify(response.results[0].geometry.location) + '\n');
                //console.log('res=' + JSON.stringify(response));
                
                currentTrip["destination"] = destination;
                currentTrip["tripName"] = tripName;

                var loc = [response.results[0].geometry.location.lat, response.results[0].geometry.location.lng];


                var parameters = {
                    query: "",
                    location: loc,
                    radius: 500

                };
                //var results = [];

                //search restaurant 1 and 2

                parameters["query"] = "restaurant";

                googlePlaces.textSearch(parameters, function (error, response) {

                    if (response) {

                        var randChoice = parseInt(Math.floor((Math.random() * response.results.length) + 1));

                        if (randChoice < 1) {
                            randChoice = 2;
                        }
                        var results = [];
                        results = results.concat(response.results.slice(randChoice - 2, randChoice));

                        restaurant1 = {
                            name: results[0].name,
                            address: results[0].formatted_address,
                            rating: results[0].rating,
                        }

                        restaurant2 = {
                            name: results[1].name,
                            address: results[1].formatted_address,
                            rating: results[1].rating,
                        }

                        //                        console.log(restaurant1);
                        //                        console.log(restaurant2);

                        currentTrip["restaurant1"] = restaurant1;
                        currentTrip["restaurant2"] = restaurant2;

                        //search random1

                        var randomQueryList = parseInt(Math.floor((Math.random() * queryList.length)));

                        prevQueryNum = randomQueryList;

                        parameters["query"] = queryList[randomQueryList];
                        console.log(queryList[randomQueryList]);

                        googlePlaces.textSearch(parameters, function (error, response) {

                            if (response) {

                                //                       console.log(response.results.length);
                                var randChoice = parseInt(Math.floor((Math.random() * response.results.length)));
                                console.log(randChoice);

                                var results1 = [];
                                results1 = results1.concat(response.results.slice(randChoice - 1, randChoice));
                                //console.log(results[0]);

                                random1 = {
                                    name: results1[0].name,
                                    address: results1[0].formatted_address,
                                    rating: results1[0].rating,
                                }

                                //                        console.log(random1);

                                currentTrip["random1"] = random1;

                                //search random2

                                while (randomQueryList == prevQueryNum) {
                                    randomQueryList = parseInt(Math.floor((Math.random() * queryList.length) + 1));
                                }

                                prevQueryNum = randomQueryList;

                                parameters["query"] = queryList[randomQueryList];
                                console.log(queryList[randomQueryList]);

                                googlePlaces.textSearch(parameters, function (error, response) {

                                    if (response) {

                                        var randChoice = parseInt(Math.floor((Math.random() * response.results.length)));
                                        console.log(randChoice);

                                        var results2 = [];
                                        results2 = results2.concat(response.results.slice(randChoice - 1, randChoice));

                                        random2 = {
                                                name: results2[0].name,
                                                address: results2[0].formatted_address,
                                                rating: results2[0].rating,
                                            }
                                            //                         console.log(random2);

                                        currentTrip["random2"] = random2;


                                        //search random3
                                        while (randomQueryList == prevQueryNum) {
                                            randomQueryList = parseInt(Math.floor((Math.random() * queryList.length)));
                                        }

                                        prevQueryNum = randomQueryList;

                                        parameters["query"] = queryList[randomQueryList];
                                        console.log(queryList[randomQueryList]);

                                        googlePlaces.textSearch(parameters, function (error, response) {

                                            if (response) {

                                                var randChoice = parseInt(Math.floor((Math.random() * response.results.length)));
                                                console.log(randChoice);

                                                var results3 = [];
                                                results3 = results3.concat(response.results.slice(randChoice - 1, randChoice));

                                                random3 = {
                                                        name: results3[0].name,
                                                        address: results3[0].formatted_address,
                                                        rating: results3[0].rating,
                                                    }
                                                    //                         console.log(random2);

                                                currentTrip["random3"] = random3;


                                                //search random4
                                                while (randomQueryList == prevQueryNum) {
                                                    randomQueryList = parseInt(Math.floor((Math.random() * queryList.length) + 1));
                                                }

                                                prevQueryNum = randomQueryList;

                                                parameters["query"] = queryList[randomQueryList];
                                                console.log(queryList[randomQueryList]);

                                                googlePlaces.textSearch(parameters, function (error, response) {

                                                    if (response) {

                                                        var randChoice = parseInt(Math.floor((Math.random() * response.results.length)));
                                                        console.log(randChoice);

                                                        var results4 = [];
                                                        results4 = results4.concat(response.results.slice(randChoice - 1, randChoice));

                                                        random4 = {
                                                                name: results4[0].name,
                                                                address: results4[0].formatted_address,
                                                                rating: results4[0].rating,
                                                            }
                                                            //                         console.log(random2);

                                                        currentTrip["random4"] = random4;

                                                        console.log(currentTrip);

                                                        reply.view('formresponse', {
                                                            formresponse: currentTrip
                                                        });


                                                    }

                                                });

                                            }

                                        });

                                    }

                                });

                            }
                        });


                    }
                });
            }
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