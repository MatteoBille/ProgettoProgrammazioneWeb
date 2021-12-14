var map = L.map('map').setView([45.624029, 13.789859], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  //maxZoom: 18,
  id: 'mapbox/streets-v11',
  //tileSize: 512,
  //zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiYmlsbG85NyIsImEiOiJja3d3Y2V5MGEwMjc5MnZwOGFtdjFxMnV0In0.5Fa8yODvSDsZ1b73O-CwRQ'
}).addTo(map);

var vm = new Vue({
  el: '#elenco-viaggi-giornata',
  data: {
    /*viaggi: [{
      "id": "1",
      "nome": "viaggio1",
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": { "selected": "no" },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                13.78509521484375,
                45.64092778836502
              ],
              [
                13.7933349609375,
                45.79050946752472
              ],
              [
                13.596954345703125,
                45.79816953017265
              ],
              [
                13.981475830078125,
                45.868018964152476
              ],
              [
                14.02130126953125,
                45.70234306798271
              ],
              [
                13.868865966796875,
                45.79529713006591
              ],
              [
                13.904571533203125,
                45.57175504130605
              ],
              [
                13.96636962890625,
                45.612116176517304
              ]
            ]
          }
        }
      ]
    }, {
      "id": "2",
      "nome": "viaggio2",
      "type": "FeatureCollection",
      "features": [
        {

          "type": "Feature",
          "properties": { "selected": "no" },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                13.591461181640623,
                45.82879925192134
              ],
              [
                13.860626220703125,
                45.95496879511337
              ],
              [
                14.1558837890625,
                45.87853662114514
              ],
              [
                14.308319091796875,
                45.71001523943372
              ],
              [
                14.394836425781248,
                45.81922927350269
              ],
              [
                14.150390625,
                45.9874205909687
              ],
              [
                13.98284912109375,
                45.73206686696598
              ],
              [
                14.32342529296875,
                45.508271755944975
              ],
              [
                14.478607177734373,
                45.706179285330855
              ]
            ]
          }
        }
      ]
    }]*/
    viaggi:[]
  },
  methods: {
    mostraTappe(event, id) {
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "none";
      divTappe = document.getElementById("elenco-tappe-viaggio");
      divTappe.style.display = "block";
      Titolo = document.querySelector("#elenco-tappe-viaggio-titolo h3");
      console.log(Titolo);
      Titolo.innerHTML = `VIAGGIO ID ${id}`;
    },
    aggiungiViaggio() {
      id = this.viaggi.length;
      id = this.viaggi[id - 1].id + 1;
      this.viaggi.push({ id: id, nome: `viaggio${id}` });
    },
    eliminaViaggio(event, id) {
      this.viaggi = this.viaggi.filter(function (value) {
        console.log(value.id + "  " + id);
        return value.id !== id;
      });
      this.disegnaViaggio();
    },
    disegnaViaggio() {
      this.viaggi.forEach(function (viaggio) {
        L.geoJSON(viaggio, {
          style: function (viaggio) {
            //console.log(viaggio.properties.selected);
            switch (viaggio.properties.selected) {
              case 'no': return { color: "#ff0000" };
              case 'yes': return { color: "#0000ff" };
            }
          }
        }).addTo(map);
      });
    },
    EvidenziaViaggio(event,id){
      
      this.viaggi.forEach(function (viaggio) {
        console.log("value.id"+" -> "+viaggio.id);
        console.log("id"+" -> "+id);
        if(viaggio.id === id){
          viaggio.features[0].properties.selected="yes";
        }else{
          viaggio.features[0].properties.selected="no";
        }
        console.log(viaggio.features[0].properties.selected);
      });
      
      this.disegnaViaggio();
    },
    retrieveData(){
      let response = fetch('http://localhost:8080/BilleMatteoProgettoEsame/api/viaggi')
      .then((response)=>response.json())
      .then((data)=>{
        this.viaggi=data;
        this.disegnaViaggio();
      });
      console.log(this.viaggi);

    }
  },
    mounted() {
      this.retrieveData()
    }
});

var vm = new Vue({
  el: '#elenco-tappe-viaggio',
  data: {
    tappe: [{ id: 1, nome: "tappa1" }, { id: 2, nome: "tappa2" }, { id: 3, nome: "tappa3" }, { id: 4, nome: "tappa4" }, { id: 5, nome: "tappa5" }, { id: 6, nome: "tappa6" }]
  },
  methods: {
    tornaAViaggi() {
      divTappe = document.getElementById("elenco-tappe-viaggio");
      divTappe.style.display = "none";
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "block";
    }
  }
});



