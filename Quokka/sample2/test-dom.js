//#region Setup

({ "plugins": [ "jsdom-quokka-plugin", "quokka-jquery-loader" ] })

let filename = 'index.html' // <<== Setup your file here

let path = require('path')
let fs = require('fs')
let __html = path.join(__dirname, filename)
let __root = document.getElementsByTagName('html')[0];
__root.innerHTML = fs.readFileSync(__html, { encoding: 'UTF8'});

//#endregion

let a = document.getElementById('id1')
let b = document.getElementById('id2')
console.log(a.innerHTML)
console.log(b.innerHTML)
