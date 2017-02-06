document.getElementById("but").style.fontSize = "8px";

var logos = document.getElementById("logo");
logos.style.display = "none";

document.getElementById("but").style.color ="yellow";

document.getElementById("but").style.background="purple";

function addElement(){
    var parent = document.createElement("div");
    parent.id = "logo";
    parent.classList.add("img");
    parent.innerHTML = "Hello Snowman";
    document.body.appendChild(parent);
}

function mDown(obj){
    obj.style.backgroundColor = "turquoise";
    obj.innerHTML = "Release Me"
}

function mHover(obj){
    obj.style.backgroundColor = "red";
}

function mOver(obj){
    obj.style.backgroundColor ="pink";
    obj.innerHTML = "Haha"
}

changeBackgroundColor("but1", "purple");
changeBackgroundColor("but2","blue");

function changeBackgroundColor(id, color) {
    var currentId = document.getElementById(id);
    currentId.style.backgroundColor = color;
}

changeText();

function changeText(){
    var h1List = document.getElementsByTagName("H1");
    console.log(h1List.length);
    h1List[0].innerHTML = "See you again";
}

