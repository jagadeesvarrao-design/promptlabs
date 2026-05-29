const fs = require('fs');
const { marked } = require('marked');

const markdown = fs.readFileSync('C:\\Users\\DELL\\.gemini\\antigravity\\brain\\7b08f764-ce78-4a1d-8d9a-669b40aee6e7\\promptlab_project_report.md', 'utf-8');

const htmlContent = marked(markdown);

const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PromptLab Project Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        h1, h2, h3 { color: #1a202c; margin-top: 1.5em; }
        h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        h2 { border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        p, li { font-size: 16px; color: #4a5568; }
        ul, ol { padding-left: 20px; }
        li { margin-bottom: 8px; }
        strong { color: #2d3748; }
        em { color: #4a5568; }
        blockquote {
            background: #ebf4ff;
            border-left: 4px solid #3182ce;
            margin: 1.5em 0;
            padding: 1em;
            border-radius: 4px;
        }
        blockquote p { margin: 0; color: #2b6cb0; font-weight: 500; }
        hr { border: 0; height: 1px; background: #e2e8f0; margin: 2em 0; }
        @media print {
            body { max-width: 100%; padding: 0; font-size: 12pt; }
            h1, h2, h3 { page-break-after: avoid; }
            blockquote { background: none; border-left: 2px solid #ccc; color: #333; }
            a { text-decoration: none; color: #000; }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>
`;

fs.writeFileSync('C:\\Users\\DELL\\OneDrive\\Desktop\\PromptLab_Project_Report.html', finalHtml);
console.log('Done!');
