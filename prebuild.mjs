import fs from "node:fs";

function processFile(file, dest) {
    let content = fs.readFileSync(file, 'utf-8');
    let lastModified = fs.statSync(file).mtime.toISOString();
    content = content.replaceAll("###DATE###", lastModified);
    fs.writeFileSync("articles/public/"+(dest || file), content);
}

processFile("windows-setup.ps1");
processFile("bashrc.sh");
