
async function getData() {
    try {
        let res = await fetch("https://crud-operations-go9g.onrender.com/data")
        if (!res.ok) {
            throw new Error("Something went Error");
        }
        let data = await res.json()
        fetchData(data)
    } catch (error) {
        console.log(error.message);
    }
}

function fetchData(data) {
    let div = document.getElementById("container");
    div.innerHTML = "";
    data.forEach(ele => {
        let p = document.createElement("p")
        p.innerHTML = `
        <h3>Animal ID: ${ele.id}</h3>
        <h4>Animal Name: ${ele.name}<h4>
        <img src = "${ele.image}">
        <button onclick= deleteData('${ele.id}')>Delete</button>
        <button onclick= editData('${ele.id}','${ele.name}','${ele.image}')>Edit</button>`
        div.appendChild(p);
    });
}

//For Deleting Purpose
async function deleteData(id) {
    let res1 = await fetch(`https://crud-operations-go9g.onrender.com/data/${id}`, {
        "method": "DELETE"
    });
    alert("Animal Details Removed Succesfully")
    getData();
}
getData();

//For Edit purpose
function editData(id, name, image) {
    document.getElementById("id").value = id;
    document.getElementById("name").value = name;
    document.getElementById("image").value = image;
}


//For Add after editing the data and New data Adding
let btn = document.getElementById("saveData")
btn.onclick = async () => {
    let id = document.getElementById("id").value;
    let name = document.getElementById("name").value;
    let image = document.getElementById("image").value;

    if (!id || !name || !image) {
        alert("Please Enter valid ID, Name, URL");
        return;
    }

    let res = await fetch(`https://crud-operations-go9g.onrender.com/data/${id}`)
    if (res.ok) {
        let edited = await fetch(`https://crud-operations-go9g.onrender.com/data/${id}`, {
            "method": "PATCH",
            "headers": {
                "Content-type": "application/json"
            },
            "body": JSON.stringify({
                name,
                image
            })
        });
        alert("Animal Details New Details added SuccesFully");
    }
    else {
        let newlyAdded = await fetch(`https://crud-operations-go9g.onrender.com/data`, {
            "method": "POST",
            "headers": {
                "Content-type": "application/json"
            },
            "body": JSON.stringify({
                id,
                name,
                image
            })
        });
         alert("Animal Details added SuccesFully");
    }
    getData();
}