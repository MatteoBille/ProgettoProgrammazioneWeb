//fetch("api/books/").then(response=>response.json()).then(data=>console.log(data));

var map = L.map('map').setView([45.624029, 13.789859], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //maxZoom: 18,
    id: 'mapbox/streets-v11',
    //tileSize: 512,
    //zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiYmlsbG85NyIsImEiOiJja3d3Y2V5MGEwMjc5MnZwOGFtdjFxMnV0In0.5Fa8yODvSDsZ1b73O-CwRQ'
}).addTo(map);

let polyline={
    coordinates:[]
};


function onMapClick(e) {
    

    polyline.coordinates.push(e.latlng);
    let tr= document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerHTML=e.latlng["lat"];
    let td2 = document.createElement("td");
    td2.innerHTML=e.latlng["lng"];

    let table = document.querySelector("table");
    tr.appendChild(td1);
    tr.appendChild(td2);
    table.appendChild(tr);


    drawPolyline();
}

function drawPolyline(){
    console.log(polyline);
    L.polyline(polyline)
    let line = L.polyline(polyline.coordinates, {color: 'red'}).addTo(map);
}
map.on('click', onMapClick);