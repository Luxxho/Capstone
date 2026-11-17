from __future__ import annotations

from datetime import date, datetime, time
from html import escape
from io import BytesIO
import textwrap


def _text(value, fallback="No registrado"):
    if value is None:
        return fallback
    value = str(value).strip()
    return value or fallback


def _date(value):
    if not value:
        return "No registrada"
    if isinstance(value, str):
        try:
            value = date.fromisoformat(value[:10])
        except ValueError:
            return value
    return value.strftime("%d/%m/%Y")


def _time(value):
    if not value:
        return "No registrada"
    if isinstance(value, str):
        return value[:5]
    return value.strftime("%H:%M")


def _safe(value, fallback="No registrado"):
    return escape(_text(value, fallback)).replace("\n", "<br/>")


def _age_text(pet):
    years = pet.get("age")
    months = pet.get("age_months")
    parts = []
    if years not in (None, ""):
        parts.append(f"{years} año" + ("s" if int(years) != 1 else ""))
    if months not in (None, "", 0, "0"):
        parts.append(f"{months} mes" + ("es" if int(months) != 1 else ""))
    return " y ".join(parts) if parts else "No registrada"


def classify_service(service: str | None) -> str:
    value = (service or "").lower()
    if "vacun" in value:
        return "vaccination"
    if any(token in value for token in ("oper", "cirug", "proced")):
        return "surgery"
    if "urgenc" in value:
        return "emergency"
    if any(token in value for token in ("consulta", "control", "cheque", "examen")):
        return "consultation"
    return "other"



def _pdf_fallback_escape(value: str) -> str:
    value = (
        value.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
    )
    return value


def _pdf_fallback_lines(report: dict) -> list[str]:
    appointment = report.get("appointment", {})
    pet = report.get("pet", {})
    owner = report.get("owner", {})
    clinic = report.get("clinic", {})

    status_map = {
        "pending": "Pendiente",
        "confirmed": "Confirmada",
        "completed": "Completada",
        "cancelled": "Cancelada",
    }

    lines = [
        "VETMAP - INFORME DE ATENCION VETERINARIA",
        f"Reserva #{appointment.get('id', '-')}",
        "",
        "ATENCION",
        f"Servicio: {_text(appointment.get('service'))}",
        f"Fecha: {_date(appointment.get('appointment_date'))}",
        f"Hora: {_time(appointment.get('appointment_time'))}",
        f"Estado: {status_map.get(appointment.get('status'), _text(appointment.get('status')))}",
        f"Observacion de reserva: {_text(appointment.get('notes'))}",
        "",
        "MASCOTA",
        f"Nombre: {_text(pet.get('name'))}",
        f"Especie: {_text(pet.get('species'))}",
        f"Raza: {_text(pet.get('breed'))}",
        f"Edad: {_age_text(pet)}",
        f"Peso: {_text(pet.get('weight'))} kg",
        f"Antecedentes: {_text(pet.get('medical_background'))}",
        f"Alimentacion: {_text(pet.get('feeding_info'))}",
        f"Observaciones: {_text(pet.get('additional_info'))}",
        "",
        "DUENO",
        f"Nombre: {_text(owner.get('name'))}",
        f"Correo: {_text(owner.get('email'))}",
        f"RUT: {_text(owner.get('rut'))}",
        "",
        "VETERINARIA",
        f"Nombre: {_text(clinic.get('name'))}",
        f"Comuna: {_text(clinic.get('commune'))}",
        f"Direccion: {_text(clinic.get('address'))}",
        "",
    ]

    consultations = report.get("consultations", [])
    lines += ["CONSULTAS / CONTROLES"]
    if consultations:
        for index, item in enumerate(consultations, 1):
            lines += [
                f"{index}. Fecha: {_date(item.get('consultation_date'))}",
                f"   Motivo: {_text(item.get('reason'))}",
                f"   Diagnostico: {_text(item.get('diagnosis'))}",
                f"   Tratamiento: {_text(item.get('treatment'))}",
                f"   Profesional: {_text(item.get('veterinarian'))}",
                f"   Observacion: {_text(item.get('observation'))}",
            ]
    else:
        lines.append("Sin consultas registradas para esta atencion.")

    lines += ["", "VACUNAS"]
    vaccines = report.get("vaccines", [])
    if vaccines:
        for index, item in enumerate(vaccines, 1):
            lines += [
                f"{index}. {_text(item.get('name'))}",
                f"   Aplicacion: {_date(item.get('application_date'))}",
                f"   Proxima dosis: {_date(item.get('next_dose_date'))}",
                f"   Observacion: {_text(item.get('observation'))}",
            ]
    else:
        lines.append("Sin vacunas registradas para esta atencion.")

    lines += ["", "MEDICAMENTOS"]
    medications = report.get("medications", [])
    if medications:
        for index, item in enumerate(medications, 1):
            lines += [
                f"{index}. {_text(item.get('name'))}",
                f"   Dosis: {_text(item.get('dose'))}",
                f"   Frecuencia: {_text(item.get('frequency'))}",
                f"   Inicio: {_date(item.get('start_date'))}",
                f"   Termino: {_date(item.get('end_date'))}",
                f"   Horarios: {_text(item.get('reminder_times'))}",
                f"   Observacion: {_text(item.get('observation'))}",
            ]
    else:
        lines.append("Sin medicamentos registrados para esta atencion.")

    lines += ["", "RECETAS"]
    prescriptions = report.get("prescriptions", [])
    if prescriptions:
        for index, item in enumerate(prescriptions, 1):
            lines += [
                f"{index}. {_text(item.get('medication'))}",
                f"   Fecha: {_date(item.get('issue_date'))}",
                f"   Dosis: {_text(item.get('dosage'))}",
                f"   Frecuencia: {_text(item.get('frequency'))}",
                f"   Duracion: {_text(item.get('duration'))}",
                f"   Indicaciones: {_text(item.get('instructions'))}",
            ]
    else:
        lines.append("Sin recetas registradas para esta atencion.")

    lines += [
        "",
        "Documento generado por VetMap.",
        "Este informe resume la informacion registrada en la plataforma.",
    ]

    wrapped = []
    for line in lines:
        if not line:
            wrapped.append("")
            continue

        wrapped.extend(
            textwrap.wrap(
                str(line),
                width=92,
                break_long_words=False,
                break_on_hyphens=False,
            ) or [""]
        )

    return wrapped


