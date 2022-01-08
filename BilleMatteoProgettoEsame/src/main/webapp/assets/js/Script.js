let jwtToken = (function () {
  let token = "";
  let func = function () {
    return {
      set: function (newToken) {
        token = newToken;
      },
      get: function () {
        return token;
      },
      delete: function () {
        token = "";
      },
      isPresent: function () {
        if (token === "") {
          return false;
        } else {
          return true;
        }
      },
    };
  };
  return func();
})();

let map = L.map("map").setView([45.624029, 13.789859], 13);

//take from Leafleat tutorial
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: "mapbox/streets-v11",
  accessToken: "pk.eyJ1IjoiYmlsbG85NyIsImEiOiJja3d3Y2V5MGEwMjc5MnZwOGFtdjFxMnV0In0.5Fa8yODvSDsZ1b73O-CwRQ",
}).addTo(map);

let GeoJsonTemplate = function (id, corners) {
  return {
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
    id,
    nome: "",
    type: "FeatureCollection",
    corners,
  };
};

let PuntoImportanteTemplate = function () {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [],
    },
    id: "",
  };
};

let geoJsonLayer = L.geoJSON();
let circles = L.featureGroup();
let cornersItalia = {
  latlngMax: [47.028253, 4.819799],
  latlngMin: [36.561942, 19.391921],
};

