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
    host:"localhost",
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


var Monster = sequelize.define('monster', {
    monsterName: {
        type: Sequelize.STRING
    },
    quarters: {
        type: Sequelize.STRING
    },
    weapon: {
        type: Sequelize.STRING
    },
    message: {
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
        Monster.sync({
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

        Monster.create(parsing).then(function (currentMonster) {
            Monster.sync();
            console.log("...syncing");
            console.log(currentMonster);
            return (currentMonster);
        }).then(function (currentMonster) {

            reply().redirect("/displayAll");

        });
    }
});


server.route({
    method: 'GET',
    path: '/destroyAll',
    handler: function (request, reply) {

        Monster.drop();

        reply("destroy all");
    }
});

server.route({
    method: 'GET',
    path: '/delete/{id}',
    handler: function (request, reply) {


        Monster.destroy({
            where: {
                id: encodeURIComponent(request.params.id)
            }
        });

        reply().redirect("/displayAll");
    }
});


server.route({
    method: 'GET',
    path: '/update/{id}',
    handler: function (request, reply) {
        var id = encodeURIComponent(request.params.id);


        reply.view('updatemonster', {
            routeId: id
        });
    }

});


server.route({
    method: 'POST',
    path: '/update/{id}',
    handler: function (request, reply) {
        var id = encodeURIComponent(request.params.id);
        var formresponse = JSON.stringify(request.payload);
        var parsing = JSON.parse(formresponse);
        //console.log(parsing);

        Monster.update(parsing, {
            where: {
                id: id
            }
        });

        reply().redirect("/displayAll");

    }

});


server.route({
    method: 'GET',
    path: '/createMonster',
    handler: {
        view: {
            template: 'createmonster'
        }
    }
});

server.route({

    method: 'POST',
    path: '/formMonster',
    handler: function (request, reply) {
        var formresponse = JSON.stringify(request.payload);
        var parsing = JSON.parse(formresponse);
        //console.log(parsing);

        Monster.create(parsing).then(function (currentMonster) {
            Monster.sync();
            console.log("...syncing");
            console.log(currentMonster);
            return (currentMonster);
        }).then(function (currentMonster) {

            reply.view('formresponse', {
                formresponse: currentMonster
            });
        });
    }
});

//findAll returns an array of users, Uses helper to loop through array

server.route({
    method: 'GET',
    path: '/displayAll',
    handler: function (request, reply) {
        Monster.findAll().then(function (users) {
            // projects will be an array of all User instances
            //console.log(users[0].monsterName);
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
    path: '/find/{monsterName}',
    handler: function (request, reply) {
        Monster.findOne({
            where: {
                monsterName: encodeURIComponent(request.params.monsterName),
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

server.route({
    method: 'GET',
    path: '/countColumn/{column}',
    handler: function (request, reply) {
        var types = {};
        var column = encodeURIComponent(request.params.column);
        Monster.findAll().then(function (monsters) {
            for (var monsterIndex in monsters) {
                var currentValue = monsters[monsterIndex][column];
                console.log(currentValue);
                var inList = 0;
                for (var typesKey in types) {
                    if (currentValue == typesKey) {
                        inList = 1;
                    }
                }
                if (inList == 0) {
                    types[currentValue] = 0;
                    types[currentValue]++;
                } else {
                    types[currentValue]++;
                }

            }
            return types;
        }).then(function (types) {
            console.log(types);
            reply(types);
        });
    }

});



server.route({
    method: 'GET',
    path: '/findAll/{column}/{values}',
    handler: function (request, reply) {
        var column = encodeURIComponent(request.params.column);
        var value = encodeURIComponent(request.params.values);
        var searching = {};
        searching[column] = value;
        Monster.findAll({
            where: searching

        }).then(function (allUsers) {
            console.log("number of items: " + allUsers.length);
            reply(allUsers.length);
        });
    }
});

server.route({
    method: 'GET',
    path: '/count/{column}/{values}',
    handler: function (request, reply) {
        var column = encodeURIComponent(request.params.column);
        var value = encodeURIComponent(request.params.values);
        var searching = {};
        searching[column] = value;
        Monster.count({
            where: searching
        }).then(function (count) {
            console.log(count);
            reply(count);
        });
    }
});

//Output

server.route({
    method: 'GET',
    path: '/p5example',
    handler: function (request, reply) {

        reply.view('p5example', null, {
            layout: 'none'
        });

    }
});

server.route({
    method: 'GET',
    path: '/barChart',
    handler: function (request, reply) {

        reply.view('barchart', null, {
            layout: 'none'
        });

    }
});


server.route({
    method: 'GET',
    path: '/pieChart',
    handler: function (request, reply) {

        reply.view('piechart', null, {
            layout: 'none'
        });

    }
});



//Utilities

server.route({

    method: 'GET',
    path: '/populate/{amount}',
    handler: function (request, reply) {
        var amount = encodeURIComponent(request.params.amount);
        amount = parseInt(amount);
        var currentMN = "monster";
        var quarters = ["cave", "dungeon", "forest", "closets"];
        var weapons = ["club", "claws", "ducky"];
        var message = "I am in the middle of eating...";

        for (var i = 0; i < amount; i++) {
            var currentM = {
                monsterName: currentMN + i,
                quarters: quarters[Math.floor(Math.random() * quarters.length)],
                weapon: weapons[Math.floor(Math.random() * weapons.length)],
                message: message
            }

            Monster.create(currentM).then(function (currentMonster) {
                Monster.sync();
                console.log("...syncing");
                console.log(currentMonster);
                return (currentMonster);
            });

        }

        reply().redirect("/displayAll");

    }
});



server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);

});
