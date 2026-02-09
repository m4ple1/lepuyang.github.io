mapboxgl.accessToken = 'pk.eyJ1IjoibTRwbGUiLCJhIjoiY21rY25yeGtnMDJraDNrc2NxY2F4dnp0dSJ9.TvZIPGyyoAXt4x4N3D1CWA';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [105.0, 36.0],
    zoom: 3.2,
    projection: 'globe'
});

let allChinaFeatures = []; 
const chinaBbox = { minLon: 73, maxLon: 135, minLat: 18, maxLat: 54 };

map.on('load', async () => {
    map.setFog({ 'color': 'rgb(186, 210, 235)', 'high-color': 'rgb(36, 92, 223)', 'horizon-blend': 0.02 });

    // Fetch data
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson');
    const globalData = await response.json();
    
    // Spatial Filter (China Region)
    allChinaFeatures = globalData.features.filter(feature => {
        const [lon, lat] = feature.geometry.coordinates;
        return lon >= chinaBbox.minLon && lon <= chinaBbox.maxLon &&
               lat >= chinaBbox.minLat && lat <= chinaBbox.maxLat;
    });

    // Add Source
    map.addSource('china-quakes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: allChinaFeatures }
    });

    // Heatmap Layer
    map.addLayer({
        id: 'quake-heat',
        type: 'heatmap',
        source: 'china-quakes',
        paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 2.5, 0, 6, 1],
            'heatmap-radius': 45,
            'heatmap-opacity': 0.5
        }
    });

    // Circle Layer
    map.addLayer({
        id: 'quake-circles',
        type: 'circle',
        source: 'china-quakes',
        paint: {
            'circle-radius': ['interpolate', ['linear'], ['get', 'mag'], 3, 4, 6, 15],
            'circle-color': ['interpolate', ['linear'], ['get', 'mag'], 3, '#f1c40f', 5, '#e67e22', 7, '#c0392b'],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.9
        }
    });

    updateCount(allChinaFeatures);

    // Interaction: Search
    document.getElementById('search-box').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const currentMag = parseFloat(document.getElementById('mag-slider').value);
        
        const filtered = allChinaFeatures.filter(f => 
            f.properties.place.toLowerCase().includes(keyword) &&
            f.properties.mag >= currentMag
        );
        
        map.getSource('china-quakes').setData({ type: 'FeatureCollection', features: filtered });
        updateCount(filtered);
    });

    // Interaction: Slider
    document.getElementById('mag-slider').addEventListener('input', (e) => {
        const mag = parseFloat(e.target.value);
        const keyword = document.getElementById('search-box').value.toLowerCase();
        
        document.getElementById('mag-label').innerText = mag;
        
        const filtered = allChinaFeatures.filter(f => 
            f.properties.mag >= mag &&
            f.properties.place.toLowerCase().includes(keyword)
        );
        
        map.getSource('china-quakes').setData({ type: 'FeatureCollection', features: filtered });
        updateCount(filtered);
    });

    // Interaction: Click Popup
    map.on('click', 'quake-circles', (e) => {
        showPopup(e.features[0]);
    });
    
    map.on('mouseenter', 'quake-circles', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'quake-circles', () => map.getCanvas().style.cursor = '');
});

function updateCount(features) {
    document.getElementById('count').innerText = features.length;
}

// Function: Fly to Max
window.flyToMax = function() {
    const mag = parseFloat(document.getElementById('mag-slider').value);
    const keyword = document.getElementById('search-box').value.toLowerCase();
    const currentFeatures = allChinaFeatures.filter(f => f.properties.mag >= mag && f.properties.place.toLowerCase().includes(keyword));

    if (currentFeatures.length === 0) {
        alert("No earthquakes found in current view!");
        return;
    }

    const maxQuake = currentFeatures.reduce((prev, current) => 
        (prev.properties.mag > current.properties.mag) ? prev : current
    );

    map.flyTo({
        center: maxQuake.geometry.coordinates,
        zoom: 7,
        speed: 1.5,
        curve: 1
    });

    showPopup(maxQuake);
};

// Function: Reset
window.resetMap = function() {
    document.getElementById('search-box').value = '';
    document.getElementById('mag-slider').value = 2.5;
    document.getElementById('mag-label').innerText = '2.5';
    
    map.getSource('china-quakes').setData({ type: 'FeatureCollection', features: allChinaFeatures });
    updateCount(allChinaFeatures);
    
    map.flyTo({ center: [105.0, 36.0], zoom: 3.2 });
};

function showPopup(feature) {
    const coords = feature.geometry.coordinates.slice();
    const props = feature.properties;
    
    const date = new Date(props.time).toLocaleString('en-US', { hour12: false });

    new mapboxgl.Popup()
        .setLngLat(coords)
        .setHTML(`
            <h3 style="margin:0; color:#2c3e50;">Mag: ${props.mag}</h3>
            <p style="margin:5px 0; font-size:13px; border-bottom:1px solid #eee; padding-bottom:5px;">📍 ${props.place}</p>
            <p style="margin:5px 0; color:#888; font-size:12px;">🕒 ${date}</p>
            <a href="${props.url}" target="_blank" style="color:#3498db; text-decoration:none; font-size:12px; font-weight:bold;">View on USGS &rarr;</a>
        `)
        .addTo(map);
}