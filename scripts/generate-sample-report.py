"""Generate a local, explicitly demonstrative PDF using standard PDF fonts only."""
from pathlib import Path

lines = [
    ("SILVA / EUDR INTELLIGENCE", 12),
    ("DOCUMENTO DE DEMOSTRACION", 10),
    ("El futuro crece desde el origen.", 28),
    ("Prototipo academico - Material ilustrativo", 12),
    ("", 10),
    ("Sobre este documento", 17),
    ("Esta muestra permite demostrar la descarga de un reporte desde", 12),
    ("una estrategia de captacion y gestion de contactos EUDR.", 12),
    ("No es el informe original del proyecto ni contiene sus conclusiones.", 12),
    ("No incluye estadisticas, plazos normativos ni asesoramiento legal.", 12),
    ("", 10),
    ("Una conversacion sobre el origen", 17),
    ("Temas propuestos para explorar con un equipo tecnico:", 12),
    ("1. Informacion disponible sobre el origen de los productos.", 12),
    ("2. Trazabilidad a lo largo de la cadena de suministro.", 12),
    ("3. Preguntas y necesidades de informacion de cada organizacion.", 12),
    ("", 10),
    ("El recorrido de esta experiencia", 17),
    ("Landing > Formulario > Confirmacion > CRM interno", 12),
    ("Los contactos y las reservas son simulados y se guardan localmente.", 12),
    ("No se envian correos ni se crean reuniones reales.", 12),
    ("", 10),
    ("Silva es una identidad ficticia creada para esta demostracion.", 10),
    ("Reemplazar este archivo por el informe autorizado cuando exista.", 10),
]
commands = ["0.10 0.24 0.19 rg", "BT", "54 780 Td"]
for index, (text, size) in enumerate(lines):
    if index:
        commands.append("0 -25 Td")
    escaped = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    commands.extend([f"/F1 {size} Tf", f"({escaped}) Tj"])
commands.append("ET")
stream = "\n".join(commands).encode("ascii")
objects = [
    b"<< /Type /Catalog /Pages 2 0 R >>",
    b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"\nendstream",
]
pdf = bytearray(b"%PDF-1.4\n")
offsets = [0]
for i, obj in enumerate(objects, 1):
    offsets.append(len(pdf))
    pdf.extend(f"{i} 0 obj\n".encode() + obj + b"\nendobj\n")
xref = len(pdf)
pdf.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
for offset in offsets[1:]:
    pdf.extend(f"{offset:010} 00000 n \n".encode())
pdf.extend(f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode())
target = Path(__file__).resolve().parent.parent / "public" / "reporte-eudr-demostracion.pdf"
target.write_bytes(pdf)
print(f"PDF de muestra generado: {target.name} ({len(pdf)} bytes)")
