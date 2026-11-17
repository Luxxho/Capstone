from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
)


NAVY = colors.HexColor("#17345B")
TEAL = colors.HexColor("#4B9688")
MINT = colors.HexColor("#EAF6F2")
LIGHT = colors.HexColor("#F7FAF9")
BORDER = colors.HexColor("#D7E6E1")
TEXT = colors.HexColor("#253D3A")
MUTED = colors.HexColor("#6C7E7A")
WHITE = colors.white


STATUS_LABELS = {
    "pending": "Pendiente",
    "preparing": "En preparación",
    "ready": "Listo",
    "dispatched": "Despachado",
    "delivered": "Entregado",
    "cancelled": "Cancelado",
}


def _clp(value):
    amount = int(value or 0)
    return f"${amount:,}".replace(",", ".")


def _date(value):
    if not value:
        return "-"

    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(
                value.replace("Z", "+00:00")
            )
        except ValueError:
            return value

    if isinstance(value, datetime):
        return value.strftime("%d/%m/%Y %H:%M")

    return str(value)


def _footer(canvas, doc):
    canvas.saveState()

    width, _ = A4

    canvas.setStrokeColor(BORDER)
    canvas.line(
        18 * mm,
        16 * mm,
        width - 18 * mm,
        16 * mm,
    )

    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(
        18 * mm,
        10 * mm,
        "VetMap · Comprobante de compra",
    )

    canvas.drawRightString(
        width - 18 * mm,
        10 * mm,
        f"Página {doc.page}",
    )

    canvas.restoreState()


