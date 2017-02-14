'use strict';

const Hapi = require('hapi');
const Blipp = require('blipp');
const Vision = require('vision');
const Inert = require('inert');
const Path = require('path');
const Handlebars = require('handlebars');

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

server.register([Blipp, Inert, Vision], () => {});

server.views({
    engines: {
        html: Handlebars
    },
    path: 'views',
    layoutPath: 'views/layout',
    layout: 'layout',
    helpersPath: 'views/helpers'
        //partialsPath: 'views/partials'
});



server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: {
            template: 'index',
            context: {
                title: "Snowman's Adventure",
                menu: [
                    {
                        item: 'Grizzly'
                    },
                    {
                        item: 'Panda'
                    },
                    {
                        item: 'IceBear'
                    }
                    ],
                message: 'On a Winter Morning, snowman played in the forest. Walking, he was stopped by ....'
            }
        }
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './',
            listing: true,
            index: false,
            redirectToSlash: true
        }
    }
});


server.route({
    method: 'GET',
    path: '/dynamic',
    handler: {
        view: {
            template: 'dynamic',
            context: {
                title: "Snowman's Adventure",
                message: 'On a Winter Morning, snowman played in the forest. Walking, he was stopped by ....',
                nav: [
                    {
                        url: "/page2/grizzly",
                        title: "Grizzly"
                    },
                    {
                        url: "/page2/panda",
                        title: "Panda"
                    },
                    {
                        url: "/page2/icebear",
                        title: "IceBear"
                    }
                ]
            }

            //
        }
    }
});

server.route({
    method: 'GET',
    path: '/page2/{played*}',
    handler: function (request, reply) {

        var played = encodeURIComponent(request.params.played);
        var message = "with " + played;


        reply.view('page2', {
            title: "Snowman's Adventure",
            message: message,
            pic: played,
            nav: [
                    {
                        url: "/page3/icecream",
                        title: "Ice Cream"
                    },
                    {
                        url: "/page3/cake",
                        title: "Cake"
                    },
                    {
                        url: "/page3/pizza",
                        title: "Pizza"
                    }
                ]

        });
    }
});


server.route({
    method: 'GET',
    path: '/page3/{played*}',
    handler: function (request, reply) {
         var played = encodeURIComponent(request.params.played);
        var message = "and ate " + played ;
        reply.view('page2', {
            title: "Snowman's Adventure",
            message: message,
            pic: played

        });
    }
});

server.route({
    method: 'GET',
    path: '/basicHandler',
    handler: {
        view:{
            template: 'basic',
            context: {
               title: "Basic Handler",
                message: "More information"
            }

        }
    }
});


server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);

});
