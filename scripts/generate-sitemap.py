#!/usr/bin/env python3
"""
generate-sitemap.py — Gera sitemap.xml para TradeXa Fretes

Usage:
    python scripts/generate-sitemap.py

Output: public/sitemap.xml (sobrescreve)
"""

from datetime import date
from xml.etree.ElementTree import Element, SubElement, tostring, register_namespace
from xml.dom import minidom

BASE = "https://www.tradexafretes.com.br"
TODAY = date.today().isoformat()

# Registrar namespaces para prefixos corretos no XML
register_namespace("xhtml", "http://www.w3.org/1999/xhtml")
register_namespace("image", "http://www.google.com/schemas/sitemap-image/1.1")

PAGES = [
    # (path, changefreq, priority, lastmod, noIndex, images)
    ("/", "weekly", "1.0", TODAY, False,
     [("og-image.webp", "TradeXa Fretes — Plataforma de Fretes", "TradeXa Fretes — Plataforma de Fretes"),
      ("og-image.png", "TradeXa Fretes — Plataforma de Fretes (PNG)", "TradeXa Fretes — Plataforma de Fretes"),
      ("logo-fretes.png", "Logo TradeXa Fretes", "TradeXa Fretes Logo")]),
    ("/como-funciona", "monthly", "0.8", TODAY, False,
     [("og-image.webp", "Como funciona a TradeXa Fretes", "Como Funciona — TradeXa Fretes"),
      ("og-image.png", "Como funciona a TradeXa Fretes (PNG)", "Como Funciona — TradeXa Fretes")]),
    ("/planos", "monthly", "0.8", TODAY, False,
     [("og-image.webp", "Planos e Preços — TradeXa Fretes", "Planos — TradeXa Fretes"),
      ("og-image.png", "Planos e Preços — TradeXa Fretes (PNG)", "Planos — TradeXa Fretes")]),
    ("/contato", "monthly", "0.6", TODAY, False,
     [("og-image.webp", "Contato — TradeXa Fretes", "Contato — TradeXa Fretes"),
      ("og-image.png", "Contato — TradeXa Fretes (PNG)", "Contato — TradeXa Fretes")]),
    ("/privacidade", "yearly", "0.3", TODAY, False,
     [("og-image.webp", "Política de Privacidade — TradeXa Fretes", "Privacidade — TradeXa Fretes"),
      ("og-image.png", "Política de Privacidade — TradeXa Fretes (PNG)", "Privacidade — TradeXa Fretes")]),
    ("/termos", "yearly", "0.3", TODAY, False,
     [("og-image.webp", "Termos de Uso — TradeXa Fretes", "Termos — TradeXa Fretes"),
      ("og-image.png", "Termos de Uso — TradeXa Fretes (PNG)", "Termos — TradeXa Fretes")]),
    # /login and /cadastro are noIndex — excluded from sitemap
]


def build_sitemap() -> str:
    """Gera sitemap.xml com namespaces corretos (xhtml: e image:)."""
    urlset = Element("urlset")
    # Apenas o namespace default precisa ser setado manualmente;
    # xhtml: e image: são registrados via register_namespace() acima.
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

    for path, freq, priority, lastmod, noindex, images in PAGES:
        if noindex:
            continue

        url = Element("url")
        loc = SubElement(url, "loc")
        loc.text = f"{BASE}{path}"

        lm = SubElement(url, "lastmod")
        lm.text = lastmod

        cf = SubElement(url, "changefreq")
        cf.text = freq

        pr = SubElement(url, "priority")
        pr.text = priority

        # hreflang — usa namespace xhtml (prefixo correto)
        alt_ptbr = SubElement(url, "{http://www.w3.org/1999/xhtml}link")
        alt_ptbr.set("rel", "alternate")
        alt_ptbr.set("hreflang", "pt-BR")
        alt_ptbr.set("href", f"{BASE}{path}")

        alt_xdefault = SubElement(url, "{http://www.w3.org/1999/xhtml}link")
        alt_xdefault.set("rel", "alternate")
        alt_xdefault.set("hreflang", "x-default")
        alt_xdefault.set("href", f"{BASE}{path}")

        # images — usa namespace image
        for img_file, img_caption, img_title in images:
            img = SubElement(url, "{http://www.google.com/schemas/sitemap-image/1.1}image")
            img_loc = SubElement(img, "{http://www.google.com/schemas/sitemap-image/1.1}loc")
            img_loc.text = f"{BASE}/{img_file}"
            img_cap = SubElement(img, "{http://www.google.com/schemas/sitemap-image/1.1}caption")
            img_cap.text = img_caption
            img_tit = SubElement(img, "{http://www.google.com/schemas/sitemap-image/1.1}title")
            img_tit.text = img_title

        urlset.append(url)

    rough = tostring(urlset, encoding="unicode")
    dom = minidom.parseString(rough)
    pretty = dom.toprettyxml(indent="  ", encoding=None)
    # Remove the <?xml?> line from minidom (we add our own)
    lines = pretty.splitlines()
    xml_declaration = '<?xml version="1.0" encoding="UTF-8"?>'
    return xml_declaration + "\n" + "\n".join(lines[1:])


def main():
    xml = build_sitemap()
    output_path = "public/sitemap.xml"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"✅ Sitemap generated: {output_path}")
    indexed = sum(1 for p in PAGES if not p[4])
    print(f"   URLs: {indexed} indexáveis")


if __name__ == "__main__":
    main()
