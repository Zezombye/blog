import fs from "node:fs";

let bashrcContent = fs.readFileSync("bashrc.sh", 'utf-8');
let lastModifiedBashrc = fs.statSync("bashrc.sh").mtime.toISOString();
bashrcContent = bashrcContent.replaceAll("###DATE###", lastModifiedBashrc);

function processFile(file, dest) {
    let content = fs.readFileSync(file, 'utf-8');
    let lastModified = fs.statSync(file).mtime.toISOString();
    content = content.replaceAll("###DATE###", lastModified);
    content = content.replaceAll("###BASHRC###", bashrcContent);
    fs.writeFileSync("articles/public/"+(dest || file), content);
}

processFile("windows-setup.ps1");
processFile("bashrc.sh");