def build_store_order_receipt_pdf(data: dict) -> bytes:
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=24 * mm,
        title=(
            f"VetMap - Comprobante Pedido "
            f"#{data.get('order_id')}"
        ),
        author="VetMap",
    )

    styles = getSampleStyleSheet()

    title = ParagraphStyle(
        "VetMapReceiptTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=21,
        leading=25,
        textColor=NAVY,
        spaceAfter=4,
    )

    kicker = ParagraphStyle(
        "VetMapReceiptKicker",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=TEAL,
        spaceAfter=3,
    )

    body = ParagraphStyle(
        "VetMapReceiptBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=TEXT,
    )

    small = ParagraphStyle(
        "VetMapReceiptSmall",
        parent=body,
        fontSize=8,
        leading=11,
        textColor=MUTED,
    )

    right = ParagraphStyle(
        "VetMapReceiptRight",
        parent=body,
        alignment=TA_RIGHT,
        fontName="Helvetica-Bold",
    )

    story = []

    # --------------------------------------------------------
    # Encabezado
    # --------------------------------------------------------
    header = Table(
        [
            [
                Paragraph(
                    "<b>VETMAP</b><br/>"
                    "<font size='8'>Cuidado, salud y marketplace</font>",
                    ParagraphStyle(
                        "Brand",
                        parent=body,
                        fontSize=14,
                        leading=16,
                        textColor=WHITE,
                    ),
                ),
                Paragraph(
                    f"<b>Pedido #{data.get('order_id')}</b><br/>"
                    f"{_date(data.get('created_at'))}",
                    ParagraphStyle(
                        "HeadRight",
                        parent=body,
                        fontSize=9,
                        leading=12,
                        textColor=WHITE,
                        alignment=TA_RIGHT,
                    ),
                ),
            ]
        ],
        colWidths=[105 * mm, 53 * mm],
    )

    header.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), NAVY),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )

    story.append(header)
    story.append(Spacer(1, 8 * mm))

    story.append(
        Paragraph("COMPROBANTE VETMAP", kicker)
    )
    story.append(
        Paragraph(
            "Comprobante de compra",
            title,
        )
    )
    story.append(
        Paragraph(
            "Resumen detallado de la compra registrada en VetMap.",
            body,
        )
    )
    story.append(Spacer(1, 6 * mm))

    # --------------------------------------------------------
    # Datos generales
    # --------------------------------------------------------
    status = STATUS_LABELS.get(
        data.get("status"),
        data.get("status") or "-",
    )

    info = Table(
        [
            [
                Paragraph("<b>Tienda</b>", small),
                Paragraph(
                    data.get("store_name") or "-",
                    body,
                ),
                Paragraph("<b>Estado</b>", small),
                Paragraph(status, body),
            ],
            [
                Paragraph("<b>Comprador</b>", small),
                Paragraph(
                    data.get("user_name") or "-",
                    body,
                ),
                Paragraph("<b>Total</b>", small),
                Paragraph(
                    _clp(data.get("total")),
                    right,
                ),
            ],
            [
                Paragraph("<b>Comuna</b>", small),
                Paragraph(
                    data.get("store_commune") or "-",
                    body,
                ),
                Paragraph("<b>Pago</b>", small),
                Paragraph(
                    data.get("payment_method")
                    or "Compra registrada en VetMap",
                    body,
                ),
            ],
        ],
        colWidths=[
            25 * mm,
            61 * mm,
            22 * mm,
            50 * mm,
        ],
    )

    info.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.7, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )

    story.append(info)
    story.append(Spacer(1, 7 * mm))

    # --------------------------------------------------------
    # Productos
    # --------------------------------------------------------
    story.append(
        Paragraph("DETALLE DE PRODUCTOS", kicker)
    )

    product_rows = [
        [
            Paragraph("<b>Producto</b>", body),
            Paragraph("<b>Cant.</b>", body),
            Paragraph("<b>Precio</b>", right),
            Paragraph("<b>Subtotal</b>", right),
        ]
    ]

    for item in data.get("items") or []:
        description = item.get("product_name") or "Producto"

        extras = [
            value
            for value in [
                item.get("brand"),
                item.get("format"),
            ]
            if value
        ]

        if extras:
            description += (
                "<br/><font size='7' color='#6C7E7A'>"
                + " · ".join(extras)
                + "</font>"
            )

        product_rows.append(
            [
                Paragraph(description, body),
                Paragraph(
                    str(item.get("quantity") or 0),
                    body,
                ),
                Paragraph(
                    _clp(item.get("unit_price")),
                    right,
                ),
                Paragraph(
                    _clp(item.get("subtotal")),
                    right,
                ),
            ]
        )

    products = Table(
        product_rows,
        colWidths=[
            82 * mm,
            18 * mm,
            28 * mm,
            30 * mm,
        ],
        repeatRows=1,
    )

    products.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), MINT),
                ("TEXTCOLOR", (0, 0), (-1, 0), NAVY),
                ("BOX", (0, 0), (-1, -1), 0.7, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )

    for row in range(1, len(product_rows)):
        if row % 2 == 0:
            products.setStyle(
                TableStyle(
                    [
                        (
                            "BACKGROUND",
                            (0, row),
                            (-1, row),
                            colors.HexColor("#FBFDFC"),
                        )
                    ]
                )
            )

    story.append(products)
    story.append(Spacer(1, 6 * mm))

    total_table = Table(
        [
            [
                Paragraph("<b>TOTAL COMPRA</b>", body),
                Paragraph(
                    f"<b>{_clp(data.get('total'))}</b>",
                    ParagraphStyle(
                        "ReceiptTotal",
                        parent=right,
                        fontSize=14,
                        textColor=NAVY,
                    ),
                ),
            ]
        ],
        colWidths=[100 * mm, 58 * mm],
    )

    total_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), MINT),
                ("BOX", (0, 0), (-1, -1), 0.8, TEAL),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )

    story.append(total_table)

    # --------------------------------------------------------
    # Datos de Mercado Pago
    # --------------------------------------------------------
    if data.get("payment_method") == "Mercado Pago":
        story.append(Spacer(1, 7 * mm))

        payment_lines = []

        if data.get("mp_order_id"):
            payment_lines.append(
                [
                    "ID Mercado Pago",
                    str(data.get("mp_order_id")),
                ]
            )

        if data.get("external_reference"):
            payment_lines.append(
                [
                    "Referencia VetMap",
                    str(data.get("external_reference")),
                ]
            )

        if data.get("payment_status"):
            payment_lines.append(
                [
                    "Estado del pago",
                    str(data.get("payment_status")),
                ]
            )

        if payment_lines:
            story.append(
                Paragraph("DATOS DEL PAGO", kicker)
            )

            payment_table = Table(
                [
                    [
                        Paragraph(
                            f"<b>{label}</b>",
                            small,
                        ),
                        Paragraph(value, body),
                    ]
                    for label, value in payment_lines
                ],
                colWidths=[40 * mm, 118 * mm],
            )

            payment_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                        ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
                        ("INNERGRID", (0, 0), (-1, -1), 0.3, BORDER),
                        ("LEFTPADDING", (0, 0), (-1, -1), 7),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                        ("TOPPADDING", (0, 0), (-1, -1), 6),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ]
                )
            )

            story.append(payment_table)

    story.append(Spacer(1, 8 * mm))

    note = (
        "Este documento es un comprobante de compra emitido por VetMap "
        "para fines de seguimiento dentro de la plataforma. "
        "No corresponde a una boleta o factura tributaria."
    )

    if data.get("payment_method") == "Mercado Pago":
        note += (
            " El pago asociado fue procesado mediante Mercado Pago."
        )

    story.append(
        KeepTogether(
            [
                Paragraph("INFORMACIÓN", kicker),
                Paragraph(note, small),
            ]
        )
    )

    doc.build(
        story,
        onFirstPage=_footer,
        onLaterPages=_footer,
    )

    pdf = buffer.getvalue()
    buffer.close()
    return pdf
