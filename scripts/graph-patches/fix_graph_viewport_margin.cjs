const fs = require("fs")

const path = "./.quartz/plugins/graph/src/components/scripts/graph.inline.ts"
let content = fs.readFileSync(path, "utf-8")

content = content.replace(
  /var heartContainmentScale = Math\.min\(width, height\) (?:\/ 2|\* 0\.\d+);/,
  "var heartContainmentScale = Math.min(width, height) * 0.42;",
)

fs.writeFileSync(path, content)
console.log("Updated heart graph viewport margin")
