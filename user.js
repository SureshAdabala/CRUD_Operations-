
// Check for User Login
if (!sessionStorage.getItem("username")) {
    window.location.href = "login.html";
}

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? "http://localhost:3000" : "";

async function gettingData() {
    try {
        let res = await fetch(`${API_BASE}/data`);
        if (!res.ok) {
            throw new Error("Something Went Wrong");
        }
        let data = await res.json();
        fetchData1(data);
    } catch (error) {
        console.log(error.message);
    }
}

function fetchData1(data) {
    let div1 = document.getElementById("container");
    data.forEach(ele => {
        let p = document.createElement("p");
        p.innerHTML = `
         <h3>Animal ID: ${ele.id}</h3>
        <h4>Animal Name: ${ele.name}</h4>
        <img src="${ele.image}">`
        div1.appendChild(p);
    });
}
gettingData();

