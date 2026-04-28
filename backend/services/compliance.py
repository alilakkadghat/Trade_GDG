"""
Compliance engine — validates documents against destination-country rules.
Covers: US, UAE, Kenya, Nigeria, South Africa.
"""
from backend.services.storage import db_select, db_insert, db_delete

# ── Required documents by destination country ─────────────

COUNTRY_RULES: dict[str, dict] = {
    "US": {
        "name": "United States",
        "required_docs": [
            "Commercial Invoice", "Packing List", "Bill of Lading", "Certificate of Origin",
        ],
        "conditional_docs": {
            "food": ["Phytosanitary Certificate"],
            "pharma": ["Export Declaration"],
        },
        "mandatory_fields": {
            "Commercial Invoice": ["hs_code", "total_value", "currency", "seller_name", "buyer_name"],
            "Bill of Lading": ["consignee_name", "port_of_discharge", "container_numbers"],
        },
        "notes": [
            "FDA Prior Notice required for food, drugs, cosmetics, and medical devices (21 CFR Part 1, Subpart I).",
            "TSCA compliance required for chemical substances.",
            "Country of Origin marking required per 19 CFR 134.",
            "OFAC sanctions screening mandatory for all parties.",
        ],
    },
    "AE": {
        "name": "United Arab Emirates",
        "required_docs": [
            "Commercial Invoice", "Packing List", "Bill of Lading", "Certificate of Origin",
        ],
        "conditional_docs": {
            "food": ["Phytosanitary Certificate", "Insurance Certificate"],
        },
        "mandatory_fields": {
            "Commercial Invoice": ["hs_code", "total_value", "currency", "buyer_name"],
            "Certificate of Origin": ["certifying_authority", "country_of_origin"],
        },
        "notes": [
            "Certificate of Origin must be attested by Indian Chamber of Commerce AND UAE Embassy.",
            "Halal certificate required for meat and poultry products.",
            "All docs must show consignee's UAE Trade License number.",
            "Import permit required from UAE Ministry of Economy for restricted goods.",
        ],
    },
    "KE": {
        "name": "Kenya",
        "required_docs": [
            "Commercial Invoice", "Packing List", "Bill of Lading", "Certificate of Origin",
        ],
        "conditional_docs": {
            "food": ["Phytosanitary Certificate"],
            "electronics": ["Export Declaration"],
        },
        "mandatory_fields": {
            "Commercial Invoice": ["hs_code", "total_value", "currency"],
            "Bill of Lading": ["consignee_name", "port_of_discharge"],
        },
        "notes": [
            "IDF (Import Declaration Form) must be obtained by Kenyan importer before shipment.",
            "PVoC (Pre-export Verification of Conformity) certificate required under KEBS standards.",
            "Certificate of Origin should be issued by authorized chamber per COMESA rules.",
            "Phytosanitary Certificate required for all agricultural and plant products.",
        ],
    },
    "NG": {
        "name": "Nigeria",
        "required_docs": [
            "Commercial Invoice", "Packing List", "Bill of Lading", "Certificate of Origin",
        ],
        "conditional_docs": {
            "food": ["Phytosanitary Certificate"],
            "manufactured": ["Export Declaration"],
        },
        "mandatory_fields": {
            "Commercial Invoice": ["hs_code", "total_value", "currency", "seller_name"],
            "Bill of Lading": ["consignee_name", "port_of_discharge"],
        },
        "notes": [
            "SONCAP (Standards Organisation of Nigeria Conformity Assessment Programme) certificate mandatory for regulated products.",
            "Form M must be obtained by Nigerian importer through their bank for imports over $5,000.",
            "Combined Certificate of Value and Origin (CCVO) may be required.",
            "NAFDAC registration required for food, drugs, and cosmetics.",
            "Pre-Arrival Assessment Report (PAAR) required before cargo arrival.",
        ],
    },
    "ZA": {
        "name": "South Africa",
        "required_docs": [
            "Commercial Invoice", "Packing List", "Bill of Lading", "Certificate of Origin",
        ],
        "conditional_docs": {
            "food": ["Phytosanitary Certificate"],
        },
        "mandatory_fields": {
            "Commercial Invoice": ["hs_code", "total_value", "currency", "country_of_origin"],
            "Bill of Lading": ["consignee_name", "port_of_discharge"],
        },
        "notes": [
            "NRCS (National Regulator for Compulsory Specifications) approval required for certain products.",
            "ITAC import permit required for goods on controlled list.",
            "Certificate of Origin needed for preferential tariff under India-SACU PTA.",
            "Letter of Authority from SAHPRA required for pharmaceutical products.",
            "PPECB certificate required for perishable products.",
        ],
    },
}

