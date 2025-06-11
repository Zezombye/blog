import fs from "node:fs";

function processFile(file) {
    let content = fs.readFileSync(file, 'utf-8');
    let lastModified = fs.statSync(file).mtime.toISOString();
    content = content.replace("###DATE###", lastModified);
    fs.writeFileSync("articles/public/"+file, content);
}

processFile("windows-setup.ps1");
