// Generator: GUIDE.md → 互动书操作指南.docx
//
// Reads GUIDE.md, lexes it with marked, and emits a Word document.
// This means the docx automatically tracks any future GUIDE.md edits.
//
// Usage:
//   npm install -g docx marked
//   NODE_PATH=$(npm root -g) node gen-docx.js

const fs = require('fs');
const marked = require('marked');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, Footer, ExternalHyperlink
} = require('docx');

// ─── style constants ────────────────────────────────────────────────────

const FONT = 'Arial';
const MONO = 'Menlo';
const ACCENT = 'B45309';
const MUTED = '64748B';
const CODE_BG = 'F1F5F9';
const QUOTE_BAR = 'B45309';
const TBL_HEAD_BG = '0F172A';
const TBL_HEAD_FG = 'F8FAFC';
const TBL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' };
const CELL_BORDERS = { top: TBL_BORDER, bottom: TBL_BORDER, left: TBL_BORDER, right: TBL_BORDER };

const CONTENT_WIDTH = 9360;

// ─── inline tokens → TextRun[] ──────────────────────────────────────────

function inlineRuns(tokens, opts = {}) {
  const out = [];
  for (const t of tokens || []) {
    switch (t.type) {
      case 'text':
        out.push(new TextRun(Object.assign({
          text: t.text, font: FONT, size: opts.size || 22
        }, opts.run)));
        break;
      case 'strong':
        out.push(...inlineRuns(t.tokens, {
          ...opts,
          run: Object.assign({}, opts.run, { bold: true })
        }));
        break;
      case 'em':
        out.push(...inlineRuns(t.tokens, {
          ...opts,
          run: Object.assign({}, opts.run, { italics: true })
        }));
        break;
      case 'codespan':
        out.push(new TextRun({
          text: t.text, font: MONO, size: 20,
          shading: { fill: CODE_BG, type: ShadingType.CLEAR }
        }));
        break;
      case 'link':
        out.push(new ExternalHyperlink({
          children: inlineRuns(t.tokens, { run: { style: 'Hyperlink' }, size: opts.size }),
          link: t.href
        }));
        break;
      case 'br':
        out.push(new TextRun({ text: '\n', font: FONT, size: opts.size || 22 }));
        break;
      case 'del':
        out.push(...inlineRuns(t.tokens, {
          ...opts,
          run: Object.assign({}, opts.run, { strike: true })
        }));
        break;
      case 'html':
        // strip plain html tags, render the text only
        out.push(new TextRun({
          text: t.text.replace(/<[^>]+>/g, ''), font: FONT, size: opts.size || 22
        }));
        break;
      case 'escape':
        out.push(new TextRun({ text: t.text, font: FONT, size: opts.size || 22 }));
        break;
      default:
        if (t.text) out.push(new TextRun({ text: t.text, font: FONT, size: opts.size || 22 }));
    }
  }
  return out;
}

// ─── block tokens → docx elements ───────────────────────────────────────

function headingPara(depth, tokens) {
  const sizes = { 1: 36, 2: 28, 3: 24 };
  const levels = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3
  };
  const colors = { 1: ACCENT, 2: ACCENT, 3: '0a1628' };
  const spacing = {
    1: { before: 360, after: 200 },
    2: { before: 280, after: 140 },
    3: { before: 200, after: 100 }
  };
  return new Paragraph({
    heading: levels[depth] || HeadingLevel.HEADING_3,
    children: inlineRuns(tokens, {
      size: sizes[depth] || 22,
      run: { bold: true, color: colors[depth] || '0a1628' }
    }),
    spacing: spacing[depth] || { before: 160, after: 100 },
    pageBreakBefore: depth === 1
  });
}

function paragraphPara(tokens) {
  return new Paragraph({
    children: inlineRuns(tokens),
    spacing: { after: 140, line: 320 }
  });
}

function blockquotePara(tokens) {
  // For each inner paragraph, render with left border and italic muted color.
  const out = [];
  for (const child of tokens || []) {
    if (child.type === 'paragraph') {
      out.push(new Paragraph({
        children: inlineRuns(child.tokens, { run: { italics: true, color: MUTED } }),
        indent: { left: 360 },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: QUOTE_BAR, space: 8 } },
        spacing: { before: 100, after: 160, line: 320 }
      }));
    } else if (child.type === 'space') {
      // skip
    } else {
      out.push(...renderBlock(child));
    }
  }
  return out;
}

function listPara(token) {
  const out = [];
  const isOrdered = token.ordered;
  const ref = isOrdered ? 'nums' : 'bullets';
  for (const item of token.items) {
    // Each list item can contain multiple inline runs and even sub-blocks.
    // For simplicity, flatten the first paragraph's inline runs.
    let runs = [];
    let sublists = [];
    for (const childTok of item.tokens || []) {
      if (childTok.type === 'text' || childTok.type === 'paragraph') {
        runs.push(...inlineRuns(childTok.tokens || [{ type: 'text', text: childTok.text || '' }]));
      } else if (childTok.type === 'list') {
        sublists.push(childTok);
      } else if (childTok.type === 'space') {
        // skip
      }
    }
    out.push(new Paragraph({
      numbering: { reference: ref, level: 0 },
      children: runs,
      spacing: { after: 80, line: 300 }
    }));
    for (const sub of sublists) {
      // nested list at level 1
      for (const subItem of sub.items) {
        const subRuns = [];
        for (const subCh of subItem.tokens || []) {
          if (subCh.type === 'text' || subCh.type === 'paragraph') {
            subRuns.push(...inlineRuns(subCh.tokens || [{ type: 'text', text: subCh.text || '' }]));
          }
        }
        out.push(new Paragraph({
          numbering: { reference: ref, level: 1 },
          children: subRuns,
          spacing: { after: 60, line: 300 }
        }));
      }
    }
  }
  return out;
}

