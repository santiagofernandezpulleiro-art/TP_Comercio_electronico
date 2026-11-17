"""PDF académico local. Fuente reproducible, sin servicios ni dependencias externas."""
from pathlib import Path
from textwrap import wrap

pages = [
    [
        ("HUB DE ALIADOS ESTRATÉGICOS", 11),
        ("MATERIAL DEMOSTRATIVO ACADÉMICO / NO OFICIAL", 9),
        ("Preparación ante EUDR", 26),
        ("Una conversación sobre origen y trazabilidad", 15),
        ("", 10),
        ("Propósito y alcance", 17),
        ("Esta muestra acompaña el prototipo universitario del Hub de Aliados Estratégicos de Solidaridad LATAM. No es una publicación oficial de la organización ni reemplaza una evaluación técnica o jurídica.", 12),
        ("El informe académico identifica una oportunidad: conectar el interés en contenidos técnicos con un circuito de captación, calificación y seguimiento institucional B2B, sin depender de planillas dispersas.", 12),
        ("Preguntas para comenzar", 17),
        ("1. ¿Qué información sobre el origen de los productos está disponible y quién la administra en cada eslabón de la cadena?", 12),
        ("2. ¿Qué necesidades de trazabilidad identifica la organización y qué aspectos requieren revisión por especialistas?", 12),
        ("3. ¿Qué actores del territorio deberían participar de una conversación sobre abastecimiento responsable?", 12),
        ("4. ¿Qué documentos y fuentes oficiales habría que consultar antes de evaluar la preparación normativa?", 12),
        ("Estas preguntas son introductorias. No permiten afirmar que una organización cumple EUDR, ni asignan certificaciones o resultados reales.", 11),
    ],
    [
        ("DEL CONOCIMIENTO A LA VINCULACIÓN", 11),
        ("Un recorrido institucional conectado", 24),
        ("", 10),
        ("1 / Captación", 17),
        ("El visitante registra nombre, apellido, correo corporativo, organización y sector. Acepta el tratamiento local de datos y decide de forma independiente si desea comunicaciones futuras.", 12),
        ("2 / Entrega del recurso", 17),
        ("El documento se descarga en autoservicio. El prototipo registra la solicitud de descarga, sin afirmar que el archivo fue guardado o leído.", 12),
        ("3 / Calificación y seguimiento", 17),
        ("Comunicación y Programas consultan las interacciones registradas y aplican criterios de demostración transparentes. Una puntuación no verifica el cargo, el poder de decisión ni el tamaño de la organización.", 12),
        ("4 / Conversación técnica", 17),
        ("Una solicitud expresa interés. No crea una reunión de calendario ni envía correos. La aceptación y derivación a Programas se simulan manualmente en la ficha del contacto.", 12),
        ("Fuentes y límites", 17),
        ("Basado en el TP académico de Comercio Electrónico del ITBA, secciones 5, 6, 8, 9 y 10. El TP referencia el Reglamento (UE) 2023/1115 y la Ley argentina 25.326. Consultar textos oficiales y asesoramiento actualizado para decisiones reales.", 11),
        ("Los umbrales, contactos y métricas de esta aplicación son ficticios. El informe no aporta una línea de base histórica ni metas cuantitativas institucionales. Este PDF no presenta cifras de impacto de Solidaridad.", 11),
    ],
]

def pdf_string(text):
    result = ""
    for byte in text.encode("cp1252"):
        if byte in (40, 41, 92):
            result += "\\" + chr(byte)
        elif byte < 32 or byte > 126:
            result += f"\\{byte:03o}"
        else:
            result += chr(byte)
    return result

objects = [b"<< /Type /Catalog /Pages 2 0 R >>", b"", b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"]
page_ids = []
for index, paragraphs in enumerate(pages):
    commands = ["0.13 0.28 0.21 rg", "BT"]
    y = 785
    for text, size in paragraphs:
        for line in wrap(text, width=78 if size <= 12 else 45) or [""]:
            commands.append(f"/F1 {size} Tf 1 0 0 1 48 {y} Tm ({pdf_string(line)}) Tj")
            y -= size + 6
        y -= 8
    commands.extend([f"/F1 9 Tf 1 0 0 1 48 30 Tm (Prototipo académico - No oficial / {index + 1} de {len(pages)}) Tj", "ET"])
    stream = "\n".join(commands).encode("cp1252")
    page_id = len(objects) + 1
    content_id = page_id + 1
    page_ids.append(page_id)
    objects.append(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents {content_id} 0 R >>".encode())
    objects.append(f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"\nendstream")
objects[1] = f"<< /Type /Pages /Kids [{' '.join(f'{i} 0 R' for i in page_ids)}] /Count {len(page_ids)} >>".encode()
pdf = bytearray(b"%PDF-1.4\n")
offsets = [0]
for i, obj in enumerate(objects, 1):
    offsets.append(len(pdf))
    pdf.extend(f"{i} 0 obj\n".encode() + obj + b"\nendobj\n")
xref = len(pdf)
pdf.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
for offset in offsets[1:]:
    pdf.extend(f"{offset:010} 00000 n \n".encode())
pdf.extend(f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode())
target = Path(__file__).resolve().parent.parent / "public" / "informe-eudr-demostracion.pdf"
target.write_bytes(pdf)
print(f"PDF de muestra: {target.name} ({len(pdf)} bytes, {len(pages)} páginas)")