def _build_basic_pdf_without_reportlab(report: dict) -> bytes:
    """
    Generador PDF de respaldo sin dependencias externas.

    Se usa solo si ReportLab no está instalado. Produce un PDF textual
    multipágina con los datos clínicos principales.
    """
    import textwrap

    lines = _pdf_fallback_lines(report)
    lines_per_page = 49
    pages = [
        lines[i : i + lines_per_page]
        for i in range(0, len(lines), lines_per_page)
    ] or [["VetMap - Informe de atencion"]]

    objects = []

    # 1 = Catalog
    # 2 = Pages
    # 3 = Font
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    objects.append(b"")  # se completa después
    objects.append(
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
    )

    page_object_numbers = []

    for page_lines in pages:
        content_parts = [
            "BT",
            "/F1 10 Tf",
            "48 800 Td",
            "14 TL",
        ]

        for line in page_lines:
            safe = _pdf_fallback_escape(
                str(line)
                .encode("latin-1", "replace")
                .decode("latin-1")
            )
            content_parts.append(f"({safe}) Tj")
            content_parts.append("T*")

        content_parts.append("ET")
        content = "\n".join(content_parts).encode("latin-1")

        content_number = len(objects) + 1
        objects.append(
            (
                f"<< /Length {len(content)} >>\nstream\n"
            ).encode("ascii")
            + content
            + b"\nendstream"
        )

        page_number = len(objects) + 1
        page_object_numbers.append(page_number)
        objects.append(
            (
                "<< /Type /Page /Parent 2 0 R "
                "/MediaBox [0 0 595 842] "
                "/Resources << /Font << /F1 3 0 R >> >> "
                f"/Contents {content_number} 0 R >>"
            ).encode("ascii")
        )

    kids = " ".join(
        f"{number} 0 R"
        for number in page_object_numbers
    )
    objects[1] = (
        f"<< /Type /Pages /Count {len(page_object_numbers)} "
        f"/Kids [{kids}] >>"
    ).encode("ascii")

    output = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]

    for index, obj in enumerate(objects, 1):
        offsets.append(len(output))
        output.extend(
            f"{index} 0 obj\n".encode("ascii")
        )
        output.extend(obj)
        output.extend(b"\nendobj\n")

    xref_offset = len(output)
    output.extend(
        f"xref\n0 {len(objects) + 1}\n".encode("ascii")
    )
    output.extend(b"0000000000 65535 f \n")

    for offset in offsets[1:]:
        output.extend(
            f"{offset:010d} 00000 n \n".encode("ascii")
        )

    output.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} "
            "/Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode("ascii")
    )

    return bytes(output)