function tablePara(token) {
  const headers = token.header.map(cell => cell.tokens || [{ type: 'text', text: cell.text || '' }]);
  const rows    = token.rows.map(row => row.map(cell => cell.tokens || [{ type: 'text', text: cell.text || '' }]));
  const colCount = headers.length;
  const colWidth = Math.floor(CONTENT_WIDTH / colCount);
  const colWidths = headers.map(() => colWidth);

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((hTokens, i) => new TableCell({
      borders: CELL_BORDERS,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: TBL_HEAD_BG, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [new Paragraph({
        children: inlineRuns(hTokens, { size: 22, run: { bold: true, color: TBL_HEAD_FG } })
      })]
    }))
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map((cellTokens, i) => new TableCell({
      borders: CELL_BORDERS,
      width: { size: colWidths[i], type: WidthType.DXA },
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [new Paragraph({
        children: inlineRuns(cellTokens, { size: 22 })
      })]
    }))
  }));

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

function hrPara() {
  return new Paragraph({
    children: [new TextRun({ text: '' })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1', space: 1 } },
    spacing: { before: 200, after: 200 }
  });
}

function codeBlockParas(text) {
  return text.split('\n').map((line, i, arr) => new Paragraph({
    children: [new TextRun({ text: line || ' ', font: MONO, size: 18 })],
    shading: { fill: CODE_BG, type: ShadingType.CLEAR },
    spacing: { after: i === arr.length - 1 ? 160 : 0, before: i === 0 ? 80 : 0, line: 260 },
    indent: { left: 200 }
  }));
}

function renderBlock(token) {
  switch (token.type) {
    case 'heading':    return [headingPara(token.depth, token.tokens)];
    case 'paragraph':  return [paragraphPara(token.tokens)];
    case 'blockquote': return blockquotePara(token.tokens);
    case 'list':       return listPara(token);
    case 'table':      return [tablePara(token)];
    case 'hr':         return [hrPara()];
    case 'code':       return codeBlockParas(token.text);
    case 'space':      return [];
    default:
      // unknown block — fall back to its raw text
      if (token.text) return [paragraphPara([{ type: 'text', text: token.text }])];
      return [];
  }
}

// ─── build document ─────────────────────────────────────────────────────

const md = fs.readFileSync('GUIDE.md', 'utf-8');
const tokens = marked.lexer(md);

const body = [];

// COVER
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '在 Luffa SuperBox 上做一本「互动书」', font: FONT, bold: true, size: 48, color: ACCENT })],
  spacing: { before: 2400, after: 200 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '把你最爱的非虚构书,变成读者能动手玩的小程序', font: FONT, italics: true, color: MUTED, size: 26 })],
  spacing: { after: 80 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '8-12 小时,AI Coder 帮你做 80% 的工作', font: FONT, italics: true, color: MUTED, size: 22 })],
  spacing: { after: 800 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '案例项目:《金融周期》— Peter C. Oppenheimer', font: FONT, italics: true, color: MUTED, size: 22 })],
  spacing: { after: 16 }
}));
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [
    new ExternalHyperlink({
      children: [new TextRun({ text: 'github.com/ViviennaMAO/FinancialCycle', style: 'Hyperlink', font: FONT, size: 22 })],
      link: 'https://github.com/ViviennaMAO/FinancialCycle'
    })
  ]
}));

// Walk all GUIDE.md tokens — but skip the first H1 since cover handles the title.
let skippedFirstH1 = false;
for (const tok of tokens) {
  if (!skippedFirstH1 && tok.type === 'heading' && tok.depth === 1) {
    skippedFirstH1 = true;
    continue;
  }
  // Also skip the first blockquote (already covered by the subtitle).
  body.push(...renderBlock(tok));
}

// closing
body.push(hrPara());
body.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '— 文档结束 —', font: FONT, color: MUTED, italics: true, size: 22 })],
  spacing: { before: 240 }
}));

// ─── document config ────────────────────────────────────────────────────

const doc = new Document({
  creator: 'Claude (for Vivienna MAO)',
  title: '在 Luffa SuperBox 上做一本「互动书」 · 详尽操作指南',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: FONT, color: ACCENT },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: ACCENT },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: FONT },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }
      ]},
      { reference: 'nums', levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.LOWER_LETTER, text: '%2.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }
      ]}
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: '互动书操作指南 · 第 ', font: FONT, size: 18, color: MUTED }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: MUTED }),
            new TextRun({ text: ' 页', font: FONT, size: 18, color: MUTED })
          ]
        })]
      })
    },
    children: body
  }]
});

Packer.toBuffer(doc).then(buf => {
  const outPath = '互动书操作指南.docx';
  fs.writeFileSync(outPath, buf);
  console.log('✅ Wrote:', outPath, '(' + (buf.length / 1024).toFixed(1) + ' KB)');
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