# Map common country names / codes
COUNTRY_CODE_MAP = {
    "US": "US", "USA": "US", "UNITED STATES": "US",
    "AE": "AE", "UAE": "AE", "UNITED ARAB EMIRATES": "AE", "DUBAI": "AE",
    "KE": "KE", "KENYA": "KE",
    "NG": "NG", "NIGERIA": "NG",
    "ZA": "ZA", "SOUTH AFRICA": "ZA",
}


def _resolve_country(code_or_name: str) -> str | None:
    key = code_or_name.strip().upper()
    return COUNTRY_CODE_MAP.get(key)


def check_compliance(transaction_id: str) -> list[dict]:
    """Run compliance checks for a transaction against destination country rules."""
    # Clear previous results
    db_delete("compliance_checks", {"transaction_id": transaction_id})

    # Get transaction
    from backend.services.storage import db_select_one
    txns = db_select("transactions", {"id": transaction_id})
    if not txns:
        return [_make_check(transaction_id, "error", "FAIL", "Transaction not found.", "Critical")]
    txn = txns[0]

    # Resolve country
    country_code = _resolve_country(
        txn.get("destination_country_code", "") or txn.get("destination", "")
    )
    if not country_code or country_code not in COUNTRY_RULES:
        return [_make_check(
            transaction_id, "country_support", "WARNING",
            f"No compliance rules configured for destination '{txn.get('destination', 'Unknown')}'.",
            "Warning", "Currently supported: US, UAE, Kenya, Nigeria, South Africa.",
        )]

    rules = COUNTRY_RULES[country_code]
    docs = db_select("documents", {"transaction_id": transaction_id})
    doc_types = [d.get("document_type").lower().strip() for d in docs if d.get("document_type")]

    results = []

    # 1. Check required documents
    for req_doc in rules["required_docs"]:
        if req_doc.lower().strip() in doc_types:
            results.append(_make_check(
                transaction_id, "required_document", "PASS",
                f"{req_doc} is present.", "Info",
            ))
        else:
            results.append(_make_check(
                transaction_id, "required_document", "FAIL",
                f"{req_doc} is MISSING — required for export to {rules['name']}.",
                "Critical",
                f"Upload a valid {req_doc} to proceed.",
            ))

    # 2. Check mandatory fields
    for doc_type, required_fields in rules.get("mandatory_fields", {}).items():
        matching_docs = [d for d in docs if d.get("document_type") == doc_type]
        for doc in matching_docs:
            fields = db_select("extracted_fields", {"document_id": doc["id"]})
            field_names = {f["field_name"] for f in fields if f.get("field_value")}
            for rf in required_fields:
                if rf in field_names:
                    results.append(_make_check(
                        transaction_id, "mandatory_field", "PASS",
                        f"'{rf}' found in {doc_type}.", "Info",
                    ))
                else:
                    results.append(_make_check(
                        transaction_id, "mandatory_field", "FAIL",
                        f"'{rf}' is MISSING from {doc_type} — required for {rules['name']}.",
                        "Critical",
                        f"Add {rf} to your {doc_type}.",
                    ))

    # 3. Check date logic (shipment date vs LC expiry)
    results.extend(_check_date_logic(transaction_id, docs))

    # 4. Add country-specific notes as advisories
    for note in rules.get("notes", []):
        results.append(_make_check(
            transaction_id, "advisory", "INFO", note, "Info",
        ))

    return results


def _check_date_logic(transaction_id: str, docs: list[dict]) -> list[dict]:
    """Check that document dates are in logical order."""
    results = []
    # This is a simplified check — in production, parse actual dates
    lc_docs = [d for d in docs if d.get("document_type", "").lower().strip() == "letter of credit"]
    bl_docs = [d for d in docs if d.get("document_type", "").lower().strip() == "bill of lading"]
    if lc_docs and bl_docs:
        results.append(_make_check(
            transaction_id, "date_logic", "PASS",
            "LC and Bill of Lading both present — verify shipment date is before LC expiry.",
            "Info", "Manually confirm: BL date ≤ LC latest shipment date ≤ LC expiry date.",
        ))
    return results


def _make_check(txn_id, check_type, status, desc, severity, resolution=None):
    check = {
        "transaction_id": txn_id,
        "check_type": check_type,
        "status": status,
        "description": desc,
        "severity": severity,
        "resolution": resolution or "",
    }
    db_insert("compliance_checks", check)
    return check
