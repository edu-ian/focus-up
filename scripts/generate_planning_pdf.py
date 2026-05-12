#!/usr/bin/env python3
"""Gera docs/planejamento_etapas.pdf a partir de docs/planejamento_etapas.md."""
import re
from pathlib import Path

import markdown
from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "planejamento_etapas.md"
OUT_PATH = ROOT / "docs" / "planejamento_etapas.pdf"


class PDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 9)
        self.cell(0, 10, f"Página {self.page_no()}", align="C")


def main():
    if not MD_PATH.is_file():
        raise SystemExit(f"Ficheiro em falta: {MD_PATH}")
    md = MD_PATH.read_text(encoding="utf-8")
    md = re.sub(r"`([^`]+)`", r"\1", md)
    html = markdown.markdown(md)
    for a, b in (
        ("\u2014", "-"),
        ("\u2013", "-"),
        ("\u2192", "->"),
        ("\u00ab", '"'),
        ("\u00bb", '"'),
    ):
        html = html.replace(a, b)

    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.write_html(html)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT_PATH))
    print(f"Escrito: {OUT_PATH} ({OUT_PATH.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
