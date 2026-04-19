const fs = require("fs");
const path = "./.quartz/plugins/graph/src/components/scripts/graph.inline.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  /simulation\.force\("collide", d3\.forceCollide\(\)\.radius\(function\(d\) \{\n[\s\S]*?\}\)\.iterations\(3\)\);/,
  `simulation.force("collide", d3.forceCollide().radius(function(d) {
          // Minimal collision so nodes can form the dense cloud shape without pushing each other into blobs!
          return 1.5;
        }).iterations(1));`
);

content = content.replace(
  /\.strength\(0\.3\),/g,
  `.strength(0.85),`
);

fs.writeFileSync(path, content);
console.log("Fixed graph.inline.ts to lock precise shape");
