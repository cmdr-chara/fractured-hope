const fs = require("fs");
const path = "./.quartz/plugins/graph/src/components/scripts/graph.inline.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  /simulation\.force\("collide", d3\.forceCollide\(\)\.radius\(function\(d\) \{\n[\s\S]*?\}\)\.iterations\(1\)\);/,
  `simulation.force("collide", d3.forceCollide().radius(function(d) {
          var numLinks = 0;
          for (var i = 0; i < graphLinks.length; i++) {
            if (graphLinks[i].source.id === d.id || graphLinks[i].target.id === d.id) {
              numLinks++;
            }
          }
          // Let them push apart naturally so it looks like an organic cloud, not a single line
          return (heartTargets.get(d.id)?.band === "outer" ? 6 : 8) + Math.sqrt(numLinks);
        }).iterations(3));`
);

// We should also decrease the strength of forceX and forceY slightly so collision can push them off the exact target.
content = content.replace(
  /\.strength\(0\.8\),/g,
  `.strength(0.3),`
);

fs.writeFileSync(path, content);
console.log("Fixed collide and force strengths");
