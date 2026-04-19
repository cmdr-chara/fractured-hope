const fs = require("fs");
const path = "./.quartz/plugins/graph/src/components/scripts/graph.inline.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  /simulation\.force\("collide", d3\.forceCollide\(\)\.radius\(function\(d\) \{\n[\s\S]*?\}\)\.iterations\(1\)\);/,
  `simulation.force("collide", null); // NO collision to allow perfect straight lines`
);

content = content.replace(
  /simulation\.force\("link", d3\.forceLink\(graphLinks\)\.distance\(linkDistance\)\.strength\(0\.01\)\);/,
  `simulation.force("link", d3.forceLink(graphLinks).distance(linkDistance).strength(0)); // disable link pulling completely for perfect shape`
);

fs.writeFileSync(path, content);
console.log("Fixed graph.inline.ts physics");
