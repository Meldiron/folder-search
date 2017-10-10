const fs = require('fs');
const path = require('path');

const info = {
    folder: './ftp/',
    searchFor: 'header('
};

console.log("Your paramenters: ");
console.log(info);
console.log("");

let appStats = {
    filesSearched: 0,
    foldersSearched: 0,
    time: Date.now()
};

let foundFiles = [
    /*
      {
          address: "ftp/css/main.css",
          line: 14,
          lineText: "       width: 500px;",
          found: "500px"
      }  
    */
];

readDirectory(info.folder);

function readDirectory(dir) {
    //console.log("Checking direcotry " + dir);
    fs.readdir(dir, (err, files) => {
        if(err) {
            console.log("Error while reading " + dir + " folder.");
            console.log(err);
            process.exit();
        }

        if(files.length == 0) {
            console.log("Folder " + dir + " is empty.");
            return;
        }

        for(let i = 0; i < files.length; i++) {
            let file = files[i];
            let address = path.join(dir, file);

            fs.lstat(address, (err, stats) => {
                if(err) {
                    console.log("Error while getting info about file " + file);
                    console.log(err);
                    process.exit();
                }

                if(stats.isFile() == true) {
                    appStats.filesSearched += 1;
                    fs.readFile(address, 'utf8', (err, data) => {
                        if(err) {
                            console.log("Error while reading file " + address);
                            console.log(error);
                            process.exit();
                        }

                        if(data.indexOf(info.searchFor) != -1) {
                            let part = data.split(info.searchFor)[0].split("\n");
                            let part2 = data.split(info.searchFor)[1].split("\n")[0];

                            let line = part.length;
                            let lineText = part[part.length - 1] + info.searchFor + part2;
                            let found = info.searchFor;

                            foundFiles.push({
                                address: address,
                                line: line,
                                lineText: lineText,
                                found: found
                            });
                        }
                    });
                } else {
                    appStats.foldersSearched += 1;
                    readDirectory( address );
                }

            });
        }

    });
}

process.on('exit', () => {
    console.log("Searched files: " + appStats.filesSearched);
    console.log("Searched folders: " + appStats.foldersSearched);
    console.log("Time spent doing this: " + ( Date.now() - appStats.time ) + "ms");
    console.log("Found " + foundFiles.length + " matches (files)");

    if(foundFiles.length > 0) {
        console.log("\n");
        
        for(let i = 0; i < foundFiles.length; i++) {
            console.log("");
            console.log(foundFiles[i].address);
            console.log("   Line:       " + foundFiles[i].line);
            console.log("   Found:      " + foundFiles[i].found);
            console.log("   Line Text:  " + foundFiles[i].lineText);
            console.log("");
        }
    }
});