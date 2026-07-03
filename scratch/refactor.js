const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let needToolResultImport = false;
  let needSelectImport = false;

  // 1. Refactor selects
  if (content.includes('<select')) {
    content = content.replace(/<select\b/g, '<Select').replace(/<\/select>/g, '</Select>');
    content = content.replace(/className="[^"]*h-9[^"]*"/g, ''); // strip old hardcoded select classes
    needSelectImport = true;
  }

  // 2. Refactor standard output boxes into ToolResult
  let idx = 0;
  while (true) {
    const substr = content.slice(idx);
    // Find generic output boxes with bg-muted/30
    const match = substr.match(/<div[^>]*className="[^"]*bg-muted\/30[^"]*"[^>]*>/);
    if (!match) break;
    
    const startIdx = idx + match.index;
    const matchString = match[0];
    
    // Ignore if it's already refactored or has group-hover (specific cases)
    if (matchString.includes('group-hover')) {
      idx = startIdx + 1;
      continue;
    }
    
    let openDivs = 0;
    let endIdx = -1;
    for (let i = startIdx; i < content.length; i++) {
      if (content.slice(i, i + 4) === '<div') {
        let j = i + 4;
        let isSelfClosing = false;
        while(j < content.length && content[j] !== '>') {
          if (content.slice(j, j + 2) === '/>') {
            isSelfClosing = true;
            break;
          }
          j++;
        }
        if (!isSelfClosing) openDivs++;
      }
      if (content.slice(i, i + 6) === '</div>') {
        openDivs--;
        if (openDivs === 0) {
          endIdx = i;
          break;
        }
      }
    }
    
    if (endIdx !== -1) {
      // Replace opening
      let newOpening = matchString.replace('<div', '<ToolResult');
      // Strip border and bg and p-3/p-4 from the className so it uses ToolResult's default style,
      // but retain other layout classes if any
      newOpening = newOpening.replace(/bg-muted\/30/g, '')
                             .replace(/border border-border\/50/g, '')
                             .replace(/border border-border/g, '')
                             .replace(/p-3|p-4|p-5/g, '')
                             .replace(/rounded-lg|rounded-xl|rounded-md/g, '')
                             .replace(/className="\s+"/g, ''); // empty classes

      content = content.slice(0, startIdx) + newOpening + content.slice(startIdx + matchString.length, endIdx) + '</ToolResult>' + content.slice(endIdx + 6);
      idx = startIdx + newOpening.length;
      needToolResultImport = true;
    } else {
      idx = startIdx + 1;
    }
  }

  if (content !== originalContent) {
    if (needSelectImport && !content.includes('import { Select }')) {
      content = content.replace(/(import .* from ".*"\n)/, '$1import { Select } from "@/components/ui/select"\n');
    }
    if (needToolResultImport && !content.includes('import { ToolResult }')) {
      content = content.replace(/(import .* from ".*"\n)/, '$1import { ToolResult } from "@/components/tools/shared/tool-result"\n');
    }
    fs.writeFileSync(file, content);
    console.log(`Refactored: ${file}`);
  }
}

const files = walk(path.join(__dirname, '../components/tools'));
files.forEach(processFile);
console.log('Done!');
