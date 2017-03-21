var quartersImg = {
    "cave": null,
    "dungeon": null,
    "closet": null,
    "forest": null


};

var currentSelection = "cave";

var amount = 0;

var columns = 10;

function setup() {
    createCanvas(1000, 1000);
    quartersImg["cave"] = loadImage("p5/assets/cave.jpg");
    quartersImg["dungeon"] = loadImage("p5/assets/dungeon.jpg");
    quartersImg["closet"] = loadImage("p5/assets/closet.jpg");
    quartersImg["forest"] = loadImage("p5/assets/forest.jpg");

    caveButton = createButton('Cave');
    caveButton.position(10, 10);
    caveButton.mousePressed(cave);

    dungeonButton = createButton('Dungeon');
    dungeonButton.position(100, 10);
    dungeonButton.mousePressed(dungeon);

    closetButton = createButton('Closet');
    closetButton.position(200, 10);
    closetButton.mousePressed(closet);

    forestButton = createButton('Forest');
    forestButton.position(300, 10);
    forestButton.mousePressed(forest);



}

function draw() {
    background(255);
    textSize(24);
    text(currentSelection.toUpperCase(), 10, 75);
    for (var i = 0; i < amount; i++) {
        var row = int(i / columns);
        var column = i % columns;
        console.log(column);
        image(quartersImg[currentSelection], 10 + (column * 100), (row * 100) + 100);
    }

}


function cave() {
    currentSelection = "cave";

    fetch('http://localhost:3000/count/quarters/cave')
        .then(function (response) {
            //console.log(response);
            return response.text();
        }).then(function (text) {
            console.log(text);
            amount = parseInt(text);
        });
}

function dungeon() {
    currentSelection = "dungeon";
    fetch('http://localhost:3000/count/quarters/dungeon')
        .then(function (response) {
            //console.log(response);
            return response.text();
        }).then(function (text) {
            console.log(text);
            amount = parseInt(text);
        });
}

function closet() {
    currentSelection = "closet";
    fetch('http://localhost:3000/count/quarters/closets')
        .then(function (response) {
            //console.log(response);
            return response.text();
        }).then(function (text) {
            console.log(text);
            amount = parseInt(text);
        });
}

function forest() {
    currentSelection = "forest";
    fetch('http://localhost:3000/count/quarters/forest')
        .then(function (response) {
            //console.log(response);
            return response.text();
        }).then(function (text) {
            console.log(text);
            amount = parseInt(text);
        });
}
