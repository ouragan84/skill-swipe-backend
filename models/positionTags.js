async function readTextFile(fileUrl) {
    try {
      console.log("reading from txt")
      const response = await fetch(fileUrl);
      const fileContent = await response.text();
      const lines = fileContent.split('\n');
      return lines;
    } catch (error) {
      console.error('Error reading the file:', error);
    }
  }
  
  // Call the function with the URL of your fixed file
  const tags = readTextFile('./models/tags.txt');

// const tags =
//     [
        // "Java",
        // "Python",
        // "C++",
        // "JavaScript",
        // "PHP",
        // "Ruby",
        // "Swift",
        // "Objective-C",
        // "Kotlin",
        // "Go",
        // "TypeScript",
        // "Rust",
        // "Perl",
        // "Lua",
        // "Bash - Shell",
        // "Powershell",
        // "Scala",
        // "R",
        // "MATLAB",
        // "Dart",
        // "Visual Basic (VB)",
        // "C#",
        // "Haskell",
        // "Erlang",
        // "Lisp",
        // "Clojure",
        // "Assembly language",
        // "SQL (Structured Query Language)",
        // "HTML/CSS",
        // "XML",
        // "JSON",
        // "GraphQL",
        // "Solidity (for blockchain)",
        // "Dart (for Flutter)",
        // "Julia",
        // "Groovy",
        // "Tcl (Tool Command Language)",
        // "Prolog",
        // "Ada",
        // "Cobol",
        // "ReactJS",
        // "Angular",
        // "Vue.js",
        // "Ruby on Rails",
        // "Django",
        // "Laravel",
        // "Express.js",
        // "Flask",
        // "ASP.NET",
        // "Spring Boot",
        // "Database management",
        // "Agile methodology",
        // "Object-oriented programming",
        // "Algorithms",
        // "Machine learning",
        // "Data analytics",
        // "Cloud computing",
        // "DevOps",
        // "UX/UI design",
        // "Mobile app development",
        // "Version control",
        // "Network security",
        // "System administration",
        // "Artificial intelligence",
        // "Computer graphics",
        // "Test-driven development",
        // "Project management",
        // "Web server administration",
        // "Scripting",
        // "Data visualization",
        // "Cybersecurity",
        // "Data mining",
        // "Operating systems",
        // "API design",
        // "Embedded systems",
        // "Virtualization",
        // "Data modeling",
        // "Information retrieval",
        // "Distributed systems",
        // "Computer vision",
        // "Natural language processing",
        // "Big data",
        // "Microservices",
        // "Data warehousing",
        // "Serverless computing",
        // "Containerization",
        // "Object-relational mapping",
        // "Business intelligence",
//     ]
//     // TODO: Add more tags


  module.exports = {tags};