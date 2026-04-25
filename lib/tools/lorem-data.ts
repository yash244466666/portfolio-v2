const loremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde",
  "omnis", "iste", "natus", "error", "voluptatem", "accusantium", "doloremque",
  "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo",
  "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta",
  "explicabo", "nemo", "ipsam", "voluptas", "aspernatur", "aut", "odit",
  "fugit", "consequuntur", "magni", "dolores", "eos", "ratione", "sequi",
  "nesciunt", "neque", "porro", "quisquam", "nihil", "impedit", "quo",
  "minus", "quod", "maxime", "placeat", "facere", "possimus", "assumenda",
  "repellendus", "temporibus", "quibusdam", "illum", "corporis", "suscipit",
  "laboriosam", "distinctio",
]

function randomWord(): string {
  return loremWords[Math.floor(Math.random() * loremWords.length)]
}

function randomSentence(): string {
  const length = 8 + Math.floor(Math.random() * 12)
  const words = Array.from({ length }, () => randomWord())
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  return words.join(" ") + "."
}

function randomParagraph(): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 5)
  return Array.from({ length: sentenceCount }, () => randomSentence()).join(" ")
}

export function generateLoremIpsum(count: number, unit: "paragraphs" | "sentences" | "words"): string {
  switch (unit) {
    case "paragraphs":
      return Array.from({ length: count }, () => randomParagraph()).join("\n\n")
    case "sentences":
      return Array.from({ length: count }, () => randomSentence()).join(" ")
    case "words":
      return Array.from({ length: count }, () => randomWord()).join(" ")
  }
}