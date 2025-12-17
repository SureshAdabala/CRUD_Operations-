async function gettingData() {
    try {
        let res = await fetch("https://crud-operations-go9g.onrender.com/data");
        if(!res.ok) {
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
    data.forEach(ele=>{
        let p = document.createElement("p");
        p.innerHTML = `
         <h3>Animal ID: ${ele.id}</h3>
        <h4>Animal Name: ${ele.name}<h4>
        <img src = "${ele.image}">`
        div1.appendChild(p);
    });
}
gettingData();