let travelList = new Vue({
  el: "#elenco-viaggi-giornata",
  data: {
    viaggi: [],
    nextId: 0,
    date: "",
    corners: { latlngMin: [null, null], latlngMax: [null, null] },
  },
  methods: {
    addTravel: function () {
      id = this.nextId;
      let geoJsonNuovoViaggio = new GeoJsonTemplate(String(id), cornersItalia);

      date = this.changeDateFormatting(this.date);
      let header = {
        "Content-Type": "application/json",
      };
      header = setAuthHeader(header);
      let response = fetch(`apiViaggi/viaggi?data=${date}`, {
        method: "POST",
        headers: header,
        body: JSON.stringify(geoJsonNuovoViaggio),
      })
        .then((response) => response.json())
        .then((data) => {
          jwtToken.set(data.jwtToken);
          this.viaggi.push(data.geoJson);
          this.goToEditStage(data.geoJson.id);
        })
        .catch((err) => {
          SignUpLoginLogoutButtons.logout();
        });
    },
    changeDateFormatting: function (date) {
      date = date.replace(/-/g, "/");

      return date;
    },
    changeDay: function (nday) {
      if (nday === 1) {
        document.getElementById("data-viaggi").stepUp(1);
      } else {
        document.getElementById("data-viaggi").stepDown(1);
      }

      this.date = document.getElementById("data-viaggi").value;
      clearGeoJsonLayer();
      this.retrieveData();
    },
    drawTravel: function () {
      this.viaggi.forEach((viaggio) => {
        if (viaggio.features[0].properties.selected === "yes") {
          selected = viaggio.id;
        }
      });

      let myStyle = function (viaggio) {
        switch (viaggio.properties.selected) {
          case "no":
            return { color: "#1766EB", weight: 3 };
          case "yes":
            return { color: "#EB1F00", weight: 5 };
        }
      };
      if (this.viaggi.length !== 0) {
        map.fitBounds([this.corners.latlngMax, this.corners.latlngMin]);
      } else {
        map.fitBounds([cornersItalia.latlngMax, cornersItalia.latlngMin]);
      }

      geoJsonLayer.addData(this.viaggi).addTo(map);

      geoJsonLayer.eachLayer(function (layer) {
        if (layer.feature.geometry.coordinates.length != 0 && layer.feature.geometry.type === "LineString") {
          layer.setStyle(myStyle(layer.feature));
        }
      });
    },
    deleteTravel: function (id) {
      let header = {
        "Content-Type": "application/json",
      };
      header = setAuthHeader(header);
      let response = fetch("apiViaggi/viaggi", {
        method: "DELETE",
        headers: header,
        body: JSON.stringify({ id: id }),
      })
        .then((response) => response.json())
        .then((data) => {
          jwtToken.set(data.jwtToken);
          clearGeoJsonLayer();
          this.retrieveData();
        })
        .catch((err) => {
          SignUpLoginLogoutButtons.logout();
        });
    },
    highlightTravel: function (id) {
      this.viaggi.forEach(function (viaggio) {
        if (viaggio.id === id) {
          viaggio.features[0].properties.selected = "yes";
        } else {
          viaggio.features[0].properties.selected = "no";
        }
      });

      let listaViaggi = document.querySelectorAll(".elenco-viaggi");
      for (i = 0; i < listaViaggi.length; ++i) {
        if (listaViaggi[i].id === "viaggio-" + id) {
          listaViaggi[i].style.backgroundColor = "#d86a62";
        } else {
          listaViaggi[i].style.backgroundColor = "#B76D68";
        }
      }

      clearGeoJsonLayer();
      this.drawTravel();
    },
    goToEditStage: function (id) {
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "none";
      divTappe = document.getElementById("visualizza-elenco-tappe-viaggio");
      divTappe.style.display = "none";
      divTappe = document.getElementById("modifica-elenco-tappe-viaggio");
      divTappe.style.display = "block";
      clearGeoJsonLayer();
      clearCirclesLayer();
      editStage.setMapListener();
      editStage.retrieveData(id);
    },
    goToStagesList: function (id) {
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "none";
      diveditStage = document.getElementById("modifica-elenco-tappe-viaggio");
      diveditStage.style.display = "none";
      divTappe = document.getElementById("visualizza-elenco-tappe-viaggio");
      divTappe.style.display = "block";

      this.viaggi.forEach(function (viaggio) {
        viaggio.features[0].properties.selected = "no";
      });
      clearGeoJsonLayer();
      stagesList.retrieveData(id);
    },
    retrieveData: function () {
      let date = this.changeDateFormatting(this.date);
      let header = {};
      header = setAuthHeader(header);
      let response = fetch(`apiViaggi/viaggi?data=${date}`, {
        method: "GET",
        headers: header,
      })
        .then((response) => response.json())
        .then((data) => {
          jwtToken.set(data.jwtToken);
          this.viaggi = data.geoJsons;
          this.nextId = data.id + 1;
          this.totalCorners = cornersItalia;
          this.setCorners();
          this.drawTravel();
        })
        .catch((err) => {
          SignUpLoginLogoutButtons.logout();
        });
    },
    setCorners: function () {
      let latMax = -92;
      let latMin = 91;
      let lngMax = -1;
      let lngMin = 181;

      this.viaggi.forEach(function (viaggio) {
        if (viaggio.corners.latlngMin[0] < latMin) {
          latMin = viaggio.corners.latlngMin[0];
        }
        if (viaggio.corners.latlngMax[0] > latMax) {
          latMax = viaggio.corners.latlngMax[0];
        }
        if (viaggio.corners.latlngMin[1] < lngMin) {
          lngMin = viaggio.corners.latlngMin[1];
        }
        if (viaggio.corners.latlngMax[1] > lngMax) {
          lngMax = viaggio.corners.latlngMax[1];
        }
      });

      this.corners = {
        latlngMax: [latMax, lngMax],
        latlngMin: [latMin, lngMin],
      };
    },
    setNewDate: function (newDate) {
      this.date = document.getElementById("data-viaggi").value;
      clearGeoJsonLayer();
      this.retrieveData();
    },
    setThisDay() {
      /*https://www.codegrepper.com/code-examples/javascript/today+date+javascript+yyyy-mm-dd*/
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = today.getFullYear();

      today = yyyy + "-" + mm + "-" + dd;
      /*********************/
      document.getElementById("data-viaggi").value = today;
      this.date = document.getElementById("data-viaggi").value;
    },
  },
  mounted: function () {
    this.setThisDay();
  },
});

