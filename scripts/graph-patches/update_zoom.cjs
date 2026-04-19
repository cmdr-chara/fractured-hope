const fs = require("fs");
const path = "./.quartz/plugins/graph/src/components/scripts/graph.inline.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  /for \(var i = 0; i < labelsContainer\.children\.length; i\+\+\) {[\s\S]*?if \(activeLabels\.indexOf\(label\) === -1\) {[\s\S]*?label\.alpha = scaleOpacity;[\s\S]*?}[\s\S]*?}/m,
  `for (var i = 0; i < labelsContainer.children.length; i++) {
            var label = labelsContainer.children[i];
            if (activeLabels.indexOf(label) === -1) {
              // In global heart mode, don't show a sea of text on zoom to keep the shape clean
              if (heartTargets) {
                 label.alpha = 0;
              } else {
                 label.alpha = scaleOpacity;
              }
            }
          }`
);

fs.writeFileSync(path, content);
console.log("Updated zoom labels");
