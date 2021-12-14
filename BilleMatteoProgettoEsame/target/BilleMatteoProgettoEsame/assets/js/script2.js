import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';

export default {
  name: 'MyAwesomeMap',
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
};

var vm = new Vue({
    el:'#page',
    data:{
        firstName:"Matteo",
        lastname:"Billè"
    }
})