let stagesList = new Vue({
  el: "#visualizza-elenco-tappe-viaggio",
  data: {
    viaggio: [],
    tappe: [],
    nomeViaggio: "",
    corners: {},
    mezzo: "",
    id: "",
  },
  methods: {
    drawTravel: function () {
      //geoJsonLayer = L.geoJSON();
      var myStyle = { color: "#1766EB", weight: 3 };

      if (this.tappe.length !== 0) {
        map.fitBounds([this.corners.latlngMax, this.corners.latlngMin]);
      } else {
        map.fitBounds([cornersItalia.latlngMax, cornersItalia.latlngMin]);
      }
      map.fitBounds([this.viaggio.corners.latlngMax, this.viaggio.corners.latlngMin]);

      geoJsonLayer.addData(this.viaggio).addTo(map);
      geoJsonLayer.eachLayer(function (layer) {
        if (layer.feature.geometry.coordinates.length != 0 && layer.feature.geometry.type === "LineString") {
          layer.setStyle(myStyle);
        }
      });
    },
    highLightStage: function (id) {
      clearCirclesLayer();

      this.tappe.forEach(function (tappa) {
        if (tappa.idTappa === id) {
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
        if (listaTappe[i].id === "visualizza-tappa-" + id) {
          listaTappe[i].style.backgroundColor = "#d86a62";
        } else {
          listaTappe[i].style.backgroundColor = "#B76D68";
        }
      }
    },
    goToEditStage: function () {
      divTappe = document.getElementById("visualizza-elenco-tappe-viaggio");
      divTappe.style.display = "none";
      divTappe = document.getElementById("modifica-elenco-tappe-viaggio");
      divTappe.style.display = "block";
      clearGeoJsonLayer();
      clearCirclesLayer();
      editStage.setMapListener();
      editStage.retrieveData(this.id);
    },
    retrieveData: function (id) {
      this.id = id;
      let header = {};
      header = setAuthHeader(header);
      let response = fetch(`apiViaggi/viaggi/${this.id}`, {
        method: "GET",
        headers: header,
      })
        .then((response) => response.json())
        .then((data) => {
          jwtToken.set(data.jwtToken);
          this.viaggio = data.geoJson;
          this.mezzo = data.geoJson.mezzo;
          this.nomeViaggio = data.geoJson.nome;
          this.setStages();
          this.setCorners();
          this.drawTravel();
        })
        .catch((err) => {
          SignUpLoginLogoutButtons.logout();
        });
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
      this.corners = {
        latlngMax: [latMax, lngMax],
        latlngMin: [latMin, lngMin],
      };

      this.viaggio.corners = this.corners;
    },
    setStages: function () {
      this.tappe = [];
      for (let i = 0; i < this.viaggio.features[0].geometry.coordinates.length; i++) {
        let checkText = "";
        for (let j = 1; j < this.viaggio.features.length; j++) {
          if (this.viaggio.features[j].id === i) {
            checkText = this.viaggio.features[j].properties.text;
          }
        }

        this.tappe.push({
          idTappa: i,
          coordinates: [this.viaggio.features[0].geometry.coordinates[i][1], this.viaggio.features[0].geometry.coordinates[i][0]],
          checkText: checkText,
        });
      }
    },
    goToTravelList: function () {
      divTappe = document.getElementById("visualizza-elenco-tappe-viaggio");
      divTappe.style.display = "none";
      divViaggi = document.getElementById("elenco-viaggi-giornata");
      divViaggi.style.display = "block";
      this.viaggio = [];
      this.tappe = [];

      clearCirclesLayer();
      clearGeoJsonLayer();
      travelList.retrieveData();
    },
  },
  filters: {
    formatNumber: function (value) {
      if (!value) {
        return "";
      }
      return parseFloat(value).toFixed(5);
    },
  },
});

let editStage = new Vue({
  el: "#modifica-elenco-tappe-viaggio",
  data: {
    viaggio: [],
    tappe: [],
    idUltimaTappa: 0,
    nomeViaggio: "",
    corners: {},
    mezzo: "",
    id: "",
    modificato: false,
  },
  methods: {
    updateAllTheTravelCoordinates: function () {
      this.viaggio.features[0].geometry.coordinates = [];
      this.tappe.forEach((tappa) => {
        this.viaggio.features[0].geometry.coordinates.push([tappa.coordinates[1], tappa.coordinates[0]]);
      });
      this.setCorners();
      clearCirclesLayer();
      clearGeoJsonLayer();
      this.drawTravel();
    },
    addStageAtTheEnd(lat, lng) {
      let elements = document.getElementsByClassName("container-modifica-tappa");
      if (elements.length !== 0) {
        for (let i = 0; i < elements.length; ++i) {
          if (elements[i].style.display === "flex") {
            alert("inserire i dati nel form prima di aggiungere un nuovo punto");
            return undefined;
          }
        }
      }
      let idTappa = this.tappe.length;
      this.modificato = true;
      if (lat === undefined || lng === undefined) {
        let coords = ["Nan", "Nan"];
        let newTappa = { idTappa: idTappa, coordinates: coords };
        this.tappe.push(newTappa);
        this.$nextTick(() => {
          this.editStage(idTappa);
        });
      } else {
        let coords = [lat, lng];
        window.location.href = "#tappa-" + idTappa;
        let newTappa = { idTappa: idTappa, coordinates: coords };
        this.tappe.push(newTappa);
        this.updateAllTheTravelCoordinates();
      }
      this.idUltimaTappa = this.tappe.length - 1;
    },
    deleteStage: function (id) {
      this.modificato = true;
      this.tappe.splice(id, 1);
      for (let i = 0; i < this.tappe.length; ++i) {
        this.tappe[i].idTappa = i;
      }

      for (let i = 1; i < this.viaggio.features.length; i++) {
        if (this.viaggio.features[i].id === id && this.viaggio.features[i].geometry.type === "Point") {
          this.viaggio.features.splice(i, 1);
        }
      }

      for (let i = 1; i < this.viaggio.features.length; i++) {
        if (this.viaggio.features[i].id > id && this.viaggio.features[i].geometry.type === "Point") {
          this.viaggio.features[i].id = this.viaggio.features[i].id - 1;
        }
      }

      this.idUltimaTappa = this.tappe.length - 1;

      this.$forceUpdate();
      this.updateAllTheTravelCoordinates();
      clearCirclesLayer();
      clearGeoJsonLayer();
      this.drawTravel();
    },
    drawTravel: function () {
      //geoJsonLayer = L.geoJSON();
      var myStyle = { color: "#1766EB", weight: 3 };
      geoJsonLayer.addData(this.viaggio).addTo(map);
      geoJsonLayer.eachLayer(function (layer) {
        if (layer.feature.geometry.coordinates.length != 0 && layer.feature.geometry.type === "LineString") {
          layer.setStyle(myStyle);
        }
      });
    },
    highLightStage: function (id) {
      clearCirclesLayer();

      this.tappe.forEach(function (tappa) {
        if (tappa.idTappa === id && !isNaN(tappa.coordinates[0]) && !isNaN(tappa.coordinates[1])) {
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
    goBackWithoutSavingStage(id) {
      for (let i = 0; i < this.tappe.length; ++i) {
        if (this.tappe[i].idTappa === i) {
          if (isNaN(this.tappe[i].coordinates[0]) || isNaN(this.tappe[i].coordinates[1])) {
            this.deleteStage(id);
          } else {
            let container = document.querySelector(`#container-tappa-${id}`);
            container.style.display = "flex";
            let modifierContainer = document.querySelector(`#container-modifica-tappa-${id}`);
            modifierContainer.style.display = "none";
          }
        }
        circles.removeFrom(map);
        clearGeoJsonLayer();
        this.drawTravel();
      }
    },
    insertDataByClick: function (latlng) {
      let elements = document.getElementsByClassName("container-modifica-tappa");
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
        this.addStageAtTheEnd(latlng.lat, latlng.lng);
      } else {
        //alert("inserire i dati nel form prima di aggiungere un nuovo punto");
        let id = parseInt(selectedElem.querySelector("div>p").textContent);
        this.tappe[id].coordinates[1] = latlng.lng;
        this.tappe[id].coordinates[0] = latlng.lat;
        this.$forceUpdate();
        //selectedElem.querySelector("#lat + input").value=latlng.lat;
        //selectedElem.querySelector("#lng + input").value=latlng.lng;
      }
    },
    latlongFormat: function (string) {
      const regex = /"[0-9]*\.[0-9]*/;
      return regex.test(string);
    },
    editStage: function (id) {
      let container = document.querySelector(`#container-tappa-${id}`);
      container.style.display = "none";
      let modifierContainer = document.querySelector(`#container-modifica-tappa-${id}`);
      modifierContainer.style.display = "flex";
    },
    removeMapListener: function () {
      map.off("click");
    },
    retrieveData: function (id) {
      this.id = id;
      let header = {};
      header = setAuthHeader(header);
      let response = fetch(`apiViaggi/viaggi/${this.id}`, {
        method: "GET",
        headers: header,
      })
        .then((response) => response.json())
        .then((data) => {
          jwtToken.set(data.jwtToken);
          this.viaggio = data.geoJson;
          this.nomeViaggio = data.geoJson.nome;
          this.mezzo = data.geoJson.mezzo;

          this.setStages();
          this.setCorners();
          this.drawTravel();
        })
        .catch((err) => {
          SignUpLoginLogoutButtons.logout();
        });
    },
    saveMeansOfTransport: function () {
      this.mezzo = document.querySelector("#nuovo-mezzo-viaggio").value;
      this.viaggio.mezzo = this.mezzo;
      this.mezzo = document.querySelector("#nuovo-mezzo-viaggio").value = "";
    },
    saveEditPoint: function (id) {
      let button = document.getElementById(`button-${id}`);
      button.classList.remove("show");
      button.setAttribute("aria-expanded", "false");

      let lat = document.getElementById(`lat-tappa-${id}`).value;
      let lng = document.getElementById(`lng-tappa-${id}`).value;
      let check = document.getElementById(`check-tappa-${id}`).checked;
      let checkText = document.getElementById(`check-text-tappa-${id}`).value;

      if (isNaN(lat) || isNaN(lng)) {
        this.deleteStage(id);
        return undefined;
      }

      let container = document.querySelector(`#container-tappa-${id}`);
      container.style.display = "flex";
      let modifierContainer = document.querySelector(`#container-modifica-tappa-${id}`);
      modifierContainer.style.display = "none";

      this.tappe.forEach((tappa) => {
        let puntoImportante = new PuntoImportanteTemplate();

        if (tappa.idTappa === id) {
          tappa.coordinates[0] = parseFloat(lat);
          tappa.coordinates[1] = parseFloat(lng);
          tappa.check = check;
          tappa.checkText = checkText;

          let exist = false;
          for (let i = 1; i < this.viaggio.features.length; i++) {
            if (this.viaggio.features[i].id === id) {
              exist = true;
            }
          }

          if (tappa.check === true) {
            if (exist === false) {
              puntoImportante.id = id;
              puntoImportante.geometry.coordinates[0] = tappa.coordinates[1];
              puntoImportante.geometry.coordinates[1] = tappa.coordinates[0];
              puntoImportante.properties.text = tappa.checkText;
              this.viaggio.features.push(puntoImportante);
            }
          } else {
            tappa.checkText = "";
            for (let i = 1; i < this.viaggio.features.length; i++) {
              if (this.viaggio.features[i].id === id) {
                this.viaggio.features.splice(i, 1);
              }
            }
          }
          if (!this.viaggio.features[0].geometry.coordinates[id]) {
            this.viaggio.features[0].geometry.coordinates[id] = [,];
          }
          this.viaggio.features[0].geometry.coordinates[id][0] = tappa.coordinates[1];
          this.viaggio.features[0].geometry.coordinates[id][1] = tappa.coordinates[0];
        }
      });

      this.setCorners();

      this.$forceUpdate();
      clearCirclesLayer();
      clearGeoJsonLayer();
      this.drawTravel();
    },
    saveTravelName: function () {
      this.nomeViaggio = document.querySelector("#nuovo-nome-viaggio").value;
      this.viaggio.nome = this.nomeViaggio;
      this.nomeViaggio = document.querySelector("#nuovo-nome-viaggio").value = "";
    },
    saveTravel: function () {
      this.saveMeansOfTransport();
      this.saveTravelName();

      let id = parseInt(this.viaggio.id);
      let header = {
        "Content-Type": "application/json",
      };
      header = setAuthHeader(header);
      let response = fetch(`apiViaggi/viaggi/${id}`, {
        method: "PUT",
        headers: header,
        body: JSON.stringify(this.viaggio),
      })
        .then((response) => response.json())
        .then((data) => {
          jwtToken.set(data.jwtToken);
          this.modificato = false;
          this.goToStagesList();
        })
        .catch((err) => {
          SignUpLoginLogoutButtons.logout();
        });
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
      this.corners = {
        latlngMax: [latMax, lngMax],
        latlngMin: [latMin, lngMin],
      };

      this.viaggio.corners = this.corners;
    },
    setMapListener: function () {
      map.on("click", function (ev) {
        editStage.insertDataByClick(ev.latlng);
      });
    },
    setStages: function () {
      this.tappe = [];
      for (let i = 0; i < this.viaggio.features[0].geometry.coordinates.length; i++) {
        let check = false;
        let checkText = "";

        for (let j = 1; j < this.viaggio.features.length; j++) {
          if (this.viaggio.features[j].id === i) {
            check = true;
            checkText = this.viaggio.features[j].properties.text;
          }
        }
        this.tappe.push({
          idTappa: i,
          coordinates: [this.viaggio.features[0].geometry.coordinates[i][1], this.viaggio.features[0].geometry.coordinates[i][0]],
          check: check,
          checkText: checkText,
        });
      }
      this.idUltimaTappa = this.tappe.length - 1;
      this.$forceUpdate();
    },
    goToStagesList: function () {
      if (this.modificato === true) {
        let resp = confirm("Tornerai indietro senza salvare. Sei sicuro?");
        if (resp === true) {
          divTappe = document.getElementById("modifica-elenco-tappe-viaggio");
          divTappe.style.display = "none";
          divViaggi = document.getElementById("visualizza-elenco-tappe-viaggio");
          divViaggi.style.display = "block";
          this.viaggio = [];
          this.tappe = [];
          clearCirclesLayer();
          clearGeoJsonLayer();
          this.removeMapListener();
          stagesList.retrieveData(this.id);
        }
      } else {
        divTappe = document.getElementById("modifica-elenco-tappe-viaggio");
        divTappe.style.display = "none";
        divViaggi = document.getElementById("visualizza-elenco-tappe-viaggio");
        divViaggi.style.display = "block";
        this.viaggio = [];
        this.tappe = [];
        clearCirclesLayer();
        this.removeMapListener();
        clearGeoJsonLayer();
        stagesList.retrieveData(this.id);
      }
    },
  },
  mounted: function () {
    //this.nascondiModificaNomeEModificaMezzo();
  },
  filters: {
    formatNumber: function (value) {
      if (!value) {
        return "";
      }
      return parseFloat(value).toFixed(5);
    },
  },
});

let SignUpLoginLogoutButtons = new Vue({
  el: "#signUpLoginLogout",
  data: {
    nome: "",
  },
  methods: {
    showLoginForm: function () {
      document.querySelector("#login .side-bar-title p").innerHTML = "Login";
      document.querySelector("#login").style.display = "block";
      document.querySelector("#loginform").style.display = "block";
      document.querySelector("#right-side-container").style.display = "block";
      document.querySelector("#signupform").style.display = "none";
    },
    showSignUpForm: function () {
      document.querySelector("#login .side-bar-title p").innerHTML = "Sign Up";
      document.querySelector("#login").style.display = "block";
      document.querySelector("#signupform").style.display = "block";
      document.querySelector("#right-side-container").style.display = "block";
      document.querySelector("#loginform").style.display = "none";
    },
    logout: function () {
      document.querySelector("#signUpLogin").style.display = "block";

      let rightSideElements = document.querySelectorAll(".right-side");
      rightSideElements.forEach((element) => {
        element.style.display = "none";
      });

      document.querySelector("#logout").style.display = "none";
      jwtToken.delete();
      clearCirclesLayer();
      clearGeoJsonLayer();
    },
    showLogoutButton: function () {
      document.querySelector("#signUpLogin").style.display = "none";
      document.querySelector("#logout").style.display = "block";
    },
    hiddenLogout: function () {
      document.querySelector("#logout").style.display = "none";
      document.querySelector("#right-side-container").style.display = "none";
    },
    clearCirclesLayer: function () {
      if (map.hasLayer(circles)) {
        map.removeLayer(circles);
        circles = L.featureGroup();
      }
    },
    clearGeoJsonLayer: function () {
      if (map.hasLayer(geoJsonLayer)) {
        geoJsonLayer.removeFrom(map);
        geoJsonLayer = L.geoJSON();
      }
    },
  },
});

let loginWindows = new Vue({
  el: "#login",
  methods: {
    sendLogin: function () {
      let name = document.querySelector("#name").value;
      let password = document.querySelector("#password").value;
      if (name == "") {
        alert("Attenzione nome non inserito");
        return "";
      }

      if (password == "") {
        alert("Attenzione password non inserita");
        return "";
      }

      // https://stackoverflow.com/questions/34952392/simple-way-to-hash-password-client-side-right-before-submitting-form
      let hashObj = new jsSHA("SHA-512", "TEXT", { numRounds: 1 });
      hashObj.update(password);
      let hash = hashObj.getHash("HEX");

      let Auth = btoa(name + "." + hash);
      let header = {
        Authorization: `Basic ${Auth}`,
      };
      let response = fetch(`apiLogin/login`, {
        method: "GET",
        headers: header,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Accepted") {
            jwtToken.set(data.jwtToken);
            SignUpLoginLogoutButtons.showLogoutButton();
            this.mostraViaggi();
            travelList.setThisDay();
            travelList.retrieveData();
          } else {
            alert("Errore nel login, riprova");
            document.querySelector("#password").value = "";
            return "";
          }
        })
        .catch((err) => {
          SignUpLoginLogoutButtons.logout();
        });

      document.querySelector("#name").value = "";
      document.querySelector("#password").value = "";
    },
    sendSignUp: function () {
      let name = document.querySelector("#namesignup").value;
      let password1 = document.querySelector("#passwordsignup").value;
      let password2 = document.querySelector("#repeatpasswordsignup").value;
      if (name == "") {
        alert("Attenzione nome non inserito");
        return "";
      }

      if (password1 == "") {
        alert("Attenzione prima password non inserita");
        return "";
      }

      if (password1 === password2) {
        let hashObj = new jsSHA("SHA-512", "TEXT", { numRounds: 1 });
        hashObj.update(password1);
        let hash = hashObj.getHash("HEX");

        let Auth = btoa(name + "." + hash);
        let header = {
          Authorization: `Basic ${Auth}`,
          "Content-Type": "application/json",
        };
        let response = fetch(`apiSignUp/SignUp`, {
          method: "GET",
          headers: header,
        })
          .then((response) => response.json())
          .then((data) => {
            jwtToken.set(data.jwtToken);

            SignUpLoginLogoutButtons.showLogoutButton();
            this.mostraViaggi();
            travelList.setThisDay();
            travelList.retrieveData();
          })
          .catch((err) => {
            SignUpLoginLogoutButtons.logout();
          });
      } else {
        alert("Le password non corrispondono");
        document.querySelector("#repeatpasswordsignup").value = "";
        return "";
      }

      document.querySelector("#namesignup").value = "";
      document.querySelector("#passwordsignup").value = "";
      document.querySelector("#repeatpasswordsignup").value = "";
    },
    mostraViaggi: function () {
      divViaggi = document.querySelector("#elenco-viaggi-giornata");
      divViaggi.style.display = "block";
      divTappe = document.querySelector("#login");
      divTappe.style.display = "none";
    },
  },
});

function setAuthHeader(header) {
  if (jwtToken.isPresent) {
    header.Authorization = "Bearer " + jwtToken.get();
  }
  return header;
}

function clearGeoJsonLayer() {
  if (map.hasLayer(geoJsonLayer)) {
    geoJsonLayer.removeFrom(map);
    geoJsonLayer = L.geoJSON();
  }
}

function clearCirclesLayer() {
  if (map.hasLayer(circles)) {
    map.removeLayer(circles);
    circles = L.featureGroup();
  }
}
