
      /*
   Return function which will be called when `hide()` method is triggered,
   it must necessarily call the `done()` function
    to complete hiding process 
  */


var map = L.map("map").setView([45.624029, 13.789859], 13);
var geoJsonTemplate = {
  features: [
    {
      geometry: {
        coordinates: [],
        type: "LineString",
      },
      type: "Feature",
      properties: {
        selected: "no",
      },
    },
  ],
  nome: "viaggio2",
  type: "FeatureCollection",
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
    nextId:0
  },
  methods: {
    mostraTappe: function (event, id) {
      event.stopPropagation();
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "none";
      divTappe = document.getElementById("elenco-tappe-viaggio");
      divTappe.style.display = "block";
      Titolo = document.querySelector("#elenco-tappe-viaggio-titolo h3");
      Titolo.innerHTML = `VIAGGIO ID ${id}`;
      this.pulisciMappa();
      ElencoTappe.setMapListener();
      ElencoTappe.retrieveData(id);
    },
    aggiungiViaggio: function (event) {
      console.log(this.nextId);
      id=this.nextId;
      let geoJsonNuovoViaggio = geoJsonTemplate;
      geoJsonNuovoViaggio.id = String(id);
      geoJsonNuovoViaggio.nome = "viaggio" + id;
      data=document.getElementById("data-viaggi").value;
      data=this.reverseData(data);
      let response = fetch(
        `http://localhost:8080/BilleMatteoProgettoEsame/api/viaggi?data=${data}`,
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
          this.viaggi.push(data.geoJson);
          this.mostraTappe(event, data.id);
        });
    },
    eliminaViaggio: function (event, id) {
      console.log("id viaggio:" + id);

      let response = fetch(
        "http://localhost:8080/BilleMatteoProgettoEsame/api/viaggi",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id }),
        }
      ).then(() => {
        this.pulisciMappa();
        this.retrieveData();
      });
    },
    disegnaViaggio: function () {
      console.log(this.viaggi);
      geoJsonLayer = L.geoJSON();
      var myStyle = function (viaggio) {
        switch (viaggio.properties.selected) {
          case "no":
            return { color: "#1766EB", weight: 3 };
          case "yes":
            return { color: "#EB1F00", weight: 5 };
        }
      };
      geoJsonLayer.addData(this.viaggi).addTo(map);

      geoJsonLayer.eachLayer(function (layer) {
        if (layer._latlngs.length != 0) {
          layer.setStyle(myStyle(layer.feature));
        }
      });
    },
    EvidenziaViaggio: function (event, id) {
      this.viaggi.forEach(function (viaggio) {
        if (viaggio.id === id) {
          viaggio.features[0].properties.selected = "yes";
        } else {
          viaggio.features[0].properties.selected = "no";
        }
      });
      this.pulisciMappa();
      this.disegnaViaggio();
    },
    retrieveData: function () {
      let data=document.getElementById("data-viaggi").value;
      data=this.reverseData(data);
      let response = fetch(
        `http://localhost:8080/BilleMatteoProgettoEsame/api/viaggi?data=${data}`
      )
        .then((response) => response.json())
        .then((data) => {
          this.viaggi=data.geoJson;
          this.nextId=data.id+1;
          this.disegnaViaggio();
        });
    },
    pulisciMappa: function () {
      geoJsonLayer.removeFrom(map);
      geoJsonLayer = "";
    },
    setThisDay(){
      let dataInput = document.getElementById("data-viaggi");
      /*https://www.codegrepper.com/code-examples/javascript/today+date+javascript+yyyy-mm-dd*/
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();

      today = dd + '/' + mm + '/' + yyyy;
      /*********************/
      dataInput.value=today;
    },
    reverseData:function(data){
      let dataPieces=data.split('/');
      let dd=dataPieces[0];
     
      let mm=dataPieces[1];

      let yyyy=dataPieces[2];

      return yyyy+"/"+mm+"/"+dd;
    },
    setNewData:function(){
      this.pulisciMappa();
      this.retrieveData();
    }
  },
  mounted: function () {
    this.setThisDay();
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
    tornaAViaggi: function () {
      divTappe = document.getElementById("elenco-tappe-viaggio");
      divTappe.style.display = "none";
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "block";
      this.viaggio = [];
      this.tappe = [];
      this.removeMapListener();
      this.pulisciMappa();
      ElencoViaggi.retrieveData();
    },
    retrieveData: function (id) {
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
    setTappe: function () {
      for (
        let i = 0;
        i < this.viaggio.features[0].geometry.coordinates.length;
        i++
      ) {
        this.tappe.push({
          idTappa: i,
          coordinates: [
            this.viaggio.features[0].geometry.coordinates[i][1],
            this.viaggio.features[0].geometry.coordinates[i][0],
          ],
        });
      }
      console.log("tappe inizio");
      console.log(this.tappe);
    },
    salvaViaggio: function () {
      let id = parseInt(this.viaggio.id);
      let response = fetch(
        `http://localhost:8080/BilleMatteoProgettoEsame/api/viaggi/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.viaggio),
        }
      ).then(() => {
        this.tornaAViaggi();
      });
    },
    modificaPunto: function (event, id) {
      let container = document.querySelector(`#container-tappa-${id}`);
      container.style.display = "none";
      let modifierContainer = document.querySelector(
        `#container-modifica-tappa-${id}`
      );
      modifierContainer.style.display = "flex";
    },
    cancellaPunto: function (event, id) {
      this.tappe.splice(id, 1);
      for (let i = 0; i < this.tappe.length; ++i) {
        this.tappe[i].idTappa = i;
      }
      console.log("tappe");
      console.log(this.tappe);
      this.aggiornaTutteLeCoordinateViaggio();
      this.pulisciMappa();
      this.disegnaViaggio();
    },
    disegnaViaggio: function () {
      geoJsonLayer = L.geoJSON();
      var myStyle = { color: "#1766EB", weight: 3 };

      geoJsonLayer.addData(this.viaggio).addTo(map);
      geoJsonLayer.eachLayer(function (layer) {
        if (layer._latlngs.length != 0) {
          layer.setStyle(myStyle);
        }
      });
    },
    pulisciMappa: function () {
      geoJsonLayer.removeFrom(map);
      geoJsonLayer = "";
    },
    SalvaModificaPunto: function (event, id) {
      let lat = document.getElementById(`lat-tappa-${id}`).value;
      let lng = document.getElementById(`lng-tappa-${id}`).value;
      let check = document.getElementById(`check-tappa-${id}`).value;
      let checkText = document.getElementById(`check-text-tappa-${id}`).value;
      //if(this.latlongFormat(lat) && this.latlongFormat(lng)){

      let container = document.querySelector(`#container-tappa-${id}`);
      container.style.display = "flex";
      let modifierContainer = document.querySelector(
        `#container-modifica-tappa-${id}`
      );
      modifierContainer.style.display = "none";

      this.tappe.forEach((tappa) => {
        if (tappa.idTappa === id) {
          tappa.coordinates[0] = parseFloat(lng);
          tappa.coordinates[1] = parseFloat(lat);
          tappa.check = check;
          tappa.checkText = checkText;

          this.viaggio.features[0].geometry.coordinates[id] = tappa.coordinates;
        }
      });

      this.$forceUpdate();
      /*for (let i = 0;i < this.tappe.length;i++) {
          this.viaggio.features[0].geometry.coordinates.push(this.tappe[i].coordinates);
        }*/

      this.pulisciMappa();
      this.disegnaViaggio();
      /*}else{
        alert("dati inseriti mal formattati");
      }*/
    },
    latlongFormat: function (string) {
      const regex = /"[0-9]*\.[0-9]*/;
      return regex.test(string);
    },
    aggiungiTappaAllaFine(lat, lng) {
      let idTappa = this.tappe.length;

      if (lat === undefined || lng === undefined) {
        let coords = [0,0];
        let newTappa = { "idTappa": idTappa, "coordinates": coords };
        this.tappe.push(newTappa);
        console.log("aggiunta con button");
        this.$nextTick(() => {
          this.modificaPunto(null, idTappa);
        });
      } else {
        console.log("aggiunta con tasto");
        let coords = [lat, lng];
        
        let newTappa = { "idTappa": idTappa, "coordinates": coords };
        this.tappe.push(newTappa);
        this.aggiornaTutteLeCoordinateViaggio();
      }
    },
    aggiornaTutteLeCoordinateViaggio:function(){
      this.viaggio.features[0].geometry.coordinates=[];
      this.tappe.forEach((tappa) => {
        this.viaggio.features[0].geometry.coordinates.push([tappa.coordinates[1],tappa.coordinates[0]]);
      });
      this.pulisciMappa();
      this.disegnaViaggio();
    },
    inserisciDatiConClik: function (latlng) {
      console.log(latlng);
      let elements = document.getElementsByClassName(
        "container-modifica-tappa"
      );
      let selectedElem;
      if (elements.length !== 0) {
        console.log(elements);
        for(let i=0;i<elements.length;++i){
          if(elements[i].style.display === "flex"){
            selectedElem=elements[i];
            break;
          }
        }
        console.log(selectedElem);
      }else{
        selectedElem=null;
      }

      if(selectedElem===null || selectedElem===undefined){
        this.aggiungiTappaAllaFine(latlng.lat, latlng.lng);
      }else{
        alert ("inserire i dati nel form prima di aggiungere un nuovo punto");
      }
      
    },
    setMapListener: function () {
      map.on("click", function (ev) {
        ElencoTappe.inserisciDatiConClik(ev.latlng);
      });
    },
    removeMapListener: function () {
      map.off("click");
    },
  },
  filters: {
    formatNumber: function (value) {
      if (!value) {
        return "";
      }
      return parseFloat(value).toFixed(2);
    },
  },
});
