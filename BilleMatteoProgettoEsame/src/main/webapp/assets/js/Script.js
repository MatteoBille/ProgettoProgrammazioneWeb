/*
   Return function which will be called when `hide()` method is triggered,
   it must necessarily call the `done()` function
    to complete hiding process 
  */

let jwtToken = "";
let map = L.map("map").setView([45.624029, 13.789859], 13);
let geoJsonTemplate = {
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
let circles = L.featureGroup();

let ElencoViaggi = new Vue({
  el: "#elenco-viaggi-giornata",
  data: {
    viaggi: [],
    nextId: 0,
    date: "",
  },
  methods: {
    mostraTappe: function (event, id) {
      event.stopPropagation();
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "none";
      divTappe = document.getElementById("elenco-tappe-viaggio");
      divTappe.style.display = "block";
      this.pulisciMappa();
      ElencoTappe.setMapListener();
      ElencoTappe.retrieveData(id);
    },
    aggiungiViaggio: function (event) {
      id = this.nextId;
      let geoJsonNuovoViaggio = geoJsonTemplate;
      geoJsonNuovoViaggio.id = String(id);
      geoJsonNuovoViaggio.nome = "viaggio";
      date = this.reverseData(this.date);

      let header = {
        "Content-Type": "application/json",
      };
      header = this.setAuthHeader(header);
      let response = fetch(
        `http://localhost:8080/BilleMatteoProgettoEsame/apiViaggi/viaggi?data=${date}`,
        {
          method: "POST",
          headers: header,
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
      let header = {
        "Content-Type": "application/json",
      };
      header = this.setAuthHeader(header);
      let response = fetch(
        "http://localhost:8080/BilleMatteoProgettoEsame/apiViaggi/viaggi",
        {
          method: "DELETE",
          headers: header,
          body: JSON.stringify({ id: id }),
        }
      ).then(() => {
        this.pulisciMappa();
        this.retrieveData();
      });
    },
    disegnaViaggio: function () {
      geoJsonLayer = L.geoJSON();
      let myStyle = function (viaggio) {
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
    EvidenziaViaggio: function (id) {
      this.viaggi.forEach(function (viaggio) {
        if (viaggio.id === id) {
          viaggio.features[0].properties.selected = "yes";
        } else {
          viaggio.features[0].properties.selected = "no";
        }
      });

      let listaViaggi = document.querySelectorAll(".elenco-viaggi");
      console.log(listaViaggi);

      for (i = 0; i < listaViaggi.length; ++i) {
        console.log(listaViaggi[i].id);
        if (listaViaggi[i].id === "viaggio-" + id) {
          listaViaggi[i].style.backgroundColor = "#d86a62";
        } else {
          listaViaggi[i].style.backgroundColor = "#B76D68";
        }
      }

      this.pulisciMappa();
      this.disegnaViaggio();
    },
    retrieveData: function () {
      let date = this.reverseData(this.date);
      let header = {};
      header = this.setAuthHeader(header);
      let response = fetch(
        `http://localhost:8080/BilleMatteoProgettoEsame/apiViaggi/viaggi?data=${date}`,
        {
          method: "GET",
          headers: header,
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.message !== "NotAccepted") {
            this.viaggi = data.geoJson;
            this.nextId = data.id + 1;
            this.disegnaViaggio();
          }
        });
    },
    pulisciMappa: function () {
      geoJsonLayer.removeFrom(map);
      geoJsonLayer = "";
    },
    setThisDay() {
      /*https://www.codegrepper.com/code-examples/javascript/today+date+javascript+yyyy-mm-dd*/
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = today.getFullYear();

      today = dd + "/" + mm + "/" + yyyy;
      /*********************/

      this.date = today;
    },
    reverseData: function (date) {
      let datePieces = date.split("/");
      let dd = datePieces[0];

      let mm = datePieces[1];

      let yyyy = datePieces[2];

      return yyyy + "/" + mm + "/" + dd;
    },
    setNewDate: function (newDate) {
      this.pulisciMappa();
      this.retrieveData();
    },
    setAuthHeader: function (header) {
      if (jwtToken !== "") {
        header.Authorization = "Bearer " + jwtToken;
      }
      return header;
    },
    changeDay: function (nday) {
      let datePieces = this.date.split("/");
      let dd = datePieces[0];

      let mm = datePieces[1];

      let yyyy = datePieces[2];

      this.date = parseInt(dd) + parseInt(nday) + "/" + mm + "/" + yyyy;
      this.pulisciMappa();
      this.retrieveData();
    },
  },
  mounted: function () {
    this.setThisDay();
    this.retrieveData();
  },
});

let ElencoTappe = new Vue({
  el: "#elenco-tappe-viaggio",
  data: {
    viaggio: [],
    tappe: [],
    nomeViaggio: "",
    corners:{},
  },
  methods: {
    tornaAViaggi: function () {
      divTappe = document.getElementById("elenco-tappe-viaggio");
      divTappe.style.display = "none";
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "block";
      this.viaggio = [];
      this.tappe = [];

      if (map.hasLayer(circles)) {
        map.removeLayer(circles);
        circles = L.featureGroup();
      }

      this.removeMapListener();
      this.pulisciMappa();
      ElencoViaggi.retrieveData();
    },
    retrieveData: function (id) {
      let header = {};
      header = this.setAuthHeader(header);
      let response = fetch(
        `http://localhost:8080/BilleMatteoProgettoEsame/apiViaggi/viaggi/${id}`,
        {
          method: "GET",
          headers: header,
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.message !== "NotAccepted") {
            this.viaggio = data;
            this.nomeViaggio = data.nome;
            this.setTappe();
            this.setCorners();
            this.disegnaViaggio();
          }
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
    },
    salvaViaggio: function () {
      let id = parseInt(this.viaggio.id);
      let header = {
        "Content-Type": "application/json",
      };
      header = this.setAuthHeader(header);
      let response = fetch(
        `http://localhost:8080/BilleMatteoProgettoEsame/apiViaggi/viaggi/${id}`,
        {
          method: "PUT",
          headers: header,
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
      this.aggiornaTutteLeCoordinateViaggio();
      this.pulisciMappa();
      this.disegnaViaggio();
    },
    disegnaViaggio: function () {
      geoJsonLayer = L.geoJSON();
      var myStyle = { color: "#1766EB", weight: 3 };
      map.fitBounds([this.viaggio.corners.latlngMax,this.viaggio.corners.latlngMin]);
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
        let coords = [0, 0];
        let newTappa = { idTappa: idTappa, coordinates: coords };
        this.tappe.push(newTappa);
        this.$nextTick(() => {
          this.modificaPunto(null, idTappa);
        });
      } else {
        let coords = [lat, lng];

        let newTappa = { idTappa: idTappa, coordinates: coords };
        this.tappe.push(newTappa);
        this.aggiornaTutteLeCoordinateViaggio();
      }
    },
    aggiornaTutteLeCoordinateViaggio: function () {
      this.viaggio.features[0].geometry.coordinates = [];
      this.tappe.forEach((tappa) => {
        this.viaggio.features[0].geometry.coordinates.push([
          tappa.coordinates[1],
          tappa.coordinates[0],
        ]);
      });
      this.pulisciMappa();
      this.disegnaViaggio();
    },
    inserisciDatiConClik: function (latlng) {
      let elements = document.getElementsByClassName(
        "container-modifica-tappa"
      );
      let selectedElem;
      if (elements.length !== 0) {
        for (let i = 0; i < elements.length; ++i) {
          if (elements[i].style.display === "flex") {
            selectedElem = elements[i];
            break;
          }
        }
      } else {
        selectedElem = null;
      }

      if (selectedElem === null || selectedElem === undefined) {
        this.aggiungiTappaAllaFine(latlng.lat, latlng.lng);
      } else {
        alert("inserire i dati nel form prima di aggiungere un nuovo punto");
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
    setAuthHeader: function (header) {
      if (jwtToken !== "") {
        header.Authorization = "Bearer " + jwtToken;
      }
      return header;
    },
    modificaNomeViaggio: function () {
      console.log("sto cambinando visualizzazione");
      document.querySelector("#nome-viaggio").style.display = "none";
      document.querySelector("#modifica-nome").style.display = "none";
      document.querySelector("#cambia-nome").style.display = "flex";
      document.querySelector("#salva-nome").style.display = "block";
    },
    salvaNomeViaggio: function () {
      document.querySelector("#nome-viaggio").style.display = "flex";
      document.querySelector("#modifica-nome").style.display = "block";
      document.querySelector("#cambia-nome").style.display = "none";
      document.querySelector("#salva-nome").style.display = "none";

      this.nomeViaggio = document.querySelector("#nuovo-nome-viaggio").value;
      this.viaggio.nome = this.nomeViaggio;
      console.log(this.nomeViaggio);
    },
    nascondiModificaNome: function () {
      document.querySelector("#cambia-nome").style.display = "none";
      document.querySelector("#salva-nome").style.display = "none";
      document.querySelector("#nome-viaggio").style.display = "flex";
      document.querySelector("#modifica-nome").style.display = "block";
    },
    EvidenziaTappa: function (id) {
      if (map.hasLayer(circles)) {
        map.removeLayer(circles);
        circles = L.featureGroup();
      }

      this.tappe.forEach(function (tappa) {
        if (tappa.idTappa === id) {
          console.log(tappa);
          console.log(id);
          let circle = L.circleMarker([tappa.coordinates[0], tappa.coordinates[1]], {
            radius: 10,
            color: "red",
            weight: 0.5,
            opacity: 1,
            fillColor: "red",
            fillOpacity: 1,
          }).addTo(circles);
          map.addLayer(circles);
        }
      });

      let listaTappe = document.querySelectorAll(".elenco-tappe");

      for (i = 0; i < listaTappe.length; ++i) {
        if (listaTappe[i].id === "tappa-" + id) {
          listaTappe[i].style.backgroundColor = "#d86a62";
        } else {
          listaTappe[i].style.backgroundColor = "#B76D68";
        }
      }
    },
    setCorners: function () {
      let latMax = -92;
      let latMin = 91;
      let lngMax = -1;
      let lngMin = 181;

      this.tappe.forEach(function (tappa) {
        if (tappa.coordinates[0] < latMin) {
          latMin = tappa.coordinates[0];
        }
        if (tappa.coordinates[0] > latMax) {
          latMax = tappa.coordinates[0];
        }

        if (tappa.coordinates[1] < lngMin) {
          lngMin = tappa.coordinates[1];
        }
        if (tappa.coordinates[1] > lngMax) {
          lngMax = tappa.coordinates[1];
        }
      });
      this.corners=({ latlngMax: [latMax, lngMax],latlngMin: [latMin, lngMin] });
      
      this.viaggio.corners=this.corners;
    },
  },
  mounted: function () {
    this.nascondiModificaNome();
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

let SignUpLoginButtons = new Vue({
  el: signUpLogin,
  methods: {
    showLoginForm: function () {
      document.querySelector("#login").style.display = "block";
      document.querySelector("#loginform").style.display = "block";
      document.querySelector("#signupform").style.display = "none";
    },
    showSignUpForm: function () {
      document.querySelector("#login").style.display = "block";
      document.querySelector("#signupform").style.display = "block";
      document.querySelector("#loginform").style.display = "none";
    },
  },
});

let loginWindows = new Vue({
  el: login,
  methods: {
    sendLogin: function () {
      let name = document.querySelector("#name").value;
      let password = document.querySelector("#password").value;

      // https://stackoverflow.com/questions/34952392/simple-way-to-hash-password-client-side-right-before-submitting-form
      let hashObj = new jsSHA("SHA-512", "TEXT", { numRounds: 1 });
      hashObj.update(password);
      let hash = hashObj.getHash("HEX");

      let Auth = btoa(name + "." + hash);
      let header = {
        Authorization: `Basic ${Auth}`,
      };
      let response = fetch(
        `http://localhost:8080/BilleMatteoProgettoEsame/apiLogin/login`,
        {
          method: "GET",
          headers: header,
        }
      )
        .then((response) => response.json())
        .then((data) => {
          jwtToken = data.jwtToken;
          this.mostraViaggi();
          ElencoViaggi.retrieveData();
        });
    },
    sendSignUp: function () {
      let name = document.querySelector("#namesignup").value;
      let password1 = document.querySelector("#passwordsignup").value;
      let password2 = document.querySelector("#repeatpasswordsignup").value;

      if (password1 === password2) {
        let hashObj = new jsSHA("SHA-512", "TEXT", { numRounds: 1 });
        hashObj.update(password1);
        let hash = hashObj.getHash("HEX");

        let Auth = btoa(name + "." + hash);
        let header = {
          Authorization: `Basic ${Auth}`,
          "Content-Type": "application/json",
        };
        let response = fetch(
          `http://localhost:8080/BilleMatteoProgettoEsame/apiSignUp/SignUp`,
          {
            method: "GET",
            headers: header,
          }
        )
          .then((response) => response.json())
          .then((data) => {
            jwtToken = data.jwtToken;
            console.log(jwtToken);
            this.mostraViaggi();
            ElencoViaggi.retrieveData();
          });
      }
    },
    mostraViaggi: function () {
      divViaggi = document.querySelector("#elenco-viaggi-giornata");
      divViaggi.style.display = "block";
      divTappe = document.querySelector("#login");
      divTappe.style.display = "none";
    },
  },
});

let setAuthHeader = function (header) {
  if (jwtToken !== "") {
    header.Authorization = "Bearer" + jwtToken;
  }
  return header;
};
