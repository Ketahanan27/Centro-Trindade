import { jsPDF } from "jspdf";
import logo from "./pdfLogo.js";
import { formatarData } from "./data.js";

const AZUL = [23, 43, 70];
const CINZA = [79, 91, 107];
const LIMITE_CONTEUDO = 208;
export const moedaPDF = (valor) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Number(valor ?? 0)).replace(/\u00a0/g, " ");
export const dataPDFHoje = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Lisbon" });

export function criarPDFOficial({ titulo, departamento, data = dataPDFHoje(), referencia = "" }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({ title: titulo, author: "Ministério Centro Trindade", creator: "Centro Trindade" });
  let y;
  const cabecalho = () => {
    doc.setFillColor(...AZUL);
    doc.roundedRect(20, 13, 28, 28, 3, 3, "F");
    doc.addImage(logo, "PNG", 10, 3, 48, 48, "logo-trindade", "FAST");
    doc.setTextColor(...AZUL);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("MINISTÉRIO", 57, 20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(20);
    doc.text("CENTRO TRINDADE", 57, 30);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.setTextColor(...CINZA); doc.text(departamento, 57, 38);
    doc.setDrawColor(...AZUL); doc.setLineWidth(.65); doc.line(20, 49, 190, 49);
    doc.setDrawColor(186, 151, 85); doc.setLineWidth(1.1); doc.line(20, 49, 47, 49);
    doc.setTextColor(...AZUL); doc.setFont("helvetica", "bold"); doc.setFontSize(17);
    const lines = doc.splitTextToSize(titulo, 170);
    doc.text(lines, 20, 62); y = 62 + lines.length * 7;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...CINZA);
    doc.text(`Emitido em ${formatarData(data)}${referencia ? `   |   ${referencia}` : ""}`, 20, y);
    y += 10;
  };
  cabecalho();
  const novaPagina = () => { doc.addPage(); cabecalho(); };
  const espaco = (altura) => { if (y + altura > LIMITE_CONTEUDO) novaPagina(); };
  const paragrafo = (texto) => {
    doc.setFont("times", "normal"); doc.setFontSize(12); doc.setTextColor(...AZUL);
    const lines = doc.splitTextToSize(String(texto ?? "-"), 170);
    for (const line of lines) {
      espaco(7);
      doc.setFont("times", "normal"); doc.setFontSize(12); doc.setTextColor(...AZUL);
      doc.text(line, 20, y); y += 6;
    }
    y += 2;
  };
  const secao = (tituloSecao) => {
    espaco(36);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...AZUL);
    doc.setFillColor(239, 243, 247); doc.roundedRect(20, y - 4, 170, 10, 1, 1, "F");
    doc.text(tituloSecao, 24, y + 2); y += 11;
  };
  const tabela = (headers, rows, widths) => {
    if (Math.abs(widths.reduce((sum, w) => sum + w, 0) - 170) > .01) throw new Error("Largura da tabela inválida.");
    const heading = () => {
      espaco(18); doc.setFillColor(...AZUL); doc.rect(20, y - 4, 170, 10, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
      let x = 20; headers.forEach((h, i) => { doc.text(h, x + 2, y + 2); x += widths[i]; }); y += 10;
    };
    heading();
    rows.forEach((row, index) => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      const cells = row.map((cell, i) => doc.splitTextToSize(String(cell ?? "-"), widths[i] - 4));
      const lineCount = Math.max(1, ...cells.map((cell) => cell.length));
      // Split very long cells across pages instead of drawing outside the page.
      for (let offset = 0; offset < lineCount;) {
        if (y + 9 > LIMITE_CONTEUDO) { novaPagina(); heading(); }
        const count = Math.min(lineCount - offset, Math.max(1, Math.floor((LIMITE_CONTEUDO - y - 3) / 4)));
        const height = count * 4 + 3;
        doc.setFillColor(...(index % 2 ? [247, 249, 251] : [255, 255, 255]));
        doc.rect(20, y - 3, 170, height, "F");
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...AZUL);
        let x = 20;
        cells.forEach((cell, i) => {
          const slice = cell.slice(offset, offset + count);
          if (slice.length) doc.text(slice, x + 2, y + 1, { lineHeightFactor: 1.33 });
          x += widths[i];
        });
        y += height; offset += count;
      }
      doc.setDrawColor(219, 226, 234); doc.setLineWidth(.2); doc.line(20, y - 3, 190, y - 3);
    });
    y += 9;
  };
  const finalizar = () => {
    if (y > 218) novaPagina();
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...AZUL);
    doc.text("VALIDAÇÃO E ASSINATURAS", 20, 229);
    doc.setDrawColor(...CINZA); doc.setLineWidth(.3);
    doc.line(25, 253, 90, 253); doc.line(120, 253, 185, 253);
    doc.setFontSize(10); doc.text("Secretaria", 57.5, 260, { align: "center" }); doc.text("Pastor", 152.5, 260, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...CINZA);
    doc.text("Data: ____ / ____ / ______", 57.5, 267, { align: "center" }); doc.text("Data: ____ / ____ / ______", 152.5, 267, { align: "center" });
    const total = doc.getNumberOfPages();
    for (let page = 1; page <= total; page++) {
      doc.setPage(page); doc.setDrawColor(219, 226, 234); doc.line(20, 278, 190, 278);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...CINZA);
      doc.text("Ministério Centro Trindade", 20, 285);
      doc.text(`Página ${page} de ${total}`, 190, 285, { align: "right" });
    }
    return doc;
  };
  return { doc, paragrafo, secao, tabela, finalizar };
}