def build_appointment_report_pdf(report: dict) -> bytes:
    try:
        from reportlab.lib import colors
        from reportlab.lib.colors import HexColor
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.lib.units import mm
        from reportlab.platypus import (
            HRFlowable,
            KeepTogether,
            Paragraph,
            SimpleDocTemplate,
            Spacer,
            Table,
            TableStyle,
        )
    except ImportError:
        # VetMap sigue pudiendo generar el informe aun si ReportLab
        # no está instalado en el entorno local.
        return _build_basic_pdf_without_reportlab(report)

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=34 * mm,
        bottomMargin=18 * mm,
        title=f"VetMap - Informe de atención #{report['appointment']['id']}",
        author="VetMap",
    )

    navy = HexColor("#16325C")
    blue_dark = HexColor("#102542")
    blue_light = HexColor("#EAF2FF")
    teal = HexColor("#1F8A70")
    teal_soft = HexColor("#DDF5EE")
    mint = HexColor("#DFF3ED")
    mint_dark = HexColor("#4F9B87")
    text = HexColor("#2B3C37")
    muted = HexColor("#6B7C7B")
    line = HexColor("#D7E6E1")
    soft = HexColor("#F8FBFD")
    warning = HexColor("#FFF5DF")
    warning_border = HexColor("#E5C67A")
    rose_soft = HexColor("#FFF1F1")
    gray_chip = HexColor("#F0F4F8")

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "VetMapTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=navy,
        spaceAfter=3 * mm,
    )
    subtitle_style = ParagraphStyle(
        "VetMapSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=muted,
        spaceAfter=4 * mm,
    )
    section_style = ParagraphStyle(
        "VetMapSection",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=navy,
        spaceBefore=5 * mm,
        spaceAfter=2.5 * mm,
    )
    body_style = ParagraphStyle(
        "VetMapBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=13,
        textColor=text,
    )
    small_style = ParagraphStyle(
        "VetMapSmall",
        parent=body_style,
        fontSize=8,
        leading=11,
        textColor=muted,
    )
    label_style = ParagraphStyle(
        "VetMapLabel",
        parent=body_style,
        fontName="Helvetica-Bold",
        fontSize=8.3,
        textColor=muted,
    )
    cell_style = ParagraphStyle(
        "VetMapCell",
        parent=body_style,
        fontSize=8.5,
        leading=11.5,
    )

    appointment = report["appointment"]
    pet = report["pet"]
    owner = report["owner"]
    clinic = report["clinic"]
    consultations = report.get("consultations", [])
    vaccines = report.get("vaccines", [])
    medications = report.get("medications", [])
    prescriptions = report.get("prescriptions", [])
    service_kind = classify_service(appointment.get("service"))

    status_map = {
        "pending": "Pendiente",
        "confirmed": "Confirmada",
        "completed": "Completada",
        "cancelled": "Cancelada",
    }

    def p(value, style=cell_style, fallback="No registrado"):
        return Paragraph(_safe(value, fallback), style)

    def section(title):
        return Paragraph(title, section_style)

    def info_table(rows, widths=(38 * mm, 62 * mm, 38 * mm, 42 * mm)):
        data = []
        for row in rows:
            data.append([
                Paragraph(escape(str(row[0])), label_style),
                p(row[1]),
                Paragraph(escape(str(row[2])), label_style),
                p(row[3]),
            ])
        table = Table(data, colWidths=list(widths), hAlign="LEFT")
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), soft),
            ("BOX", (0, 0), (-1, -1), 0.6, line),
            ("INNERGRID", (0, 0), (-1, -1), 0.35, line),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        return table

    def records_table(headers, rows, widths):
        data = [[Paragraph(escape(h), label_style) for h in headers]]
        for row in rows:
            data.append([p(value) for value in row])
        table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
        style_commands = [
            ("BACKGROUND", (0, 0), (-1, 0), blue_light),
            ("TEXTCOLOR", (0, 0), (-1, 0), blue_dark),
            ("BOX", (0, 0), (-1, -1), 0.6, line),
            ("INNERGRID", (0, 0), (-1, -1), 0.35, line),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
        for idx in range(1, len(data)):
            style_commands.append(
                ("BACKGROUND", (0, idx), (-1, idx), soft if idx % 2 else "#FFFFFF")
            )
        table.setStyle(TableStyle(style_commands))
        return table

    def badge(text_value, fill_color, text_color=blue_dark):
        table = Table(
            [[Paragraph(f"<b>{escape(str(text_value))}</b>", ParagraphStyle(
                "badgeText", parent=small_style, alignment=TA_CENTER, textColor=text_color, fontName="Helvetica-Bold"
            ))]],
            colWidths=[42 * mm],
            hAlign="LEFT",
        )
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), fill_color),
            ("BOX", (0, 0), (-1, -1), 0.5, fill_color),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        return table

    def summary_cards(items):
        cells = []
        for title, value in items:
            inner = Table([
                [Paragraph(escape(str(title)), ParagraphStyle(
                    "summaryLabel", parent=small_style, textColor=muted, fontName="Helvetica-Bold"
                ))],
                [Paragraph(_safe(value), ParagraphStyle(
                    "summaryValue", parent=body_style, fontName="Helvetica-Bold", fontSize=10.5, leading=13, textColor=navy
                ))],
            ], colWidths=[54 * mm])
            inner.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), "#FFFFFF"),
                ("BOX", (0, 0), (-1, -1), 0.7, line),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]))
            cells.append(inner)
        wrapper = Table([cells], colWidths=[58 * mm, 58 * mm, 58 * mm], hAlign="LEFT")
        wrapper.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]))
        return wrapper

    story = []

    status_label = status_map.get(
        appointment.get("status"),
        _text(appointment.get("status")),
    )
    status_fill = {
        "Pendiente": warning,
        "Confirmada": teal_soft,
        "Completada": blue_light,
        "Cancelada": rose_soft,
    }.get(status_label, gray_chip)

    story.append(Spacer(1, 2 * mm))

    headline = Table([
        [
            Paragraph(
                "<b>VetMap</b><br/><font size='8'>INFORME CLÍNICO / RESUMEN DE ATENCIÓN</font>",
                ParagraphStyle(
                    "heroBrand",
                    parent=body_style,
                    fontSize=19,
                    leading=18,
                    textColor=navy,
                ),
            ),
            Paragraph(
                f"<b>Reserva #{appointment['id']}</b><br/><font size='9'>Documento generado el {_date(report.get('generated_at'))}</font>",
                ParagraphStyle(
                    "heroRight",
                    parent=body_style,
                    alignment=TA_LEFT,
                    fontSize=10,
                    leading=14,
                    textColor=text,
                ),
            ),
        ]
    ], colWidths=[104 * mm, 76 * mm], hAlign="LEFT")
    headline.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), "#FFFFFF"),
        ("BOX", (0, 0), (-1, -1), 0.8, line),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story += [headline, Spacer(1, 4 * mm)]

    badge_row = Table(
        [[
            badge(f"Estado: {status_label}", status_fill),
            badge(f"Servicio: {_text(appointment.get('service'))}", teal_soft),
            badge(f"Paciente: {_text(pet.get('name'))}", gray_chip),
        ]],
        colWidths=[56 * mm, 70 * mm, 54 * mm],
        hAlign="LEFT",
    )
    badge_row.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story += [badge_row, Spacer(1, 4 * mm)]

    story.append(summary_cards([
        ("Fecha", _date(appointment.get("appointment_date"))),
        ("Hora", _time(appointment.get("appointment_time"))),
        ("Veterinaria", clinic.get("name") or "No registrada"),
    ]))
    story += [Spacer(1, 5 * mm)]

    story.append(Paragraph(_safe(appointment.get("service"), "Atención veterinaria"), title_style))
    service_labels = {
        "vaccination": "Detalle de vacunación",
        "surgery": "Detalle de operación / procedimiento",
        "emergency": "Detalle de atención de urgencia",
        "consultation": "Detalle de consulta / control clínico",
        "other": "Detalle de atención",
    }
    story.append(Paragraph(
        f"{service_labels[service_kind]} - Documento generado el {_date(report.get('generated_at'))}.",
        subtitle_style,
    ))

    if appointment.get("status") == "cancelled":
        box = Table([[Paragraph(
            "<b>Reserva cancelada.</b> Este documento conserva los datos de la reserva, pero no acredita una atención realizada.",
            body_style,
        )]], colWidths=[180 * mm])
        box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), warning),
            ("BOX", (0, 0), (-1, -1), 0.6, warning_border),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        story += [box, Spacer(1, 3 * mm)]

    story += [section("1. Datos de la reserva / atención")]
    story.append(info_table([
        ("Fecha", _date(appointment.get("appointment_date")), "Hora", _time(appointment.get("appointment_time"))),
        ("Estado", status_map.get(appointment.get("status"), _text(appointment.get("status"))), "Servicio", appointment.get("service")),
        ("Observación de reserva", appointment.get("notes") or "Sin observación", "ID de reserva", appointment.get("id")),
    ]))

    story += [section("2. Paciente y responsable")]
    story.append(info_table([
        ("Mascota", pet.get("name"), "Especie", pet.get("species")),
        ("Raza / variedad", pet.get("breed") or "No registrada", "Edad", _age_text(pet)),
        ("Peso", f"{pet['weight']} kg" if pet.get("weight") is not None else "No registrado", "Fecha nacimiento", _date(pet.get("birth_date"))),
        ("Responsable", owner.get("name"), "Correo", owner.get("email")),
    ]))

    story += [section("3. Centro veterinario")]
    story.append(info_table([
        ("Veterinaria", clinic.get("name"), "Comuna", clinic.get("commune")),
        ("Dirección", clinic.get("address") or "No registrada", "Horario", clinic.get("hours") or "No registrado"),
    ]))

    if pet.get("medical_background") or pet.get("feeding_info") or pet.get("additional_info"):
        story += [section("4. Antecedentes relevantes del paciente")]
        story.append(info_table([
            ("Antecedentes médicos", pet.get("medical_background") or "Sin antecedentes registrados", "Alimentación", pet.get("feeding_info") or "Sin información"),
            ("Observaciones generales", pet.get("additional_info") or "Sin observaciones", "", ""),
        ]))

    clinical_section_number = 5 if (pet.get("medical_background") or pet.get("feeding_info") or pet.get("additional_info")) else 4
    story += [section(f"{clinical_section_number}. Registro clínico de esta atención")]

    if service_kind == "surgery":
        intro = "La reserva corresponde a una operación o procedimiento. Se muestran únicamente los datos clínicos registrados en VetMap para esta atención."
    elif service_kind == "vaccination":
        intro = "La reserva corresponde a vacunación. Se priorizan las vacunas y controles registrados para esta atención."
    elif service_kind == "emergency":
        intro = "La reserva corresponde a una urgencia. Se muestran evaluación, tratamiento y medicamentos registrados."
    else:
        intro = "Se muestran los registros clínicos asociados a esta reserva: evaluación, vacunas, medicamentos y recetas cuando existan."
    story += [Paragraph(intro, body_style), Spacer(1, 2.5 * mm)]

    has_any = bool(consultations or vaccines or medications or prescriptions)
    if not has_any:
        empty = Table([[Paragraph(
            "No se registraron antecedentes clínicos asociados a esta atención todavía.",
            body_style,
        )]], colWidths=[180 * mm])
        empty.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), soft),
            ("BOX", (0, 0), (-1, -1), 0.6, line),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(empty)

    if consultations:
        consult_title = "Evaluación clínica"
        if service_kind == "surgery":
            consult_title = "Operación / procedimiento - evaluación y evolución"
        elif service_kind == "emergency":
            consult_title = "Evaluación de urgencia"
        story += [section(consult_title)]
        rows = []
        for item in consultations:
            rows.append([
                _date(item.get("consultation_date")),
                item.get("reason") or "No registrado",
                item.get("diagnosis") or "Sin diagnóstico registrado",
                item.get("treatment") or "Sin tratamiento registrado",
                item.get("observation") or "Sin observación",
            ])
        story.append(records_table(
            ["Fecha", "Motivo", "Diagnóstico", "Tratamiento / procedimiento", "Observación"],
            rows,
            [22*mm, 32*mm, 42*mm, 45*mm, 39*mm],
        ))
        professionals = [x.get("veterinarian") for x in consultations if x.get("veterinarian")]
        if professionals:
            story += [Spacer(1, 2*mm), Paragraph(
                "Profesional registrado: <b>" + escape(professionals[0]) + "</b>", small_style
            )]

    if vaccines:
        story += [section("Vacunas aplicadas / registradas")]
        rows = [[
            x.get("name"),
            _date(x.get("application_date")),
            _date(x.get("next_dose_date")) if x.get("next_dose_date") else "Sin próxima dosis",
            x.get("observation") or "Sin observación",
        ] for x in vaccines]
        story.append(records_table(
            ["Vacuna", "Aplicación", "Próxima dosis", "Observación"],
            rows,
            [48*mm, 32*mm, 38*mm, 62*mm],
        ))

    if medications:
        story += [section("Medicamentos indicados en la atención")]
        rows = [[
            x.get("name"),
            x.get("dose") or "Sin dosis",
            x.get("frequency") or "Sin frecuencia",
            (x.get("reminder_times") or "Sin horario"),
            f"{_date(x.get('start_date'))} - {_date(x.get('end_date')) if x.get('end_date') else 'Sin término'}",
            x.get("observation") or "Sin observación",
        ] for x in medications]
        story.append(records_table(
            ["Medicamento", "Dosis", "Frecuencia", "Horarios", "Periodo", "Observación"],
            rows,
            [34*mm, 25*mm, 28*mm, 27*mm, 34*mm, 32*mm],
        ))

    if prescriptions:
        story += [section("Recetas emitidas")]
        rows = [[
            _date(x.get("issue_date")),
            x.get("medication"),
            x.get("dosage") or "Sin dosis",
            x.get("frequency") or "Sin frecuencia",
            x.get("duration") or "Sin duración",
            x.get("instructions") or "Sin indicaciones",
        ] for x in prescriptions]
        story.append(records_table(
            ["Fecha", "Medicamento", "Dosis", "Frecuencia", "Duración", "Indicaciones"],
            rows,
            [22*mm, 34*mm, 24*mm, 27*mm, 24*mm, 49*mm],
        ))

    followups = []
    for item in vaccines:
        if item.get("next_dose_date"):
            followups.append(
                f"Próxima dosis de {_text(item.get('name'))}: {_date(item.get('next_dose_date'))}."
            )
    for item in medications:
        if item.get("end_date"):
            followups.append(
                f"Fin programado de {_text(item.get('name'))}: {_date(item.get('end_date'))}."
            )
    if followups:
        story += [section("Seguimiento registrado")]
        for line_text in followups:
            story.append(Paragraph("• " + escape(line_text), body_style))

    story += [Spacer(1, 6 * mm), HRFlowable(width="100%", thickness=0.7, color=line)]
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph(
        "Documento generado por VetMap para consulta del dueño de la mascota y del equipo veterinario. "
        "VetMap es una plataforma académica y las veterinarias de demostración son ficticias.",
        small_style,
    ))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph(
        "El contenido del informe corresponde únicamente a los datos registrados en la plataforma.",
        small_style,
    ))

    def decorate_page(canvas, doc_obj):
        canvas.saveState()

        page_width, page_height = A4

        # Header principal
        canvas.setFillColor(navy)
        canvas.rect(0, page_height - 24 * mm, page_width, 24 * mm, stroke=0, fill=1)
        canvas.setFillColor(teal)
        canvas.rect(0, page_height - 27 * mm, page_width, 3 * mm, stroke=0, fill=1)

        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 16)
        canvas.drawString(15 * mm, page_height - 14 * mm, "VetMap")
        canvas.setFont("Helvetica", 8.5)
        canvas.drawString(15 * mm, page_height - 18.5 * mm, "Informe clínico veterinario")

        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(
            195 * mm,
            page_height - 14 * mm,
            f"Reserva #{appointment['id']} · {_date(appointment.get('appointment_date'))}",
        )

        # Footer
        canvas.setStrokeColor(line)
        canvas.line(15 * mm, 12 * mm, 195 * mm, 12 * mm)
        canvas.setFillColor(muted)
        canvas.setFont("Helvetica", 7.5)
        canvas.drawString(15 * mm, 7.5 * mm, "VetMap · Plataforma académica")
        canvas.drawCentredString(page_width / 2, 7.5 * mm, "Informe de atención veterinaria")
        canvas.drawRightString(195 * mm, 7.5 * mm, f"Página {doc_obj.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=decorate_page, onLaterPages=decorate_page)
    return buffer.getvalue()
