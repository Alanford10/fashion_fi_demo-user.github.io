const loadPlaces = function(coords) {
    // COMMENT FOLLOWING LINE IF YOU WANT TO USE STATIC DATA AND ADD COORDINATES IN THE FOLLOWING 'PLACES' ARRAY
    const method = 'api';

    const PLACES = [{
        name: "Your place name",
        location: {
            lat: 37.4259629, // add here latitude if using static data
            lng: -122.0723533, // add here longitude if using static data
        }
    }, ];

    if (method === 'api') {
        return loadPlaceFromAPIs(coords);
    }

    return Promise.resolve(PLACES);
};

// getting places from REST APIs
/*
// TODO (Zixuan): This function takes in FourSquare API location json files=, but not accessible for now
function loadPlaceFromAPIs(position) {
    const params = {
        radius: 300, // search places not farther than this value (in meters)
        clientId: 'QK1HLVNMWI30QWPFU1HCL2CCKYU35Y2GUOZGQ5E4MWX1VLYO',
        clientSecret: '1D1BN0TVUSI5W0Y4ENA3WCU3HJ3O3OKRPF5RC1DGJIQY1EOG',
        version: '20180604', // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    const endpoint = `https://api.foursquare.com/v2/venues/search?client_id=${params.clientId}&client_secret=${params.clientSecret}&ll=${position.latitude},${position.longitude}&radius=${params.radius}&v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};
*/
// This function takes in local json location files
function loadPlaceFromAPIs(position) {
    return fetch("place.json")
        .then(response => response.json())
        .then(json => { return json.response.venues; });
};


// this click listener has to be added simply to a click event on an a-entity element
const clickListener = function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    const name = ev.target.getAttribute('name');
    const el = ev.detail.intersection && ev.detail.intersection.object.el;

    if (el && el === ev.target) {
        // after click, we are adding a label with the name of the place
        const label = document.createElement('span');
        const container = document.createElement('div');
        container.setAttribute('id', 'place-label');
        label.innerText = name;
        container.appendChild(label);
        document.body.appendChild(container);

        setTimeout(() => {
            // that will disappear after less than 2 seconds
            container.parentElement.removeChild(container);
        }, 1500);
    }
};

function loadModelFromJson() {
    models_json = fetch("models.json").then(response => response.json());
    var models = [{
            url: './assets/magnemite/scene.gltf',
            scale: '0.5 0.5 0.5',
            info: 'Magnemite, Lv. 5, HP 10/10',
            rotation: '0 180 0',
        },
        {
            url: './assets/articuno/scene.gltf',
            scale: '0.2 0.2 0.2',
            rotation: '0 180 0',
            info: 'Articuno, Lv. 80, HP 100/100',
        },
        {
            url: './assets/dragonite/scene.gltf',
            scale: '0.08 0.08 0.08',
            rotation: '0 180 0',
            info: 'Dragonite, Lv. 99, HP 150/150',
        },
    ];
    return models;
}


var modelIndex = 0;
var setModel = function(model, entity) {
    if (model.scale) {
        entity.setAttribute('scale', model.scale);
    }

    if (model.rotation) {
        entity.setAttribute('rotation', model.rotation);
    }

    if (model.position) {
        entity.setAttribute('position', model.position);
    }

    entity.setAttribute('gltf-model', model.url);

    const div = document.querySelector('.instructions');
    div.innerText = model.info;
};


window.onload = () => {
    const scene = document.querySelector('a-scene');

    // first get current user location
    return navigator.geolocation.getCurrentPosition(function(position) {
            console.log(position);

            // than use it to load from remote APIs some places nearby
            loadPlaces(position.coords)
                .then((places) => {
                    places.forEach((place) => {
                        const latitude = place.location.lat;
                        const longitude = place.location.lng;
                        // add place name
                        const placeText = document.createElement('a-link');
                        placeText.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
                        placeText.setAttribute('title', place.name);
                        placeText.setAttribute('scale', '15 15 15');

                        placeText.addEventListener('loaded', () => {
                            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
                        });

                        scene.appendChild(placeText);
                    });
                })
        },
        (err) => console.error('Error in retrieving position', err), {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};