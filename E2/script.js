// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoibTRwbGUiLCJhIjoiY21rY214Z3R5MDJncDNkc2NuYTBueXR0YiJ9.qUDSp4lhMw83dHVfbj_LqQ";
const style_2025 = "mapbox://styles/m4ple/cmkwjfyh9002q01sbh7kl3kqk";
const style_2024 = "mapbox://styles/m4ple/cmkwj990t008401sb4po6gh0k";
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: style_2025,
  center: [-1.59932, 54.754441],
  zoom: 14
});
const layerList = document.getElementById("menu");
const inputs = layerList.getElementsByTagName("input");
//On click the radio button, toggle the style of the map.
for (const input of inputs) {
  input.onclick = (layer) => {
    if (layer.target.id == "style_2025") {
      map.setStyle(style_2025);
    }
    if (layer.target.id == "style_2024") {
      map.setStyle(style_2024);
    }
  };
}