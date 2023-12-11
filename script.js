import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';


const email = document.getElementById("email");

email.addEventListener("click", function(event) {
    event.preventDefault();
    this.setAttribute("href", "mailto:".concat(atob("YWFya2ltQHRhbXUuZWR1")));
    window.location.href = this.getAttribute("href");
})

const container = document.getElementById('model-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(20, 250, 0);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
});

const loader = new GLTFLoader();
let model = null;
loader.load(`./model/brain.glb`, (glb) => {
    model = glb.scene;

    model.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material.color.set(0xe1cfbb); 
        }
    });

    model.position.set(0, 0, 0);
    camera.lookAt(model.position);
    scene.add(model);
    animate(0);
});

var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Create a directional light
var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);


new fullpage('#fullpage', {
    licenseKey: "gplv3-license",
    scrollingSpeed: 1000,
    smoothScrolling: true,
    afterRender: function () {
        document.querySelectorAll('.section').forEach((section) => {
            section.style.opacity = '0';
        });
        setTimeout(() => {
            document.querySelector('.first-section').style.opacity = '1';
        }, 100);
    },
    onLeave: function (origin, destination, direction) {
        document.getElementById('header').classList.add('disabled');
        updateModelPosition(origin, destination, direction);
        // Fade out the current section
        origin.item.style.transition = 'opacity 0.7s ease';
        origin.item.style.opacity = '0';
        // Pre-fade-in the next section
        const nextSection = destination.item;
        nextSection.style.transition = 'opacity 3s ease';
        nextSection.style.opacity = '1';
    },
    afterLoad: function() {
        document.getElementById('header').classList.remove('disabled');
    }
});


// Define positions and quaternions for each section
const sectionPositions = {
    home: new THREE.Vector3(0, 0, 0),
    about: new THREE.Vector3(50, 5, 100),
    experience: new THREE.Vector3(60, 5, -150),
    projects: new THREE.Vector3(0, -100, 0),
    contact: new THREE.Vector3(0, 0, 0)
};

const sectionQuaternions = {
    home: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),
    about: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, Math.PI, Math.PI + (Math.PI / 2))),
    experience: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, Math.PI, Math.PI + (Math.PI / 2))),
    projects: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0)),
    contact: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0))
};


// Animation state
let animationState = {
    startPosition: new THREE.Vector3(),
    endPosition: new THREE.Vector3(),
    startQuaternion: new THREE.Quaternion(),
    endQuaternion: new THREE.Quaternion()
};


// Variables to control animation
let animationProgress = 0; // Starts at 0, ends at 1
let lastTime = 0;

// Animation loop
function animate(time) {
    requestAnimationFrame(animate);

    // Calculate the time elapsed since the last frame
    const deltaTime = time - lastTime;
    lastTime = time;

    // Normalize the time based on your desired animation speed
    const speed = 0.001; 
    animationProgress += deltaTime * speed;

    // Clamp the progress between 0 and 1
    if (animationProgress > 1) animationProgress = 1;

    model.position.lerpVectors(animationState.startPosition, animationState.endPosition, animationProgress);
    model.quaternion.copy(animationState.startQuaternion.clone().slerp(animationState.endQuaternion, animationProgress));

    renderer.render(scene, camera);
}


function updateModelPosition(origin, destination) {

    animationState.startPosition.copy(sectionPositions[origin.anchor]);
    animationState.endPosition.copy(sectionPositions[destination.anchor]);
    animationState.startQuaternion.copy(sectionQuaternions[origin.anchor]);
    animationState.endQuaternion.copy(sectionQuaternions[destination.anchor]);

    animationProgress = 0; // Reset the animation progress
}