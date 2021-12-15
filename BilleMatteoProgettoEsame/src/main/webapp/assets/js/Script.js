var map = L.map("map").setView([45.624029, 13.789859], 13);
var geoJsonTemplate = {
  "features": [
      {
          "geometry": {
              "coordinates": [
              ],
              "type": "LineString"
          },
          "type": "Feature",
          "properties": {
              "selected": "no"
          }
      }
  ],
  "nome": "viaggio2",
  "type": "FeatureCollection"
};
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //maxZoom: 18,
    id: "mapbox/streets-v11",
    //tileSize: 512,
    //zoomOffset: -1,
    accessToken:
      "pk.eyJ1IjoiYmlsbG85NyIsImEiOiJja3d3Y2V5MGEwMjc5MnZwOGFtdjFxMnV0In0.5Fa8yODvSDsZ1b73O-CwRQ",
  }
).addTo(map);

let geoJsonLayer = L.geoJSON();

var ElencoViaggi = new Vue({
  el: "#elenco-viaggi-giornata",
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
    viaggi: [],
  },
  methods: {
    mostraTappe(event, id) {
      event.stopPropagation();
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "none";
      divTappe = document.getElementById("elenco-tappe-viaggio");
      divTappe.style.display = "block";
      Titolo = document.querySelector("#elenco-tappe-viaggio-titolo h3");
      console.log(Titolo);
      Titolo.innerHTML = `VIAGGIO ID ${id}`;
      console.log("mostra tappe()");
      this.pulisciMappa();
      ElencoTappe.retrieveData(id);
    },
    aggiungiViaggio(event) {
      console.log("aggiunta");
      id = this.viaggi.length;
      id = parseInt(this.viaggi[id - 1].id) + 1;
      let geoJsonNuovoViaggio = geoJsonTemplate;
      geoJsonNuovoViaggio.id = String(id);
      geoJsonNuovoViaggio.nome = "viaggio" + id;
      console.log(geoJsonNuovoViaggio);
      let response = fetch(
        "http://localhost:8080/BilleMatteoProgettoEsame/api/viaggi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(geoJsonNuovoViaggio),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          this.viaggi.push(data);
          this.mostraTappe(event, data.id);
        });
        console.log("aggiunta effettuata");
    },
    eliminaViaggio(event, id) {
      this.viaggi = this.viaggi.filter(function (value) {
        return value.id !== id;
      });
      this.disegnaViaggio();
    },
    disegnaViaggio() {
      geoJsonLayer = L.geoJSON();
      var myStyle = function (viaggio) {
        //console.log(viaggio.properties.selected);
        switch (viaggio.properties.selected) {
          case "no":
            return { color: "#1766EB", weight: 3 };
          case "yes":
            return { color: "#EB1F00", weight: 5 };
        }
      };
      console.log("1");
      geoJsonLayer.addData(this.viaggi).addTo(map);
      
      geoJsonLayer.eachLayer(function (layer) {
        console.log(layer);
        if(layer._latlngs.length!=0){
          layer.setStyle(myStyle(layer.feature));
        }
      });
    },
    EvidenziaViaggio(event, id) {
      console.log(event);
      this.viaggi.forEach(function (viaggio) {
        if (viaggio.id === id) {
          viaggio.features[0].properties.selected = "yes";
        } else {
          viaggio.features[0].properties.selected = "no";
        }
        console.log(viaggio.features[0].properties.selected);
      });
      this.pulisciMappa();
      this.disegnaViaggio();
    },
    retrieveData() {
      console.log;
      let response = fetch(
        "http://localhost:8080/BilleMatteoProgettoEsame/api/viaggi"
      )
        .then((response) => response.json())
        .then((data) => {
          this.viaggi = data;
          this.disegnaViaggio();
        });
    },
    pulisciMappa() {
      console.log(geoJsonLayer);
      geoJsonLayer.removeFrom(map);
      geoJsonLayer = "";
    },
  },
  mounted() {
    console.log("ciao sto ricaricando");
    this.retrieveData();
  },
});

var ElencoTappe = new Vue({
  el: "#elenco-tappe-viaggio",
  data: {
    viaggio: [],
    tappe: [],
  },
  methods: {
    tornaAViaggi() {
      divTappe = document.getElementById("elenco-tappe-viaggio");
      divTappe.style.display = "none";
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "block";
      this.viaggio = [];
      this.tappe = [];
    },
    retrieveData(id) {
      let response = fetch(
        `http://localhost:8080/BilleMatteoProgettoEsame/api/viaggi/${id}`
      )
        .then((response) => response.json())
        .then((data) => {
          this.viaggio = data;
          this.setTappe();
          this.disegnaViaggio();
        });
    },
    setTappe() {
      console.log(this.viaggio.features[0].geometry);
      for (
        let i = 0;
        i < this.viaggio.features[0].geometry.coordinates.length;
        i++
      ) {
        this.tappe.push({
          idTappa: i,
          coordinates: [
            +this.viaggio.features[0].geometry.coordinates[i][0],
            this.viaggio.features[0].geometry.coordinates[i][1],
          ],
        });
      }
      console.log(this.tappe);
    },
    disegnaViaggio() {
      geoJsonLayer = L.geoJSON();
      var myStyle = { color: "#1766EB", weight: 3 };

      geoJsonLayer.addData(this.viaggio).addTo(map);
      geoJsonLayer.eachLayer(function (layer) {
        if(layer._latlngs.length!=0){
          layer.setStyle(myStyle(layer.feature));
        }
      });
    },
    pulisciMappa() {
      geoJsonLayer.removeFrom(map);
      geoJsonLayer = "";
    },
  },
  filters: {
    formatNumber: function (value) {
      if (!value) {
        return "";
      }
      console.log(value);
      return parseFloat(value).toFixed(2);
    },
  },
});
