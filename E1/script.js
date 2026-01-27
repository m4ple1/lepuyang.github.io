// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoibTRwbGUiLCJhIjoiY21rY214Z3R5MDJncDNkc2NuYTBueXR0YiJ9.qUDSp4lhMw83dHVfbj_LqQ";
//Before map
const beforeMap = new mapboxgl.Map({
  container: "before",
  style: "mapbox://styles/m4ple/cmkwj990t008401sb4po6gh0k",
  center: [-1.59932, 54.754441],
  zoom: 14
});
//After map
const afterMap = new mapboxgl.Map({
  container: "after",
  style: "mapbox://styles/m4ple/cmkwjfyh9002q01sbh7kl3kqk",
  center: [-1.59932, 54.754441],
  zoom: 14
});
const container = "#comparison-container";
const map = new mapboxgl.Compare(beforeMap, afterMap, container, {});