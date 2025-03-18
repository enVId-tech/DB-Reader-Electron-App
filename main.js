var str = "";

for (let i = 0; i < 100000; i++) {
    Math.random() > 0.5 ? str += "1" : str += "0";
}

console.log(str);