function B() {
    return new Promise(res => {
        setTimeout(function() {
            console.log("B");
            res();
        }, 2000);
    });
}

async function A() {
    await B();
    return B();
}

A().then(() => console.log("after A"));
