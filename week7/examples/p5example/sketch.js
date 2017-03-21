var quartersImg = {
    "cave": null,
    "dungeon": null,
    "closet": null,
    "forest": null


};

var currentSelection = "cave";

var amount = 11;

var columns = 10;

function setup() {
    createCanvas(1000, 1000);
    quartersImg["cave"] = loadImage("assets/cave.jpg");
    quartersImg["dungeon"] = loadImage("assets/dungeon.jpg");
    quartersImg["closet"] = loadImage("assets/closet.jpg");
    quartersImg["forest"] = loadImage("assets/forest.jpg");

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
}

function dungeon() {
    currentSelection = "dungeon";
}

function closet() {
    currentSelection = "closet";
}

function forest() {
    currentSelection = "forest";
}
